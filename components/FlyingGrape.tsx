import React, { useEffect, useState } from 'react';

interface FlyingGrapeProps {
  id: number;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onEnd: (id: number) => void;
}

const ANIMATION_DURATION = 500;
const DELAY_BEFORE_FADE = 20;
const FADE_DURATION = 200;

const FlyingGrape: React.FC<FlyingGrapeProps> = ({ id, startPos, endPos, onEnd }) => {
  const [position, setPosition] = useState(startPos);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Animate to end position
    requestAnimationFrame(() => {
      setPosition(endPos);
    });

    // Start fading out after the grape arrives + a delay
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, ANIMATION_DURATION + DELAY_BEFORE_FADE);

    // Remove the component after the fade-out is complete
    const endTimer = setTimeout(() => {
      onEnd(id);
    }, ANIMATION_DURATION + DELAY_BEFORE_FADE + FADE_DURATION);


    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    }
  }, [id, startPos, endPos, onEnd]);

  return (
    <div
      className="fixed w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: visible ? 1 : 0,
        transition: `left ${ANIMATION_DURATION}ms ease-in-out, top ${ANIMATION_DURATION}ms ease-in-out, transform ${ANIMATION_DURATION}ms ease-in-out, opacity ${FADE_DURATION}ms ease-out`,
      }}
    />
  );
};

export default FlyingGrape;
