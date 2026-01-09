import React, { useCallback, useState, useRef } from 'react';
import { AppPhase, FlyingGrapeState } from './types';
import Clock from './components/Clock';
import GrapeGrid from './components/GrapeGrid';
import CheekyFace from './components/CheekyFace';
import FlyingGrape from './components/FlyingGrape';
import MessageOverlay from './components/MessageOverlay';
import InstructionsButton from './components/InstructionsButton';
import { useCampanadasTimer } from './hooks/useCampanadasTimer';
import { useAudioController } from './hooks/useAudioController';
import { useFireworks } from './hooks/useFireworks';
import {
  TARGET_DATE,
  MOUTH_OPEN_DURATION,
  EARLY_CLICK_MODAL_AUTO_CLOSE_MS,
  INSTRUCTIONS_MODAL_AUTO_CLOSE_MS
} from './config/constants';
import audioService from './services/audioService';

declare const __APP_VERSION__: string;

interface OverlayMessage {
  text: string;
  duration: number;
}

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
  const [overlayMessage, setOverlayMessage] = useState<OverlayMessage | null>(null);
  const [eatenGrapesOrder, setEatenGrapesOrder] = useState<number[]>([]);
  const [grapeStatus, setGrapeStatus] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [lastCorrectChime, setLastCorrectChime] = useState<number>(0);

  const mouthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouthRef = useRef<SVGGElement>(null);

  const onGrapeClick = useCallback((grapeNumber: number, grapeElement: HTMLElement) => {
    // Prevent clicking same grape twice
    if (grapeStatus[grapeNumber]) return;

    // 1. Trigger visual animation for eating
    setIsMouthOpen(true);
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    mouthTimeoutRef.current = setTimeout(() => setIsMouthOpen(false), MOUTH_OPEN_DURATION);

    if (mouthRef.current) {
      const grapeRect = grapeElement.getBoundingClientRect();
      const mouthRect = mouthRef.current.getBoundingClientRect();
      const startPos = { x: grapeRect.left + grapeRect.width / 2, y: grapeRect.top + grapeRect.height / 2 };
      const endPos = { x: mouthRect.left + mouthRect.width / 2, y: mouthRect.top + mouthRect.height / 2 };
      setFlyingGrapes(prev => [...prev, { id: Date.now(), startPos, endPos }]);
      vibrarTelefono([200, 200]);
    }

    // 2. Scoring Logic
    const msSinceMidnight = Math.abs(timeDiff);
    const currentChime = Math.floor(msSinceMidnight / 3000) + 1;
    const currentChimeStart = (currentChime - 1) * 3000;
    const isClickInTime = msSinceMidnight >= currentChimeStart && msSinceMidnight < currentChimeStart + MOUTH_OPEN_DURATION;

    const isCorrect = isClickInTime && currentChime > lastCorrectChime;

    if (isCorrect) {
      setLastCorrectChime(currentChime);
    }

    setEatenGrapesOrder(prev => [...prev, grapeNumber]);
    setGrapeStatus(prev => ({ ...prev, [grapeNumber]: isCorrect ? 'correct' : 'incorrect' }));

  }, [timeDiff, grapeStatus, lastCorrectChime]);

  const vibrarTelefono = (pattern) => {
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
  };

  const startTest = () => {
    audioService.init();
    setIsTestMode(true);
    const now = Date.now();
    const target = TARGET_DATE.getTime();
    setOffsetTime(target - 40000 - now);
    vibrarTelefono([200, 200]);
  };

  const getPhaseText = () => {
    switch (phase) {
      case AppPhase.COUNTDOWN: return "CUENTA ATRÁS...";
      case AppPhase.CARILLON: return "BAJA LA BOLA (CARILLÓN)";
      case AppPhase.QUARTERS: return "LOS CUARTOS";
      case AppPhase.GAP: return "ATENTOS...";
      case AppPhase.CHIMES: return "¡A POR LAS 12 UVAS!";
      case AppPhase.CELEBRATION: return "¡FELIZ AÑO 2027!";
      default: return "";
    }
  };

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (days > 1) return `${days} días ${timeString}`;
    if (days === 1) return `1 día ${timeString}`;
    return timeString;
  };

  const showFace = phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION;

  const handleAnimationEnd = useCallback((id: number) => {
    setFlyingGrapes(prev => prev.filter(g => g.id !== id));
  }, []);

  const showEarlyClickMessage = useCallback(() => {
    setOverlayMessage({
      text: '¡Aún no ansioso!, espera a que empiecen las campanadas.',
      duration: EARLY_CLICK_MODAL_AUTO_CLOSE_MS
    });
    vibrarTelefono([200, 200]);
  }, []);

  const showInstructionsMessage = useCallback(() => {
    setOverlayMessage({
      text: 'Vamos a empezar bien el año!!! 🥳 Espera a que empiecen las campanadas y toca cada uva cuando suene la campana.',
      duration: INSTRUCTIONS_MODAL_AUTO_CLOSE_MS
    });
    vibrarTelefono([200, 200]);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setOverlayMessage(null);
  }, []);

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
          CAMPANADAS 2027
        </h1>
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center w-full max-w-4xl flex-grow justify-center">

        <InstructionsButton onClick={showInstructionsMessage} isVisible={phase !== AppPhase.CELEBRATION} />

        {/* Clock & Face Container */}
        <div className="mb-4 relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transform scale-90 md:scale-100 transition-transform duration-500">
          {/* The Clock is always rendered */}
          <Clock hours={timeState.hours} minutes={timeState.minutes} seconds={timeState.seconds} />

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
        < div className="text-center min-h-[5rem] mb-2 flex flex-col items-center justify-center" aria-live="polite" >
          <h2 className={`text-3xl md:text-5xl font-bold text-white transition-all duration-300 ${phase === AppPhase.CHIMES ? 'scale-110 text-yellow-400' : phase === AppPhase.QUARTERS ? 'text-orange-300' : ''}`}>
            {getPhaseText()}
          </h2>
          {
            phase === AppPhase.COUNTDOWN && (
              <p className="text-xl md:text-2xl text-slate-400 font-mono mt-1">
                {timeDiff > 0
                  ? formatCountdown(timeDiff)
                  : "00:00:00"
                }
              </p>
            )
          }
          <MessageOverlay
            message={overlayMessage?.text ?? ''}
            duration={overlayMessage?.duration}
            onClose={handleOverlayClose}
          />
        </div >

        {/* Grapes Grid */}
        <div className="relative">
          <div className={`transition-opacity duration-1000 ${phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION || phase === AppPhase.GAP ? 'opacity-100' : 'opacity-20'}`}>
            <GrapeGrid
              currentChime={chimeCount}
              onEat={onGrapeClick}
              phase={phase}
              onEarlyClick={showEarlyClickMessage}
              grapeStatus={grapeStatus}
            />
          </div>
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

        <p className="text-sm text-slate-400">Version: {__APP_VERSION__}</p>

      </footer >

    </div >
  );
};

export default App;
