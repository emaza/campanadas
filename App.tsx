import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppPhase, FlyingGrapeState, GrapeResult } from './types';
import Tower from './components/Tower';
import GrapeGrid from './components/GrapeGrid';
import CheekyFace from './components/CheekyFace';
import FlyingGrape from './components/FlyingGrape';
import MessageOverlay from './components/MessageOverlay';
import ResultCard from './components/ResultCard';
import { useCampanadasTimer } from './hooks/useCampanadasTimer';
import { useAudioController } from './hooks/useAudioController';
import { useFireworks } from './hooks/useFireworks';
import {
  TARGET_DATE,
  CHIME_INTERVAL,
  MOUTH_OPEN_DURATION,
  PERFECT_WINDOW_MS,
  T_CARILLON_START,
  T_QUARTERS_START,
  EARLY_CLICK_MODAL_AUTO_CLOSE_MS,
  INSTRUCTIONS_MODAL_AUTO_CLOSE_MS,
} from './config/constants';
import audioService from './services/audioService';

declare const __APP_VERSION__: string;

const YEAR = TARGET_DATE.getFullYear();
const RESULT_DELAY_MS = 2500;

interface OverlayMessage { text: string; duration: number }

const pad = (n: number) => n.toString().padStart(2, '0');

function splitCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hms: `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` };
}

const App: React.FC = () => {
  const [offsetTime, setOffsetTime] = useState(0);
  const { phase, timeState, chimeCount, timeDiff } = useCampanadasTimer({ offsetTime });
  useAudioController({ phase, timeDiff });
  useFireworks({ phase });

  const [isTestMode, setIsTestMode] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [flyingGrapes, setFlyingGrapes] = useState<FlyingGrapeState[]>([]);
  const [overlayMessage, setOverlayMessage] = useState<OverlayMessage | null>(null);
  const [grapeStatus, setGrapeStatus] = useState<Record<number, GrapeResult>>({});
  const [chimeResults, setChimeResults] = useState<Record<number, 'perfect' | 'good'>>({});
  const [showResult, setShowResult] = useState(false);

  const mouthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouthRef = useRef<SVGGElement>(null);

  // El sonido sólo puede arrancar tras un gesto del usuario
  useEffect(() => {
    const unlock = () => setSoundReady(true);
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // Al volver a la cuenta atrás, limpiamos la partida
  useEffect(() => {
    if (phase === AppPhase.COUNTDOWN || phase === AppPhase.CARILLON) {
      setGrapeStatus({});
      setChimeResults({});
      setShowResult(false);
    }
    if (phase === AppPhase.CELEBRATION) {
      const t = setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const onGrapeClick = useCallback((grapeNumber: number, el: HTMLElement) => {
    if (grapeStatus[grapeNumber]) return;

    audioService.playGulp();
    setIsMouthOpen(true);
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    mouthTimeoutRef.current = setTimeout(() => setIsMouthOpen(false), MOUTH_OPEN_DURATION);

    if (mouthRef.current) {
      const g = el.getBoundingClientRect();
      const m = mouthRef.current.getBoundingClientRect();
      setFlyingGrapes((prev) => [...prev, {
        id: Date.now(),
        startPos: { x: g.left + g.width / 2, y: g.top + g.height / 2 },
        endPos: { x: m.left + m.width / 2, y: m.top + m.height / 2 },
      }]);
    }

    // Una uva por campanada: si ya te has comido la de esta campanada, ésta va "fuera de tiempo"
    const since = Math.abs(timeDiff);
    const chime = Math.floor(since / CHIME_INTERVAL) + 1;
    const intoChime = since - (chime - 1) * CHIME_INTERVAL;
    let result: GrapeResult = 'miss';
    if (chime <= 12 && !chimeResults[chime]) {
      result = intoChime < PERFECT_WINDOW_MS ? 'perfect' : 'good';
      setChimeResults((prev) => ({ ...prev, [chime]: result as 'perfect' | 'good' }));
    }
    setGrapeStatus((prev) => ({ ...prev, [grapeNumber]: result }));
  }, [timeDiff, grapeStatus, chimeResults]);

  const startTest = () => {
    audioService.init();
    setIsTestMode(true);
    setShowResult(false);
    setGrapeStatus({});
    setChimeResults({});
    setOffsetTime(TARGET_DATE.getTime() - 40000 - Date.now());
  };

  const showEarlyClickMessage = useCallback(() => {
    const text = phase === AppPhase.QUARTERS
      ? '¡Quieto, que son los cuartos!'
      : 'Todavía no. Espera a la primera campanada.';
    setOverlayMessage({ text, duration: EARLY_CLICK_MODAL_AUTO_CLOSE_MS });
  }, [phase]);

  const showInstructions = useCallback(() => {
    setOverlayMessage({
      text: 'Cuando suene cada campanada, toca una uva. Una por campanada: si te adelantas, no cuenta.',
      duration: INSTRUCTIONS_MODAL_AUTO_CLOSE_MS,
    });
  }, []);

  const closeOverlay = useCallback(() => setOverlayMessage(null), []);
  const removeGrape = useCallback((id: number) => setFlyingGrapes((p) => p.filter((g) => g.id !== id)), []);

  // Progreso de la bola: baja durante el carillón
  const ballProgress =
    phase === AppPhase.COUNTDOWN ? 0
      : phase === AppPhase.CARILLON
        ? (Math.abs(T_CARILLON_START) - timeDiff) / (Math.abs(T_CARILLON_START) - Math.abs(T_QUARTERS_START))
        : 1;

  const showFace = phase === AppPhase.CHIMES || phase === AppPhase.CELEBRATION;
  const eatenCount = Object.keys(grapeStatus).length;
  const { days, hms } = splitCountdown(timeDiff);

  let title: React.ReactNode;
  let subtitle: React.ReactNode = null;
  switch (phase) {
    case AppPhase.COUNTDOWN:
      title = <span className="tabular-nums">{days > 0 && <>{days} {days === 1 ? 'día' : 'días'} </>}{hms}</span>;
      subtitle = `para entrar en ${YEAR}`;
      break;
    case AppPhase.CARILLON:
      title = 'Baja la bola';
      subtitle = 'Prepara las uvas';
      break;
    case AppPhase.QUARTERS:
      title = 'Los cuartos';
      subtitle = 'No, todavía no son las campanadas';
      break;
    case AppPhase.GAP:
      title = 'Atentos…';
      subtitle = 'Ahora sí';
      break;
    case AppPhase.CHIMES:
      title = <><span className="tabular-nums">{chimeCount}</span><span className="text-piedra/50"> / 12</span></>;
      subtitle = 'Una uva por campanada';
      break;
    case AppPhase.CELEBRATION:
      title = `¡Feliz ${YEAR}!`;
      subtitle = `${Object.keys(chimeResults).length} de 12 uvas a tiempo`;
      break;
  }

  const isBigNumber = phase === AppPhase.CHIMES;

  return (
    <div className="cielo relative flex min-h-dvh flex-col items-center overflow-hidden px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="estrellas pointer-events-none absolute inset-0" aria-hidden="true" />

      {flyingGrapes.map((g) => (
        <FlyingGrape key={g.id} id={g.id} startPos={g.startPos} endPos={g.endPos} onEnd={removeGrape} />
      ))}

      <header className="relative z-10 flex w-full max-w-md items-center justify-between">
        <h1 className="font-display text-lg font-bold tracking-[0.12em] text-oro-claro md:text-xl">Campanadas {YEAR}</h1>
        <button
          onClick={showInstructions}
          aria-label="Cómo se juega"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-piedra/25 text-lg font-extrabold text-piedra/80 transition hover:bg-piedra/10 focus-visible:outline-2 focus-visible:outline-oro"
        >
          ?
        </button>
      </header>

      <main className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4">
        <div className="w-[min(68vw,300px)] md:w-[320px]" style={{ maxHeight: '52dvh', aspectRatio: '240 / 330' }}>
          <Tower
            hours={timeState.hours}
            minutes={timeState.minutes}
            seconds={timeState.seconds}
            ballProgress={ballProgress}
            chime={phase === AppPhase.CHIMES ? chimeCount : 0}
            overlayVisible={showFace}
            overlay={
              <CheekyFace
                grapeCount={eatenCount}
                isEating={isMouthOpen}
                isCelebrating={phase === AppPhase.CELEBRATION}
                mouthRef={mouthRef}
              />
            }
          />
        </div>

        <div className="-mt-6 min-h-[5.5rem] text-center" aria-live="polite">
          <p className={`font-display font-bold text-piedra ${isBigNumber ? 'text-6xl' : phase === AppPhase.COUNTDOWN && days > 0 ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>
            {title}
          </p>
          {subtitle && <p className="mt-1 text-lg text-piedra/70">{subtitle}</p>}
        </div>

        <div className={`w-full transition-opacity duration-700 ${phase >= AppPhase.GAP ? 'opacity-100' : 'opacity-45'}`}>
          <GrapeGrid
            currentChime={chimeCount}
            phase={phase}
            grapeStatus={grapeStatus}
            onEat={onGrapeClick}
            onEarlyClick={showEarlyClickMessage}
          />
        </div>
      </main>

      <footer className="relative z-10 mt-4 flex flex-col items-center gap-3">
        {phase === AppPhase.COUNTDOWN && (
          <>
            <button
              onClick={startTest}
              className="rounded-full bg-oro px-7 py-3.5 text-lg font-extrabold text-tinta shadow-[0_8px_30px_rgba(242,182,50,0.35)] transition hover:bg-oro-claro active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oro-claro"
            >
              Ensayar las campanadas
            </button>
            {/* Ocupa siempre su hueco para que el botón no salte al desaparecer */}
            <p className={`text-sm text-piedra/60 transition-opacity ${soundReady ? 'opacity-0' : 'opacity-100'}`} aria-hidden={soundReady}>
              Toca la pantalla para activar el sonido
            </p>
          </>
        )}
        <p className="text-xs text-piedra/40">v{__APP_VERSION__}</p>
      </footer>

      {showResult && (
        <ResultCard
          year={YEAR}
          chimeResults={chimeResults}
          extraTaps={Object.values(grapeStatus).filter((s) => s === 'miss').length}
          isRehearsal={isTestMode}
          onRetry={startTest}
        />
      )}

      <MessageOverlay message={overlayMessage?.text ?? ''} duration={overlayMessage?.duration} onClose={closeOverlay} />
    </div>
  );
};

export default App;
