import React from 'react';
import { AppPhase, GrapeResult } from '../types';

interface GrapeGridProps {
  currentChime: number;
  phase: AppPhase;
  grapeStatus: Record<number, GrapeResult>;
  onEat: (grapeNumber: number, el: HTMLButtonElement) => void;
  onEarlyClick: () => void;
}

const BADGE: Record<GrapeResult, { glyph: string; cls: string; label: string }> = {
  perfect: { glyph: '★', cls: 'bg-oro text-tinta', label: 'justo a tiempo' },
  good: { glyph: '✓', cls: 'bg-uva text-tinta', label: 'a tiempo' },
  miss: { glyph: '✕', cls: 'bg-ladrillo text-piedra', label: 'fuera de tiempo' },
};

const Grape: React.FC<{ n: number }> = ({ n }) => (
  <svg viewBox="0 0 48 52" className="h-full w-full overflow-visible" aria-hidden="true">
    <path d="M24 9 Q25 3 31 1" stroke="#5a4a2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M27 5 Q35 2 38 7 Q31 9 27 5 Z" fill="#4b7a1c" />
    <circle cx="24" cy="30" r="20" fill="#a3cc45" />
    <circle cx="24" cy="30" r="20" fill="url(#sombraUva)" />
    <ellipse cx="17" cy="22" rx="6" ry="4" fill="#fff" opacity="0.55" transform="rotate(-30 17 22)" />
    <text x="24" y="32" textAnchor="middle" dominantBaseline="central"
      fontFamily="'Nunito Variable', system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#25400a">{n}</text>
  </svg>
);

const GrapeGrid: React.FC<GrapeGridProps> = ({ currentChime, phase, grapeStatus, onEat, onEarlyClick }) => {
  const active = phase === AppPhase.CHIMES;
  const eatenCount = Object.keys(grapeStatus).length;
  // La uva sugerida es la siguiente sin comer (sirve de guía, se puede tocar cualquiera)
  const suggested = active ? [...Array(12)].map((_, i) => i + 1).find((n) => !grapeStatus[n]) : undefined;

  const handle = (n: number, el: HTMLButtonElement) => {
    if (phase < AppPhase.CHIMES) return onEarlyClick();
    if (!active || grapeStatus[n]) return;
    onEat(n, el);
  };

  return (
    <div className="w-full">
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id="sombraUva" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#1f3a05" stopOpacity="0.55" />
          </radialGradient>
        </defs>
      </svg>

      <ul className="mx-auto grid max-w-sm grid-cols-6 gap-x-2 gap-y-3 md:max-w-md" aria-label={`Uvas: ${eatenCount} de 12 comidas`}>
        {[...Array(12)].map((_, i) => {
          const n = i + 1;
          const status = grapeStatus[n];
          const isTarget = n === suggested && currentChime > 0;
          return (
            <li key={n} className="relative flex justify-center">
              <button
                data-grape-id={n}
                onClick={(e) => handle(n, e.currentTarget)}
                disabled={!!status}
                aria-label={status ? `Uva ${n}, ${BADGE[status].label}` : `Comer uva ${n}`}
                className={`h-12 w-11 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oro md:h-14 md:w-13
                  ${status ? 'scale-75 opacity-25 saturate-0' : 'cursor-pointer active:scale-90'}
                  ${isTarget ? 'uva-objetivo drop-shadow-[0_0_12px_rgba(163,204,69,0.9)]' : ''}`}
              >
                <Grape n={n} />
              </button>
              {status && (
                <span aria-hidden="true"
                  className={`subir pointer-events-none absolute top-1/2 left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-black shadow-lg ${BADGE[status].cls}`}>
                  {BADGE[status].glyph}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(GrapeGrid);
