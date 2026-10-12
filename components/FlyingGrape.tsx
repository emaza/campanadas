import React, { useEffect, useRef } from 'react';

interface FlyingGrapeProps {
  id: number;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onEnd: (id: number) => void;
}

const DURATION = 450;

/** Uva que vuela en parábola hasta la boca del reloj. */
const FlyingGrape: React.FC<FlyingGrapeProps> = ({ id, startPos, endPos, onEnd }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const anim = el.animate(
      [
        { transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(1.15)`, opacity: 1, offset: 0.5 },
        { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.2 },
      ],
      { duration: DURATION, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' },
    );
    anim.onfinish = () => onEnd(id);
    return () => anim.cancel();
  }, [id, startPos, endPos, onEnd]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed z-50 h-9 w-9 rounded-full"
      style={{
        left: startPos.x,
        top: startPos.y,
        background: 'radial-gradient(circle at 35% 30%, #e6f7b0 0 18%, #a3cc45 40%, #4b7a1c 100%)',
      }}
    />
  );
};

export default FlyingGrape;
