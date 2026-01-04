import React, { useEffect, useState } from 'react';

interface FlyingGrapeProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onEnd: () => void;
}

const ANIMATION_DURATION = 500;

const FlyingGrape: React.FC<FlyingGrapeProps> = ({ startPos, endPos, onEnd }) => {
  const [position, setPosition] = useState(startPos);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Animate to end position
    requestAnimationFrame(() => {
      setPosition(endPos);
    });

    // Disappear and notify parent after animation
    const timer = setTimeout(() => {
      setVisible(false);
      onEnd();
    }, ANIMATION_DURATION); // Corresponds to animation duration

    return () => clearTimeout(timer);
  }, [startPos, endPos, onEnd]);

  return (
    <div
      className="fixed w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: visible ? 1 : 0,
        transition: `left ${ANIMATION_DURATION}ms ease-in-out, top ${ANIMATION_DURATION}ms ease-in-out, transform ${ANIMATION_DURATION}ms ease-in-out, opacity 0.2s 0.3s`,
      }}
    />
  );
};

export default FlyingGrape;
