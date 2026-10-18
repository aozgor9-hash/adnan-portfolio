import { useLayoutEffect } from 'react';
import MusicToggle from './components/MusicToggle';
import { projects } from './data/projects';
import ProjectGallery from './pages/ProjectGallery';
import { GALLERY_PREFIX, returnState, useHash } from './router';
import AboutSection from './sections/AboutSection';
import ContactSection from './sections/ContactSection';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import ProjectsSection from './sections/ProjectsSection';
import ServicesSection from './sections/ServicesSection';

export default function App() {
  const hash = useHash();
  const project = hash.startsWith(GALLERY_PREFIX)
    ? projects.find((p) => `${GALLERY_PREFIX}${p.slug}` === hash)
    : undefined;

  useLayoutEffect(() => {
    if (project) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (returnState.fromPage) {
      window.scrollTo({ top: returnState.y, behavior: 'instant' });
      returnState.fromPage = false;
    } else if (returnState.y === -1) {
      returnState.y = 0;
      document.getElementById('projeler')?.scrollIntoView({ behavior: 'instant' });
    }
  }, [project]);

  return (
    <>
      {/* Ana sayfa galeri açıkken gizlenir ama kaybolmaz: geri dönünce her şey yerinde */}
      <main className="bg-[#0C0C0C]" style={{ overflowX: 'clip' }} hidden={!!project}>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      {project && <ProjectGallery key={project.slug} project={project} />}
      <MusicToggle />
    </>
  );
}
