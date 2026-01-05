import { useEffect } from 'react';
import { AppPhase } from '../types';
import audioService from '../services/audioService';
import { FIREWORKS_DURATION, FIREWORKS_COLORS } from '../config/constants';

interface UseFireworksProps {
  phase: AppPhase;
}

const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const useFireworks = ({ phase }: UseFireworksProps) => {
  useEffect(() => {
    if (phase !== AppPhase.CELEBRATION) {
      return;
    }

    const animationEnd = Date.now() + FIREWORKS_DURATION;
    let interval: NodeJS.Timeout | null = null;

    const triggerFireworksBurst = () => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        if (interval) clearInterval(interval);
        return;
      }

      const burstCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < burstCount; i++) {
        const particleCount = Math.floor(randomInRange(30, 60));
        const origin = {
          x: randomInRange(0.1, 0.9),
          y: Math.random() * 0.5,
        };

        if (window.confetti) {
          window.confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount,
            origin,
            colors: FIREWORKS_COLORS,
          });
        }

        setTimeout(() => {
          audioService.playFireworkExplosion();
        }, Math.random() * 100);
      }
    };

    // Start the fireworks
    triggerFireworksBurst();
    interval = setInterval(triggerFireworksBurst, 800);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);
};
