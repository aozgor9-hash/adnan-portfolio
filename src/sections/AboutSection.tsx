import AnimatedText from '../components/AnimatedText';
import { ContactButton } from '../components/Buttons';
import FadeIn from '../components/FadeIn';
import { DecorShape } from '../components/Placeholders';
import { ABOUT_DECOR } from '../data/assets';
import { site } from '../data/content';

const decor = [
  {
    key: 'moon' as const,
    shape: 'moon' as const,
    className: 'top-[4%] left-[1%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]',
    delay: 0.1,
    x: -80,
  },
  {
    key: 'object' as const,
    shape: 'capsule' as const,
    className: 'bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]',
    delay: 0.25,
    x: -80,
  },
  {
    key: 'lego' as const,
    shape: 'cube' as const,
    className: 'top-[4%] right-[1%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]',
    delay: 0.15,
    x: 80,
  },
  {
    key: 'group' as const,
    shape: 'ring' as const,
    className: 'bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]',
    delay: 0.3,
    x: 80,
  },
];

export default function AboutSection() {
  return (
    <section
      id="hakkimda"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10"
    >
      {decor.map((d) => (
        <FadeIn
          key={d.key}
          delay={d.delay}
          x={d.x}
          y={0}
          duration={0.9}
          className={`pointer-events-none absolute ${d.className}`}
        >
          {ABOUT_DECOR ? (
            <img src={ABOUT_DECOR[d.key]} alt="" className="w-full" loading="lazy" />
          ) : (
            <DecorShape kind={d.shape} />
          )}
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading text-center font-black uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
            >
              Hakkımda
            </h2>
          </FadeIn>
          <AnimatedText
            text={site.about}
            className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>
        <ContactButton />
      </div>
    </section>
  );
}
