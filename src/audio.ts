import { music } from './data/content';

/**
 * Sitedeki tek müzik çalar. Müzik butonu bunu açıp kapatır; portrenin
 * arkasındaki RGB ışık `getLevel()` ile müziğin bas seviyesini okur.
 */
export type MusicState = 'off' | 'on' | 'missing';

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;
let state: MusicState = 'off';
let level = 0;
let fadeRaf = 0;
const listeners = new Set<(s: MusicState) => void>();

const TARGET_VOLUME = 0.55;

function setState(s: MusicState) {
  state = s;
  listeners.forEach((f) => f(s));
}

export function subscribeMusic(f: (s: MusicState) => void) {
  listeners.add(f);
  f(state);
  return () => {
    listeners.delete(f);
  };
}

function ensureElement() {
  if (el) return el;
  el = new Audio();
  el.src = music.src;
  el.loop = true;
  el.preload = 'none';
  el.addEventListener('error', () => setState('missing'));
  return el;
}

/** Ses analizi için Web Audio düğümleri. Yalnızca bir tıklamanın içinde çağrılır. */
function ensureGraph(a: HTMLAudioElement) {
  if (ctx) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    const src = ctx.createMediaElementSource(a);
    gain = ctx.createGain();
    gain.gain.value = 0;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    src.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    bins = new Uint8Array(analyser.frequencyBinCount);
    a.volume = 1;
  } catch {
    ctx = null;
    gain = null;
    analyser = null;
  }
}

function fadeTo(to: number, done?: () => void) {
  cancelAnimationFrame(fadeRaf);
  const a = el;
  if (!a) return;
  const read = () => (gain ? gain.gain.value : a.volume);
  const write = (v: number) => (gain ? (gain.gain.value = v) : (a.volume = v));
  const from = read();
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / 1200, 1);
    write(from + (to - from) * t);
    if (t < 1) fadeRaf = requestAnimationFrame(step);
    else done?.();
  };
  fadeRaf = requestAnimationFrame(step);
}

export async function toggleMusic() {
  const a = ensureElement();
  if (state === 'on') {
    stopMusic();
    return;
  }
  ensureGraph(a);
  if (!gain) a.volume = 0;
  try {
    await ctx?.resume();
    await a.play();
    setState('on');
    fadeTo(TARGET_VOLUME);
  } catch {
    setState('missing');
  }
}

export function stopMusic() {
  if (state !== 'on' || !el) return;
  setState('off');
  const a = el;
  fadeTo(0, () => a.pause());
}

/** 0–1 arası bas enerjisi; müzik kapalıyken yavaşça 0'a iner. */
export function getLevel() {
  let target = 0;
  if (state === 'on' && analyser && bins) {
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    for (let i = 1; i < 14; i++) sum += bins[i];
    target = Math.min(1, Math.max(0, (sum / 13 / 255 - 0.25) / 0.6));
  }
  level += (target - level) * (target > level ? 0.35 : 0.08);
  return level;
}
