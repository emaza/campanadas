import React, { useState, useEffect } from 'react';
import audioService from '../services/audioService';
import { AppPhase } from '../types';

interface GrapeGridProps {
  currentChime: number;
  onEat?: (grapeNumber: number, grapeElement: HTMLButtonElement) => void;
  onEarlyClick?: () => void;
  phase: AppPhase;
  grapeStatus: Record<number, 'correct' | 'incorrect'>;
}
const GrapeGrid: React.FC<GrapeGridProps> = ({ currentChime, onEat, onEarlyClick, phase, grapeStatus }) => {
  const [eatenGrapes, setEatenGrapes] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Reset eaten grapes when the countdown restarts
    if (phase !== AppPhase.CHIMES && phase !== AppPhase.CELEBRATION) {
      setEatenGrapes(new Set());
    }
  }, [phase]);

  const handleGrapeClick = (grapeNumber: number, grapeElement: HTMLButtonElement) => {
    if (phase < AppPhase.CHIMES) {
      if (onEarlyClick) onEarlyClick();
      return;
    }

    if (phase === AppPhase.CHIMES) {
      if (eatenGrapes.has(grapeNumber)) return;

      audioService.playGulp();

      const newEaten = new Set(eatenGrapes);
      newEaten.add(grapeNumber);
      setEatenGrapes(newEaten);

      if (onEat) onEat(grapeNumber, grapeElement);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
        {/* We use a grid that adapts: 4 cols on mobile, 6 cols on desktop for a 2-row 'linear' look */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 p-4 bg-black/40 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
        {[...Array(12)].map((_, index) => {
            const grapeNumber = index + 1;
            
            // Visual State Logic
            const isEaten = eatenGrapes.has(grapeNumber);
            const status = grapeStatus[grapeNumber];

            const targetNumber = currentChime === 0 ? 1 : currentChime;
            const isTarget = grapeNumber === targetNumber;
            const showActiveStyle = isTarget && !isEaten;

            return (
              <div key={index} className="relative flex flex-col items-center justify-center">
                <button
                  data-grape-id={grapeNumber}
                  onClick={(e) => handleGrapeClick(grapeNumber, e.currentTarget)}
                  className={`
                    w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center
                    transition-all duration-300 transform cursor-pointer active:scale-90
                    ${isEaten
                      ? 'bg-green-900/30 scale-75 opacity-40 grayscale border-green-900'
                      : showActiveStyle
                        ? 'bg-gradient-to-br from-green-300 to-green-500 scale-110 shadow-[0_0_25px_rgba(74,222,128,0.8)] animate-pulse border-white'
                        : 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg border-green-300 hover:scale-105'
                    }
                    border-2 focus:outline-none
                  `}
                  aria-label={`Uva ${grapeNumber}`}
                  disabled={isEaten}
                >
                  <span className={`font-bold text-sm md:text-lg ${isEaten ? 'text-gray-500' : 'text-green-950 drop-shadow-sm'}`}>
                    {grapeNumber}
                  </span>
                </button>
                {status && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img
                      src={status === 'correct' ? '/check.svg' : '/x.svg'}
                      alt={status}
                      className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg"
                    />
                  </div>
                )}
              </div>
            );
        })}
        </div>
    </div>
  );
};

export default React.memo(GrapeGrid);
