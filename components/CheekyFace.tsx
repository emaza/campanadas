import React from 'react';

interface CheekyFaceProps {
  grapeCount: number;      // 0 a 12 (uvas comidas)
  isEating: boolean;       // boca abierta
  isCelebrating?: boolean; // beso de Año Nuevo
  mouthRef?: React.RefObject<SVGGElement | null>;
}

const INK = '#2b2840';

/** La esfera del reloj cobra vida y se come las uvas. */
const CheekyFace: React.FC<CheekyFaceProps> = ({ grapeCount, isEating, isCelebrating, mouthRef }) => {
  const count = isCelebrating ? 0 : Math.min(Math.max(grapeCount, 0), 12);
  const cheekScale = 1 + count * 0.075;
  const sweating = !isCelebrating && count >= 8;

  let mouth: React.ReactNode;
  let mouthScale = 1;
  if (isCelebrating) {
    mouth = (
      <path
        d="M100 155 C100 155 90 140 90 135 C90 128 98 128 100 135 C102 128 110 128 110 135 C110 140 100 155 100 155 Z"
        fill="#c2304a" className="beso"
      />
    );
    mouthScale = 1.2;
  } else if (isEating) {
    mouth = <ellipse cx="100" cy="140" rx="15" ry="16" fill="#4a1426" />;
    mouthScale = 1.5;
  } else {
    mouth = <ellipse cx="100" cy="140" rx="15" ry="7" fill="#c2304a" />;
    mouthScale = Math.max(0.45, 1 - count * 0.05);
  }

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]" role="img"
      aria-label={isCelebrating ? 'El reloj lanza un beso' : `El reloj lleva ${count} uvas en la boca`}>
      <defs>
        <radialGradient id="cara" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="1" stopColor="#f0e2bd" />
        </radialGradient>
        <radialGradient id="moflete">
          <stop offset="0" stopColor="#f39a8f" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f39a8f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="96" fill="#f2b632" />
      <circle cx="100" cy="100" r="88" fill="url(#cara)" />

      {/* Mofletes que se hinchan con cada uva */}
      {[40, 160].map((x) => (
        <g key={x} style={{ transform: `translate(${x}px,112px) scale(${cheekScale}) translate(${-x}px,-112px)` }}
          className="transition-transform duration-500 ease-out">
          <circle cx={x} cy="112" r="24" fill="url(#moflete)" />
        </g>
      ))}

      {/* Ojos */}
      {isEating ? (
        <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M54 72 L68 78 L54 84" />
          <path d="M146 72 L132 78 L146 84" />
        </g>
      ) : isCelebrating ? (
        <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M55 80 Q65 64 75 80" />
          <path d="M125 80 Q135 64 145 80" />
        </g>
      ) : (
        <g fill={INK}>
          <circle cx="65" cy="78" r="10" />
          <circle cx="135" cy="78" r="10" />
          <circle cx="68" cy="74" r="3" fill="#fff" />
          <circle cx="138" cy="74" r="3" fill="#fff" />
        </g>
      )}

      {/* Cejas: suben de agobio */}
      <g stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round"
        style={{ transform: `translateY(${count * -1.6}px)` }} className="transition-transform duration-300">
        <path d="M50 55 Q65 42 80 52" />
        <path d="M120 52 Q135 42 150 55" />
      </g>

      {/* Gota de sudor a partir de la octava */}
      {sweating && (
        <path d="M160 48 Q152 62 160 66 Q168 62 160 48 Z" fill="#8fd3ff" stroke="#3a7bb0" strokeWidth="1.5" />
      )}

      <g ref={mouthRef}
        style={{ transform: `translate(100px,140px) scale(${mouthScale}) translate(-100px,-140px)` }}
        className="transition-transform duration-200">
        {mouth}
      </g>
    </svg>
  );
};

export default React.memo(CheekyFace);
