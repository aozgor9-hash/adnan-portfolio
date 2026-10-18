import { useEffect, useRef, useState } from 'react';
import { GeneratedTile } from '../components/Placeholders';
import { MARQUEE_IMAGES } from '../data/assets';
import { marqueeWords } from '../data/content';

type Item = { key: string; index: number };

function Row({ items, transform }: { items: Item[]; transform: string }) {
  const total = marqueeWords.length;
  return (
    // bir kopya genişliği kadar sola kaydırılarak başlar; iki yönde de boşluk görünmez
    <div
      className="flex w-max gap-3"
      style={{ transform, willChange: 'transform', marginLeft: -items.length * (420 + 12) }}
    >
      {[0, 1, 2].flatMap((copy) =>
        items.map(({ key, index }) =>
          MARQUEE_IMAGES ? (
            <img
              key={`${copy}-${key}`}
              src={MARQUEE_IMAGES[index]}
              alt=""
              loading="lazy"
              className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <GeneratedTile key={`${copy}-${key}`} word={marqueeWords[index]} index={index} total={total} />
          ),
        ),
      )}
    </div>
  );
}

export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const count = MARQUEE_IMAGES?.length ?? marqueeWords.length;
  const all: Item[] = Array.from({ length: count }, (_, i) => ({ key: String(i), index: i }));
  const row1 = all.slice(0, 11);
  const row2 = all.slice(11);

  return (
    <section ref={ref} className="bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40" aria-label="Çalışma alanları">
      <div className="flex flex-col gap-3 overflow-hidden">
        <Row items={row1} transform={`translateX(${offset - 200}px)`} />
        <Row items={row2} transform={`translateX(${-(offset - 200)}px)`} />
      </div>
    </section>
  );
}
