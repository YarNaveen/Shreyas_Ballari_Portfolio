import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { ArrowUpRight, EnvelopeSimple, Flask, Phone } from '@phosphor-icons/react';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { SmoothScrollContext } from '@/app/providers/SmoothScroll';
import { achievements, languages, profile } from '@/content/portfolio';
import { Activities, Certificates, Courses, Education, Goals, Languages, Scores, Tutoring } from '@/features/visuals/Visuals';
import { DetailSheet, type DetailId } from '@/features/details/Details';
import './studio.css';

/**
 * Studio tab: a folding phone.
 *
 * Closed, it shows a lock screen in front of his name. Scrolling unfolds it into a wide screen,
 * and the site scrolls inside that screen: hero, numbers, selected work, skills, where he learns,
 * and a contact card. At the end it folds shut again on an "incoming call" screen.
 * The dots under the phone change its colour; Basic / Glow / Orbit change the background.
 *
 * How the fold works: the device is two halves. The left half turns on the hinge (rotateY);
 * its back is the cover screen, so when it lies on top of the right half you see a closed phone.
 * Everything is driven by one number, the scroll progress `p` from 0 to 1 (see `frame` below).
 */

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;
/** Real photographs of each topic (public/assets/photos, see CREDITS.md there). */
const PHOTO: Record<string, string> = { oncure: 'microscope', trading: 'stock-charts', trophy: 'trophy', academy: 'classroom', arrow: 'archery-target', writing: 'writing', medical: 'stethoscope', tutor: 'chalkboard-math' };
const J = (n: string) => asset(`photos/${PHOTO[n] ?? n}.jpg`);
const PORTRAIT = asset('shreyas/portrait-studio.jpg');

const RIMS = [
  { id: 'Silver', c: '#e7e4dd' },
  { id: 'Graphite', c: '#3b3c40' },
  { id: 'Rose', c: '#e6a497' },
  { id: 'Sage', c: '#b5c2a6' },
];
const MODES = ['Basic', 'Glow', 'Orbit'] as const;
type Mode = (typeof MODES)[number];

const NUMBERS = [
  { v: 'Top 99%', l: 'PSAT' },
  { v: 'Top 99%', l: 'MAP' },
  { v: String(achievements.length), l: 'Awards and honors' },
  { v: String(languages.length), l: 'Coding languages' },
];

const WORK: { kind: string; title: string; line: string; img: string; tone: string; more?: DetailId }[] = [
  { kind: 'Research concept', title: 'Oncure', line: 'AI-guided nanobots that could carry cancer therapy straight to tumour cells. A conceptual research proposal, not an existing treatment.', img: J('oncure'), tone: '#2f5fd6', more: 'oncure' },
  { kind: 'FinTech · in progress', title: 'AI trading app', line: 'Suggests how much to buy, when to buy and when to sell. Hypothetical sample data, not financial advice.', img: J('trading'), tone: '#e39a2d', more: 'finance' },
  { kind: 'Recognition', title: 'Awards', line: 'College Board National Recognition Program, and the Principal’s Honors List in 2025 and 2026.', img: J('trophy'), tone: '#e8ae9f' },
  { kind: 'Teaching', title: 'Peer tutoring', line: 'Math and Science for 7th and 8th graders, at lunch and after school.', img: J('tutor'), tone: '#4f9a6f' },
  { kind: 'Writing', title: 'Young Authors', line: 'Young Authors Contest winner in 2023.', img: J('writing'), tone: '#f1c232' },
];



const ORBIT = [J('oncure'), J('trading'), J('trophy'), J('tutor'), J('academy'), PORTRAIT];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (x: number) => x * x * (3 - 2 * x);

/** Scroll progress (0 to 1) where things happen. */
const T = { unfold: [0.03, 0.15], scroll: [0.17, 0.86], fold: [0.88, 0.97], call: 0.92 } as const;

function useClock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    tick();
    const t = window.setInterval(tick, 15000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

/** Sofia Sans Extra Condensed (open font) for the big lettering, from Google Fonts. */
function useDisplayFont() {
  useEffect(() => {
    const id = 'fo-font';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@700;800;900&display=swap';
    document.head.appendChild(l);
  }, []);
}

// --- The site inside the unfolded screen -------------------------------------------------------

function Screen({ go, live, onMore }: { go: (id: string) => void; live: boolean; onMore?: (id: DetailId, from: HTMLElement) => void }) {
  const tab = live ? undefined : -1;
  return (
    <div className="fo-site">
      <section className="fo-hero" data-sec="home">
        <div className="fo-hero-text">
          <p className="fo-mono">Student researcher &amp; peer tutor · {profile.school}</p>
          <h3 className="fo-display">{profile.name}</h3>
          <p className="fo-lede">Exploring how AI could make cancer treatment more precise, and building an AI trading app for beginners.</p>
          <div className="fo-row">
            <button type="button" className="fo-btn is-dark" tabIndex={tab} onClick={() => go('work')}>
              See the work <ArrowUpRight weight="bold" aria-hidden="true" />
            </button>
            <button type="button" className="fo-btn" tabIndex={tab} onClick={(e) => onMore?.('contact', e.currentTarget)}>
              Say hello
            </button>
          </div>
        </div>
        <img className="fo-hero-img" src={PORTRAIT} alt={live ? `${profile.name}, in a dark suit and blue tie` : ''} draggable={false} />
      </section>

      <section className="fo-band" data-sec="numbers">
        <p className="fo-mono">In numbers</p>
        <div className="fo-nums">
          {NUMBERS.map((n) => (
            <div key={n.l}>
              <b className="fo-display">{n.v}</b>
              <span className="fo-mono">{n.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fo-work" data-sec="work">
        <header className="fo-work-head">
          <h3 className="fo-display">Selected work</h3>
          <span className="fo-chip">{WORK.length} projects</span>
        </header>
        {WORK.map((w, i) => (
          <article key={w.title} className="fo-card" style={{ '--tone': w.tone } as CSSProperties}>
            <figure>
              <img src={w.img} alt="" loading="lazy" draggable={false} />
            </figure>
            <div className="fo-card-text">
              <b className="fo-display fo-num">{String(i + 1).padStart(2, '0')}</b>
              <div>
                <p className="fo-mono">{w.kind}</p>
                <h4 className="fo-display">{w.title}</h4>
                <p>{w.line}</p>
                {w.more ? (
                  <button
                    type="button"
                    className="fo-more fo-mono"
                    tabIndex={tab}
                    data-voice={`view more ${w.title}`}
                    onClick={(e) => onMore?.(w.more!, e.currentTarget.closest('.fo-card') as HTMLElement)}
                  >
                    View more →
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="fo-sec fo-light" data-sec="about">
        <p className="fo-mono">Education</p>
        <h3 className="fo-display fo-h">Where he learns</h3>
        <Education />
      </section>

      <section className="fo-sec fo-dark vz-on-dark" data-sec="skills">
        <p className="fo-mono">Technical skills</p>
        <h3 className="fo-display fo-h">Courses &amp; languages</h3>
        <Languages />
        <div className="fo-gap" />
        <Courses />
      </section>

      <section className="fo-sec fo-cream" data-sec="awards">
        <p className="fo-mono">Achievements and certificates</p>
        <h3 className="fo-display fo-h">Awards</h3>
        <Certificates />
        <div className="fo-gap" />
        <Scores />
      </section>

      <section className="fo-sec fo-dark vz-on-dark" data-sec="life">
        <p className="fo-mono">Beyond the classroom</p>
        <h3 className="fo-display fo-h">Activities &amp; volunteering</h3>
        <Activities />
      </section>

      <section className="fo-sec fo-light" data-sec="tutoring">
        <p className="fo-mono">As a peer tutor</p>
        <h3 className="fo-display fo-h">How he helps others learn</h3>
        <Tutoring />
      </section>

      <section className="fo-sec fo-blue vz-on-dark" data-sec="goals">
        <p className="fo-mono">Goals</p>
        <h3 className="fo-display fo-h">Where he is heading</h3>
        <Goals />
        <div className="fo-cta" data-sec="contact">
          <b className="fo-display">Curious about Oncure? Let’s talk.</b>
          <button type="button" className="fo-btn is-dark" tabIndex={tab} data-voice="contact form" onClick={(e) => onMore?.('contact', e.currentTarget.closest('.fo-cta') as HTMLElement)}>
            Contact form <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}

// --- The cover screens (closed phone) ----------------------------------------------------------

function LockScreen({ time }: { time: string }) {
  return (
    <div className="fo-lock">
      <img className="fo-lock-bg" src={PORTRAIT} alt="" draggable={false} />
      <div className="fo-lock-top">
        <b className="fo-display fo-time">{time}</b>
        <span>
          {profile.grade} · {profile.school}
        </span>
      </div>
      <div className="fo-notes">
        <div className="fo-note">
          <img src={J('oncure')} alt="" />
          <span>
            <b>Oncure proposal</b>
            <small className="fo-mono">Research concept · now</small>
          </span>
        </div>
        <div className="fo-note">
          <img src={J('trading')} alt="" />
          <span>
            <b>AI trading app</b>
            <small className="fo-mono">In progress</small>
          </span>
        </div>
      </div>
      <div className="fo-lock-foot">
        <span className="fo-round" aria-hidden="true">
          <Flask weight="bold" />
        </span>
        <span className="fo-pill">Scroll to unfold</span>
        <span className="fo-round" aria-hidden="true">
          <EnvelopeSimple weight="bold" />
        </span>
      </div>
    </div>
  );
}

function CallScreen({ onTalk }: { onTalk: (from: HTMLElement) => void }) {
  const knob = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  /** Slide the green button to the end (or tap it) to open the contact form. */
  const onDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    const k = knob.current;
    const tr = track.current;
    if (!k || !tr) return;
    const x0 = e.clientX;
    const max = tr.clientWidth - k.offsetWidth - 8;
    let dx = 0;
    k.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      dx = clamp(ev.clientX - x0, 0, max);
      k.style.transform = `translateX(${dx}px)`;
    };
    const up = () => {
      k.removeEventListener('pointermove', move);
      k.removeEventListener('pointerup', up);
      if (dx > max * 0.8 || dx < 4) onTalk(tr);
      k.style.transform = '';
    };
    k.addEventListener('pointermove', move);
    k.addEventListener('pointerup', up);
  };
  return (
    <div className="fo-call">
      <b className="fo-display">{profile.name}</b>
      <span>Incoming call · about your next idea</span>
      <img className="fo-call-photo" src={PORTRAIT} alt="" draggable={false} />
      <div ref={track} className="fo-slide">
        <span ref={knob} className="fo-slide-knob" role="button" tabIndex={0} aria-label="Open the contact form" onPointerDown={onDown} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && track.current && onTalk(track.current)}>
          <Phone weight="fill" />
        </span>
        <span>slide to talk</span>
      </div>
      <small className="fo-mono">Reply through the contact form</small>
    </div>
  );
}

// --- The page ----------------------------------------------------------------------------------

export function StudioPortfolio() {
  useDisplayFont();
  const time = useClock();
  const smooth = useContext(SmoothScrollContext);
  const [mode, setMode] = useState<Mode>('Basic');
  const [rim, setRim] = useState(RIMS[0]!);
  const [open, setOpen] = useState(false);
  const [call, setCall] = useState(false);
  const [size, setSize] = useState({ W: 800, H: 550, phone: false });
  /** Oncure or the trading app, opened inside the phone screen. */
  const [detail, setDetail] = useState<{ id: DetailId; from: DOMRect } | null>(null);
  /** The contact form opened from the incoming call (on the closed phone's screen). */
  const [callForm, setCallForm] = useState<DOMRect | null>(null);

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const nameL = useRef<HTMLSpanElement>(null);
  const nameR = useRef<HTMLSpanElement>(null);
  const live = useRef<HTMLDivElement>(null);
  const contentH = useRef(0);

  // Device size: a wide tablet when open; on phones a taller one.
  useLayoutEffect(() => {
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const phone = vw < 760;
      const W = phone ? Math.min(vw * 0.92, 440) : Math.min(860, vw * 0.58, (vh - 200) / 0.68);
      const H = phone ? Math.min(vh * 0.66, W * 1.45) : W * 0.68;
      setSize({ W: Math.round(W), H: Math.round(H), phone });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // His full name stays on screen when the phone opens: each word shrinks just enough to fit
  // beside the open phone (--nk is that scale).
  useLayoutEffect(() => {
    const fitName = () => {
      const st = stage.current;
      const l = nameL.current;
      const r = nameR.current;
      if (!st || !l || !r || size.phone) return;
      const room = window.innerWidth / 2 - size.W / 2 - 18 - 28;
      const widest = Math.max(l.offsetWidth, r.offsetWidth, 1);
      st.style.setProperty('--nk', Math.max(0.2, Math.min(1, room / widest)).toFixed(3));
    };
    fitName();
    void document.fonts?.ready.then(fitName);
    window.addEventListener('resize', fitName);
    return () => window.removeEventListener('resize', fitName);
  }, [size]);

  // One loop: read the scroll, set every transform.
  useEffect(() => {
    let raf = 0;
    let lastOpen = false;
    let lastCall = false;
    // Only does work when the page has scrolled or resized (or a few times a second while the
    // inner site's pictures load), not on every frame.
    let lastY = NaN;
    let lastVh = 0;
    let tick = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const sec = section.current;
      const st = stage.current;
      if (!sec || !st) return;
      tick = (tick + 1) % 20;
      if (window.scrollY === lastY && window.innerHeight === lastVh && tick !== 0) return;
      lastY = window.scrollY;
      lastVh = window.innerHeight;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const u = ease(seg(p, T.unfold[0], T.unfold[1])) * (1 - ease(seg(p, T.fold[0], T.fold[1])));
      const k = seg(p, T.scroll[0], T.scroll[1]);
      st.style.setProperty('--u', u.toFixed(4));
      // The site inside scrolls with the page (same offset on every copy).
      const inner = live.current;
      if (inner) {
        const h = inner.scrollHeight;
        if (h) contentH.current = h;
        const max = Math.max(0, contentH.current - inner.parentElement!.clientHeight);
        st.style.setProperty('--sy', `${(-k * max).toFixed(1)}px`);
      }
      const isOpen = u > 0.995;
      if (isOpen !== lastOpen) setOpen((lastOpen = isOpen));
      const isCall = p > T.call;
      if (isCall !== lastCall) setCall((lastCall = isCall));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Jump to a part of the inner site by scrolling the page to the matching point. */
  const go = (id: string) => {
    const sec = section.current;
    const inner = live.current;
    if (!sec || !inner) return;
    const el = inner.querySelector<HTMLElement>(`[data-sec="${id}"]`);
    const max = Math.max(1, inner.scrollHeight - inner.parentElement!.clientHeight);
    const k = el ? clamp(el.offsetTop / max) : 0;
    const p = T.scroll[0] + k * (T.scroll[1] - T.scroll[0]);
    const y = sec.getBoundingClientRect().top + window.scrollY + p * (sec.offsetHeight - window.innerHeight);
    if (smooth) smooth.scrollToY(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const vars = { '--W': `${size.W}px`, '--H': `${size.H}px`, '--rim': rim.c } as CSSProperties;
  const half = (side: 'l' | 'r', children: ReactNode) => (
    <div className={`fo-screen-clip is-${side}`} aria-hidden="true" inert>
      <div className="fo-screen-move">{children}</div>
    </div>
  );

  return (
    <div className={`fo is-${mode.toLowerCase()} ${size.phone ? 'is-phone' : ''}`} style={vars}>
      <header className="fo-top">
        <span className="fo-logo fo-display">{profile.name}</span>
        <div className="fo-modes" role="radiogroup" aria-label="Background">
          {MODES.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </header>

      <section ref={section} className="fo-scroll" aria-label={`${profile.name}: portfolio on a folding phone`}>
        <div ref={stage} className="fo-stage">
          <div className="fo-glow" aria-hidden="true" />
          <div className="fo-orbit" aria-hidden="true">
            {ORBIT.map((src, i) => (
              <img key={src} src={src} alt="" style={{ '--i': i } as CSSProperties} draggable={false} />
            ))}
          </div>
          <h2 className="fo-name fo-display" aria-hidden="true">
            <span ref={nameL} className="is-l">
              {profile.firstName}
            </span>
            <span ref={nameR} className="is-r">
              {profile.lastName}
            </span>
          </h2>

          <div className="fo-device">
            {/* The hinge, seen from the side while the phone is closed. */}
            <div className="fo-spine" aria-hidden="true" />
            {/* Right half: the right side of the open screen. */}
            <div className="fo-half is-r">
              <div className="fo-glass">{half('r', <Screen go={go} live={false} />)}</div>
            </div>
            {/* Left half: turns on the hinge. Front: left side of the open screen. Back: the cover. */}
            <div className="fo-half is-l">
              <div className="fo-face is-front">
                <div className="fo-glass">{half('l', <Screen go={go} live={false} />)}</div>
              </div>
              <div className="fo-face is-back">
                <div className="fo-glass">
                  {call ? <CallScreen onTalk={(el) => setCallForm(el.getBoundingClientRect())} /> : <LockScreen time={time} />}
                  <DetailSheet id={callForm ? 'contact' : null} origin={callForm} onClose={() => setCallForm(null)} contained theme="studio" />
                </div>
              </div>
            </div>
            {/* Fully open: one live screen you can use. */}
            <div className={`fo-open ${open ? 'is-on' : ''}`} aria-hidden={!open} inert={!open}>
              <div className="fo-glass">
                <div className="fo-status fo-mono" aria-hidden="true">
                  <span>{time}</span>
                  <span>5G ▮</span>
                </div>
                <div className="fo-screen-clip">
                  <div ref={live} className="fo-screen-move">
                    <Screen go={go} live onMore={(id, el) => setDetail({ id, from: el.getBoundingClientRect() })} />
                  </div>
                </div>
                <nav className="fo-nav" aria-label="Sections">
                  {[
                    ['home', 'Home'],
                    ['work', 'Work'],
                    ['about', 'About'],
                    ['awards', 'Awards'],
                    ['contact', 'Contact'],
                  ].map(([id, l]) => (
                    <button key={id} type="button" onClick={() => go(id!)}>
                      {l}
                    </button>
                  ))}
                </nav>
                <DetailSheet id={detail?.id ?? null} origin={detail?.from ?? null} onClose={() => setDetail(null)} contained theme="studio" />
              </div>
            </div>
          </div>

          <div className="fo-swatches" role="radiogroup" aria-label="Phone colour">
            {RIMS.map((r) => (
              <button key={r.id} type="button" role="radio" aria-checked={rim.id === r.id} aria-label={r.id} className={rim.id === r.id ? 'is-on' : ''} style={{ '--c': r.c } as CSSProperties} onClick={() => setRim(r)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
