import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import AutoVideo from '../components/AutoVideo';
import { LiveProjectButton } from '../components/Buttons';
import FadeIn from '../components/FadeIn';
import { ProjectVisual } from '../components/Placeholders';
import { projects, type Project } from '../data/projects';
import { openGallery } from '../router';

const RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

/** Önizleme alanı: sabit kutu, görsel kırpılarak doldurur (tamamı galeride görünür). */
function Visual({ project, slot, className = '' }: { project: Project; slot: number; className?: string }) {
  const item = project.cover[slot];
  const fill = 'absolute inset-0 h-full w-full object-cover';
  return (
    <div className={`relative overflow-hidden ${RADIUS} ${className}`}>
      {item?.video ? (
        <AutoVideo src={item.video} poster={item.src} className={fill} label={project.name} />
      ) : item?.src ? (
        <img src={item.src} alt="" loading="lazy" className={fill} />
      ) : (
        <ProjectVisual
          palette={project.palette}
          slot={slot}
          label={`${project.name} · görsel ${slot + 1}`}
          className={fill}
        />
      )}
    </div>
  );
}

/** Görsel satırının yüksekliği: kart her ekranda görünür alana sığar */
const ROW_HEIGHT = 'clamp(260px, min(38vw, calc(85vh - 290px)), 560px)';

function Card({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="sticky top-24 flex h-[85vh] items-start justify-center md:top-32">
      <motion.article
        style={{ scale, top: `${index * 28}px`, transformOrigin: 'top center' }}
        className={`relative flex w-full max-w-6xl flex-col gap-5 border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:gap-6 sm:p-6 md:gap-8 md:p-8 ${RADIUS}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6 md:gap-8">
            <span
              className="hero-heading shrink-0 font-black leading-[0.85] tabular-nums"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {project.no}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-light uppercase tracking-[0.2em] text-[#D7E2EA]/60 sm:text-sm">
                {project.category}
              </span>
              <h3
                className="font-medium uppercase leading-tight text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1.1rem, 2.6vw, 2.4rem)' }}
              >
                {project.name}
              </h3>
            </div>
          </div>
          <LiveProjectButton onClick={() => openGallery(project.slug)} />
        </div>

        <div className="flex gap-3 sm:gap-4" style={{ height: ROW_HEIGHT }}>
          <div className="flex w-[40%] flex-col gap-3 sm:gap-4">
            <Visual project={project} slot={0} className="flex-[2]" />
            <Visual project={project} slot={1} className="flex-[3]" />
          </div>
          <Visual project={project} slot={2} className="w-[60%]" />
        </div>
      </motion.article>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  return (
    <section
      id="projeler"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-20 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-10 text-center font-black uppercase leading-none tracking-tight sm:mb-14"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projeler
        </h2>
      </FadeIn>

      <div ref={containerRef}>
        {projects.map((p, i) => (
          <Card key={p.no} project={p} index={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
