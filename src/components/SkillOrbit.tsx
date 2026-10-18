import type { MotionValue } from 'framer-motion';
import { useEffect, useRef, type RefObject } from 'react';
import { tools } from '../data/content';

type Props = {
  /** Portre kutusu: yörünge bunun etrafında döner */
  anchorRef: RefObject<HTMLDivElement>;
  progress: MotionValue<number>;
};

const PERIOD = 28; // bir tam tur (saniye)
const TILT = (-10 * Math.PI) / 180; // yörünge düzleminin eğimi
/** Yörünge merkezi: arkası saçın arkasından, önü göğsün önünden geçer */
const CENTER_Y = 0.44;

/**
 * Programların portrenin başı etrafında 3D bir yörüngede dönmesi.
 * Arkaya geçen etiketler küçülüp kararır ve yüzün arkasında kalır.
 */
export default function SkillOrbit({ anchorRef, progress }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const n = tools.length;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!reduce) t += dt;
      const wrap = wrapRef.current;
      const anchor = anchorRef.current;
      if (!wrap || !anchor) return;
      const box = wrap.getBoundingClientRect();
      const r = anchor.getBoundingClientRect();
      if (box.width === 0 || r.width === 0 || box.bottom < 0 || box.top > window.innerHeight) return;

      // dağılma evresinde yörünge genişleyip söner
      const p = progress.get();
      const out = Math.min(Math.max((p - 0.5) / 0.4, 0), 1);
      const spread = 1 + out * 0.6;
      const fade = 1 - out;

      const cx = r.left - box.left + r.width / 2;
      const cy = r.top - box.top + r.height * CENTER_Y;
      const rx = r.width * 0.6 * spread;
      const ry = r.width * 0.24 * spread;
      const cos = Math.cos(TILT);
      const sin = Math.sin(TILT);

      for (let i = 0; i < n; i++) {
        const el = chipRefs.current[i];
        if (!el) continue;
        const a = (t / PERIOD) * Math.PI * 2 + (i / n) * Math.PI * 2;
        const ox = Math.cos(a) * rx;
        const oy = Math.sin(a) * ry;
        let x = cx + ox * cos - oy * sin;
        const y = cy + ox * sin + oy * cos;
        const depth = Math.sin(a); // +1 önde, -1 arkada
        const half = el.offsetWidth / 2;
        x = Math.min(Math.max(x, half + 12), box.width - half - 12);
        const scale = 0.78 + 0.3 * (depth + 1) * 0.5;
        const alpha = (0.45 + 0.55 * (depth + 1) * 0.5) * fade;
        el.style.transform = `translate3d(${x - half}px, ${y - el.offsetHeight / 2}px, 0) scale(${scale})`;
        el.style.opacity = alpha.toFixed(3);
        el.style.zIndex = depth > 0 ? '15' : '5';
        el.style.filter = depth > 0 ? 'none' : `blur(${((-depth) * 1.2).toFixed(2)}px)`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anchorRef, progress]);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0" aria-label="Kullandığım programlar">
      {tools.map((tool, i) => (
        <div
          key={tool.name}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2EA]/25 bg-[#0C0C0C]/55 py-1.5 pl-2 pr-3.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#D7E2EA] opacity-0 backdrop-blur-md sm:py-2 sm:pl-2.5 sm:pr-4 sm:text-xs lg:text-sm"
          style={{ willChange: 'transform, opacity', boxShadow: '0 0 24px -6px rgba(61, 158, 255, 0.45)' }}
        >
          {tool.icon ? (
            <img src={tool.icon} alt="" className="h-5 w-5 rounded-[5px] object-contain sm:h-6 sm:w-6" />
          ) : (
            <span className="orbit-dot" aria-hidden="true" />
          )}
          {tool.name}
        </div>
      ))}
    </div>
  );
}
