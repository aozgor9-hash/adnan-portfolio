import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { subscribeMusic, toggleMusic, type MusicState } from '../audio';
import { music } from '../data/content';

/**
 * Sağ kenarda sabit müzik butonu. Tarayıcılar sesi ancak ziyaretçi bir şeye
 * tıklayınca başlatmaya izin verdiği için müzik butona basınca açılır.
 */
export default function MusicToggle() {
  const [state, setState] = useState<MusicState>('off');
  useEffect(() => subscribeMusic(setState), []);

  const on = state === 'on';
  const label =
    state === 'missing' ? 'Müzik dosyası bulunamadı' : on ? 'Müziği kapat' : 'Müziği aç';
  const caption = music.artist ? `${music.artist} — ${music.title}` : music.title;

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-50 -translate-y-1/2 sm:right-5">
      <button
        type="button"
        onClick={toggleMusic}
        aria-pressed={on}
        aria-label={label}
        title={label}
        className={`group pointer-events-auto flex h-12 items-center gap-3 rounded-full border-2 bg-[#0C0C0C]/70 px-[13px] text-[#D7E2EA] backdrop-blur-md transition-colors duration-200 hover:bg-[#0C0C0C]/90 focus-visible:bg-[#0C0C0C]/90 ${
          state === 'missing' ? 'border-dashed border-[#D7E2EA]/40' : 'border-[#D7E2EA]'
        }`}
      >
        {/* ekolayzer çubukları */}
        <span className="flex h-4 w-[18px] items-end justify-between" aria-hidden="true">
          {[0.9, 0.5, 1, 0.65].map((h, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-[#D7E2EA]"
              animate={
                on
                  ? { height: ['30%', `${h * 100}%`, '45%', `${(1.1 - h) * 100}%`, '30%'] }
                  : { height: '25%' }
              }
              transition={on ? { duration: 1.1 + i * 0.17, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
            />
          ))}
        </span>
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium uppercase tracking-widest opacity-0 transition-all duration-300 group-hover:max-w-[220px] group-hover:opacity-100 group-focus-visible:max-w-[220px] group-focus-visible:opacity-100 sm:inline">
          {state === 'missing' ? 'Müzik bulunamadı' : caption}
        </span>
      </button>
    </div>
  );
}
