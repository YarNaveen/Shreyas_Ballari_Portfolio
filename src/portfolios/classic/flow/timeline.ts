/** The film ends as the sparkle fills the screen (Oncure and the trading app are page sections after it): its scroll progress runs 0..END. */
export const END = 0.34;

/** Where each chapter of the scroll film sits along its 0..1 progress. */
export const F = {
  hero: [0, 0.05],
  carousel: [0.05, 0.19],
  star: [0.185, 0.235],
  burst: [0.245, 0.285],
  /** The sparkle grows until it fills the screen... */
  fill: [0.295, 0.34],
  /** ...particles end here. */
  detail: [0.338, 0.345],
  /** Oncure film, full screen; it leaves upwards at the end. */
  video: [0.335, 0.475],
  /** Awards and scores spiralling round a burst of light. */
  vortex: [2.9, 3],
  /** A card opens to full screen... */
  open: [0.455, 0.505],
  /** ...as the trading app. */
  finance: [0.49, 0.69],
  /** Everything else, as a 3D stack. */
  mara: [2.95, 2.97],
  /** Technical skills. */
  tech: [2.97, 2.99],
  // Parked chapters (being rebuilt).
  problem: [2, 2.1],
  steps: [2.1, 2.2],
  challenges: [2.2, 2.3],
  gallery: [2.3, 2.4],
  numbers: [2.4, 2.5],
  skills: [2.5, 2.6],
  tiles: [2.6, 2.7],
  goals: [2.7, 2.8],
  cta: [2.8, 3],
} as const;

export type Chapter = keyof typeof F;

/** 0..1 between a and b. */
export const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
/** Smooth start and end. */
export const smooth = (x: number) => x * x * (3 - 2 * x);
/** Fast out, slow in (decelerating). */
export const out = (x: number) => 1 - Math.pow(1 - x, 3);
/** Progress inside a chapter. */
export const within = (t: number, c: Chapter) => seg(t, F[c][0], F[c][1]);
/** In and out envelope: rises over the first `edge`, falls over the last `edge`. */
export const envelope = (k: number, edge = 0.14) => Math.min(seg(k, 0, edge), 1 - seg(k, 1 - edge, 1));

/** Resume (the updated file in public/assets). */
export { RESUME } from '@/features/details/Reach';
