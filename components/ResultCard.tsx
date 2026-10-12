import React, { useState } from 'react';
import { GrapeResult } from '../types';

interface ResultCardProps {
  year: number;
  /** Resultado por campanada (1..12): qué tal se comió la uva de esa campanada */
  chimeResults: Record<number, Exclude<GrapeResult, 'miss'>>;
  /** Uvas comidas a destiempo (dos en la misma campanada) */
  extraTaps: number;
  isRehearsal: boolean;
  onRetry: () => void;
}

const SITE = 'https://campanadas.zik.es';

function verdict(score: number, perfect: number): string {
  if (score === 12 && perfect === 12) return 'Doce de doce y sin pestañear. Este año es tuyo.';
  if (score === 12) return 'Las doce dentro. Suerte asegurada para todo el año.';
  if (score >= 9) return 'Casi. Alguna se ha quedado en el plato.';
  if (score >= 5) return 'Media suerte. Hay que ensayar un poco más.';
  if (score >= 1) return 'Te ha pillado el toro. Por suerte esto era un ensayo.';
  return 'Ni una. ¿Estabas brindando?';
}

export function buildShareText(year: number, chimeResults: ResultCardProps['chimeResults'], isRehearsal: boolean) {
  const row = [...Array(12)].map((_, i) => {
    const r = chimeResults[i + 1];
    return r === 'perfect' ? '🟡' : r === 'good' ? '🟢' : '⚫';
  });
  const score = Object.keys(chimeResults).length;
  const head = isRehearsal ? `🔔 Ensayo de las Campanadas ${year}` : `🔔 Campanadas ${year}`;
  return `${head}\n🍇 ${score}/12 uvas a tiempo\n${row.slice(0, 6).join('')}\n${row.slice(6).join('')}\n¿Te atreves? ${SITE}`;
}

const ResultCard: React.FC<ResultCardProps> = ({ year, chimeResults, extraTaps, isRehearsal, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const score = Object.keys(chimeResults).length;
  const perfect = Object.values(chimeResults).filter((r) => r === 'perfect').length;
  const text = buildShareText(year, chimeResults, isRehearsal);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* el usuario ha cancelado */
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-noche/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      role="dialog" aria-modal="true" aria-labelledby="resultado-titulo">
      <div className="subir w-full max-w-sm rounded-[28px] bg-piedra p-6 text-tinta shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <h2 id="resultado-titulo" className="font-display text-3xl font-bold">¡Feliz {year}!</h2>

        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-6xl leading-none font-bold">{score}</span>
          <span className="text-lg font-bold text-tinta/70">de 12 uvas a tiempo</span>
        </p>

        <div className="mt-4 grid grid-cols-12 gap-1" aria-label="Resultado por campanada">
          {[...Array(12)].map((_, i) => {
            const r = chimeResults[i + 1];
            return (
              <span key={i} title={`Campanada ${i + 1}`}
                className={`aspect-square rounded-full ${r === 'perfect' ? 'bg-oro' : r === 'good' ? 'bg-uva' : 'bg-tinta/15'}`} />
            );
          })}
        </div>
        <p className="mt-2 text-sm text-tinta/60">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-oro align-middle" /> justo en la campanada ({perfect})
          <span className="mr-1 ml-3 inline-block h-2.5 w-2.5 rounded-full bg-uva align-middle" /> a tiempo
        </p>

        <p className="mt-5 text-xl leading-snug font-bold">{verdict(score, perfect)}</p>
        {extraTaps > 0 && (
          <p className="mt-1 text-tinta/70">Y {extraTaps === 1 ? 'una uva' : `${extraTaps} uvas`} de propina, por las prisas.</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button onClick={share}
            className="rounded-full bg-tinta px-5 py-3.5 text-lg font-extrabold text-piedra transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oro">
            {copied ? 'Copiado, pégalo en el grupo' : 'Retar a mis amigos'}
          </button>
          <button onClick={onRetry}
            className="rounded-full px-5 py-3 text-lg font-bold text-tinta/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-tinta">
            Volver a ensayar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
