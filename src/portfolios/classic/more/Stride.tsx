import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight, Atom, DownloadSimple, EnvelopeSimple, FileText, Phone, Brain, Calculator, ChalkboardTeacher, ChartLineUp, Code, Dna, GraduationCap, Medal, Sparkle } from '@phosphor-icons/react';
import { achievements, activities, contact, courses, journey, languages, profile, researchInterests, schools, stockApp, subjects } from '@/content/portfolio';
import { ContactPanel } from '@/features/details/Contact';
import { ExperienceGrid } from '@/features/experience/ExperienceGrid';
import { EXPERIENCE_TITLE } from '@/content/experience';
import { AppMockup, GoalPath, InnerPage, type PageId } from './Pages';
import { Film } from '../flow/sequel';
import { Honors } from './Honors';
import { useClassicMotion } from './motion';
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
/** Opens one of the inner pages (see PageHost below); the Oncure film uses it too. */
const openPage = (id: PageId) => void window.dispatchEvent(new CustomEvent('sd-page', { detail: id }));
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

/** The stock trading application, on the particle burst: what it is, three key points, the mockup. */
function Trading() {
  const ref = useSeen<HTMLElement>();
  const points = [
    { icon: Sparkle, t: 'AI advice', s: 'Right beside the chart' },
    { icon: ChartLineUp, t: 'Buy and sell', s: 'A time frame for each' },
    { icon: Calculator, t: 'Smart calculators', s: 'The best amount to buy' },
  ];
  return (
    <section ref={ref} id="cx-finance" className="sd-hero" aria-labelledby="sd-hero-h">
      <Burst />
      <div className="sd-hero-in">
        <div className="sd-hero-top">
          <div className="sd-hero-left">
            <p className="sd-label is-light">
              <i aria-hidden="true" /> Personal project · {stockApp.status.toLowerCase()}
            </p>
            <h2 id="sd-hero-h" className="sd-hero-h">
              <span>Stock trading,</span>
              <span className="is-soft">made simple.</span>
            </h2>
          </div>
          <div className="sd-hero-copy">
            <p className="sd-hero-sub">{stockApp.name}: {stockApp.tagline.charAt(0).toLowerCase() + stockApp.tagline.slice(1)}</p>
            <p className="sd-hero-body">
              Instead of candlesticks and equations, an AI model uses real-world data and algorithms to suggest how much of a stock to buy, when to buy it and an estimated time to sell, shown right next to the stock graph you are looking at.
            </p>
            <div className="sd-hero-cta">
              <button type="button" className="sd-pill is-white" onClick={() => openPage('trading')}>
                View more <ArrowUpRight weight="bold" aria-hidden="true" />
              </button>
              <button type="button" className="sd-link" onClick={() => scrollTo('cx-contact')}>
                Ask about it
              </button>
            </div>
          </div>
        </div>
        <ul className="sd-stats">
          {points.map((s, i) => (
            <li key={s.t} style={{ '--i': i } as CSSProperties}>
              <s.icon weight="duotone" aria-hidden="true" />
              <b>{s.t}</b>
              <small>{s.s}</small>
            </li>
          ))}
        </ul>
        <div className="sd-hero-mock">
          <AppMockup />
          <p className="sd-hero-note">Concept design · names and figures are made up · hypothetical, not financial advice.</p>
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
          <p>PSAT in 8th, 10th and 11th grade (99th percentile and above, National Merit recognition), and MAP in 10th grade.</p>
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
    { icon: GraduationCap, n: 'AP', t: 'His school', d: `${profile.school}, all Honors and AP courses, including AP Computer Science A and AP Biology.` },
    { icon: Brain, n: String(researchInterests.length), t: 'His research', d: `${researchInterests.map((r) => r.title).join(' and ')}, with Oncure as his first proposal.` },
    { icon: ChalkboardTeacher, n: '7–8', t: 'His tutoring', d: 'Math and Science for 7th and 8th graders, one on one and in small groups.' },
    { icon: Code, n: String(languages.length), t: 'His tools', d: `${languages.join(', ')}, and the AI course he takes at school.` },
  ];
  return (
    <section className="sd-craft" aria-labelledby="sd-craft-h">
      <span className="sd-lines" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <div className="sd-craft-top">
        <Rise className="sd-craft-pic">
          <figure style={{ '--i': 0 } as CSSProperties}>
            <img src={photo('microscope')} alt="" loading="lazy" />
            <figcaption>
              <span>
                <Dna weight="fill" aria-hidden="true" /> Oncure
              </span>
              <b>His first research proposal</b>
            </figcaption>
          </figure>
        </Rise>
        <div className="sd-craft-head">
          <p className="sd-label">
            <i aria-hidden="true" /> How he works
          </p>
          <Blur id="sd-craft-h" text="Careful study behind every idea he builds." dimFrom={3} />
          <p className="sd-craft-lede">He learns the subject first, at school and on his own, then turns it into something real: a research proposal, an app, or a lesson for younger students.</p>
          <button type="button" className="sd-pill is-black" onClick={() => openPage('oncure')}>
            Read the Oncure proposal <ArrowUpRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <Rise className="sd-cols">
        {cols.map(({ icon: I, n, t, d }, i) => (
          <article key={t} style={{ '--i': i } as CSSProperties}>
            <span className="sd-col-top">
              <I weight="duotone" aria-hidden="true" />
              <b>{n}</b>
            </span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </Rise>
    </section>
  );
}

/* ---------------------------------------------------------------- work gallery */

const WORK: { id: PageId; title: string; line: string; img: string; tint: string; anchor?: string }[] = [
  { id: 'oncure', title: 'Oncure', line: 'A conceptual research proposal, not an existing or clinically validated treatment.', img: 'microscope', tint: '#0b1030' },
  { id: 'trading', title: 'Stock Trading Application', line: 'Hypothetical sample data, not financial advice.', img: 'stock-charts', tint: '#061a1a' },
  { id: 'skills', title: 'Technical skills & courses', line: 'JavaScript, Python and Java, with AP Computer Science, Biology, Chemistry and Physics C.', img: 'classroom', tint: '#0a1428' },
  { id: 'internship', title: 'Internship & industry experience', line: 'A summer internship with a company developing an AI-enabled play mat, now on the App Store.', img: 'writing', tint: '#140f26' },
  { id: 'awards', title: 'Awards and honors', line: `${achievements.length} awards, honors and certificates, from 2nd grade to National Merit recognition.`, img: 'trophy', tint: '#1d1606' },
  { id: 'life', title: 'Activities and Experience', line: 'Volunteering at TAMA Medical Camp and Sri Shirdi Sai Temple, tutoring, Swim Atlanta, Muay Thai, guitar, Science Olympiad and DECA.', img: 'guitar', tint: '#1a0d1a' },
  { id: 'tutoring', title: 'Peer tutoring', line: 'Math and Science, at lunch and after school.', img: 'chalkboard-math', tint: '#0d1a10', anchor: 'cx-tutoring' },
  { id: 'goals', title: 'Goals', line: 'From university to an AI-enabled oncology lab.', img: 'stethoscope', tint: '#0a1226' },
];

function Work() {
  const sec = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

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
          // Below the centre a card lies back like a page on a desk and stands up as it arrives.
          const tilt = d > 0 ? Math.min(32, d * 48) : 0;
          c.style.transform = `perspective(1400px) rotateX(${tilt.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
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

  const act = (i: number) => {
    const w = WORK[i];
    if (w) openPage(w.id);
  };

  return (
    <section ref={sec} id="sd-work" className="sd-work" style={{ '--tint': WORK[active]?.tint } as CSSProperties} aria-labelledby="sd-work-h">
      <div className="sd-work-sticky">
        <Blur id="sd-work-h" text="My work" className="sd-work-h" />
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
    </section>
  );
}

/* ---------------------------------------------------------------- momentum + goals */

/** His path so far: a glowing line with milestones that slides sideways as you scroll. */
function Momentum() {
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const seen = useSeen<HTMLDivElement>();
  useEffect(() => {
    const s = sec.current;
    const tr = track.current;
    if (!s || !tr) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const wide = window.innerWidth > 900;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const t = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      s.style.setProperty('--m', t.toFixed(3));
      if (!wide || still) {
        tr.style.transform = '';
        return;
      }
      const max = Math.max(0, tr.scrollWidth - window.innerWidth);
      tr.style.transform = `translate3d(${(-max * t).toFixed(1)}px,0,0)`;
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
  return (
    <section ref={sec} id="cx-journey" className="sd-momentum" aria-labelledby="sd-mo-h">
      <div className="sd-mo-in">
        <span className="sd-band" aria-hidden="true" />
        <div className="sd-mo-head">
          <div>
            <p className="sd-label is-light">
              <i aria-hidden="true" /> His journey
            </p>
            <h2 id="sd-mo-h" className="sd-mo-h">
              <span>Ideas with</span>
              <span className="is-soft">momentum</span>
            </h2>
            <p className="sd-mo-lede">From the 2nd grade to Oncure and his trading app: every step so far, in order.</p>
          </div>
        </div>
        <div ref={seen} className="sd-jr">
          <span className="sd-jr-line" aria-hidden="true">
            <i />
          </span>
          <ol ref={track} className="sd-jr-track">
            {journey.map((j, i) => (
              <li key={j.when + j.title} style={{ '--i': i } as CSSProperties}>
                <span className="sd-jr-dot" aria-hidden="true" />
                <small>{j.when}</small>
                <h3>{j.title}</h3>
                <p>{j.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** His Oncure video, framed, with its controls. */
function OncureFilm() {
  return (
    <section id="cx-oncure" className="sd-film" aria-labelledby="sd-film-h">
      <div className="sd-film-head">
        <p className="sd-label is-light">
          <i aria-hidden="true" /> Research concept
        </p>
        <Blur id="sd-film-h" text="The technology that could make cancer treatment precise." dimFrom={3} />
        <p className="sd-film-lede">Oncure: AI, nanobots and targeted antibodies, in his own short film. A conceptual research proposal, not an existing or clinically validated treatment.</p>
      </div>
      <Film />
    </section>
  );
}

/** Activities and Experience: volunteering and his other activities, each with a motion preview. */
function Experience() {
  return (
    <section id="cx-life" className="sd-goals sd-xp" aria-labelledby="sd-xp-h">
      <p className="sd-label">
        <i aria-hidden="true" /> Beyond the classroom
      </p>
      <Blur id="sd-xp-h" text={EXPERIENCE_TITLE} className="sd-goals-h" />
      <p className="sd-goals-lede">Volunteering in his community, and the sport, music and competitions he does outside class.</p>
      <div className="sd-xp-grid">
        <ExperienceGrid tone="classic" />
      </div>
    </section>
  );
}

function Goals() {
  return (
    <section id="cx-goals" className="sd-goals" aria-labelledby="sd-goals-h">
      <p className="sd-label">
        <i aria-hidden="true" /> Goals
      </p>
      <Blur id="sd-goals-h" text="Where is he heading?" className="sd-goals-h" />
      <p className="sd-goals-lede">Four goals, in order: first university, then three things he wants to build.</p>
      <GoalPath />
      <button type="button" className="sd-pill is-black" onClick={() => scrollTo('cx-contact')}>
        Ask him about it
      </button>
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

function Finale() {
  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const site = [
    { l: 'About', id: 'cx-about' },
    { l: 'Stock trading app', id: 'cx-finance' },
    { l: 'Awards', id: 'cx-honors' },
    { l: 'My work', id: 'sd-work' },
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
          <a href={`mailto:${contact.email}`}>
            <EnvelopeSimple weight="bold" aria-hidden="true" /> {contact.email}
          </a>
          <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}>
            <Phone weight="bold" aria-hidden="true" /> {contact.phone}
          </a>
          <a href={contact.resume} target="_blank" rel="noopener">
            <FileText weight="bold" aria-hidden="true" /> View resume
          </a>
          <a href={contact.resume} download="Shreyas_Ballari_Resume.pdf">
            <DownloadSimple weight="bold" aria-hidden="true" /> Download resume
          </a>
          <button type="button" onClick={() => scrollTo('cx-contact')}>
            Or use the contact form
          </button>
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

/** Hosts the inner pages: anything can open one with the 'sd-page' event. */
function PageHost() {
  useClassicMotion();
  const [id, setId] = useState<PageId | null>(null);
  useEffect(() => {
    const open = (e: Event) => setId((e as CustomEvent<PageId>).detail);
    window.addEventListener('sd-page', open);
    return () => window.removeEventListener('sd-page', open);
  }, []);
  return id ? <InnerPage id={id} onClose={() => setId(null)} /> : null;
}

export const StrideTop = () => (
  <>
    <PageHost />
    <About />
    <Marquee />
    <Craft />
    <Work />
  </>
);

export const StrideBottom = () => (
  <>
    <Momentum />
    <OncureFilm />
    <Trading />
    <Honors />
    <Experience />
    <Goals />
    <Contact />
    <Finale />
  </>
);
