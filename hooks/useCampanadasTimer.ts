import { useState, useEffect } from 'react';
import { AppPhase, TimeState } from '../types';
import {
  TARGET_DATE,
  CHIME_INTERVAL,
  T_CARILLON_START,
  T_QUARTERS_START,
  T_GAP_START,
  T_CELEBRATION_START,
} from '../config/constants';

interface UseCampanadasTimerProps {
  offsetTime: number;
}

export const useCampanadasTimer = ({ offsetTime }: UseCampanadasTimerProps) => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.COUNTDOWN);
  const [timeState, setTimeState] = useState<TimeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    totalSecondsLeft: 100000,
  });
  const [chimeCount, setChimeCount] = useState(0);
  const [timeDiff, setTimeDiff] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      const now = Date.now() + offsetTime;
      const visualDate = new Date(now);

      setTimeState({
        hours: visualDate.getHours(),
        minutes: visualDate.getMinutes(),
        seconds: visualDate.getSeconds(),
        milliseconds: visualDate.getMilliseconds(),
        totalSecondsLeft: 0,
      });

      const timeDiffValue = TARGET_DATE.getTime() - now;
      setTimeDiff(timeDiffValue);
      let currentPhase = AppPhase.COUNTDOWN;

      if (timeDiffValue > Math.abs(T_CARILLON_START)) {
        currentPhase = AppPhase.COUNTDOWN;
      } else if (timeDiffValue > Math.abs(T_QUARTERS_START)) {
        currentPhase = AppPhase.CARILLON;
      } else if (timeDiffValue > Math.abs(T_GAP_START)) {
        currentPhase = AppPhase.QUARTERS;
      } else if (timeDiffValue > 0) {
        currentPhase = AppPhase.GAP;
      } else {
        const msSinceMidnight = Math.abs(timeDiffValue);
        if (msSinceMidnight < T_CELEBRATION_START) {
          currentPhase = AppPhase.CHIMES;
        } else {
          currentPhase = AppPhase.CELEBRATION;
        }
      }

      setPhase(currentPhase);

      if (currentPhase === AppPhase.CHIMES) {
        const msSinceMidnight = Math.abs(timeDiffValue);
        const currentChimeIndex = Math.floor(msSinceMidnight / CHIME_INTERVAL);
        setChimeCount(currentChimeIndex + 1);
      } else if (currentPhase !== AppPhase.CELEBRATION) {
         if (currentPhase === AppPhase.COUNTDOWN) {
          setChimeCount(0);
        }
      }


      animationFrameId = requestAnimationFrame(updateTime);
    };

    updateTime();

    return () => cancelAnimationFrame(animationFrameId);
  }, [offsetTime]);

  return { phase, timeState, chimeCount, timeDiff };
};
