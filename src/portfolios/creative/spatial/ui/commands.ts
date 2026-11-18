import { CHAPTERS } from '../story/chapters';
import { spatial } from '../store';

/**
 * Turns a spoken phrase into a real action. Story controls ("next", "previous", "repeat",
 * "pause", "play the story", "narrator off"), chapters by name ("show his awards", "open Oncure"),
 * and "click …" for anything on screen: a button or card is matched by its voice name, label or
 * text ("click start the story", "click awards card", "click play", "click answer b",
 * "click card 3"). Returns what happened, for the on-screen confirmation, or null.
 */

const NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
const norm = (s: string) => ` ${s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()} `;

function visible(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/** Click the on-screen control whose name best matches the words. */
function clickByName(words: string): string | null {
  const want = norm(words).replace(/ (the|on|this|that|button|card|please) /g, ' ').trim();
  if (!want) return null;
  const els = [...document.querySelectorAll<HTMLElement>('.sp-ui button, .sp-ui a, .sp-ui [data-voice]')].filter((e) => visible(e) && !(e as HTMLButtonElement).disabled);
  // "card 3": the third card on screen.
  const num = want.match(/^(\d+)$/)?.[1] ?? NUMBERS[want];
  if (num !== undefined) {
    const cards = els.filter((e) => e.matches('.os-story, .os-post, .aw-card, .os-act, .os-hv-app, .os-strip-card, .sc-big-card, .fun-card, [data-card]'));
    const el = cards[Number(num) - 1];
    if (el) {
      el.click();
      return `Clicked card ${num}`;
    }
  }
  let best: { el: HTMLElement; score: number } | null = null;
  for (const el of els) {
    const names = [el.dataset.voice, el.getAttribute('aria-label'), el.textContent].filter(Boolean).map((n) => norm(n!).trim());
    for (const n of names) {
      let score = 0;
      if (n === want) score = 100;
      else if (n.startsWith(want)) score = 60;
      else if (` ${n} `.includes(` ${want} `)) score = 40;
      else {
        const ws = want.split(' ');
        const hit = ws.filter((w) => w.length > 2 && ` ${n} `.includes(` ${w} `)).length;
        score = hit ? (hit / ws.length) * 30 : 0;
      }
      if (score > (best?.score ?? 0)) best = { el, score };
    }
  }
  if (best && best.score >= 15) {
    best.el.click();
    return `Clicked “${(best.el.dataset.voice ?? best.el.textContent ?? '').trim().slice(0, 40)}”`;
  }
  return null;
}

/** The scrollable area the visitor is most likely looking at: the front window's content first. */
function mainScroller(): HTMLElement | null {
  const all = [...document.querySelectorAll<HTMLElement>('.sp-ui *')].filter((el) => {
    if (!visible(el)) return false;
    const cs = getComputedStyle(el);
    return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4;
  });
  // Later in the page means on top; among those, the biggest.
  return all.reverse().sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] ?? null;
}

export function runCommand(raw: string, actions: { replayIntro: () => void; sound: (on: boolean) => void; voiceOff?: () => void }): string | null {
  const t = norm(raw);
  const has = (...w: string[]) => w.some((x) => t.includes(` ${x} `));
  if (has('stop listening', 'stop voice control', 'microphone off', 'mic off', 'turn off voice control')) {
    actions.voiceOff?.();
    return 'Stopped listening';
  }
  if (has('what can i say', 'help', 'commands', 'voice commands', 'show commands')) {
    window.dispatchEvent(new Event('sp-voice-guide'));
    return 'Here is what you can say';
  }
  const scroll = t.match(/ (?:scroll|move|go) (up|down|to the top|to top|to the bottom|to bottom) /) ?? t.match(/ (page down|page up) /);
  if (scroll) {
    const box = mainScroller();
    if (!box) return 'Nothing to scroll here';
    const w = scroll[1]!;
    if (w.includes('top')) box.scrollTo({ top: 0, behavior: 'smooth' });
    else if (w.includes('bottom')) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    else box.scrollBy({ top: (w.includes('up') ? -0.7 : 0.7) * box.clientHeight, behavior: 'smooth' });
    return w.includes('up') || w.includes('top') ? 'Scrolled up' : 'Scrolled down';
  }
  // "click …" / "press …" / "select …" / "tap …"
  const click = t.match(/ (?:click|press|select|tap|choose|pick)(?: on)? (.+) $/);
  if (click) {
    const target = click[1]!.trim();
    if (/^(this|that|it|here)$/.test(target)) {
      const hovered = document.querySelector<HTMLElement>('.sp-hand-hover');
      if (hovered) {
        hovered.click();
        return 'Clicked';
      }
    }
    return clickByName(target) ?? `Could not find “${target}”`;
  }
  // "ask who is Shreyas" / "question what does he study": straight to the AI chat.
  const q = t.match(/ (?:ask(?: ai| the ai)?(?: about)?|question) (.+) $/);
  if (q && q[1]!.trim().length > 2) {
    spatial.set({ pendingAsk: q[1]!.trim() });
    spatial.goChapter('chat');
    return 'Asking the AI';
  }
  const awardsOpen = CHAPTERS[spatial.get().chapter]?.id === 'awards';
  if (has('shuffle', 'shuffle cards', 'mix')) {
    window.dispatchEvent(new CustomEvent('os-awards', { detail: 'shuffle' }));
    clickByName('shuffle');
    return 'Shuffling';
  }
  if (has('next award', 'next card') || (awardsOpen && has('right', 'swipe left'))) {
    window.dispatchEvent(new CustomEvent('os-awards', { detail: 'next' }));
    return 'Next award';
  }
  if (has('previous award', 'previous card') || (awardsOpen && has('left', 'swipe right'))) {
    window.dispatchEvent(new CustomEvent('os-awards', { detail: 'prev' }));
    return 'Previous award';
  }
  if (has('auto light', 'real time', 'follow the time')) {
    spatial.set({ envAuto: true });
    return 'Light follows the time of day';
  }
  if (has('home view', 'all apps', 'show apps')) {
    spatial.set({ homeView: !spatial.get().homeView, control: false });
    return 'Home View';
  }
  if (has('control center', 'control centre', 'settings')) {
    spatial.set({ control: !spatial.get().control, homeView: false });
    return 'Control Center';
  }
  for (const [w, env] of [
    ['sunset', 'sunset'],
    ['night', 'night'],
    ['daylight', 'day'],
    ['day', 'day'],
  ] as const)
    if (has(w, `${w} mode`)) {
      spatial.set({ env, envAuto: false });
      return `Light: ${env}`;
    }
  if (has('contact', 'message', 'send a message', 'contact form', 'get in touch')) {
    spatial.openWindow('contact');
    return 'Opening the contact form';
  }
  if (has('profile', 'about him', 'his profile')) {
    spatial.openWindow('profile');
    return 'Opening his profile';
  }
  if (has('close', 'close window')) {
    const s = spatial.get();
    if (s.homeView || s.control) spatial.set({ homeView: false, control: false });
    else if (s.windows.length) spatial.closeWindow(s.windows[s.windows.length - 1]!);
    else spatial.goChapter('home');
    return 'Closed';
  }
  if (has('next', 'next one', 'continue', 'forward', 'go on')) {
    spatial.next();
    return 'Next';
  }
  if (has('go back', 'back')) {
    // A window's own back button first (e.g. from a certificate to the carousel).
    const b = [...document.querySelectorAll<HTMLElement>('.os-main [data-voice="back"]')].find(visible);
    if (b) {
      b.click();
      return 'Back';
    }
    spatial.prev();
    return 'Previous';
  }
  if (has('previous', 'last one')) {
    spatial.prev();
    return 'Previous';
  }
  if (has('repeat', 'say that again', 'again', 'explain')) {
    spatial.tell();
    return 'Repeating';
  }
  if (has('pause', 'stop', 'stop talking', 'quiet', 'be quiet')) {
    spatial.pause();
    return 'Paused';
  }
  if (has('play the story', 'start the story', 'read the apps', 'play story', 'resume')) {
    spatial.play();
    return 'Playing the story';
  }
  if (has('narrator off', 'turn off narrator', 'no narration')) {
    spatial.setNarrate(false);
    return 'Narrator off';
  }
  if (has('narrator on', 'turn on narrator', 'read it', 'read this')) {
    spatial.setNarrate(true);
    return 'Narrator on';
  }
  if (has('house tour', 'take the tour', 'tour the house', 'replay intro', 'start tour')) {
    actions.replayIntro();
    return 'Starting the house tour';
  }
  if (spatial.get().tour) {
    if (has('next room', 'next', 'continue', 'go on', 'walk')) {
      spatial.tourStep(1, 10);
      return 'Next';
    }
    if (has('previous room', 'previous', 'back', 'go back')) {
      spatial.tourStep(-1, 10);
      return 'Previous';
    }
    if (has('skip', 'skip tour', 'dashboard', 'end tour', 'stop tour')) {
      spatial.endTour('home');
      return 'Opening the dashboard';
    }
  }
  if (has('watch video', 'watch the video', 'play video', 'play the video', 'oncure video')) {
    spatial.set({ video: true });
    return 'Playing the Oncure video';
  }
  if (has('full view', 'full screen', 'fullscreen')) {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
    return 'Full view';
  }
  if (has('refresh', 'reload', 'start over')) {
    window.setTimeout(() => window.location.reload(), 200);
    return 'Refreshing';
  }
  if (has('replay', 'start over', 'from the beginning')) {
    spatial.goChapter(0);
    return 'Back to the start';
  }
  if (has('mute voice', 'voice off', 'stop the voice', 'be silent')) {
    spatial.setNarrate(false);
    return 'AI voice muted';
  }
  if (has('unmute voice', 'voice on', 'turn voice on', 'talk to me')) {
    spatial.setNarrate(true);
    return 'AI voice on';
  }
  if (has('vision apps', 'show apps', 'bring the apps back') && spatial.get().tour) {
    spatial.endTour('home');
    return 'Back to the apps';
  }
  if (has('sound on', 'unmute')) {
    actions.sound(true);
    return 'Sound on';
  }
  if (has('sound off', 'mute')) {
    actions.sound(false);
    return 'Sound off';
  }
  let best: { i: number; len: number } | null = null;
  CHAPTERS.forEach((c, i) => {
    for (const v of [c.title.toLowerCase(), ...c.voice])
      if (t.includes(` ${norm(v).trim()} `) && (!best || v.length > best.len)) best = { i, len: v.length };
  });
  if (best) {
    const b = best as { i: number; len: number };
    spatial.goChapter(b.i);
    return `Opening ${CHAPTERS[b.i]!.title}`;
  }
  // Last try: a control on screen with that name ("start the story", "play").
  return clickByName(raw);
}
