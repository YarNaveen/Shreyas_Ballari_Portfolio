import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  BatteryCharging,
  ChalkboardTeacher,
  ChatCircleText,
  Exam,
  Medal,
  Notebook,
  PencilLine,
  Student,
  Trophy,
  UsersThree,
  Brain,
  Calculator,
  ChartBar,
  ChartLineUp,
  CheckCircle,
  Clock,
  Cpu,
  CurrencyDollar,
  Flask,
  Globe,
  GraduationCap,
  Heart,
  Heartbeat,
  HourglassMedium,
  Lightning,
  ListChecks,
  MagnifyingGlass,
  Pulse,
  Robot,
  ShieldCheck,
  Syringe,
  Target,
  TrendUp,
  Users,
  Virus,
  Warning,
  WifiHigh,
  X,
  type Icon,
} from '@phosphor-icons/react';
import { SmoothScrollContext } from '@/app/providers/SmoothScroll';
import { achievements, oncure, resume, stockApp } from '@/content/portfolio';
import { Certificates, Reveal, Scores } from '@/features/visuals/Visuals';
import { ContactPanel } from './Contact';
import './style';

/**
 * Full details for Oncure, the AI trading app and the contact form, shown as pictures: big
 * numbers, step diagrams, icon tiles and a roadmap track (each part rises in when seen).
 *
 * <DetailSheet> opens them like an app on a phone: it grows out of the button or card that was
 * tapped and shrinks back into it. `contained` keeps it inside its parent (the Studio phone
 * screen); otherwise it covers the page.
 */

export type DetailId = 'oncure' | 'finance' | 'awards' | 'tutoring' | 'contact';
export type DetailTheme = 'studio' | 'classic' | 'page';

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const at = (i: number) => ({ '--i': i }) as CSSProperties;

function Tiles({ items, icons }: { items: { title: string; line: string }[]; icons: Icon[] }) {
  return (
    <Reveal className="dt-tiles">
      {items.map((x, i) => {
        const I = icons[i % icons.length]!;
        return (
          <div key={x.title} className="dt-tile" data-vz style={at(i)}>
            <span className="dt-ico">
              <I weight="duotone" />
            </span>
            <b>{x.title}</b>
            <p>{x.line}</p>
          </div>
        );
      })}
    </Reveal>
  );
}

function Flow({ steps, icons }: { steps: { title: string; line: string }[]; icons: Icon[] }) {
  return (
    <Reveal className="dt-flow">
      <span className="dt-flow-line" data-vz aria-hidden="true" />
      {steps.map((s, i) => {
        const I = icons[i % icons.length]!;
        return (
          <div key={s.title} className="dt-node" data-vz style={at(i)}>
            <span className="dt-node-ico">
              <I weight="duotone" />
              <i>{i + 1}</i>
            </span>
            <b>{s.title}</b>
            <p>{s.line}</p>
          </div>
        );
      })}
    </Reveal>
  );
}

// --- Oncure ------------------------------------------------------------------------------------

/** The headline figure for each problem (all from the sources named in the text). */
const PROBLEM_STAT: Record<string, { big: string; icon: Icon }> = {
  'High mortality': { big: '20M', icon: Heartbeat },
  'Expensive treatment': { big: '$100k+', icon: CurrencyDollar },
  'Long treatment': { big: '6–8 mo', icon: HourglassMedium },
  'Severe side effects': { big: '', icon: Warning },
  'Emotional toll': { big: '15–25%', icon: Heart },
  'Limited access': { big: '', icon: Globe },
};

export function OncureDetails({ withVideo = true }: { withVideo?: boolean }) {
  return (
    <article className="dt-body">
      <header className="dt-head">
        <p className="dt-kicker">Research concept</p>
        <h2 className="dt-title">{oncure.name}</h2>
        <p className="dt-lede">{oncure.tagline}</p>
        <p className="dt-note">{oncure.disclaimer}</p>
      </header>

      {withVideo && (
        <figure className="dt-video">
          <video src={oncure.video} controls playsInline preload="metadata" />
          <figcaption>Shreyas’s Oncure film</figcaption>
        </figure>
      )}

      <section className="dt-sec">
        <p className="dt-big">{oncure.pitch}</p>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">The problem</h3>
        <Reveal className="dt-stats">
          {oncure.problems.map((p, i) => {
            const st = PROBLEM_STAT[p.title] ?? { big: '', icon: Warning };
            const I = st.icon;
            return (
              <div key={p.title} className="dt-stat" data-vz style={at(i)}>
                <span className="dt-ico">
                  <I weight="duotone" />
                </span>
                {st.big ? <b className="dt-stat-big">{st.big}</b> : null}
                <b>{p.title}</b>
                <p>{p.line}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">How it would work</h3>
        <Flow steps={oncure.steps} icons={[Syringe, MagnifyingGlass, Brain, Target, Virus]} />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">What it is designed to do</h3>
        <Tiles items={oncure.features} icons={[Brain, Robot, Pulse, Target, Virus, ShieldCheck, Clock, CurrencyDollar, Heart]} />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">Challenges to solve</h3>
        <Tiles items={oncure.challenges} icons={[Cpu, BatteryCharging, MagnifyingGlass, Brain, WifiHigh, Target, ShieldCheck, Flask, Users]} />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">Why it could be possible</h3>
        <Reveal className="dt-evidence">
          {oncure.evidence.map((e, i) => (
            <div key={e} className="dt-ev" data-vz style={at(i)}>
              <span className="dt-ico">
                <Robot weight="duotone" />
              </span>
              <p>{e}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">Roadmap</h3>
        <Reveal className="dt-road">
          <span className="dt-road-line" data-vz aria-hidden="true" />
          {oncure.roadmap.map((r, i) => (
            <div key={r.title} className="dt-stop" data-vz style={at(i)}>
              <span className="dt-stop-dot">{i + 1}</span>
              <b>{r.title}</b>
              <p>{r.line}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">What it stands for</h3>
        <Tiles items={oncure.values} icons={[Target, Lightning, CurrencyDollar, Heart]} />
      </section>

      <section className="dt-end">
        <p className="dt-big">{oncure.vision}</p>
        <p className="dt-note">{oncure.disclaimer}</p>
      </section>
    </article>
  );
}

// --- The AI trading app -------------------------------------------------------------------------

const SAMPLE = [42, 44, 43, 47, 46, 50, 49, 53, 57, 55, 59, 62, 61, 66];
const ROWS = [
  { t: 'NOVA', stage: 'Holding', v: '+4.2%', up: true },
  { t: 'ORBT', stage: 'Buying · 2 of 3', v: '+1.8%', up: true },
  { t: 'LUMA', stage: 'Sell window soon', v: '−0.9%', up: false },
];

export function FinanceDetails() {
  const max = Math.max(...SAMPLE);
  const min = Math.min(...SAMPLE);
  const pts = SAMPLE.map((v, i) => `${(i / (SAMPLE.length - 1)) * 300},${90 - ((v - min) / (max - min)) * 80}`).join(' ');
  return (
    <article className="dt-body">
      <header className="dt-head">
        <p className="dt-kicker">FinTech · {stockApp.status.toLowerCase()}</p>
        <h2 className="dt-title">Stock Trading Application</h2>
        <p className="dt-lede">{stockApp.tagline}</p>
        <p className="dt-note">Everything shown here is hypothetical sample data, not financial advice.</p>
      </header>

      <Reveal className="dt-dash-wrap">
        <figure className="dt-dash" data-vz aria-label="Sample dashboard with made-up data">
          <div className="dt-dash-chart">
            <span className="dt-mono">Sample portfolio</span>
            <b>$12,480.36</b>
            <span className="dt-up">▲ 2.4% today</span>
            <svg viewBox="0 0 300 96" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={pts} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <p className="dt-advice">
              <b>AI suggestion (sample):</b> buy 3 shares of NOVA this week; estimated sell window in 5 to 7 weeks.
            </p>
          </div>
          <ul className="dt-dash-rows">
            {ROWS.map((r) => (
              <li key={r.t}>
                <b>{r.t}</b>
                <span>{r.stage}</span>
                <em className={r.up ? 'is-up' : 'is-down'}>{r.v}</em>
              </li>
            ))}
          </ul>
          <figcaption className="dt-mono">Concept design · sample data · not financial advice</figcaption>
        </figure>
      </Reveal>

      <section className="dt-sec">
        <p className="dt-big">{stockApp.summary}</p>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">In short</h3>
        <p className="dt-big">{stockApp.simple}</p>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">How the AI helps</h3>
        <Flow
          steps={[
            { title: 'Reads real-world data', line: 'Real market data and real-world factors, worked through with algorithms.' },
            { title: 'Suggests how much and when', line: 'How much of a stock to buy, when to buy it, and an estimated time to sell.' },
            { title: 'Shows it beside the chart', line: 'No candlesticks or equations needed.' },
            { title: 'Keeps track for you', line: 'Holdings, buy or sell stages, pending orders and top performers.' },
          ]}
          icons={[Globe, Brain, ChartLineUp, ListChecks]}
        />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">What it will have</h3>
        <Tiles items={stockApp.features} icons={[Brain, Globe, ChartBar, Clock, TrendUp, Calculator, CheckCircle]} />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">Who it is for</h3>
        <Tiles
          items={[
            { title: 'Beginners', line: 'Guidance without jargon: plain advice next to the chart.' },
            { title: 'Experienced traders', line: 'A faster way to decide, with the numbers worked out.' },
          ]}
          icons={[GraduationCap, Lightning]}
        />
      </section>

      <section className="dt-end">
        <p className="dt-big">{stockApp.forWhom}</p>
        <p className="dt-note">Hypothetical concept. Not financial advice.</p>
      </section>
    </article>
  );
}

// --- Awards ------------------------------------------------------------------------------------

const KIND_ICON: Record<string, Icon> = { Award: Trophy, Honor: Medal, Score: ChartBar, Program: Student, Certificate: GraduationCap };

export function AwardsDetails() {
  return (
    <article className="dt-body">
      <header className="dt-head">
        <p className="dt-kicker">Achievements · {achievements.length} awards and honors</p>
        <h2 className="dt-title">Awards</h2>
        <p className="dt-lede">Every award, honor and certificate since 2nd grade, and how his test scores compare nationwide.</p>
      </header>

      <section className="dt-sec">
        <h3 className="dt-h">Every award</h3>
        <Tiles items={achievements.map((a) => ({ title: `${a.title} · ${a.value}`, line: a.detail }))} icons={achievements.map((a) => KIND_ICON[a.kind] ?? Trophy)} />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">Test scores</h3>
        <p className="dt-note">Percentile rank by grade: higher than that share of students nationwide.</p>
        <Scores />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">As certificates</h3>
        <p className="dt-note">Designed presentations of each award, not scans of the originals.</p>
        <Certificates />
      </section>
    </article>
  );
}

// --- Peer tutoring ------------------------------------------------------------------------------

export function TutoringDetails() {
  return (
    <article className="dt-body">
      <header className="dt-head">
        <p className="dt-kicker">Teaching · peer tutor</p>
        <h2 className="dt-title">Peer tutoring</h2>
        <p className="dt-lede">Math and Science for 7th and 8th graders, one on one and in small groups, at lunch and after school.</p>
      </header>

      <section className="dt-sec">
        <Tiles
          items={[
            { title: '7th and 8th graders', line: 'The students he tutors.' },
            { title: 'Math and Science', line: 'The subjects.' },
            { title: 'One on one and groups', line: 'At lunch and after school.' },
          ]}
          icons={[Student, Flask, UsersThree]}
        />
      </section>

      <section className="dt-sec">
        <p className="dt-big">{resume.summary}</p>
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">How he helps</h3>
        <Flow
          steps={[
            { title: 'Find the gap', line: 'Spot what is hard and build better study habits.' },
            { title: 'Explain it simply', line: 'Visual aids, diagrams and step-by-step explanations.' },
            { title: 'Practise together', line: 'Homework help and small-group sessions.' },
            { title: 'Prepare', line: 'Quizzes and exams, with feedback on writing and thinking.' },
          ]}
          icons={[MagnifyingGlass, ChalkboardTeacher, UsersThree, CheckCircle]}
        />
      </section>

      <section className="dt-sec">
        <h3 className="dt-h">What he does</h3>
        <Tiles items={resume.tutoring.map((t) => ({ title: t, line: '' }))} icons={[Exam, Notebook, PencilLine, ChalkboardTeacher, UsersThree, ChatCircleText]} />
      </section>
    </article>
  );
}

// --- The sheet that opens like an app -----------------------------------------------------------

const TITLE: Record<DetailId, string> = { oncure: 'Oncure', finance: 'Stock Trading Application', awards: 'Awards', tutoring: 'Peer tutoring', contact: 'Contact' };

export function DetailSheet({ id, origin, onClose, contained = false, theme }: { id: DetailId | null; origin: DOMRect | null; onClose: () => void; contained?: boolean; theme: DetailTheme }) {
  const smooth = useContext(SmoothScrollContext);
  const sheet = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<DetailId | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    setShown(id);
  }, [id]);

  /** The tapped rectangle, as a clip-path inset of the sheet. */
  const insetFrom = () => {
    const el = sheet.current;
    if (!el || !origin) return 'inset(40% 40% 40% 40% round 28px)';
    const h = el.getBoundingClientRect();
    const t = Math.max(0, origin.top - h.top);
    const l = Math.max(0, origin.left - h.left);
    const r = Math.max(0, h.right - origin.right);
    const b = Math.max(0, h.bottom - origin.bottom);
    return `inset(${t}px ${r}px ${b}px ${l}px round 24px)`;
  };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Open: grow out of the tapped card.
  useLayoutEffect(() => {
    const el = sheet.current;
    if (!shown || !el) return;
    closing.current = false;
    el.scrollTop = 0;
    if (reduced()) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    else {
      el.animate([{ clipPath: insetFrom(), opacity: 0.6 }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }], { duration: 620, easing: EASE });
      el.querySelector('.dt-inner')?.animate(
        [
          { opacity: 0, transform: 'scale(0.94) translateY(16px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 520, delay: 120, easing: EASE, fill: 'backwards' },
      );
    }
    closeBtn.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // Close: shrink back into the card (on time even if the device is busy).
  const close = () => {
    const el = sheet.current;
    if (!el || closing.current) return;
    closing.current = true;
    el.querySelectorAll('video').forEach((v) => v.pause());
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      setShown(null);
      onClose();
    };
    if (reduced()) return done();
    const a = el.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }, { clipPath: insetFrom(), opacity: 0 }], { duration: 420, easing: EASE, fill: 'forwards' });
    a.onfinish = done;
    window.setTimeout(done, 520);
  };

  // While open: the page behind stays still, and Escape closes.
  useEffect(() => {
    if (!shown) return;
    // Remember the page's own setting BEFORE locking (saving it after would save "hidden" and
    // leave the page unable to scroll once the details close).
    const prev = document.documentElement.style.overflow === 'hidden' ? '' : document.documentElement.style.overflow;
    smooth?.setLocked(true);
    document.documentElement.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', key);
    return () => {
      smooth?.setLocked(false);
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  if (!shown) return null;
  const node = (
    <div ref={sheet} className={`dt dt--${theme} ${contained ? 'is-contained' : 'is-page'}`} role="dialog" aria-modal="true" aria-label={`${TITLE[shown]}, full details`} data-lenis-prevent>
      <div className="dt-bar">
        <span className="dt-kicker">{TITLE[shown]}</span>
        <button ref={closeBtn} type="button" className="dt-close" aria-label="Close" data-voice="close" onClick={close}>
          <X weight="bold" />
        </button>
      </div>
      <div className="dt-inner">{shown === 'oncure' ? <OncureDetails /> : shown === 'finance' ? <FinanceDetails /> : shown === 'awards' ? <AwardsDetails /> : shown === 'tutoring' ? <TutoringDetails /> : <ContactPanel />}</div>
    </div>
  );
  return contained ? node : createPortal(node, document.body);
}
