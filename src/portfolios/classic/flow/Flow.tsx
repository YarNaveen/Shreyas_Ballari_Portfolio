import { Component, lazy, Suspense, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';
import '@fontsource-variable/geist';
import { SmoothScrollContext } from '@/app/providers/SmoothScroll';
import { languages, profile, subjects } from '@/content/portfolio';
import { PHOTOS } from '@/content/photos';
import { Dock, NAV_ITEMS } from './Dock';
import { StageHero } from '../hero/StageHero';
import { show, useFx, type Fx, type Reg } from './fx';
import { END, F, out, seg, smooth, within } from './timeline';
import './flow.css';

const FlowCanvas = lazy(() => import('./FlowCanvas'));

/** If the browser cannot make a WebGL context, the film carries on without the 3D layer. */
class Optional3D extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* The particles and chrome star are decoration; everything else still works. */
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function canWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Classic, as one scroll film (pinned to the screen while it plays):
 *  hero panel → it tips and shrinks into a ring of cards (click one, or keep scrolling for Oncure)
 *  → a black star swallows the screen → a particle sphere bursts → the chosen topic in detail
 *  → the problem in numbers → how Oncure would work → challenges and roadmap → projects
 *  → recognition → courses and skills → activities (a fly-through) → goals → the closing panel.
 * Every chapter registers one update function; a single loop feeds them the scroll position.
 */

const BASE = import.meta.env.BASE_URL;

/** Where the menu jumps to (scroll progress). */
const JUMP: Record<string, number> = {
  home: 0,
  work: 0.1,
  contact: END,
};
const activeAt = (t: number) => {
  if (t > END - 0.005) return 'contact';
  if (t < 0.05) return 'home';
  let id = 'home';
  for (const n of NAV_ITEMS) if (t >= JUMP[n.id]! - 0.03) id = n.id;
  return id;
};

// --- Hero ----------------------------------------------------------------------------------------

/** The violet panel hero (kept for an earlier design; the hologram hero opens the page now). */
function HeroLayer({ reg }: { reg: Reg }) {
  const wrap = useRef<HTMLDivElement>(null);
  useFx(reg, (t, vw, vh) => {
    const el = wrap.current;
    if (!el) return;
    const k = within(t, 'hero');
    show(el, k < 1);
    if (k >= 1) return;
    const e = smooth(k);
    // The card in front of the ring: same size and place.
    const w = Math.min(340, Math.max(190, vw * 0.22));
    const h = w * 1.48;
    const cy = vh * 0.52;
    const x = (e * (vw - w)) / 2;
    const top = e * (cy - h / 2);
    const bottom = e * (vh - cy - h / 2);
    el.style.clipPath = `inset(${top}px ${x}px ${bottom}px ${x}px round ${e * 24}px)`;
    const inner = el.firstElementChild as HTMLElement | null;
    if (inner) inner.style.transform = `scale(${1 - e * 0.42})`;
    // At the end it fades into the portrait card waiting in the ring (his face, clear on any screen).
    el.style.opacity = String(1 - smooth(seg(k, 0.72, 1)));
  });
  return (
    <div ref={wrap} className="fl-herolayer">
      <StageHero />
    </div>
  );
}

// --- Ring of cards: the hero card, then his education -----------------------------------------------

const EDU: { tag: string; title: string; lines: string[]; tone: 'violet' | 'night' | 'lime'; image?: string }[] = [
  { tag: 'High school', title: profile.school, lines: [`${profile.grade} · ${profile.schoolTown}`, 'All Honors and AP coursework'], tone: 'violet', image: `${BASE}assets/photos/classroom.jpg` },
  { tag: 'AP & Honors', title: 'Courses', lines: ['AP Computer Science A', 'AP CS Principles', 'AP Precalculus', 'AP Biology · AP Chemistry', 'AP Physics C'], tone: 'night', image: `${BASE}assets/photos/chalkboard-math.jpg` },
  { tag: 'Code', title: 'Languages', lines: languages, tone: 'lime', image: PHOTOS.code.src },
  { tag: 'Interests', title: 'Subjects he loves', lines: subjects, tone: 'violet', image: `${BASE}assets/photos/stock-charts.jpg` },
  { tag: 'Middle school', title: 'Francis Granger Middle School', lines: ['Project Arrow advanced program'], tone: 'night', image: PHOTOS.desk.src },
  { tag: 'Elementary', title: 'Nancy Young Elementary School', lines: ['Where the curiosity started'], tone: 'lime', image: PHOTOS.openBook.src },
];

function Ring({ reg }: { reg: Reg }) {
  const wrap = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const marquee = useRef<HTMLParagraphElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  useFx(reg, (t) => {
    // In place (full size, facing you) by the time the hero lands on its card; then it turns.
    const enter = out(seg(t, F.hero[0] + 0.015, F.hero[1]));
    const a = seg(t, F.hero[1], F.carousel[1] + 0.02);
    const cover = seg(t, F.star[0], F.star[1]);
    const on = enter > 0 && cover < 0.9;
    show(wrap.current, on);
    show(marquee.current, on);
    show(hint.current, on);
    if (!on) return;
    wrap.current!.style.transform = `translate(-50%, -50%) scale(${0.7 + enter * 0.3})`;
    ring.current!.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${-a * 330}deg)`;
    marquee.current!.style.opacity = String(enter);
    marquee.current!.style.transform = `translate(${-a * 55}%, -50%)`;
    hint.current!.style.opacity = String(seg(t, F.hero[1], F.hero[1] + 0.02) * (1 - seg(t, F.star[0] - 0.01, F.star[0] + 0.005)));
  });
  return (
    <>
      <p ref={marquee} className="fl-marquee" aria-hidden="true">
        {[0, 1].map((k) => (
          <span key={k}>
            Curiosity without limits <i>○</i> Research, code and teaching <i>○</i> Ideas that grow <i>○</i>{' '}
          </span>
        ))}
      </p>
      <div ref={wrap} className="fl-carousel">
        <div ref={ring} className="fl-ring" style={{ '--n': EDU.length + 1 } as CSSProperties}>
          <div className="fl-card is-hero" style={{ '--i': 0 } as CSSProperties} aria-hidden="true">
            <img className="fl-heroimg" src={`${BASE}assets/shreyas/portrait-studio.jpg`} alt="" />
            <span className="fl-herocap">
              <b>Hey, I’m {profile.firstName}</b>
              <small>
                {profile.grade} · {profile.school}
              </small>
            </span>
          </div>
          {EDU.map((c, i) => (
            <article key={c.title} className={`fl-card is-${c.tone} is-edu`} style={{ '--i': i + 1 } as CSSProperties}>
              {c.image && <img src={c.image} alt="" loading="lazy" />}
              <span className="fl-card-head">
                <span className="fl-pill">{c.tag}</span>
                <span className="fl-site">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="fl-card-foot">
                <b>{c.title}</b>
                <ul>
                  {c.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </span>
            </article>
          ))}
        </div>
      </div>
      <p ref={hint} className="fl-hint">
        His education · keep scrolling
      </p>
    </>
  );
}

// --- The black star, the spark ---------------------------------------------------------------

function Star({ reg, bg }: { reg: Reg; bg: MutableRefObject<HTMLDivElement | null> }) {
  const star = useRef<SVGSVGElement>(null);
  const spark = useRef<SVGSVGElement>(null);
  useFx(reg, (t) => {
    const cover = seg(t, F.star[0], F.star[1]);
    const s = Math.pow(cover, 2.4);
    const st = star.current;
    if (st) {
      st.style.transform = `translate(-50%, -50%) rotate(${cover * 40}deg) scale(${0.001 + s * 42})`;
      st.style.opacity = cover > 0 && t < F.detail[1] ? '1' : '0';
    }
    if (bg.current) bg.current.style.background = cover >= 0.98 ? '#000' : '#fff';
    const on = seg(t, F.star[0] + 0.02, F.star[1]) * (1 - seg(t, F.detail[0] + 0.004, F.detail[0] + 0.02));
    const sp = spark.current;
    if (sp) {
      sp.style.opacity = String(on);
      const grow = Math.pow(seg(t, F.fill[0], F.fill[1]), 3);
      sp.style.transform = `translate(-50%, -50%) scale(${0.6 + on * 0.4 + grow * 140}) rotate(${t * 900 * (1 - grow)}deg)`;
    }
  });
  return (
    <>
      <svg ref={star} className="fl-star" viewBox="-50 -50 100 100" aria-hidden="true">
        <path d="M0 -50 Q7 -7 50 0 Q7 7 0 50 Q-7 7 -50 0 Q-7 -7 0 -50Z" />
      </svg>
      <svg ref={spark} className="fl-spark" viewBox="-50 -50 100 100" aria-hidden="true">
        <path d="M0 -50 Q6 -6 50 0 Q6 6 0 50 Q-6 6 -50 0 Q-6 -6 0 -50Z" />
      </svg>
    </>
  );
}

// --- The chosen topic ----------------------------------------------------------------------------

export function Flow() {
  const smoothScroll = useContext(SmoothScrollContext);
  const section = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const fxs = useRef(new Set<Fx>());
  const [near, setNear] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState('home');

  const [gl, setGl] = useState(false);
  useEffect(() => {
    setMounted(true);
    setGl(canWebGL());
  }, []);
  const reg = useCallback<Reg>((fx) => {
    fxs.current.add(fx);
    return () => void fxs.current.delete(fx);
  }, []);

  const scrollToT = useCallback(
    (t: number, duration = 1.8) => {
      const sec = section.current;
      if (!sec) return;
      const y = sec.getBoundingClientRect().top + window.scrollY + (Math.min(t, END) / END) * (sec.offsetHeight - window.innerHeight);
      if (smoothScroll) smoothScroll.scrollToY(y, { duration });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    },
    [smoothScroll],
  );
  const go = useCallback(
    (id: string) => {
      if (id === 'home') {
        // Back to the hologram hero at the very top.
        if (smoothScroll) smoothScroll.scrollToY(0, { duration: 2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // Sections after the film (about, awards, activities, goals, contact) are ordinary page sections.
      const after = document.getElementById(`cx-${id}`);
      if (after) {
        const y = after.getBoundingClientRect().top + window.scrollY;
        if (smoothScroll) smoothScroll.scrollToY(y, { duration: 1.8 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }
      scrollToT(JUMP[id] ?? 0, 2.2);
    },
    [scrollToT, smoothScroll],
  );

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    const io = new IntersectionObserver(([e]) => setNear(!!e?.isIntersecting), { rootMargin: '30% 0px' });
    io.observe(sec);
    let raf = 0;
    let last = '';
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 1.5) return;
      const t = END * Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      progress.current = t;
      const vw = window.innerWidth;
      fxs.current.forEach((fx) => fx(t, vw, vh));
      const a = activeAt(t);
      if (a !== last) setActive((last = a));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <>
      {/* Outside the film section, so the menu bar stays above every section after it. */}
      <div className="fl-dockhost">
        <Dock go={go} active={active} />
      </div>
      <section ref={section} id="story" className="fl" aria-label={`${profile.name}: portfolio`}>
      <div className="fl-stage">
        <div ref={bg} className="fl-bg" />
        <Ring reg={reg} />
        <HeroLayer reg={reg} />
        <Star reg={reg} bg={bg} />
        {mounted && gl && (
          <Optional3D>
            <Suspense fallback={null}>
              <FlowCanvas progress={progress} active={near} />
            </Suspense>
          </Optional3D>
        )}
      </div>
      </section>
    </>
  );
}
