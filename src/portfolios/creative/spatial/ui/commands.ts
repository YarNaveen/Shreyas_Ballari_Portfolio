import { internship, nationalMerit, pavilion, profile, resume } from '@/content/portfolio';
import { CHAPTERS, NAV_GUIDE } from '../story/chapters';
import { speak } from '../story/narrator';
import { TOUR } from '../story/tour';
import { spatial } from '../store';

const TOUR_LEN = TOUR.length;

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

/** Press a control: a dashboard card opens on a tap (pointer down and up), anything else on a click. */
function press(el: HTMLElement) {
  if (el.matches('[data-widget], [data-drag]')) {
    const r = el.getBoundingClientRect();
    const opts = { clientX: r.left + r.width / 2, clientY: r.top + 24, bubbles: true, cancelable: true, pointerId: 78, pointerType: 'mouse', isPrimary: true, button: 0 };
    el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, buttons: 1 }));
    el.dispatchEvent(new PointerEvent('pointerup', { ...opts, buttons: 0 }));
    window.dispatchEvent(new PointerEvent('pointerup', { ...opts, buttons: 0 }));
    return;
  }
  el.click();
}

/** Click the on-screen control whose name best matches the words. */
function clickByName(words: string): string | null {
  const want = norm(words).replace(/ (the|on|this|that|button|card|cards|please|me|page|app|project|tile|link) /g, ' ').replace(/ (the|on|button|card|please) /g, ' ').trim();
  if (!want) return null;
  const els = [...document.querySelectorAll<HTMLElement>('.sp-ui button, .sp-ui a, .sp-ui [data-voice]')].filter((e) => visible(e) && !(e as HTMLButtonElement).disabled);
  // "card 3": the third card on screen.
  const num = want.match(/^(\d+)$/)?.[1] ?? NUMBERS[want];
  if (num !== undefined) {
    const cards = els.filter((e) => e.matches('.os-story, .os-post, .aw-card, .os-act, .os-hv-app, .os-strip-card, .sc-big-card, .fun-card, [data-card]'));
    const el = cards[Number(num) - 1];
    if (el) {
      press(el);
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
    press(best.el);
    return `Clicked “${(best.el.dataset.voice ?? best.el.textContent ?? '').trim().slice(0, 40)}”`;
  }
  return null;
}

/** The scrollable area the visitor is most likely looking at: the front window's content first. */
export function mainScroller(): HTMLElement | null {
  const all = [...document.querySelectorAll<HTMLElement>('.sp-ui *')].filter((el) => {
    if (!visible(el)) return false;
    const cs = getComputedStyle(el);
    return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4;
  });
  // Later in the page means on top; among those, the biggest.
  return all.reverse().sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] ?? null;
}

/** Speak on request (even with the AI voice muted: the visitor asked), with captions. */
function say(text: string) {
  spatial.set({ caption: { text, at: 0 } });
  speak(text, {
    onWord: (i) => spatial.set({ caption: { text, at: i } }),
    onEnd: () => spatial.set({ caption: null }),
  });
}
const sayChapter = (id: string) => say(CHAPTERS.find((c) => c.id === id)!.say);

/** Open the Sports & Fitness Pavilion window, on one of its zones. */
export function openPavilion(zone: string | null = null) {
  spatial.set({ pavilionZone: zone, homeView: false, control: false });
  spatial.openWindow('pavilion');
}
/** Open Activities and Experience, on one activity (tama, temple, tutoring, swim, muaythai, guitar, olympiad, deca). */
export function openExperience(item: string | null = null) {
  spatial.set({ experienceItem: item, homeView: false, control: false });
  spatial.openWindow('experience');
}
export const openInternship = () => {
  spatial.set({ homeView: false, control: false });
  spatial.openWindow('internship');
};

const INTRO = `${profile.name} is a ${profile.grade.toLowerCase()} at ${profile.school} in ${profile.schoolTown}. ${resume.summary}`;
const zoneSay = (id: string) => {
  const z = pavilion.zones.find((x) => x.id === id)!;
  return `${z.title}. ${z.line}`;
};
const INTERNSHIP_SAY = `${internship.heading}. ${internship.summary}${internship.company ? ` The company is ${internship.company}.` : ''}${internship.role ? ` His role: ${internship.role}.` : ''}`;
const MERIT_SAY = `${nationalMerit.title}. On the ${nationalMerit.test}, Shreyas placed in the ${nationalMerit.result}, and he ${nationalMerit.status.charAt(0).toLowerCase()}${nationalMerit.status.slice(1)}. Earlier, he was in the top 99% on the PSAT in eighth and tenth grade, and the top 98% in ninth.`;

const focusMerit = () => {
  spatial.goChapter('awards');
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('os-awards', { detail: 'nmsc' })), 700);
};

/** "explain ..." / "describe ..." / "tell me about ...": open the topic and explain it aloud. */
function explain(topic: string): string | null {
  const w = norm(topic);
  const in_ = (...xs: string[]) => xs.some((x) => w.includes(` ${x} `));
  if (in_('this', 'it', 'this page', 'this app')) {
    sayChapter(CHAPTERS[spatial.get().chapter]?.id ?? 'home');
    return 'Explaining this app';
  }
  if (in_('national merit', 'psat', 'merit')) {
    focusMerit();
    say(MERIT_SAY);
    return 'National Merit recognition';
  }
  if (in_('oncure', 'on cure', 'research', 'his research')) {
    spatial.goChapter('oncure');
    sayChapter('oncure');
    return 'Explaining Oncure';
  }
  if (in_('finance', 'finance app', 'trading', 'stock', 'trading app', 'stock app')) {
    spatial.goChapter('finance');
    sayChapter('finance');
    return 'Explaining the Finance App';
  }
  if (in_('internship', 'play mat', 'industry', 'experience', 'work experience')) {
    openInternship();
    say(INTERNSHIP_SAY);
    return 'Explaining his internship';
  }
  for (const z of pavilion.zones)
    if (in_(z.title.toLowerCase(), z.id, ...(z.id === 'swim' ? ['swim', 'swimming', 'swim atlanta'] : []))) {
      openPavilion(z.id);
      say(zoneSay(z.id));
      return `Explaining ${z.title}`;
    }
  if (in_('pavilion', 'sports', 'fitness', 'sport')) {
    openPavilion();
    say(`${pavilion.title}. ${pavilion.intro}`);
    return 'Explaining the pavilion';
  }
  if (in_('awards', 'achievements', 'academic achievements', 'honors', 'academics')) {
    spatial.goChapter('awards');
    sayChapter('awards');
    return 'Explaining his awards';
  }
  if (in_('activities', 'extracurricular', 'extracurricular activities', 'volunteering', 'hobbies')) {
    spatial.goChapter('activities');
    sayChapter('activities');
    return 'Explaining his activities';
  }
  if (in_('projects', 'his projects', 'his work', 'my work')) {
    say(`He has two main projects. ${CHAPTERS.find((c) => c.id === 'oncure')!.say} ${CHAPTERS.find((c) => c.id === 'finance')!.say}`);
    return 'Explaining his projects';
  }
  if (in_('shreyas', 'him', 'himself', 'yourself')) {
    spatial.openWindow('profile');
    say(INTRO);
    return 'Introducing Shreyas';
  }
  if (in_('navigation', 'how to navigate', 'controls', 'this portfolio', 'the portfolio')) {
    say(NAV_GUIDE);
    return 'How to get around';
  }
  return null;
}

export function runCommand(raw: string, actions: { replayIntro: () => void; sound: (on: boolean) => void; voiceOff?: () => void }): string | null {
  const t = norm(raw).replace(/^ (please|can you|could you|hey|ok|okay|now) /, ' ').replace(/ please $/, ' ');
  const has = (...w: string[]) => w.some((x) => t.includes(` ${x} `));
  // Squeeze the apps into the corner, and bring them back.
  if (has('squeeze', 'minimise', 'minimize', 'hide everything', 'tuck away', 'hide the apps')) {
    spatial.set({ squeezed: true, homeView: false, control: false });
    return 'Apps squeezed into the corner';
  }
  if (spatial.get().squeezed && has('bring back', 'bring them back', 'restore', 'show everything', 'show the apps', 'unsqueeze', 'come back')) {
    spatial.set({ squeezed: false });
    return 'Apps are back';
  }
  // The 360 degree view.
  if (has('360', '360 view', '360 degree', 'look around', 'three sixty')) {
    spatial.set({ look360: !spatial.get().look360 || has('look around'), homeView: false, control: false });
    return spatial.get().look360 ? '360° view: drag or move your device to look around' : '360° view closed';
  }
  if (spatial.get().look360 && has('done', 'exit', 'stop looking', 'leave', 'close')) {
    spatial.set({ look360: false });
    return '360° view closed';
  }
  // Hand control by voice.
  if (has('hand control', 'hands on', 'hands off', 'use my hands', 'gestures on', 'camera control')) {
    const off = has('off', 'stop');
    window.dispatchEvent(new CustomEvent('sp-hands', { detail: !off }));
    return off ? 'Hand control off' : 'Hand control on';
  }
  // His resume.
  if (has('view resume', 'download resume', 'open resume', 'show resume', 'his resume', 'the resume', 'open cv', 'his cv')) {
    return clickByName(has('download') ? 'download resume' : 'view resume') ?? clickByName('resume') ?? 'Say “open profile”: the resume buttons are there';
  }
  if (has('stop listening', 'stop voice control', 'microphone off', 'mic off', 'turn off voice control')) {
    actions.voiceOff?.();
    return 'Stopped listening';
  }
  // Spoken help, introductions and explanations.
  if (has('how do i navigate', 'how to navigate', 'how does this work', 'how do i use this', 'guide me', 'how do i get around', 'navigation help')) {
    say(NAV_GUIDE);
    return 'How to get around';
  }
  if (has('welcome', 'welcome me', 'say welcome')) {
    sayChapter('home');
    return 'Welcome';
  }
  if (!t.includes(' ask ') && has('introduce shreyas', 'introduce him', 'who is shreyas', 'tell me about shreyas', 'introduce yourself', 'introduce')) {
    spatial.openWindow('profile');
    say(INTRO);
    return 'Introducing Shreyas';
  }
  const ex = t.match(/ (?:explain|describe|tell me about|talk about|what is|whats) (.+) $/);
  if (ex && !t.includes(' ask ')) {
    const r = explain(ex[1]!);
    if (r) return r;
  }
  // Activities and Experience: volunteering first.
  if (has('tama', 'medical camp', 'tama medical camp')) {
    openExperience('tama');
    return 'TAMA Medical Camp';
  }
  if (has('temple', 'sai temple', 'shirdi', 'sri shirdi sai temple')) {
    openExperience('temple');
    return 'Sri Shirdi Sai Temple';
  }
  if (has('tutoring', 'peer tutoring', 'tutor')) {
    openExperience('tutoring');
    return 'Peer tutoring';
  }
  if (has('volunteering', 'volunteer', 'community', 'activities and experience') || (has('experience') && !has('work experience', 'industry experience'))) {
    openExperience(has('volunteering', 'volunteer', 'community') ? 'tama' : null);
    return 'Activities and Experience';
  }
  // The Sports & Fitness Pavilion, his internship and National Merit recognition.
  if (has('swimming', 'swim', 'swim atlanta', 'pool')) {
    openPavilion('swim');
    return 'Swimming, in the Sports & Fitness Pavilion';
  }
  if (has('muay thai', 'martial arts', 'boxing')) {
    openPavilion('muaythai');
    return 'Muay Thai, in the Sports & Fitness Pavilion';
  }
  if (has('science olympiad', 'olympiad')) {
    openPavilion('olympiad');
    return 'Science Olympiad';
  }
  if (has('deca')) {
    openPavilion('deca');
    return 'DECA';
  }
  if (has('pavilion', 'sports pavilion', 'fitness pavilion', 'sports and fitness', 'sports', 'fitness', 'gym')) {
    openPavilion();
    return 'Opening the Sports & Fitness Pavilion';
  }
  if (has('internship', 'play mat', 'industry experience', 'work experience', 'his internship')) {
    openInternship();
    return 'Opening his internship';
  }
  if (has('national merit', 'merit', 'psat', 'grade 11 psat')) {
    focusMerit();
    return 'National Merit recognition';
  }
  if (spatial.get().tour && has('next room', 'next', 'next section', 'continue', 'go on')) {
    spatial.tourStep(1, TOUR_LEN);
    return 'Next room';
  }
  if (spatial.get().tour && has('previous room', 'previous', 'previous section')) {
    spatial.tourStep(-1, TOUR_LEN);
    return 'Previous room';
  }
  if (has('next section', 'next app')) {
    spatial.next();
    return 'Next section';
  }
  if (has('previous section', 'previous app')) {
    spatial.prev();
    return 'Previous section';
  }
  if (has('return to dashboard', 'back to dashboard', 'back to the dashboard')) {
    if (spatial.get().tour) spatial.endTour('home');
    else {
      spatial.set({ homeView: false, control: false, squeezed: false, windows: [] });
      spatial.goChapter('home');
    }
    return 'Back to the dashboard';
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
  if (has('dashboard', 'go home', 'home screen', 'main page')) {
    if (spatial.get().tour) {
      spatial.endTour('home');
      return 'Opening the dashboard';
    }
    spatial.set({ homeView: false, control: false, squeezed: false });
    spatial.goChapter('home');
    return 'Opening the dashboard';
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
  if (has('next', 'next one', 'next project', 'next page', 'show me the next', 'continue', 'forward', 'go on')) {
    spatial.next();
    return 'Next';
  }
  if (has('go back', 'back')) {
    // An open window or panel closes first, then a page's own back button, then the dashboard.
    const st = spatial.get();
    if (st.homeView || st.control) {
      spatial.set({ homeView: false, control: false });
      return 'Back';
    }
    if (st.windows.length) {
      spatial.closeWindow(st.windows[st.windows.length - 1]!);
      return 'Back';
    }
    const b = [...document.querySelectorAll<HTMLElement>('.os-main [data-voice="back"], .os-free > .os-back')].find(visible);
    if (b) {
      b.click();
      return 'Back';
    }
    if (CHAPTERS[st.chapter]?.id !== 'home') {
      spatial.goChapter('home');
      return 'Back to the dashboard';
    }
    return 'Already on the dashboard';
  }
  if (has('previous', 'last one', 'previous project', 'previous one', 'go to previous')) {
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
  if (has('house tour', 'take the tour', 'tour the house', 'replay intro', 'start tour', 'walk freely', 'walk around')) {
    actions.replayIntro();
    return 'Starting the house tour';
  }
  if (spatial.get().tour) {
    if (has('next room', 'next', 'continue', 'go on', 'walk')) {
      spatial.tourStep(1, TOUR_LEN);
      return 'Next';
    }
    if (has('previous room', 'previous', 'back', 'go back')) {
      spatial.tourStep(-1, TOUR_LEN);
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
  if (has('exit full screen', 'leave full screen', 'small screen') && document.fullscreenElement) {
    void document.exitFullscreen();
    return 'Left full screen';
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
