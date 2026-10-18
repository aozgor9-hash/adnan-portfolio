import { useScroll } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ContactButton } from '../components/Buttons';
import AmbientGlow from '../components/AmbientGlow';
import Face3D from '../components/Face3D';
import { FACE_ASPECT } from '../components/FaceScene';
import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';
import SkillOrbit from '../components/SkillOrbit';
import { navLinks, site } from '../data/content';
import faceUrl from '../assets/face.webp';
import depthUrl from '../assets/face-depth.png';

/** Başlığı satıra tam sığacak boyuta ölçekler (isim uzunluğu değişse de taşmaz). */
function useFitText<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el?.parentElement) return;
    const parent = el.parentElement;
    const fit = () => {
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      let size = 100;
      el.style.fontSize = `${size}px`;
      // iki tur: harf aralığı ve kerning ölçekle tam doğrusal değil
      for (let i = 0; i < 2; i++) {
        const w = el.getBoundingClientRect().width;
        if (w <= 0) return;
        size *= avail / w;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    // Kanit yüklenince ölçüler değişir; yükleme bittiğinde yeniden sığdır
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener('loadingdone', fit);
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener('loadingdone', fit);
    };
  }, []);
  return ref;
}

export default function HeroSection() {
  const wrapRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const headingRef = useFitText<HTMLSpanElement>();
  const [faceLive, setFaceLive] = useState(false);

  // Hero sabitlenmişken yapılan scroll → yüzün dijitalleşme ilerlemesi
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <section ref={wrapRef} className="relative h-[260vh]" aria-label="Giriş">
      <div className="sticky top-0 flex h-screen flex-col" style={{ overflowX: 'clip' }}>
        <FadeIn as="nav" delay={0} y={-20} className="relative z-20 flex justify-between px-6 pt-6 md:px-10 md:pt-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 focus-visible:opacity-70 md:text-lg lg:text-[1.4rem]"
            >
              {l.label}
            </a>
          ))}
        </FadeIn>

        {/* FadeIn dışarıda: kırpılan kutunun içinde kalırsa görünür alana hiç giremiyor */}
        <FadeIn delay={0.15} y={40} className="mt-6 sm:mt-4 md:-mt-5">
          <div className="w-full overflow-hidden px-6 md:px-10">
            <h1 className="w-full whitespace-nowrap text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">
              <span ref={headingRef} className="hero-heading inline-block">
                {site.heroHeading}
              </span>
            </h1>
          </div>
        </FadeIn>

        <div className="relative z-20 mt-auto flex items-end justify-between gap-4 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn
            as="p"
            delay={0.35}
            y={20}
            className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {site.heroTagline}
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton />
          </FadeIn>
        </div>

        {/* Portre çapası: Magnet ile hareket eder, 3D yüz bu kutunun üstüne çizilir */}
        <div className="absolute left-1/2 top-1/2 z-10 w-[min(380px,100vw)] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[500px] sm:translate-y-0 md:w-[600px] lg:w-[720px]">
          <FadeIn delay={0.6} y={30}>
            <Magnet
              padding={150}
              strength={3}
              activeTransition="transform 0.3s ease-out"
              inactiveTransition="transform 0.6s ease-in-out"
              className="block w-full"
            >
              <AmbientGlow progress={scrollYProgress} />
              <div ref={anchorRef} className="w-full" style={{ aspectRatio: `1 / ${FACE_ASPECT}` }}>
                <img
                  src={faceUrl}
                  alt={`${site.name} portresi`}
                  className="h-full w-full object-contain"
                  style={{ visibility: faceLive ? 'hidden' : 'visible' }}
                  draggable={false}
                />
              </div>
            </Magnet>
          </FadeIn>
        </div>

        <SkillOrbit anchorRef={anchorRef} progress={scrollYProgress} />

        <Face3D
          faceUrl={faceUrl}
          depthUrl={depthUrl}
          anchorRef={anchorRef}
          progress={scrollYProgress}
          onReady={setFaceLive}
        />
      </div>
    </section>
  );
}
