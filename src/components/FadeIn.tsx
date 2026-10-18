import { motion } from 'framer-motion';
import type { CSSProperties, ElementType, ReactNode } from 'react';

type FadeInProps = {
  as?: ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  role?: string;
  children?: ReactNode;
};

// motion.create() her render'da yeni bileşen üretmesin diye önbellek
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<ElementType, any>();
function motionFor(as: ElementType) {
  if (!cache.has(as)) cache.set(as, motion.create(as as never));
  return cache.get(as);
}

export default function FadeIn({
  as = 'div',
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
  role,
  children,
}: FadeInProps) {
  const Comp = motionFor(as);
  return (
    <Comp
      className={className}
      style={style}
      role={role}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  );
}
