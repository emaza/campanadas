// TIME CONFIGURATION
export const TARGET_DATE = new Date(2027, 0, 1, 0, 0, 0);
export const CHIME_INTERVAL = 3000; // 3 seconds per chime

// Time thresholds (relative to target time 0, in milliseconds)
export const T_CARILLON_START = -35000;
export const T_QUARTERS_START = -20000;
export const T_GAP_START = -5000;
export const T_CELEBRATION_START = 12 * CHIME_INTERVAL; // Start of celebration phase

// MOUTH ANIMATION
export const MOUTH_OPEN_DURATION = 1000; // ms

// FIREWORKS CONFIGURATION
export const FIREWORKS_DURATION = 15 * 1000; // 15 seconds
export const FIREWORKS_COLORS = ['#f2b632', '#ffe08a', '#ffffff', '#a3cc45', '#c2304a'];

// MESSAGE OVERLAY
export const INSTRUCTIONS_MODAL_AUTO_CLOSE_MS = 5500;
export const EARLY_CLICK_MODAL_AUTO_CLOSE_MS = 2200;

// SCORING
// Una uva cuenta si se come durante su campanada; si es en el primer segundo, es "justo a tiempo".
export const PERFECT_WINDOW_MS = 1000;
