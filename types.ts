export enum AppPhase {
  COUNTDOWN,
  CARILLON,    // La bola baja (approx 35s before)
  QUARTERS,    // Los Cuartos (4 double chimes)
  GAP,         // Silence before midnight
  CHIMES,      // The 12 grapes
  CELEBRATION
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalSecondsLeft: number;
}

export interface FlyingGrapeState {
  id: number;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
}

// Type for the canvas-confetti library
export type ConfettiFunction = (options?: {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('square' | 'circle' | 'star')[];
  zIndex?: number;
  disableForReducedMotion?: boolean;
  useWorker?: boolean;
  resize?: boolean;
  canvas?: HTMLCanvasElement;
}) => void;
