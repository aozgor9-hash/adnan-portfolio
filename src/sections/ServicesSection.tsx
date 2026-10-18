import FadeIn from '../components/FadeIn';
import { services } from '../data/content';

export default function ServicesSection() {
  return (
    <section
      id="hizmetler"
      className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn y={40}>
        <h2
          className="mb-16 text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Hizmetler
        </h2>
      </FadeIn>

      <ul className="mx-auto max-w-5xl">
        {services.map((s, i) => (
          <FadeIn
            as="li"
            key={s.no}
            delay={i * 0.1}
            className="flex items-start gap-6 py-8 sm:gap-10 sm:py-10 md:gap-14 md:py-12"
            style={{
              borderTop: i === 0 ? '1px solid rgba(12, 12, 12, 0.15)' : undefined,
              borderBottom: '1px solid rgba(12, 12, 12, 0.15)',
            }}
          >
            <span
              className="shrink-0 font-black leading-[0.85] tabular-nums"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {s.no}
            </span>
            <div className="flex min-w-0 flex-col gap-2 pt-1 sm:gap-3 md:pt-3">
              <h3 className="font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>
                {s.name}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed"
                style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}
              >
                {s.text}
              </p>
            </div>
          </FadeIn>
        ))}
      </ul>
    </section>
  );
}
