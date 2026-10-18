import * as THREE from 'three';

/**
 * 3D yüz sahnesi.
 *
 * Fotoğraf + derinlik haritasından kabartma (relief) bir yüz modeli kurar.
 * Scroll ilerlemesi (0 → 1) şu evreleri sürer:
 *   1) Fotoğraf → yukarıdan aşağı inen bir tarama çizgisiyle mavi hologram iskelete döner
 *   2) İskelet bir süre ekranda kalır
 *   3) İskelet RGB glitch ile titreyip parça parça, yavaşça yok olur
 * Yukarı kaydırınca aynı yol geri oynar ve yüz yeniden oluşur.
 * Her şey ilerlemenin saf bir fonksiyonu olduğu için geri sarma bedavadır.
 */

/** Doku oranı (yükseklik / genişlik). Hero'daki çapa kutusu da bu oranı kullanır. */
export const FACE_ASPECT = 766 / 1024;
const ASPECT = FACE_ASPECT;
const DEPTH = 0.22; // kabartma derinliği (genişliğe oranla)
const DEPTH_CENTER = 0.55;

type Sampler = (u: number, v: number) => number;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeSampler(img: HTMLImageElement, channel: 0 | 3): Sampler {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const at = (x: number, y: number) => data[(y * w + x) * 4 + channel] / 255;
  // u: 0 → sol, v: 0 → alt (three.js uv düzeni)
  return (u, v) => {
    const fx = Math.min(Math.max(u, 0), 1) * (w - 1);
    const fy = (1 - Math.min(Math.max(v, 0), 1)) * (h - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const x1 = Math.min(x0 + 1, w - 1);
    const y1 = Math.min(y0 + 1, h - 1);
    const tx = fx - x0;
    const ty = fy - y0;
    const a = at(x0, y0) * (1 - tx) + at(x1, y0) * tx;
    const b = at(x0, y1) * (1 - tx) + at(x1, y1) * tx;
    return a * (1 - ty) + b * ty;
  };
}

/** Tekrarlanabilir rastgele sayı (her yüklemede aynı iskelet) */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const GLSL_COMMON = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  const vec3 HOLO      = vec3(0.24, 0.62, 1.00);  // ana mavi
  const vec3 HOLO_CYAN = vec3(0.55, 0.86, 1.00);  // parlak çizgi
  const vec3 HOLO_DEEP = vec3(0.03, 0.18, 0.48);  // gövde dolgusu
  const vec3 HOLO_CORE = vec3(0.88, 0.97, 1.00);  // düğüm çekirdeği
`;

/** Barycentric çizgi örgüsü için üçgenleri ayrık köşelere açar */
function triangulate(
  verts: { x: number; y: number; z: number; u: number; v: number; m: number }[],
  nx: number,
  ny: number,
  minMask: number,
) {
  const pos: number[] = [];
  const uv: number[] = [];
  const bary: number[] = [];
  const id = (i: number, j: number) => verts[j * (nx + 1) + i];
  const tri = (A: (typeof verts)[0], B: (typeof verts)[0], C: (typeof verts)[0]) => {
    if (Math.min(A.m, B.m, C.m) < minMask) return;
    const corners: [typeof A, number[]][] = [
      [A, [1, 0, 0]],
      [B, [0, 1, 0]],
      [C, [0, 0, 1]],
    ];
    for (const [V, b] of corners) {
      pos.push(V.x, V.y, V.z);
      uv.push(V.u, V.v);
      bary.push(b[0], b[1], b[2]);
    }
  };
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1);
      if ((i + j) % 2 === 0) {
        tri(a, b, d);
        tri(a, d, c);
      } else {
        tri(a, b, c);
        tri(b, d, c);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aBary', new THREE.Float32BufferAttribute(bary, 3));
  return g;
}

export class FaceScene {
  private renderer: THREE.WebGLRenderer;
  private camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
  /** Fotoğraf doğrudan ekrana çizilir */
  private photoScene = new THREE.Scene();
  private photoGroup = new THREE.Group();
  /** İskelet önce bir hedefe çizilir, sonra glitch geçişinden geçer */
  private holoScene = new THREE.Scene();
  private holoGroup = new THREE.Group();
  private holoTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private uniforms = {
    uMap: { value: null as THREE.Texture | null },
    uScan: { value: 1.2 },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uUnit: { value: 500 },
  };
  private post = {
    tScene: { value: this.holoTarget.texture },
    uGlitch: { value: 0 },
    uFade: { value: 1 },
    uTime: this.uniforms.uTime,
    uRes: { value: new THREE.Vector2(1, 1) },
  };

  private width = 1;
  private height = 1;
  private target = 0;
  private progress = 0;
  private mouse = new THREE.Vector2();
  private mouseSmooth = new THREE.Vector2();
  private raf = 0;
  private last = performance.now();
  private disposed = false;
  private getAnchor: () => DOMRect | null;
  ready: Promise<void>;

  constructor(
    private canvas: HTMLCanvasElement,
    faceUrl: string,
    depthUrl: string,
    getAnchor: () => DOMRect | null,
  ) {
    this.getAnchor = getAnchor;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    this.photoScene.add(this.photoGroup);
    this.holoScene.add(this.holoGroup);
    this.postScene.add(this.buildPost());
    this.ready = this.build(faceUrl, depthUrl);
  }

  private async build(faceUrl: string, depthUrl: string) {
    const [faceImg, depthImg] = await Promise.all([loadImage(faceUrl), loadImage(depthUrl)]);
    if (this.disposed) return;

    const tex = new THREE.Texture(faceImg);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    this.uniforms.uMap.value = tex;

    const depth = makeSampler(depthImg, 0);
    const mask = makeSampler(faceImg, 3);
    const zAt = (u: number, v: number) => (depth(u, v) - DEPTH_CENTER) * DEPTH;

    this.photoGroup.add(this.buildPhoto(zAt, mask));
    this.holoGroup.add(this.buildSkin(zAt, mask));
    const coarse = this.buildCoarse(zAt, mask);
    this.holoGroup.add(coarse.lines);
    this.holoGroup.add(coarse.nodes);
  }

  /* ---------- 1) Fotoğraf yüzeyi ---------- */
  private buildPhoto(zAt: (u: number, v: number) => number, mask: Sampler) {
    const nx = 180;
    const ny = Math.round(nx * ASPECT);
    const pos: number[] = [];
    const uv: number[] = [];
    const m: number[] = [];
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const u = i / nx;
        const v = j / ny;
        pos.push(u - 0.5, (v - 0.5) * ASPECT, zAt(u, v));
        uv.push(u, v);
        m.push(mask(u, v));
      }
    }
    const idx: number[] = [];
    const id = (i: number, j: number) => j * (nx + 1) + i;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1);
        if (Math.max(m[a], m[b], m[c], m[d]) < 0.02) continue;
        idx.push(a, b, d, a, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uScan;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float d = uv.y - uScan;
          p.z += exp(-d * d * 900.0) * 0.025; // tarama çizgisinde hafif kabarma
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uScan;
        uniform float uTime;
        varying vec2 vUv;
        ${GLSL_COMMON}
        void main() {
          vec4 c = texture2D(uMap, vUv);
          float edge = uScan - vUv.y;               // > 0 → hâlâ fotoğraf
          vec2 cell = floor(vUv * vec2(112.0, 84.0));
          float n = hash21(cell + floor(uTime * 12.0));
          float keep = step(n * 0.07, edge);        // kenarda piksel piksel kopma
          float a = c.a * keep * smoothstep(0.0, 0.14, vUv.y); // alt kenar yumuşak biter
          if (a < 0.01) discard;
          float glow = exp(-edge * edge * 2600.0);
          vec3 col = c.rgb;
          col = mix(col, col * vec3(0.75, 0.9, 1.1), smoothstep(0.12, 0.0, edge) * 0.7);
          col += HOLO_CYAN * glow * 0.9;
          gl_FragColor = vec4(col, a);
          #include <colorspace_fragment>
        }
      `,
    });
    return new THREE.Mesh(g, mat);
  }

  /* ---------- 2a) İnce örgü + yarı saydam hologram gövde ---------- */
  private buildSkin(zAt: (u: number, v: number) => number, mask: Sampler) {
    const nx = 80;
    const ny = Math.round(nx * ASPECT);
    const verts = [];
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const u = i / nx, v = j / ny;
        verts.push({ x: u - 0.5, y: (v - 0.5) * ASPECT, z: zAt(u, v), u, v, m: mask(u, v) });
      }
    }
    const g = triangulate(verts, nx, ny, 0.35);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 aBary;
        varying vec2 vUv;
        varying vec3 vBary;
        varying vec3 vView;
        void main() {
          vUv = uv;
          vBary = aBary;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uScan;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vBary;
        varying vec3 vView;
        ${GLSL_COMMON}
        void main() {
          vec4 tex = texture2D(uMap, vUv);
          tex.a *= smoothstep(0.0, 0.14, vUv.y);
          float above = smoothstep(-0.004, 0.012, vUv.y - uScan);
          vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
          if (n.z < 0.0) n = -n;
          float lambert = clamp(dot(n, normalize(vec3(-0.35, 0.4, 1.0))), 0.0, 1.0);
          float rim = pow(1.0 - n.z, 1.6);
          // fotoğrafın tonu gövdeye işlenir: kaş, göz, sakal okunur
          float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
          float tone = mix(0.25, 1.0, pow(lum, 0.7));

          float w = min(min(vBary.x, vBary.y), vBary.z);
          float fw = fwidth(w);
          float line = 1.0 - smoothstep(0.0, fw * 1.1, w);

          float shade = (0.15 + 0.85 * lambert) * tone;
          vec3 col = mix(HOLO_DEEP, HOLO, shade) + HOLO_CYAN * shade * shade * 0.45 + HOLO_CYAN * rim * 0.6;
          float a = (0.55 * shade + 0.3 * rim + line * (0.12 + 0.3 * shade)) * tex.a * above;

          float d = vUv.y - uScan;
          float glow = exp(-d * d * 1400.0);
          col = mix(col, HOLO_CYAN * 1.3, glow * 0.6);
          a += glow * 0.35 * tex.a * above;
          if (a < 0.003) discard;
          gl_FragColor = vec4(col, a);
        }
      `,
    });
    return new THREE.Mesh(g, mat);
  }

  /* ---------- 2b) Seyrek, düzensiz üçgen iskelet + parlayan düğümler ---------- */
  private buildCoarse(zAt: (u: number, v: number) => number, mask: Sampler) {
    const nx = 28;
    const ny = Math.round(nx * ASPECT);
    const rand = seeded(7);
    const verts = [];
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const edge = i === 0 || j === 0 || i === nx || j === ny;
        const jx = edge ? 0 : (rand() - 0.5) * 0.7;
        const jy = edge ? 0 : (rand() - 0.5) * 0.7;
        const u = (i + jx) / nx, v = (j + jy) / ny;
        verts.push({ x: u - 0.5, y: (v - 0.5) * ASPECT, z: zAt(u, v) + 0.004, u, v, m: mask(u, v) });
      }
    }
    const g = triangulate(verts, nx, ny, 0.4);
    const lineMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 aBary;
        varying vec2 vUv;
        varying vec3 vBary;
        void main() {
          vUv = uv;
          vBary = aBary;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uScan;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vBary;
        ${GLSL_COMMON}
        void main() {
          float m = texture2D(uMap, vUv).a * smoothstep(0.0, 0.14, vUv.y);
          float above = smoothstep(-0.004, 0.012, vUv.y - uScan);
          float w = min(min(vBary.x, vBary.y), vBary.z);
          float fw = fwidth(w);
          float core = 1.0 - smoothstep(0.0, fw * 1.05, w);
          float halo = 1.0 - smoothstep(0.0, fw * 4.0, w);
          float flicker = 0.88 + 0.12 * hash21(floor(vUv * vec2(34.0, 25.0)) + floor(uTime * 8.0));
          vec3 col = mix(HOLO, HOLO_CYAN, core);
          float a = (core * 0.6 + halo * 0.1) * flicker * m * above;
          if (a < 0.003) discard;
          gl_FragColor = vec4(col, a);
        }
      `,
    });

    const npos: number[] = [];
    const nuv: number[] = [];
    const nsize: number[] = [];
    for (const V of verts) {
      if (V.m < 0.55) continue;
      npos.push(V.x, V.y, V.z + 0.002);
      nuv.push(V.u, V.v);
      const r = rand();
      nsize.push(r > 0.88 ? 10 : r > 0.6 ? 6 : 4);
    }
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(npos, 3));
    ng.setAttribute('uv', new THREE.Float32BufferAttribute(nuv, 2));
    ng.setAttribute('aSize', new THREE.Float32BufferAttribute(nsize, 1));
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aSize;
        uniform float uScan;
        uniform float uPixelRatio;
        uniform float uUnit;
        varying float vA;
        varying float vBig;
        void main() {
          vA = step(uScan, uv.y) * smoothstep(0.02, 0.16, uv.y);
          vBig = step(9.0, aSize);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * clamp(uUnit / 660.0, 0.6, 1.2) * vA;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        varying float vBig;
        ${GLSL_COMMON}
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float sq = max(abs(c.x), abs(c.y));
          // büyük düğüm: içi boş kare, küçük düğüm: dolu kare
          float box = vBig > 0.5
            ? (1.0 - smoothstep(0.30, 0.36, sq)) * smoothstep(0.17, 0.23, sq)
            : 1.0 - smoothstep(0.16, 0.24, sq);
          float glow = exp(-d * d * 14.0) * 0.4;
          float a = (box + glow) * vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(mix(HOLO_CYAN, HOLO_CORE, box), a);
        }
      `,
    });
    const nodes = new THREE.Points(ng, nodeMat);
    nodes.frustumCulled = false;
    return { lines: new THREE.Mesh(g, lineMat), nodes };
  }

  /* ---------- 3) RGB glitch geçişi ---------- */
  private buildPost() {
    const mat = new THREE.ShaderMaterial({
      uniforms: this.post,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene;
        uniform float uGlitch;
        uniform float uFade;
        uniform float uTime;
        uniform vec2 uRes;
        varying vec2 vUv;
        ${GLSL_COMMON}
        void main() {
          vec2 uv = vUv;
          float t = floor(uTime * 14.0);
          float g = uGlitch;

          // glitch sürekli değil, kesik kesik patlamalarla gelir
          float burst = step(1.0 - (0.12 + 0.75 * g), hash21(vec2(t, 3.1)));
          float amt = g * (0.3 + 0.7 * burst);

          // yatay dilim kaymaları
          float rows = 14.0 + 46.0 * hash21(vec2(t, 7.7));
          float row = floor(uv.y * rows);
          float sliceOn = step(1.0 - amt * 0.6, hash21(vec2(row, t)));
          uv.x += (hash21(vec2(row, t + 1.0)) - 0.5) * 0.16 * amt * sliceOn;

          // RGB kanal ayrışması
          float split = 0.002 + 0.045 * amt;
          vec2 dir = vec2(split, split * 0.3 * (hash21(vec2(t, 9.0)) - 0.5));
          vec4 base = texture2D(tScene, uv);
          vec4 rG = texture2D(tScene, uv + dir);
          vec4 bG = texture2D(tScene, uv - dir);
          float rL = max(max(rG.r, rG.g), rG.b);
          float bL = max(max(bG.r, bG.g), bG.b);
          float ghost = 0.25 + 0.75 * amt;
          // kırmızı ve mavi kopyalar iki yana kayar, ortadaki kopya söner
          vec3 col = base.rgb * (1.0 - 0.55 * amt)
                   + vec3(1.0, 0.12, 0.25) * rL * ghost
                   + vec3(0.1, 0.45, 1.0) * bL * ghost;
          float a = max(base.a * (1.0 - 0.55 * amt), max(rG.a, bG.a) * ghost);

          // küçük bloklar halinde kopma, sona doğru hızlanır
          vec2 blk = floor(uv * vec2(96.0, 64.0));
          float keep = step(g * g * g * g * 0.95, hash21(blk + t * 0.37));

          // hologram tarama çizgileri
          float lines = 0.86 + 0.14 * sin(vUv.y * uRes.y * 1.4 + uTime * 6.0);
          float f = uFade * keep * mix(1.0, lines, 0.35 + 0.65 * g);
          gl_FragColor = vec4(col * f, a * f);
        }
      `,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    return quad;
  }

  /* ---------- Dış kontrol ---------- */
  setProgress(p: number) {
    this.target = Math.min(Math.max(p, 0), 1);
  }

  setMouse(x: number, y: number) {
    this.mouse.set(x, y);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    const pr = this.renderer.getPixelRatio();
    this.holoTarget.setSize(Math.round(w * pr), Math.round(h * pr));
    this.post.uRes.value.set(w * pr, h * pr);
    this.camera.aspect = w / h;
    // z = 0 düzleminde 1 birim = 1 CSS pikseli
    const dist = h / 2 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.camera.position.set(0, 0, dist);
    this.camera.near = dist / 20;
    this.camera.far = dist * 4;
    this.camera.updateProjectionMatrix();
  }

  start() {
    const loop = (now: number) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      this.tick(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private tick(dt: number) {
    this.resize();
    const rect = this.getAnchor();
    if (!rect || rect.width === 0) return;
    const canvasRect = this.canvas.getBoundingClientRect();
    // Hero görünmüyorsa çizmeye gerek yok
    if (canvasRect.bottom < 0 || canvasRect.top > window.innerHeight) return;

    const k = 1 - Math.exp(-dt * 7);
    this.progress += (this.target - this.progress) * k;
    this.mouseSmooth.lerp(this.mouse, 1 - Math.exp(-dt * 4));
    this.uniforms.uTime.value += dt;

    const p = this.progress;
    const ease = (t: number) => t * t * (3 - 2 * t);
    const remap = (v: number, a: number, b: number) => Math.min(Math.max((v - a) / (b - a), 0), 1);

    // 0.04–0.44: tarama  ·  0.44–0.56: iskelet  ·  0.56–0.97: RGB glitch ile kaybolma
    this.uniforms.uScan.value = 1.12 - ease(remap(p, 0.04, 0.44)) * 1.26;
    this.post.uGlitch.value = ease(remap(p, 0.56, 0.95));
    this.post.uFade.value = 1 - ease(remap(p, 0.62, 0.97));
    this.uniforms.uUnit.value = rect.width;

    // Yüzü DOM'daki çapanın (Magnet ile hareket eden kutu) üstüne oturt
    const cx = rect.left + rect.width / 2 - canvasRect.left;
    const cy = rect.top + rect.height / 2 - canvasRect.top;
    const turn = ease(remap(p, 0.02, 0.6));
    const g = this.photoGroup;
    g.position.set(cx - this.width / 2, this.height / 2 - cy, 0);
    g.scale.setScalar(rect.width * (1 + turn * 0.05));
    g.rotation.set(-this.mouseSmooth.y * 0.12 + turn * 0.06, this.mouseSmooth.x * 0.22 - turn * 0.32, turn * 0.02);
    this.holoGroup.position.copy(g.position);
    this.holoGroup.scale.copy(g.scale);
    this.holoGroup.rotation.copy(g.rotation);

    // iskelet → hedef doku → glitch ile ekrana
    this.renderer.setRenderTarget(this.holoTarget);
    this.renderer.clear();
    this.renderer.render(this.holoScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = true;
    this.renderer.render(this.photoScene, this.camera);
    this.renderer.autoClear = false;
    this.renderer.render(this.postScene, this.postCamera);
    this.renderer.autoClear = true;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    for (const s of [this.photoScene, this.holoScene, this.postScene]) {
      s.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose?.();
      });
    }
    this.uniforms.uMap.value?.dispose();
    this.holoTarget.dispose();
    this.renderer.dispose();
  }
}
