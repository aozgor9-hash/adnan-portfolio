import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';

type Props = { text: string; className?: string; style?: CSSProperties };

/** Scroll ilerledikçe harf harf beliren paragraf. */
export default function AnimatedText({ text, className, style }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });

  const total = Array.from(text).length;
  const words = text.split(' ');
  let index = 0;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, w) => {
        const chars = Array.from(word + (w < words.length - 1 ? ' ' : ''));
        return (
          <span key={w} className="inline-block whitespace-pre">
            {chars.map((ch) => {
              const start = index / total;
              const end = start + 1 / total;
              index++;
              return <Char key={index} ch={ch} progress={scrollYProgress} range={[start, end]} />;
            })}
          </span>
        );
      })}
    </p>
  );
}

function Char({ ch, progress, range }: { ch: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative">
      <span className="invisible">{ch}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {ch}
      </motion.span>
    </span>
  );
}
