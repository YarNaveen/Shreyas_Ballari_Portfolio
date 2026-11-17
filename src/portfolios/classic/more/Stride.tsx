import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight, Atom, Brain, ChalkboardTeacher, ChartLineUp, Code, Dna, GraduationCap, Medal, Sparkle, X } from '@phosphor-icons/react';
import { achievements, activities, courses, goals, intro, languages, profile, researchInterests, resume, schools, subjects, volunteering } from '@/content/portfolio';
import { ContactPanel } from '@/features/details/Contact';
import { DetailSheet, type DetailId } from '@/features/details/Details';
import { Activities, Certificates, Scores } from '@/features/visuals/Visuals';
import { useSeen } from './ui';

/**
 * The Classic sections after the Finance film, laid out like a modern studio site: a blue hero with
 * a particle burst, a two-row marquee, an about headline with bento cards, a white grid section,
 * a stacked "work" gallery with a counter, a dark "momentum" band with a chrome object, a goals
 * row, an underline contact form and a blue finale with the footer. Every fact comes from
 * content/portfolio.ts. Menu ids kept: cx-about, cx-wall, cx-life, cx-tutoring, cx-goals, cx-contact.
 */

const BASE = import.meta.env.BASE_URL;
const photo = (n: string) => `${BASE}assets/photos/${n}.jpg`;
/** Opens Oncure or the trading app in the detail sheet (see Sheet below). */
const openSheet = (id: DetailId) => void window.dispatchEvent(new CustomEvent('sd-sheet', { detail: id }));
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Words that come into focus one after another (blur to sharp). `dimFrom` greys the rest. */
export function Blur({ text, dimFrom = Infinity, as: Tag = 'h2', className = '', id }: { text: string; dimFrom?: number; as?: 'h2' | 'h3' | 'p'; className?: string; id?: string }) {
  const ref = useSeen<HTMLHeadingElement>();
  const T = Tag as 'h2';
  return (
    <T ref={ref} id={id} className={`sd-blur ${className}`}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className={i >= dimFrom ? 'is-dim' : undefined} style={{ '--i': i } as CSSProperties}>
            {w}
          </span>{' '}
        </Fragment>
      ))}
    </T>
  );
}

function Rise({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
  const ref = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} id={id} className={`sd-rise ${className}`}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- hero */

/** A soft burst of light particles streaming out of the centre. Draws only while on screen. */
function Burst() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const N = window.innerWidth < 700 ? 260 : 520;
    const ps = Array.from({ length: N }, () => ({ a: 0, r: 0, v: 0, s: 0, life: 0 }));
    const spawn = (p: (typeof ps)[number], warm: boolean) => {
      p.a = Math.random() * Math.PI * 2;
      p.r = warm ? Math.random() * Math.max(w, h) * 0.5 : Math.random() * 6;
      p.v = 0.25 + Math.random() * 1.4;
      p.s = 0.4 + Math.random() * 1.5;
      p.life = Math.random();
    };
    const size = () => {
      const b = cv.getBoundingClientRect();
      w = b.width;
      h = b.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    ps.forEach((p) => spawn(p, true));
    let raf = 0;
    let on = false;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.46;
      const max = Math.hypot(w, h) * 0.55;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.22);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.15, 'rgba(160,190,255,0.45)');
      g.addColorStop(1, 'rgba(40,80,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (const p of ps) {
        if (!still) p.r += p.v * (1 + p.r / 160);
        if (p.r > max) spawn(p, false);
        const k = 1 - p.r / max;
        const x = cx + Math.cos(p.a) * p.r;
        const y = cy + Math.sin(p.a) * p.r * 0.82;
        const a = Math.min(1, k * 1.3) * (0.35 + p.life * 0.65);
        const tail = Math.min(p.r, 4 + p.v * p.r * 0.05);
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.life > 0.55 ? '#ffffff' : '#8fb0ff';
        ctx.lineWidth = p.s * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(p.a) * tail, y - Math.sin(p.a) * tail * 0.82);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    const loop = () => {
      draw();
      if (on && !still) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      on = !!e?.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) loop();
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(cv);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);
  return <canvas ref={ref} className="sd-burst" aria-hidden="true" />;
}

function Hero() {
  const ref = useSeen<HTMLElement>();
  const stats = [
    { v: '99%', k: 'PSAT, top nationwide' },
    { v: '1280', k: 'PSAT 8/9, out of 1440' },
    { v: String(achievements.length), k: 'Awards and honors' },
  ];
  return (
    <section ref={ref} id="cx-intro" className="sd-hero" aria-labelledby="sd-hero-h">
      <Burst />
      <div className="sd-hero-in">
        <h2 id="sd-hero-h" className="sd-hero-h">
          <span>Curiosity has</span>
          <span className="is-soft">no limits.</span>
        </h2>
        <div className="sd-hero-foot">
          <ul className="sd-stats">
            {stats.map((s, i) => (
              <li key={s.k} style={{ '--i': i } as CSSProperties}>
                <b>{s.v}</b>
                <small>{s.k}</small>
              </li>
            ))}
          </ul>
          <div className="sd-hero-copy">
            <p className="sd-hero-sub">
              Student researcher and peer tutor in {profile.schoolTown}.
            </p>
            <p className="sd-hero-body">{intro.lead.text}</p>
            <div className="sd-hero-cta">
              <button type="button" className="sd-pill is-white" onClick={() => scrollTo('sd-work')}>
                See his work
              </button>
              <button type="button" className="sd-link" onClick={() => scrollTo('cx-contact')}>
                Get in touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- marquee */

function Marquee() {
  const rows = [
    { items: [...subjects, ...courses.slice(0, 6)], icon: Atom, rev: false },
    { items: [...schools.map((s) => s.name), ...activities.map((a) => a.title), ...languages], icon: Sparkle, rev: true },
  ];
  return (
    <div className="sd-marquee" aria-label="Subjects, courses, schools and activities">
      {rows.map(({ items, icon: I, rev }, r) => (
        <div key={r} className={`sd-mq-row ${rev ? 'is-rev' : ''}`}>
          <div className="sd-mq-track">
            {[0, 1].map((k) => (
              <span key={k} aria-hidden={k === 1 ? true : undefined}>
                {items.map((t) => (
                  <em key={t}>
                    <I weight="fill" aria-hidden="true" /> {t}
                  </em>
                ))}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- about + bento */

function About() {
  const ref = useSeen<HTMLHeadingElement>();
  // The headline, with small coloured icons between some words.
  const parts: (string | { icon: typeof Dna; tone: string })[] = [
    'A junior who studies',
    { icon: Code, tone: 'is-blue' },
    'computer science and AI,',
    'and turns curiosity into research',
    { icon: Dna, tone: 'is-violet' },
    'and real apps',
    { icon: ChartLineUp, tone: 'is-green' },
    'that could help people.',
  ];
  let n = 0;
  return (
    <section id="cx-about" className="sd-about" aria-labelledby="sd-about-h">
      <p className="sd-label">
        <i aria-hidden="true" /> About {profile.firstName}
      </p>
      <h2 ref={ref} id="sd-about-h" className="sd-about-h sd-blur">
        {parts.map((p, pi) =>
          typeof p === 'string' ? (
            p.split(' ').map((w, wi) => {
              const i = n++;
              return (
                <Fragment key={`${pi}-${wi}`}>
                  <span className={pi >= 3 ? 'is-dim' : undefined} style={{ '--i': i } as CSSProperties}>
                    {w}
                  </span>{' '}
                </Fragment>
              );
            })
          ) : (
            <Fragment key={pi}>
              <span className={`sd-ico ${p.tone}`} style={{ '--i': n++ } as CSSProperties} aria-hidden="true">
                <p.icon weight="fill" />
              </span>{' '}
            </Fragment>
          ),
        )}
      </h2>
      <Bento />
    </section>
  );
}

function Bento() {
  return (
    <Rise id="cx-wall" className="sd-bento">
      <article className="sd-b sd-b-photo" style={{ '--i': 0 } as CSSProperties}>
        <img src={photo('classroom')} alt="" loading="lazy" />
        <div className="sd-b-over">
          <b>Top 99%</b>
          <p>PSAT in 8th and 10th grade, and MAP in 10th grade.</p>
        </div>
      </article>
      <article className="sd-b sd-b-mid" style={{ '--i': 1 } as CSSProperties}>
        <div>
          <b className="sd-b-big">1280</b>
          <small>PSAT 8/9 score, out of 1440</small>
        </div>
        <div className="sd-b-people">
          <span className="sd-avatars" aria-hidden="true">
            <img src={`${BASE}assets/shreyas/portrait-studio.jpg`} alt="" loading="lazy" />
            <img src={photo('microscope')} alt="" loading="lazy" />
            <img src={photo('stock-charts')} alt="" loading="lazy" />
          </span>
          <p>“Every great discovery starts with curiosity.”</p>
        </div>
      </article>
      <article className="sd-b sd-b-blue" style={{ '--i': 2 } as CSSProperties}>
        <Medal weight="duotone" aria-hidden="true" />
        <div>
          <b className="sd-b-big">{achievements.length}</b>
          <p>Awards, honors and certificates, including the College Board National Recognition Program.</p>
        </div>
      </article>
      <article className="sd-b sd-b-black" style={{ '--i': 3 } as CSSProperties}>
        <small>Principal’s Honors List</small>
        <b className="sd-b-big">2025 · 2026</b>
      </article>
    </Rise>
  );
}

/* ---------------------------------------------------------------- white grid section */

function Craft() {
  const cols = [
    { icon: GraduationCap, t: 'His school', d: `${profile.school}, a ${profile.grade.toLowerCase()} taking all Honors and AP courses.` },
    { icon: Brain, t: 'His research', d: researchInterests.map((r) => r.title).join(' and ') + ', with Oncure as his first proposal.' },
    { icon: ChalkboardTeacher, t: 'His tutoring', d: 'Math and Science for 7th and 8th graders, one on one and in small groups.' },
    { icon: Code, t: 'His tools', d: `${languages.join(', ')}, and the AI courses he takes at school.` },
  ];
  return (
    <section className="sd-craft" aria-labelledby="sd-craft-h">
      <span className="sd-lines" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <div className="sd-craft-head">
        <Blur id="sd-craft-h" text="Careful study behind every idea he builds." dimFrom={3} />
        <button type="button" className="sd-pill is-outline" onClick={() => openSheet('oncure')}>
          Read the Oncure proposal
        </button>
      </div>
      <Rise className="sd-cols">
        {cols.map(({ icon: I, t, d }, i) => (
          <article key={t} style={{ '--i': i } as CSSProperties}>
            <I weight="duotone" aria-hidden="true" />
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </Rise>
    </section>
  );
}

/* ---------------------------------------------------------------- work gallery */

type Modal = 'awards' | 'life' | 'tutoring' | null;

const WORK: { id: string; title: string; line: string; img: string; tint: string; open: () => void | Modal; anchor?: string }[] = [
  { id: 'oncure', title: 'Oncure', line: 'A conceptual research proposal, not an existing or clinically validated treatment.', img: 'microscope', tint: '#0b1030', open: () => openSheet('oncure') },
  { id: 'trading', title: 'AI trading app', line: 'In progress · hypothetical sample data, not financial advice.', img: 'stock-charts', tint: '#061a1a', open: () => openSheet('finance') },
  { id: 'awards', title: 'Awards and honors', line: 'Seven awards, honors and certificates since 2nd grade.', img: 'trophy', tint: '#1d1606', open: () => 'awards' },
  { id: 'life', title: 'Activities', line: 'Swimming, Muay Thai, guitar, Science Olympiad and DECA.', img: 'guitar', tint: '#1a0d1a', open: () => 'life', anchor: 'cx-life' },
  { id: 'tutoring', title: 'Peer tutoring', line: 'Math and Science, at lunch and after school.', img: 'chalkboard-math', tint: '#0d1a10', open: () => 'tutoring', anchor: 'cx-tutoring' },
  { id: 'goals', title: 'Goals', line: 'From university to an AI-enabled oncology lab.', img: 'stethoscope', tint: '#0a1226', open: () => scrollTo('cx-goals') },
];

function Work() {
  const sec = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    const s = sec.current;
    if (!s) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      let best = 0;
      let bestD = Infinity;
      cards.current.forEach((c, i) => {
        if (!c) return;
        const b = c.getBoundingClientRect();
        const mid = b.top + b.height / 2;
        const d = (mid - vh / 2) / vh; // 0 when centred, negative above
        if (Math.abs(d) < bestD) (bestD = Math.abs(d)), (best = i);
        if (!still) {
          const sc = 1 - Math.min(0.14, Math.abs(d) * 0.16);
          const op = d < 0 ? Math.max(0.25, 1 + d * 0.9) : 1;
          c.style.transform = `scale(${sc.toFixed(4)})`;
          c.style.opacity = op.toFixed(3);
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    // Menu links for awards, activities and tutoring open their card's details.
    const open = (e: Event) => setModal((e as CustomEvent<Modal>).detail);
    window.addEventListener('sd-open', open);
    return () => window.removeEventListener('sd-open', open);
  }, []);

  const act = (i: number) => {
    const r = WORK[i]?.open();
    if (r) setModal(r);
  };

  return (
    <section ref={sec} id="sd-work" className="sd-work" style={{ '--tint': WORK[active]?.tint } as CSSProperties} aria-labelledby="sd-work-h">
      <div className="sd-work-sticky">
        <Blur id="sd-work-h" text="His work" className="sd-work-h" />
        <div className="sd-work-bar">
          <span className="sd-count" aria-live="polite">
            {String(active + 1).padStart(2, '0')} / {String(WORK.length).padStart(2, '0')}
          </span>
          <button type="button" className="sd-pill is-ghost" onClick={() => act(active)}>
            View project <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ol className="sd-cards">
        {WORK.map((w, i) => (
          <li key={w.id} id={w.anchor}>
            <article
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={`sd-card ${i === active ? 'is-on' : ''}`}
            >
              <img src={photo(w.img)} alt="" loading="lazy" />
              <span className="sd-card-shade" aria-hidden="true" />
              <button type="button" className="sd-card-btn" onClick={() => act(i)}>
                <h3>{w.title}</h3>
                <p>{w.line}</p>
                <span className="sd-pill is-ghost sd-card-view">
                  View project <ArrowUpRight weight="bold" aria-hidden="true" />
                </span>
              </button>
            </article>
          </li>
        ))}
      </ol>
      {modal && <WorkModal id={modal} onClose={() => setModal(null)} />}
    </section>
  );
}

function WorkModal({ id, onClose }: { id: Exclude<Modal, null>; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    document.documentElement.classList.add('sd-locked');
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.classList.remove('sd-locked');
      prev?.focus?.();
    };
  }, [onClose]);
  const title = id === 'awards' ? 'Awards and honors' : id === 'life' ? 'Activities and volunteering' : 'Peer tutoring';
  return (
    <div className="sd-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} className="sd-modal-box" tabIndex={-1} data-lenis-prevent>
        <header>
          <h3>{title}</h3>
          <button type="button" className="sd-x" onClick={onClose} aria-label="Close">
            <X weight="bold" />
          </button>
        </header>
        <div className="vz-on-dark">
          {id === 'awards' && (
            <>
              <Certificates />
              <div className="sd-gap" />
              <Scores />
            </>
          )}
          {id === 'life' && <Activities />}
          {id === 'tutoring' && (
            <>
              <p className="sd-modal-lede">One on one and in groups, at lunch and after school. {volunteering[2]?.role}.</p>
              <ol className="sd-tlist">
                {resume.tutoring.map((t, i) => (
                  <li key={t}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <p>{t}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- momentum + goals */

/** A polished chrome chain link, drawn in SVG. */
function ChromeLinks() {
  return (
    <svg className="sd-chrome" viewBox="0 0 200 320" aria-hidden="true">
      <defs>
        <linearGradient id="sd-cr" x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0" stopColor="#5d6170" />
          <stop offset="0.22" stopColor="#f4f6ff" />
          <stop offset="0.4" stopColor="#8a8fa3" />
          <stop offset="0.62" stopColor="#e9ecf7" />
          <stop offset="0.8" stopColor="#6b7086" />
          <stop offset="1" stopColor="#c9cde0" />
        </linearGradient>
        <linearGradient id="sd-cr2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c5062" />
          <stop offset="0.35" stopColor="#dfe3f2" />
          <stop offset="0.55" stopColor="#7d8296" />
          <stop offset="0.8" stopColor="#f6f7ff" />
          <stop offset="1" stopColor="#5c6175" />
        </linearGradient>
      </defs>
      <rect x="52" y="10" width="96" height="170" rx="48" fill="none" stroke="url(#sd-cr2)" strokeWidth="26" transform="rotate(-18 100 95)" />
      <rect x="52" y="140" width="96" height="170" rx="48" fill="none" stroke="url(#sd-cr)" strokeWidth="26" transform="rotate(10 100 225)" />
      <rect x="58" y="146" width="84" height="158" rx="42" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" transform="rotate(10 100 225)" />
    </svg>
  );
}

function Momentum() {
  const sec = useRef<HTMLElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const s = sec.current;
    const l = line.current;
    if (!s || !l || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const t = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
      l.style.transform = `translate3d(${(40 - t * 110).toFixed(2)}%,0,0)`;
      s.style.setProperty('--m', t.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <section ref={sec} className="sd-momentum" aria-labelledby="sd-mo-h">
      <span className="sd-band" aria-hidden="true" />
      <div className="sd-mo-in">
        <h2 id="sd-mo-h" className="sd-mo-h">
          <span>Ideas with</span>
          <span className="is-soft">momentum</span>
        </h2>
        <ChromeLinks />
      </div>
      <p ref={line} className="sd-mo-line" aria-hidden="true">
        from a classroom to a research lab
      </p>
    </section>
  );
}

function Goals() {
  const cards = [
    { k: 'Next', t: 'A top university', d: goals.education, blue: true },
    { k: 'Career', t: 'Lead AI engineering', d: goals.career[0] ?? '' },
    { k: 'Career', t: 'An oncology lab', d: goals.career[1] ?? '' },
    { k: 'Career', t: 'A trading platform', d: goals.career[2] ?? '' },
  ];
  return (
    <section id="cx-goals" className="sd-goals" aria-labelledby="sd-goals-h">
      <Blur id="sd-goals-h" text="Where is he heading?" className="sd-goals-h" />
      <button type="button" className="sd-pill is-black" onClick={() => scrollTo('cx-contact')}>
        Ask him about it
      </button>
      <Rise className="sd-gcards">
        {cards.map((c, i) => (
          <article key={c.t} className={`sd-g ${c.blue ? 'is-blue' : ''}`} style={{ '--i': i } as CSSProperties}>
            {c.blue && <img src={photo('writing')} alt="" loading="lazy" />}
            <small>{c.k}</small>
            <h3>{c.t}</h3>
            <p>{c.d}</p>
          </article>
        ))}
      </Rise>
    </section>
  );
}

/* ---------------------------------------------------------------- contact + finale + footer */

function Contact() {
  return (
    <section id="cx-contact" className="sd-contact" aria-labelledby="sd-contact-h">
      <Blur id="sd-contact-h" as="p" className="sd-contact-h" text={`${profile.firstName} is always glad to hear from curious people. Feel free to drop him a line.`} />
      <div className="sd-form dt dt--classic">
        <ContactPanel />
      </div>
    </section>
  );
}

/** A polished chrome heart, drawn in SVG. */
function ChromeHeart() {
  const d = 'M150 262 C 92 214, 22 168, 22 98 C 22 56, 54 26, 92 26 C 118 26, 138 40, 150 62 C 162 40, 182 26, 208 26 C 246 26, 278 56, 278 98 C 278 168, 208 214, 150 262 Z';
  return (
    <svg className="sd-heart" viewBox="0 0 300 280" aria-hidden="true">
      <defs>
        <radialGradient id="sd-h1" cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.18" stopColor="#d9dcec" />
          <stop offset="0.42" stopColor="#7e8399" />
          <stop offset="0.62" stopColor="#c7cbe0" />
          <stop offset="0.82" stopColor="#5b6077" />
          <stop offset="1" stopColor="#9aa0bb" />
        </radialGradient>
        <linearGradient id="sd-h2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
          <stop offset="0.7" stopColor="rgba(40,80,255,0.0)" />
          <stop offset="1" stopColor="rgba(60,100,255,0.55)" />
        </linearGradient>
        <filter id="sd-hb">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <path d={d} fill="url(#sd-h1)" />
      <path d={d} fill="url(#sd-h2)" />
      <ellipse cx="96" cy="78" rx="34" ry="16" fill="#fff" opacity="0.75" filter="url(#sd-hb)" transform="rotate(-30 96 78)" />
      <ellipse cx="160" cy="190" rx="40" ry="10" fill="#fff" opacity="0.45" filter="url(#sd-hb)" transform="rotate(-38 160 190)" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </svg>
  );
}

function Finale() {
  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const site = [
    { l: 'About', id: 'cx-about' },
    { l: 'His work', id: 'sd-work' },
    { l: 'Goals', id: 'cx-goals' },
  ];
  return (
    <section className="sd-finale" aria-labelledby="sd-fin-h">
      <div className="sd-fin-head">
        <Blur id="sd-fin-h" text="Have questions? Let’s talk." className="sd-fin-h" />
        <button type="button" className="sd-pill is-ghost" onClick={() => scrollTo('cx-contact')}>
          Fill in the form
        </button>
      </div>
      <ChromeHeart />
      <footer className="sd-foot">
        <div>
          <h4>Links</h4>
          <button type="button" onClick={top}>
            Back to top
          </button>
        </div>
        <div>
          <h4>Sitemap</h4>
          {site.map((s) => (
            <button key={s.id} type="button" onClick={() => scrollTo(s.id)}>
              {s.l}
            </button>
          ))}
        </div>
        <div className="sd-foot-c">
          <h4>Contact</h4>
          <button type="button" onClick={() => scrollTo('cx-contact')}>
            Use the contact form
          </button>
          <span>Messages are read by his family first.</span>
        </div>
        <div>
          <h4>School</h4>
          <span>{profile.school}</span>
          <span>{profile.schoolTown}</span>
        </div>
        <p className="sd-foot-note">
          © 2026 {profile.name}. Oncure is a conceptual research proposal, not an existing or clinically validated treatment. Trading app figures are hypothetical sample data, not financial advice.
        </p>
      </footer>
    </section>
  );
}

/** The Oncure and trading app detail sheet, opened from anywhere with the 'sd-sheet' event. */
function Sheet() {
  const [id, setId] = useState<DetailId | null>(null);
  useEffect(() => {
    const open = (e: Event) => setId((e as CustomEvent<DetailId>).detail);
    window.addEventListener('sd-sheet', open);
    return () => window.removeEventListener('sd-sheet', open);
  }, []);
  return <DetailSheet id={id} origin={null} onClose={() => setId(null)} theme="classic" />;
}

export const StrideTop = () => (
  <>
    <Sheet />
    <Hero />
    <Marquee />
    <About />
    <Craft />
    <Work />
  </>
);

export const StrideBottom = () => (
  <>
    <Momentum />
    <Goals />
    <Contact />
    <Finale />
  </>
);
