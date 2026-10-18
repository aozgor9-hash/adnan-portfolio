import { motion, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { FaceScene } from './FaceScene';

type Props = {
  faceUrl: string;
  depthUrl: string;
  /** Yüzün oturacağı DOM kutusu (Magnet ile hareket eder) */
  anchorRef: RefObject<HTMLDivElement>;
  /** 0 → fotoğraf, ~0.45 → wireframe, 1 → tamamen dağılmış */
  progress: MotionValue<number>;
  onReady?: (ok: boolean) => void;
};

/** Hero'yu kaplayan tuval; yüzü çapa kutusunun üstünde 3D olarak çizer. */
export default function Face3D({ faceUrl, depthUrl, anchorRef, progress, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FaceScene | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: FaceScene;
    try {
      scene = new FaceScene(canvas, faceUrl, depthUrl, () => anchorRef.current?.getBoundingClientRect() ?? null);
    } catch {
      onReady?.(false);
      return;
    }
    sceneRef.current = scene;
    scene.setProgress(progress.get());
    scene.ready
      .then(() => {
        scene.start();
        // ilk kare çizilince fotoğraf yedeğini gizle
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setVisible(true);
            onReady?.(true);
          }),
        );
      })
      .catch(() => onReady?.(false));

    const onMove = (e: MouseEvent) => {
      scene.setMouse((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceUrl, depthUrl]);

  useMotionValueEvent(progress, 'change', (v) => sceneRef.current?.setProgress(v));

  return (
    <motion.canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.01 }}
    />
  );
}
