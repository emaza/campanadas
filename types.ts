export enum AppPhase {
  COUNTDOWN = 'COUNTDOWN',
  CARILLON = 'CARILLON', // La bola baja (approx 35s before)
  QUARTERS = 'QUARTERS', // Los Cuartos (4 double chimes)
  GAP = 'GAP',           // Silence before midnight
  CHIMES = 'CHIMES',     // The 12 grapes
  CELEBRATION = 'CELEBRATION'
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalSecondsLeft: number;
}