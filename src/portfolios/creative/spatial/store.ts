import { useSyncExternalStore } from 'react';
import { CHAPTERS, chapterIndex } from './story/chapters';
import { speak, stopSpeaking } from './story/narrator';
import { envNow } from './os/localTime';

/**
 * One small store for the spatial home: the story chapter you are on, the narrator (and its
 * captions), autoplay, and the optional modes (sound, voice, hands). React components subscribe;
 * the 3D scene reads it without re-rendering.
 */

export type Phase = 'intro' | 'house';

export interface SpatialState {
  phase: Phase;
  /** Index into CHAPTERS. */
  chapter: number;
  /** Direction of the last move (for the transition animations). */
  dir: 1 | -1;
  /** Legacy room id kept in step with the chapter (camera fallback). */
  room: string;
  narrate: boolean;
  /** Tour plays by itself: narrate, then move on. */
  auto: boolean;
  caption: { text: string; at: number } | null;
  sound: boolean;
  toast: string | null;
  dock: boolean;
  /** Extra floating windows that are open (e.g. 'profile'). */
  windows: string[];
  /** The Home View (app icons) and Control Center overlays. */
  homeView: boolean;
  control: boolean;
  /** The light outside: daylight, sunset or night. */
  env: 'day' | 'sunset' | 'night';
  /** Follow the real time of day in Georgia (on until the visitor picks a light). */
  envAuto: boolean;
  /** House tour: scrolling walks the camera from room to room (see story/tour.ts). */
  tour: boolean;
  /** Where the scroll wants the tour to be (0 … stops−1). */
  tourTarget: number;
  /** The card the tour shows now. */
  tourIndex: number;
  /** The rooms beyond the living room are loaded and prepared (the first tour loads them). */
  roomsReady: boolean;
  /** The small AI chat in the corner is open. */
  bubble: boolean;
  /** His Oncure video in full view. */
  video: boolean;
  /** 360° view: the apps step aside and dragging turns the camera all the way round the room. */
  look360: boolean;
  /** Cards pinned on the dashboard's pinboard (ids). */
  pinned: string[];
  /** A question waiting for the AI chat (set by "Ask AI" buttons). */
  pendingAsk: string | null;
}

let state: SpatialState = { phase: 'intro', chapter: 0, dir: 1, room: 'living', narrate: false, auto: false, caption: null, sound: false, toast: null, dock: true, windows: [], homeView: false, control: false, env: envNow(), envAuto: true, tour: false, tourTarget: 0, tourIndex: 0, roomsReady: false, bubble: false, video: false, look360: false, pinned: ['oncure', 'finance', 'awards', 'guitar'], pendingAsk: null };
const subs = new Set<() => void>();
let autoTimer = 0;

const roomFor = (i: number) => {
  const st = CHAPTERS[i]?.station ?? 'living';
  return st === 'living' || st === 'sofa' || st === 'return' || st === 'entry' ? 'living' : 'study';
};

export const spatial = {
  get: () => state,
  set(patch: Partial<SpatialState>) {
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
  /** Go to a chapter by index or id. */
  goChapter(to: number | string) {
    const i = typeof to === 'number' ? to : chapterIndex(to);
    if (i < 0 || i >= CHAPTERS.length) return;
    window.clearTimeout(autoTimer);
    const dir: 1 | -1 = i >= state.chapter ? 1 : -1;
    spatial.set({ chapter: i, dir, room: roomFor(i), caption: null, homeView: false });
    playUi('move');
    spatial.tell();
  },
  next() {
    spatial.goChapter(Math.min(CHAPTERS.length - 1, state.chapter + 1));
  },
  prev() {
    spatial.goChapter(Math.max(0, state.chapter - 1));
  },
  /** Legacy: rooms by id map onto chapters. */
  go(id: string) {
    spatial.goChapter(id === 'living' ? 0 : id);
  },
  step(dir: 1 | -1) {
    if (dir > 0) spatial.next();
    else spatial.prev();
  },
  /** Narrate the current chapter (if narration is on); in autoplay, move on afterwards. */
  tell() {
    stopSpeaking();
    if (!state.narrate || state.phase !== 'house') return;
    const c = CHAPTERS[state.chapter]!;
    const at = state.chapter;
    // Let the camera walk and the scene arrive before speaking.
    window.setTimeout(() => {
      if (spatial.get().chapter !== at || !spatial.get().narrate) return;
      spatial.set({ caption: { text: c.say, at: 0 } });
      speak(c.say, {
        onWord: (i) => spatial.set({ caption: { text: c.say, at: i } }),
        onEnd: () => {
          if (spatial.get().chapter !== at) return;
          spatial.set({ caption: null });
          if (spatial.get().auto && at < CHAPTERS.length - 1) autoTimer = window.setTimeout(() => spatial.next(), 1400);
          else if (spatial.get().auto) spatial.set({ auto: false });
        },
      });
    }, 900);
  },
  /** Start the guided tour from the first story chapter, narrated and playing by itself. */
  play() {
    spatial.set({ auto: true, narrate: true });
    spatial.goChapter(state.chapter === 0 ? 1 : state.chapter);
  },
  pause() {
    window.clearTimeout(autoTimer);
    stopSpeaking();
    spatial.set({ auto: false, caption: null });
  },
  setNarrate(on: boolean) {
    spatial.set({ narrate: on });
    if (on) spatial.tell();
    else {
      stopSpeaking();
      spatial.set({ caption: null });
    }
  },
  openWindow(id: string) {
    if (!state.windows.includes(id)) spatial.set({ windows: [...state.windows, id] });
    else spatial.set({ windows: [...state.windows.filter((w) => w !== id), id] });
    playUi('open');
  },
  closeWindow(id: string) {
    spatial.set({ windows: state.windows.filter((w) => w !== id) });
    playUi('close');
  },
  pin(id: string) {
    if (!state.pinned.includes(id)) spatial.set({ pinned: [...state.pinned, id] });
  },
  unpin(id: string) {
    spatial.set({ pinned: state.pinned.filter((p) => p !== id) });
  },
  /** Start the house tour from the front door. */
  startTour() {
    window.clearTimeout(autoTimer);
    stopSpeaking();
    spatial.set({ tour: true, tourTarget: 0, tourIndex: 0, homeView: false, control: false, windows: [], caption: null, auto: false, look360: false });
  },
  /** Show one card of the tour (the scroll may sit between two; the nearest one shows). */
  tourTo(target: number, rooms: number) {
    // Until the other rooms are ready the tour waits at the entrance and in the living room.
    const max = state.roomsReady ? rooms - 1 : Math.min(rooms - 1, 1);
    const t = Math.max(0, Math.min(max, target));
    const i = Math.round(t);
    if (t !== state.tourTarget || i !== state.tourIndex) spatial.set({ tourTarget: t, tourIndex: i });
  },
  /** Leave the tour for the dashboard (or another app). */
  endTour(app: string = 'home') {
    stopSpeaking();
    spatial.set({ tour: false, caption: null });
    spatial.goChapter(app);
  },
  tourStep(d: 1 | -1, rooms: number) {
    spatial.tourTo(Math.round(state.tourTarget) + d, rooms);
  },
  toast(text: string) {
    spatial.set({ toast: text });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => spatial.set({ toast: null }), 2600);
  },
};
let toastTimer = 0;

export function useSpatial<T>(pick: (s: SpatialState) => T): T {
  return useSyncExternalStore(spatial.subscribe, () => pick(state), () => pick(state));
}

// --- Sound: soft synthesised UI sounds, only after the visitor turns sound on ----------------

let ctx: AudioContext | null = null;
export function playUi(kind: 'tap' | 'open' | 'close' | 'move' | 'enter') {
  if (!state.sound || typeof window === 'undefined') return;
  ctx ??= new AudioContext();
  const now = ctx.currentTime;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f: Record<typeof kind, [number, number, number]> = {
    tap: [880, 660, 0.08],
    open: [520, 780, 0.22],
    close: [700, 440, 0.2],
    move: [300, 420, 0.5],
    enter: [220, 660, 1.2],
  };
  const [a, b, d] = f[kind];
  o.frequency.setValueAtTime(a, now);
  o.frequency.exponentialRampToValueAtTime(b, now + d);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(kind === 'enter' || kind === 'move' ? 0.05 : 0.07, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(g);
  o.start(now);
  o.stop(now + d + 0.05);
}
