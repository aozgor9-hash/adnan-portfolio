import { useEffect, useRef, type CSSProperties } from 'react';
import { stopMusic } from '../audio';

type Props = {
  src: string;
  poster: string;
  className?: string;
  style?: CSSProperties;
  /** Galeri: oynatma kontrolleri görünür, ses açılabilir */
  controls?: boolean;
  label?: string;
};

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Görünür olunca sessiz döngüde oynar, ekrandan çıkınca durur. */
export default function AutoVideo({ src, poster, className, style, controls, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduceMotion()) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    // ziyaretçi videonun sesini açarsa arka plan müziği susar
    const onVolume = () => {
      if (!v.muted && v.volume > 0) stopMusic();
    };
    v.addEventListener('volumechange', onVolume);
    return () => {
      io.disconnect();
      v.removeEventListener('volumechange', onVolume);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls}
      aria-label={label}
      className={className}
      style={style}
    />
  );
}
