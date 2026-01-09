import { useEffect, useRef } from 'react';
import { AppPhase } from '../types';
import audioService from '../services/audioService';
import { T_QUARTERS_START, CHIME_INTERVAL } from '../config/constants';

interface UseAudioControllerProps {
  phase: AppPhase;
  timeDiff: number;
}

export const useAudioController = ({ phase, timeDiff }: UseAudioControllerProps) => {
  const prevPhaseRef = useRef<AppPhase>(AppPhase.COUNTDOWN);
  const prevChimeIndexRef = useRef<number>(-1);
  const prevQuarterIndexRef = useRef<number>(-1);
  const carillonPlayedRef = useRef<boolean>(false);

  // Effect for resuming Audio Context on user interaction
  useEffect(() => {
    const resumeAudio = () => {
      audioService.init();
    };
    window.addEventListener('click', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  // Effect for handling audio events based on phase and time changes
  useEffect(() => {
    // 1. Phase Transitions
    if (prevPhaseRef.current !== phase) {
      if (phase === AppPhase.CELEBRATION) {
        audioService.playCelebrationCrowd();
      }
      if (phase === AppPhase.CARILLON) {
        if (!carillonPlayedRef.current) {
          audioService.playCarillon();
          carillonPlayedRef.current = true;
        }
      }
      if (phase === AppPhase.COUNTDOWN) {
        // Reset refs on returning to countdown
        carillonPlayedRef.current = false;
        prevQuarterIndexRef.current = -1;
        prevChimeIndexRef.current = -1;
      }
      prevPhaseRef.current = phase;
    }

    // 2. Quarters Logic
    if (phase === AppPhase.QUARTERS) {
      const progress = Math.abs(T_QUARTERS_START) - timeDiff;
      const quarterIdx = Math.floor(progress / 3500);
      // vibrarTelefono([200, 200]);
      if (quarterIdx >= 0 && quarterIdx < 4 && quarterIdx !== prevQuarterIndexRef.current) {
        audioService.playQuarter();
        prevQuarterIndexRef.current = quarterIdx;
      }
    }

    function vibrarTelefono(pattern) {
      console.log("Vibrando", pattern);
      if ("vibrate" in navigator) {
        // Intentar vibrar 500ms
        const exito = navigator.vibrate(pattern);
        if (!exito) {
          console.log("La vibración fue bloqueada o no es compatible.");
        }
      } else {
        console.log("Tu navegador no soporta la API de vibración.");
      }
    }

    // 3. Chimes Logic
    if (phase === AppPhase.CHIMES) {
      const msSinceMidnight = Math.abs(timeDiff);
      const currentChimeIndex = Math.floor(msSinceMidnight / CHIME_INTERVAL);

      if (currentChimeIndex !== prevChimeIndexRef.current && currentChimeIndex < 12) {
        audioService.playChime();
        // vibrarTelefono([200, 200]);
        prevChimeIndexRef.current = currentChimeIndex;
      }
    }
  }, [phase, timeDiff]);
};
