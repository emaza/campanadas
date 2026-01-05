import React, { useCallback, useState, useRef, useEffect } from 'react';
import { AppPhase, FlyingGrapeState } from './types';
import Clock from './components/Clock';
import GrapeGrid from './components/GrapeGrid';
import CheekyFace from './components/CheekyFace';
import FlyingGrape from './components/FlyingGrape';
import MessageOverlay from './components/MessageOverlay';
import { useCampanadasTimer } from './hooks/useCampanadasTimer';
import { useAudioController } from './hooks/useAudioController';
import { useFireworks } from './hooks/useFireworks';
import { TARGET_DATE, MOUTH_OPEN_DURATION } from './config/constants';
import audioService from './services/audioService';

const App: React.FC = () => {
  // Test mode offset
  const [offsetTime, setOffsetTime] = useState<number>(0);
  const { phase, timeState, chimeCount, timeDiff } = useCampanadasTimer({ offsetTime });

  useAudioController({ phase, timeDiff });
  useFireworks({ phase });
  const [isTestMode, setIsTestMode] = useState(false);

  // Logic State
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [flyingGrapes, setFlyingGrapes] = useState<FlyingGrapeState[]>([]);
  const [overlayMessage, setOverlayMessage] = useState<string>('');

  const mouthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouthRef = useRef<SVGGElement>(null);

  // Helper to trigger eating animation
  const triggerEatAnim = (grapeElement?: HTMLElement) => {
    setIsMouthOpen(true);
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    mouthTimeoutRef.current = setTimeout(() => {
      setIsMouthOpen(false);
    }, MOUTH_OPEN_DURATION); // Mouth stays open for 300ms

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

  const prevChimeCountRef = useRef(chimeCount);
  useEffect(() => {
    if (chimeCount > 0 && chimeCount !== prevChimeCountRef.current) {
      triggerEatAnim(undefined);
      prevChimeCountRef.current = chimeCount;
    }
  }, [chimeCount]);

  const startTest = () => {
    audioService.init();
    setIsTestMode(true);
    const now = Date.now();
    const target = TARGET_DATE.getTime();
    setOffsetTime(target - 40000 - now);
  };

  const getPhaseText = () => {
    switch (phase) {
      case AppPhase.COUNTDOWN: return "CUENTA ATRÁS";
      case AppPhase.CARILLON: return "BAJA LA BOLA (CARILLÓN)";
      case AppPhase.QUARTERS: return "LOS CUARTOS";
      case AppPhase.GAP: return "ATENTOS...";
      case AppPhase.CHIMES: return "¡LAS 12 UVAS!";
      case AppPhase.CELEBRATION: return "¡FELIZ AÑO 2027!";
      default: return "";
    }
  };

  const showFace = phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION;

  const handleAnimationEnd = useCallback((id: number) => {
    setFlyingGrapes(prev => prev.filter(g => g.id !== id));
  }, []);

  const showEarlyClickMessage = () => {
    setOverlayMessage('Aún no ansioso!!!, espera que empiecen las campanadas.');
    setTimeout(() => {
      setOverlayMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 overflow-hidden relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

      {
        flyingGrapes.map(grape => (
          <FlyingGrape
            key={grape.id}
            id={grape.id}
            startPos={grape.startPos}
            endPos={grape.endPos}
            onEnd={handleAnimationEnd}
          />
        ))
      }

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
        </div >

        {/* Phase Indicator */}
        < div className="text-center min-h-[5rem] mb-2 flex flex-col items-center justify-center" >
          <h2 className={`text-3xl md:text-5xl font-bold text-white transition-all duration-300 ${phase === AppPhase.CHIMES ? 'scale-110 text-yellow-400' : phase === AppPhase.QUARTERS ? 'text-orange-300' : ''}`}>
            {getPhaseText()}
          </h2>
          {
            phase === AppPhase.COUNTDOWN && (
              <p className="text-xl md:text-2xl text-slate-400 font-mono mt-1">
                {timeDiff > 0
                  ? new Date(timeDiff).toISOString().substr(11, 8)
                  : "00:00:00"
                }
              </p>
            )
          }
        </div >

        {/* Grapes Grid & Message Overlay Container */}
        <div className="relative">
          <div className={`transition-opacity duration-1000 ${phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION || phase === AppPhase.GAP ? 'opacity-100' : 'opacity-20'}`}>
            <GrapeGrid
              currentChime={chimeCount}
              onEat={triggerEatAnim}
              phase={phase}
              onEarlyClick={showEarlyClickMessage}
            />
          </div>
          <MessageOverlay message={overlayMessage} isVisible={!!overlayMessage} />
        </div>

      </main >

      {/* Footer / Controls */}
      < footer className="z-10 flex flex-col items-center gap-4 mb-4" >
        {!isTestMode && (
          <>
            <button
              onClick={startTest}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-full text-sm transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              Simular Campanadas (Test)
            </button>
          </>
        )}
      </footer >

    </div >
  );
};

export default App;