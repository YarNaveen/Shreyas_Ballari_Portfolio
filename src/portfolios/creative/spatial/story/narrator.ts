/**
 * The narrator: reads aloud with the browser's own speech synthesis (no audio is sent anywhere,
 * no API key). To sound professional rather than robotic it:
 *
 * - picks the most natural voice the device has (Edge's "Online (Natural)" voices, Chrome's
 *   Google voices, Apple's Enhanced and Premium voices), and keeps the same one for the whole visit;
 * - speaks at its natural pitch and an unhurried pace, one sentence at a time with a short pause
 *   between sentences (this also avoids Chrome cutting off long passages);
 * - says names and terms correctly (Oncure, Muay Thai, PSAT, DECA, FSA, AP …) without changing the
 *   captions, which still show the written words.
 *
 * It reports the word being spoken (for captions) and when it has finished, so the tour can move on.
 * Browsers only allow speech after the visitor has interacted, and nothing is spoken unless the
 * visitor turns the AI voice on or presses a Listen button.
 */

export interface SpeakHandlers {
  onWord?: (charIndex: number) => void;
  onEnd?: () => void;
}

let voice: SpeechSynthesisVoice | null = null;
let token = 0;
let busy = false;
let pauseTimer = 0;

export const narratorSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const KEY = 'sp-narrator-voice';
const MALE = ['guy', 'davis', 'andrew', 'brian', 'christopher', 'eric', 'roger', 'steffan', 'tony', 'jason', 'ryan', 'thomas', 'william', 'liam', 'david', 'mark', 'george', 'james', 'richard', 'sean', 'google uk english male', 'daniel', 'alex', 'aaron', 'arthur', 'fred', 'tom', 'oliver', 'gordon', 'rishi', 'evan', 'nathan', 'male'];
const FEMALE = ['female', 'aria', 'jenny', 'zira', 'samantha', 'susan', 'hazel', 'karen', 'moira', 'tessa', 'victoria', 'ava', 'allison', 'emma', 'michelle', 'sonia', 'libby', 'natasha', 'clara', 'google us english'];
/** Voices that sound clearly synthetic. */
const ROBOTIC = ['espeak', 'compact', 'novelty', 'bad news', 'bells', 'boing', 'bubbles', 'cellos', 'whisper', 'zarvox', 'trinoids', 'albert', 'jester', 'organ', 'superstar', 'wobble', 'good news'];

function pickVoice() {
  if (!narratorSupported()) return null;
  const vs = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (!vs.length) return null;
  // The same voice for the whole visit (and the next one), once chosen.
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  const keep = saved ? vs.find((v) => v.name === saved) : undefined;
  if (keep) return keep;
  const rank = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    let s = 0;
    if (ROBOTIC.some((r) => n.includes(r))) s -= 60;
    if (n.includes('natural') || n.includes('neural') || n.includes('online') || n.includes('premium') || n.includes('enhanced')) s += 30;
    if (n.startsWith('google')) s += 18;
    if (MALE.some((m) => n.includes(m)) && !FEMALE.some((f) => n.includes(f))) s += 8;
    if (n.includes('andrew') || n.includes('guy') || n.includes('christopher') || n.includes('brian')) s += 4;
    if (v.lang === 'en-US') s += 4;
    else if (v.lang === 'en-GB') s += 2;
    return s;
  };
  const best = [...vs].sort((a, b) => rank(b) - rank(a))[0] ?? null;
  if (best) {
    try {
      localStorage.setItem(KEY, best.name);
    } catch {
      /* storage blocked */
    }
  }
  return best;
}

if (narratorSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    voice = pickVoice();
  };
}

/** The voice in use (for the Control Center), or null before the browser has listed its voices. */
export const narratorVoice = () => {
  voice ??= pickVoice();
  return voice?.name ?? null;
};

/** How names and terms are said (the written words stay as they are on screen). */
const SAY: [RegExp, string][] = [
  [/\bONCURE\b|\bOncure\b/g, 'On-cure'],
  [/\bMuay Thai\b/gi, 'Moo-ay Thai'],
  [/\bPSAT 8\/9\b/g, 'P-SAT eight nine'],
  [/\bPSAT\b/g, 'P-SAT'],
  [/\bDECA\b/g, 'Decka'],
  [/\bFSA\b/g, 'F-S-A'],
  [/\bIPSD\b/g, 'I-P-S-D'],
  [/\bMAP\b/g, 'map'],
  [/\bAP\b/g, 'A-P'],
  [/\bAI\b/g, 'A-I'],
  [/\bTAMA\b/g, 'Tama'],
  [/\bShirdi Sai\b/g, 'Sheer-dee Sai'],
  [/\bBallari\b/g, 'Bul-lah-ree'],
  [/\bFinTech\b/gi, 'fin-tech'],
  [/\bCS\b/g, 'C-S'],
  [/\bTop (\d+)%/g, 'top $1 percent'],
  [/(\d+)%/g, '$1 percent'],
  [/ · /g, ', '],
  [/\s*—\s*/g, ', '],
];
export const pronounce = (text: string) => SAY.reduce((t, [re, to]) => t.replace(re, to), text);

/** Sentences, grouped into chunks of at most ~220 characters, with where each starts in the text. */
function chunks(text: string) {
  const out: { at: number; text: string }[] = [];
  const re = /[^.!?]+(?:[.!?]+["”’)]?|$)\s*/g;
  let m: RegExpExecArray | null;
  let cur: { at: number; text: string } | null = null;
  while ((m = re.exec(text)) && m[0]) {
    const piece = m[0];
    if (cur && cur.text.length + piece.length <= 220) cur.text += piece;
    else {
      if (cur) out.push(cur);
      cur = { at: m.index, text: piece };
    }
  }
  if (cur) out.push(cur);
  return out.filter((c) => c.text.trim());
}

export function speak(text: string, h: SpeakHandlers = {}) {
  if (!narratorSupported()) {
    h.onEnd?.();
    return;
  }
  stopSpeaking();
  const my = ++token;
  voice ??= pickVoice();
  const natural = !!voice && /natural|neural|online|premium|enhanced|google/i.test(voice.name);
  const parts = chunks(text);
  busy = true;
  const say = (i: number) => {
    if (my !== token) return;
    const part = parts[i];
    if (!part) {
      busy = false;
      h.onEnd?.();
      return;
    }
    const spoken = pronounce(part.text.trim());
    const u = new SpeechSynthesisUtterance(spoken);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.pitch = 1;
    u.rate = natural ? 0.98 : 0.94;
    u.volume = 1;
    const scale = part.text.length / Math.max(1, spoken.length);
    u.onboundary = (e) => {
      if (my === token && e.name === 'word') h.onWord?.(part.at + Math.round(e.charIndex * scale));
    };
    const next = () => {
      if (my !== token) return;
      // A short, natural pause between sentences.
      pauseTimer = window.setTimeout(() => say(i + 1), 220);
    };
    u.onend = next;
    u.onerror = (e) => {
      // Cancelled by a newer request: stay quiet. Any other error: skip to the next sentence.
      if (my !== token || e.error === 'interrupted' || e.error === 'canceled') return;
      next();
    };
    if (i === 0) h.onWord?.(part.at);
    window.speechSynthesis.speak(u);
  };
  say(0);
}

export function stopSpeaking() {
  token++;
  busy = false;
  window.clearTimeout(pauseTimer);
  if (narratorSupported()) window.speechSynthesis.cancel();
}

export const speaking = () => busy && narratorSupported();
