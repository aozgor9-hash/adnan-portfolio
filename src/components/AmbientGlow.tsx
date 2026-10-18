import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { getLevel } from '../audio';

/**
 * Portrenin arkasında yavaşça dönen kırmızı / yeşil / mavi ışık.
 * Müzik çalarken basla birlikte nefes alır.
 */
export default function AmbientGlow({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useTransform(progress, [0, 0.5, 1], [1, 0.9, 0.35]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ref.current?.style.setProperty('--lvl', getLevel().toFixed(3));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[40%] -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2"
      style={{ opacity }}
    >
      <div
        ref={ref}
        className="ambient-glow absolute inset-0"
        style={{ ['--lvl' as string]: 0 }}
      >
        <span className="ambient-blob ambient-r" />
        <span className="ambient-blob ambient-g" />
        <span className="ambient-blob ambient-b" />
      </div>
    </motion.div>
  );
}
