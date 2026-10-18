import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import AutoVideo from '../components/AutoVideo';
import FadeIn from '../components/FadeIn';
import { ProjectVisual } from '../components/Placeholders';
import type { Media, Project } from '../data/projects';
import { closeGallery } from '../router';

const RADIUS = 'rounded-[24px] sm:rounded-[32px]';

function useColumnCount() {
  const get = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
  const [n, setN] = useState(get);
  useEffect(() => {
    const on = () => setN(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return n;
}

/** Görseller sırayla, her seferinde en kısa sütuna eklenir: kırpılmaz, soldan sağa okunur. */
function toColumns(media: Media[], n: number) {
  const cols: { m: Media; i: number }[][] = Array.from({ length: n }, () => []);
  const heights = new Array(n).fill(0);
  media.forEach((m, i) => {
    let c = 0;
    for (let k = 1; k < n; k++) if (heights[k] < heights[c] - 0.01) c = k;
    cols[c].push({ m, i });
    heights[c] += m.h / m.w;
  });
  return cols;
}

export default function ProjectGallery({ project }: { project: Project }) {
  const media = project.media;
  const onlyVideo = media.length > 0 && media.every((m) => m.kind === 'video');
  const columns = useColumnCount();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeGallery();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#0C0C0C] via-[#0C0C0C]/90 to-transparent px-5 pb-8 pt-5 sm:px-8 md:px-10 md:pt-8">
        <button
          type="button"
          onClick={closeGallery}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-6 py-2.5 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 focus-visible:bg-[#D7E2EA]/10 sm:px-8 sm:py-3 sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
          Geri Dön
        </button>
      </div>

      {media.length === 0 ? (
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-5 pb-20 sm:grid-cols-2 sm:gap-4 sm:px-8 md:px-10 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <ProjectVisual
                palette={project.palette}
                slot={i}
                label={`${project.name} · görsel ${i + 1}`}
                className={`${RADIUS} aspect-[4/5] w-full`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div
          role="list"
          aria-label={`${project.name} görselleri`}
          className={
            onlyVideo
              ? 'mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-20 sm:gap-6 sm:px-8 md:px-10'
              : 'mx-auto flex max-w-7xl items-start gap-3 px-5 pb-20 sm:gap-4 sm:px-8 md:px-10'
          }
        >
          {onlyVideo
            ? media.map((m, i) => <Tile key={m.src} m={m} i={i} />)
            : toColumns(media, columns).map((col, c) => (
                <div key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
                  {col.map(({ m, i }) => (
                    <Tile key={m.src} m={m} i={i} />
                  ))}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

function Tile({ m, i }: { m: Media; i: number }) {
  return (
    <FadeIn role="listitem" delay={(i % 3) * 0.08} y={30}>
      {m.kind === 'video' ? (
        <AutoVideo
          src={m.src}
          poster={m.poster}
          controls
          label={m.alt}
          className={`${RADIUS} block w-full bg-black object-cover`}
          style={{ aspectRatio: `${m.w} / ${m.h}` }}
        />
      ) : (
        <img
          src={m.src}
          alt={m.alt}
          width={m.w}
          height={m.h}
          loading={i < 6 ? 'eager' : 'lazy'}
          className={`${RADIUS} block h-auto w-full`}
        />
      )}
    </FadeIn>
  );
}
