// Gerçek görsel yokken kullanılan, kodla üretilmiş görseller.
import type { CSSProperties } from 'react';

const TILE_PALETTES: [string, string, string][] = [
  ['#18011F', '#B600A8', '#F2B8EC'],
  ['#0D0F14', '#7621B0', '#C9B6F2'],
  ['#160A02', '#BE4C00', '#FFD2B0'],
  ['#0E1216', '#646973', '#BBCCD7'],
  ['#120318', '#5B1C86', '#FF8A3D'],
];

export function GeneratedTile({ word, index, total }: { word: string; index: number; total: number }) {
  const [dark, mid, light] = TILE_PALETTES[index % TILE_PALETTES.length];
  const variant = index % 3;
  const dur = 7 + (index % 5) * 1.3;
  return (
    <div
      className="relative h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl"
      style={{ background: `radial-gradient(120% 90% at 80% 10%, ${mid} 0%, ${dark} 62%)` }}
    >
      {/* yüzen 3D küre / halka / kapsül */}
      <div
        className="tile-float absolute"
        style={{
          right: variant === 1 ? '46%' : '10%',
          top: variant === 2 ? '34%' : '14%',
          width: variant === 2 ? 170 : 130,
          height: variant === 2 ? 74 : 130,
          borderRadius: 999,
          background:
            variant === 1
              ? `conic-gradient(from 200deg, ${light}, ${mid}, ${dark}, ${light})`
              : `radial-gradient(circle at 32% 28%, #ffffff 0%, ${light} 14%, ${mid} 48%, ${dark} 100%)`,
          WebkitMask: variant === 1 ? 'radial-gradient(circle, transparent 33%, #000 34%)' : undefined,
          mask: variant === 1 ? 'radial-gradient(circle, transparent 33%, #000 34%)' : undefined,
          boxShadow: `0 30px 60px -20px ${dark}`,
          animationDuration: `${dur}s`,
          animationDelay: `${-index * 0.7}s`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <span className="absolute right-5 top-4 text-xs font-light tracking-widest text-white/60 tabular-nums">
        {String(index + 1).padStart(2, '0')}/{total}
      </span>
      <span
        className="absolute bottom-4 left-5 text-[2rem] font-black uppercase leading-none tracking-tight"
        style={{ color: light }}
      >
        {word}
      </span>
    </div>
  );
}

type DecorKind = 'moon' | 'capsule' | 'cube' | 'ring';

export function DecorShape({ kind }: { kind: DecorKind }) {
  if (kind === 'moon') {
    return (
      <div
        className="decor-bob relative aspect-square w-full rounded-full"
        style={{
          background: 'radial-gradient(circle at 34% 30%, #F4F7F9 0%, #BBCCD7 24%, #646973 58%, #1C1F24 100%)',
          boxShadow: 'inset -18px -22px 40px rgba(0,0,0,.55), 0 30px 70px -30px rgba(187,204,215,.45)',
        }}
      >
        {[
          [28, 40, 18],
          [56, 26, 11],
          [58, 60, 15],
          [36, 70, 8],
        ].map(([l, t, s], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${l}%`,
              top: `${t}%`,
              width: `${s}%`,
              height: `${s}%`,
              background: 'radial-gradient(circle at 60% 65%, rgba(255,255,255,.35), rgba(60,64,72,.55) 70%)',
              boxShadow: 'inset 2px 3px 5px rgba(0,0,0,.35)',
            }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'capsule') {
    return (
      <div className="decor-bob flex aspect-square w-full items-center justify-center" style={{ animationDelay: '-2s' }}>
        <div
          className="h-[44%] w-full -rotate-[32deg] rounded-full"
          style={{
            background: 'linear-gradient(160deg, #FFB37A 0%, #BE4C00 38%, #B600A8 100%)',
            boxShadow: 'inset 0 10px 18px rgba(255,255,255,.45), inset 0 -14px 24px rgba(24,1,31,.6), 0 26px 50px -20px #B600A8',
          }}
        />
      </div>
    );
  }
  if (kind === 'cube') {
    const face = 'absolute inset-0 rounded-[18%]';
    return (
      <div
        className="flex aspect-square w-full items-center justify-center"
        style={{ perspective: 600, containerType: 'inline-size' }}
      >
        <div
          className="decor-spin relative h-[62%] w-[62%]"
          style={{ transformStyle: 'preserve-3d', ['--s' as string]: '62cqw' } as CSSProperties}
        >
          {[
            'translateZ(calc(var(--s) / 2))',
            'rotateY(180deg) translateZ(calc(var(--s) / 2))',
            'rotateY(90deg) translateZ(calc(var(--s) / 2))',
            'rotateY(-90deg) translateZ(calc(var(--s) / 2))',
            'rotateX(90deg) translateZ(calc(var(--s) / 2))',
            'rotateX(-90deg) translateZ(calc(var(--s) / 2))',
          ].map((t, i) => (
            <div
              key={i}
              className={face}
              style={{
                transform: t,
                background: `linear-gradient(${135 + i * 30}deg, #9B5BE0 0%, #7621B0 45%, #2A0B45 100%)`,
                boxShadow: 'inset 0 0 0 2px rgba(215,226,234,.25), inset 0 0 30px rgba(0,0,0,.35)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className="decor-bob aspect-square w-full rounded-full"
      style={{
        animationDelay: '-4s',
        background: 'conic-gradient(from 140deg, #D7E2EA, #646973, #B600A8, #7621B0, #D7E2EA)',
        WebkitMask: 'radial-gradient(circle, transparent 34%, #000 35%)',
        mask: 'radial-gradient(circle, transparent 34%, #000 35%)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,.5)',
      }}
    />
  );
}

export function ProjectVisual({
  palette,
  slot,
  label,
  className = '',
  style,
}: {
  palette: [string, string, string];
  slot: number;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [dark, mid, light] = palette;
  const shapes = [
    `radial-gradient(60% 70% at 30% 35%, ${light}cc 0%, transparent 60%), radial-gradient(90% 90% at 90% 100%, ${mid} 0%, ${dark} 70%)`,
    `radial-gradient(45% 55% at 72% 60%, ${light}b3 0%, transparent 62%), linear-gradient(200deg, ${mid} 0%, ${dark} 75%)`,
    `radial-gradient(70% 45% at 50% 20%, ${light}d9 0%, transparent 60%), radial-gradient(80% 70% at 20% 90%, ${mid} 0%, ${dark} 72%)`,
  ];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: shapes[slot % 3], ...style }}>
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `repeating-linear-gradient(${slot === 1 ? 0 : 90}deg, ${light} 0 1px, transparent 1px 22px)`,
        }}
      />
      <span className="absolute bottom-[12%] left-[10%] text-[0.7rem] font-light uppercase tracking-[0.2em] text-white/70 sm:text-xs">
        {label}
      </span>
    </div>
  );
}
