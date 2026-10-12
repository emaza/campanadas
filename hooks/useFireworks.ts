import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppPhase } from '../types';
import audioService from '../services/audioService';
import { FIREWORKS_DURATION, FIREWORKS_COLORS } from '../config/constants';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const useFireworks = ({ phase }: { phase: AppPhase }) => {
  useEffect(() => {
    if (phase !== AppPhase.CELEBRATION) return;

    const end = Date.now() + FIREWORKS_DURATION;
    const burst = () => {
      if (Date.now() > end) return clearInterval(interval);
      const n = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < n; i++) {
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 70,
          zIndex: 0,
          particleCount: Math.floor(rand(30, 60)),
          origin: { x: rand(0.1, 0.9), y: rand(0, 0.45) },
          colors: FIREWORKS_COLORS,
          disableForReducedMotion: true,
        });
        setTimeout(() => audioService.playFireworkExplosion(), Math.random() * 100);
      }
    };

    burst();
    const interval = setInterval(burst, 800);
    return () => clearInterval(interval);
  }, [phase]);
};
