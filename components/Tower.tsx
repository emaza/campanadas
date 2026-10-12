import React from 'react';

/**
 * Torre del reloj de la Casa de Correos (Puerta del Sol), simplificada.
 * Coordenadas en un viewBox de 240 x 330. La esfera está centrada en (120, 232).
 */

export const DIAL = { cx: 120, cy: 232, r: 66, vbW: 240, vbH: 330 };

interface TowerProps {
  hours: number;
  minutes: number;
  seconds: number;
  /** 0 = bola arriba, 1 = bola abajo */
  ballProgress: number;
  /** Número de campanada (0 si no está sonando) — cada cambio lanza una onda */
  chime: number;
  /** Contenido que se superpone exactamente sobre la esfera (la cara) */
  overlay?: React.ReactNode;
  overlayVisible?: boolean;
}

const ROMANS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

const Tower: React.FC<TowerProps> = ({
  hours, minutes, seconds, ballProgress, chime, overlay, overlayVisible,
}) => {
  const { cx, cy, r } = DIAL;
  const sDeg = (seconds / 60) * 360;
  const mDeg = ((minutes + seconds / 60) / 60) * 360;
  const hDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  const BALL_TOP = 24;
  const BALL_BOTTOM = 92;
  const ballY = BALL_TOP + (BALL_BOTTOM - BALL_TOP) * Math.min(Math.max(ballProgress, 0), 1);
  const ballMoving = ballProgress > 0 && ballProgress < 1;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${DIAL.vbW} / ${DIAL.vbH}` }}>
      <svg viewBox={`0 0 ${DIAL.vbW} ${DIAL.vbH}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="piedra" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f6efdf" />
            <stop offset="1" stopColor="#d9ccb0" />
          </linearGradient>
          <linearGradient id="fundido" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0.72" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="fundir">
            <rect width="240" height="330" fill="url(#fundido)" />
          </mask>
          <radialGradient id="oro" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.45" stopColor="#f2b632" />
            <stop offset="1" stopColor="#a8700f" />
          </radialGradient>
          <radialGradient id="esfera" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#fffdf6" />
            <stop offset="1" stopColor="#efe4c8" />
          </radialGradient>
          <filter id="halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Mástil */}
        <line x1={cx} y1="10" x2={cx} y2="112" stroke="#3a3650" strokeWidth="3" />
        <circle cx={cx} cy="9" r="3" fill="#f2b632" />

        {/* Templete de hierro */}
        <g stroke="#3a3650" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M84 132 Q84 100 120 96 Q156 100 156 132" />
          <path d="M98 132 Q98 108 120 104 Q142 108 142 132" opacity="0.7" />
          <line x1="84" y1="132" x2="84" y2="140" />
          <line x1="156" y1="132" x2="156" y2="140" />
          <line x1="102" y1="118" x2="102" y2="140" />
          <line x1="138" y1="118" x2="138" y2="140" />
        </g>
        <rect x="76" y="138" width="88" height="5" rx="1.5" fill="#3a3650" />

        {/* La bola */}
        <circle cx={cx} cy={ballY} r="20" fill="#f2b632" opacity={ballMoving ? 0.55 : 0.3} filter="url(#halo)" />
        <circle cx={cx} cy={ballY} r="11" fill="url(#oro)" stroke="#a8700f" strokeWidth="1" />

        {/* Cuerpo de piedra */}
        <g mask="url(#fundir)">
          <path d="M44 330 V160 Q44 150 54 150 H186 Q196 150 196 160 V330 Z" fill="url(#piedra)" />
          <rect x="36" y="143" width="168" height="10" rx="2" fill="#e4d8bd" />
          <rect x="44" y="160" width="10" height="170" fill="#9e3b2a" opacity="0.85" />
          <rect x="186" y="160" width="10" height="170" fill="#9e3b2a" opacity="0.85" />
        </g>

        {/* Esfera */}
        <circle cx={cx} cy={cy} r={r + 8} fill="url(#oro)" />
        <circle cx={cx} cy={cy} r={r + 2} fill="#2b2840" />
        <circle cx={cx} cy={cy} r={r} fill="url(#esfera)" />

        {[...Array(60)].map((_, i) => {
          const a = (i * 6 * Math.PI) / 180;
          const long = i % 5 === 0;
          const r1 = r - (long ? 7 : 4);
          return (
            <line
              key={i}
              x1={cx + Math.sin(a) * r1} y1={cy - Math.cos(a) * r1}
              x2={cx + Math.sin(a) * (r - 1.5)} y2={cy - Math.cos(a) * (r - 1.5)}
              stroke="#2b2840" strokeWidth={long ? 1.6 : 0.6}
            />
          );
        })}

        {ROMANS.map((n, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const rr = r - 17;
          return (
            <text
              key={n}
              x={cx + Math.sin(a) * rr} y={cy - Math.cos(a) * rr}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="11" fill="#2b2840"
            >
              {n}
            </text>
          );
        })}

        {/* Agujas */}
        <g strokeLinecap="round">
          <line x1={cx} y1={cy + 6} x2={cx} y2={cy - 34} stroke="#1d1a2e" strokeWidth="4.5" transform={`rotate(${hDeg} ${cx} ${cy})`} />
          <line x1={cx} y1={cy + 8} x2={cx} y2={cy - 52} stroke="#1d1a2e" strokeWidth="3" transform={`rotate(${mDeg} ${cx} ${cy})`} />
          <line x1={cx} y1={cy + 12} x2={cx} y2={cy - 56} stroke="#9e3b2a" strokeWidth="1.3" transform={`rotate(${sDeg} ${cx} ${cy})`} />
        </g>
        <circle cx={cx} cy={cy} r="4" fill="#f2b632" stroke="#1d1a2e" strokeWidth="1.2" />
      </svg>

      {/* Onda dorada en cada campanada */}
      {chime > 0 && (
        <div
          key={chime}
          className="onda pointer-events-none absolute rounded-full border-4 border-oro"
          style={dialBox(8)}
        />
      )}

      {/* La cara, encajada sobre la esfera */}
      <div
        className={`absolute transition-all duration-500 ${overlayVisible ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'}`}
        style={dialBox(8)}
      >
        {overlay}
      </div>
    </div>
  );
};

/** Caja (en %) que ocupa la esfera dentro de la torre, con margen extra opcional en unidades del viewBox */
function dialBox(extra = 0): React.CSSProperties {
  const { cx, cy, r, vbW, vbH } = DIAL;
  const rr = r + extra;
  return {
    left: `${((cx - rr) / vbW) * 100}%`,
    top: `${((cy - rr) / vbH) * 100}%`,
    width: `${((2 * rr) / vbW) * 100}%`,
    height: `${((2 * rr) / vbH) * 100}%`,
  };
}

export default React.memo(Tower);
