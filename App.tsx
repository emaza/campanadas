import React, { useEffect, useState, useRef } from 'react';
import { AppPhase, TimeState } from './types';
import Clock from './components/Clock';
import GrapeGrid from './components/GrapeGrid';
import CheekyFace from './components/CheekyFace';
import audioService from './services/audioService';
import FlyingGrape from './components/FlyingGrape';

// Declaration for canvas-confetti
declare global {
  interface Window {
    confetti: any;
  }
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.COUNTDOWN);
  const [timeState, setTimeState] = useState<TimeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    totalSecondsLeft: 100000
  });
  
  // Test mode offset
  const [offsetTime, setOffsetTime] = useState<number>(0);
  const [isTestMode, setIsTestMode] = useState(false);
  
  interface FlyingGrapeState {
    id: number;
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
  }

  // Logic State
  const [chimeCount, setChimeCount] = useState(0);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [flyingGrapes, setFlyingGrapes] = useState<FlyingGrapeState[]>([]);
  
  // Constants
  // Use local time for the target date so it works worldwide (Device Time)
  const TARGET_DATE = new Date(2026, 0, 1, 0, 0, 0); 
  const CHIME_INTERVAL = 3000; // 3 seconds per chime
  
  // Thresholds (relative to target time 0)
  const T_CARILLON_START = -35000; 
  const T_QUARTERS_START = -20000; 
  const T_GAP_START = -5000;       
  const T_CELEBRATION = 12 * CHIME_INTERVAL; 

  // Refs for tracking audio events without render lag
  const prevPhaseRef = useRef<AppPhase>(AppPhase.COUNTDOWN);
  const prevChimeIndexRef = useRef<number>(-1);
  const prevQuarterIndexRef = useRef<number>(-1);
  const carillonPlayedRef = useRef<boolean>(false);
  const mouthTimeoutRef = useRef<any>(null);
  const mouthRef = useRef<SVGGElement>(null);

  // Helper to trigger eating animation
  const triggerEatAnim = (grapeElement?: HTMLElement) => {
    setIsMouthOpen(true);
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    mouthTimeoutRef.current = setTimeout(() => {
        setIsMouthOpen(false);
    }, 300); // Mouth stays open for 300ms

    if (grapeElement && mouthRef.current) {
        const grapeRect = grapeElement.getBoundingClientRect();
        const mouthRect = mouthRef.current.getBoundingClientRect();

        const startPos = {
            x: grapeRect.left + grapeRect.width / 2,
            y: grapeRect.top + grapeRect.height / 2,
        };

        const endPos = {
            x: mouthRect.left + mouthRect.width / 2,
            y: mouthRect.top + mouthRect.height / 2,
        };

        const newGrape = {
            id: Date.now(),
            startPos,
            endPos,
        };

        setFlyingGrapes(prev => [...prev, newGrape]);
    }
  };

  // Resume Audio Context interaction
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

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      const now = Date.now() + offsetTime;
      const visualDate = new Date(now); 

      // Update Visual State
      setTimeState({
        hours: visualDate.getHours(), 
        minutes: visualDate.getMinutes(),
        seconds: visualDate.getSeconds(),
        milliseconds: visualDate.getMilliseconds(),
        totalSecondsLeft: 0 
      });

      // Time difference
      const timeDiff = TARGET_DATE.getTime() - now;
      let currentPhase = AppPhase.COUNTDOWN;

      // Determine Phase
      if (timeDiff > Math.abs(T_CARILLON_START)) {
        currentPhase = AppPhase.COUNTDOWN;
      } else if (timeDiff > Math.abs(T_QUARTERS_START)) {
        currentPhase = AppPhase.CARILLON; 
      } else if (timeDiff > Math.abs(T_GAP_START)) {
        currentPhase = AppPhase.QUARTERS; 
      } else if (timeDiff > 0) {
        currentPhase = AppPhase.GAP;      
      } else {
        const msSinceMidnight = Math.abs(timeDiff);
        if (msSinceMidnight < T_CELEBRATION) {
          currentPhase = AppPhase.CHIMES;
        } else {
          currentPhase = AppPhase.CELEBRATION;
        }
      }

      setPhase(currentPhase);

      // --- AUDIO LOGIC ---
      
      // 1. Phase Transitions
      if (prevPhaseRef.current !== currentPhase) {
          if (currentPhase === AppPhase.CELEBRATION) {
            triggerFireworks();
            audioService.playCelebrationCrowd();
          }
          if (currentPhase === AppPhase.CARILLON) {
              if(!carillonPlayedRef.current) {
                audioService.playCarillon();
                carillonPlayedRef.current = true;
              }
          }
          if (currentPhase === AppPhase.COUNTDOWN) {
              carillonPlayedRef.current = false;
              prevQuarterIndexRef.current = -1;
              prevChimeIndexRef.current = -1;
              setChimeCount(0);
          }
          prevPhaseRef.current = currentPhase;
      }

      // 2. Quarters Logic
      if (currentPhase === AppPhase.QUARTERS) {
         const progress = Math.abs(T_QUARTERS_START) - timeDiff;
         const quarterIdx = Math.floor(progress / 3500); 
         
         if (quarterIdx >= 0 && quarterIdx < 4 && quarterIdx !== prevQuarterIndexRef.current) {
             audioService.playQuarter();
             prevQuarterIndexRef.current = quarterIdx;
         }
      }

      // 3. Chimes Logic
      if (currentPhase === AppPhase.CHIMES) {
        const msSinceMidnight = Math.abs(timeDiff);
        const currentChimeIndex = Math.floor(msSinceMidnight / CHIME_INTERVAL);
        
        setChimeCount(currentChimeIndex + 1);

        if (currentChimeIndex !== prevChimeIndexRef.current && currentChimeIndex < 12) {
          audioService.playChime();
          // Trigger mouth animation on auto chime
          triggerEatAnim(undefined);
          prevChimeIndexRef.current = currentChimeIndex;
        }
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

  const triggerFireworks = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const burstCount = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < burstCount; i++) {
        const particleCount = Math.floor(randomInRange(30, 60));
        const origin = { 
            x: randomInRange(0.1, 0.9), 
            y: Math.random() * 0.5 
        };
        
        if (window.confetti) {
            window.confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
                particleCount,
                origin,
                colors: ['#FFD700', '#FF0000', '#FFFFFF', '#00FF00', '#0000FF']
            });
        }
        
        setTimeout(() => {
            audioService.playFireworkExplosion();
        }, Math.random() * 100);
      }

    }, 800);
  };

  const startTest = () => {
    audioService.init();
    setIsTestMode(true);
    const now = Date.now();
    const target = TARGET_DATE.getTime();
    setOffsetTime(target - 40000 - now);
    
    prevChimeIndexRef.current = -1;
    prevQuarterIndexRef.current = -1;
    carillonPlayedRef.current = false;
  };

  const getPhaseText = () => {
    switch (phase) {
      case AppPhase.COUNTDOWN: return "CUENTA ATRÁS";
      case AppPhase.CARILLON: return "BAJA LA BOLA (CARILLÓN)";
      case AppPhase.QUARTERS: return "LOS CUARTOS";
      case AppPhase.GAP: return "ATENTOS...";
      case AppPhase.CHIMES: return "¡LAS 12 UVAS!";
      case AppPhase.CELEBRATION: return "¡FELIZ AÑO 2026!";
      default: return "";
    }
  };

  const showFace = phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION;

  const handleAnimationEnd = (id: number) => {
    setFlyingGrapes(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 overflow-hidden relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      
      {flyingGrapes.map(grape => (
        <FlyingGrape
            key={grape.id}
            startPos={grape.startPos}
            endPos={grape.endPos}
            onEnd={() => handleAnimationEnd(grape.id)}
        />
      ))}

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="z-10 text-center mb-2">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-500 tracking-widest drop-shadow-lg">
          CAMPANADAS 2026
        </h1>
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center w-full max-w-4xl flex-grow justify-center">
        
        {/* Clock & Face Container */}
        <div className="mb-4 relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transform scale-90 md:scale-100 transition-transform duration-500">
           {/* The Clock is always rendered */}
           <Clock time={timeState} />

           {/* The Face is absolutely positioned ON TOP of the clock, 
               only visible during CHIMES or CELEBRATION */}
           <div className={`absolute inset-0 z-20 transition-opacity duration-500 ease-in-out ${showFace ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
               <CheekyFace 
                 grapeCount={chimeCount} 
                 isEating={isMouthOpen} 
                 isCelebrating={phase === AppPhase.CELEBRATION}
                 mouthRef={mouthRef}
               />
           </div>
        </div>

        {/* Phase Indicator */}
        <div className="text-center min-h-[5rem] mb-2 flex flex-col items-center justify-center">
          <h2 className={`text-3xl md:text-5xl font-bold text-white transition-all duration-300 ${phase === AppPhase.CHIMES ? 'scale-110 text-yellow-400' : phase === AppPhase.QUARTERS ? 'text-orange-300' : ''}`}>
            {getPhaseText()}
          </h2>
          {phase === AppPhase.COUNTDOWN && (
             <p className="text-xl md:text-2xl text-slate-400 font-mono mt-1">
               {TARGET_DATE.getTime() - (Date.now() + offsetTime) > 0 
                  ? new Date(TARGET_DATE.getTime() - (Date.now() + offsetTime)).toISOString().substr(11, 8) 
                  : "00:00:00"
               }
             </p>
          )}
        </div>

        {/* Grapes Grid */}
        <div className={`transition-opacity duration-1000 ${phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION || phase === AppPhase.GAP ? 'opacity-100' : 'opacity-20'}`}>
           <GrapeGrid currentChime={chimeCount} onEat={triggerEatAnim} />
        </div>

      </main>

      {/* Footer / Controls */}
      <footer className="z-10 flex flex-col items-center gap-4 mb-4">
        {/* Button hidden by request */}
      </footer>

    </div>
  );
};

export default App;