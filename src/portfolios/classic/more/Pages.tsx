import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Brain,
  Calculator,
  ChartLineUp,
  CheckCircle,
  ClockCountdown,
  Database,
  Dna,
  Flask,
  GraduationCap,
  HandHeart,
  Heartbeat,
  Medal,
  Rocket,
  Sparkle,
  Target,
  TrendUp,
  Warning,
  X,
} from '@phosphor-icons/react';
import { achievements, activities, goals, oncure, percentiles, resume, stockApp, volunteering } from '@/content/portfolio';
import { useSeen } from './ui';

/**
 * The inner pages behind the "His work" cards, in the same style as the sections around them:
 * black with blue light, thin large type, bento cards that rise into focus. One font (Geist).
 */

export type PageId = 'oncure' | 'trading' | 'awards' | 'life' | 'tutoring' | 'goals';

const BASE = import.meta.env.BASE_URL;
const at = (i: number) => ({ '--i': i }) as CSSProperties;

/* ---------------------------------------------------------------- the trading app mockup */

const HOLD = [
  { t: 'NOVA', stage: 'Holding', v: '+4.2%', up: true },
  { t: 'ORBT', stage: 'Buying · 2 of 3', v: '+1.8%', up: true },
  { t: 'LUMA', stage: 'Sell window soon', v: '−0.9%', up: false },
];
const PEND = [
  { t: 'KITE', a: 'Buy · 8 shares', s: 'Waiting' },
  { t: 'LUMA', a: 'Sell · 5 shares', s: 'Waiting' },
];
const TOP = [
  { t: 'VELA', v: '+6.1%' },
  { t: 'PIER', v: '+5.4%' },
  { t: 'ARCO', v: '+4.8%' },
];
/** A smooth sample price line (made up). */
const LINE = [38, 42, 40, 46, 44, 50, 48, 55, 53, 58, 62, 60, 66, 64, 70, 74, 71, 78];

function chartPath(w: number, h: number) {
  const max = Math.max(...LINE);
  const min = Math.min(...LINE);
  const pts = LINE.map((v, i) => [(i / (LINE.length - 1)) * w, h - ((v - min) / (max - min)) * (h - 12) - 6] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return { d, area: `${d} L${w},${h} L0,${h} Z` };
}

export function AppMockup() {
  const { d, area } = chartPath(520, 170);
  return (
    <div className="mk" role="img" aria-label="A mockup of the stock trading application with sample data: a portfolio dashboard, a stock chart with AI advice beside it, holdings with their buy or sell stage, pending orders, top performers and an AI calculator.">
      <div className="mk-bar">
        <i />
        <i />
        <i />
        <span>Stock trading application · concept</span>
      </div>
      <div className="mk-body">
        <nav className="mk-side" aria-hidden="true">
          <b>TradeMind</b>
          {['Dashboard', 'Stocks', 'Holdings', 'Orders', 'Calculators'].map((n, i) => (
            <span key={n} className={i === 0 ? 'is-on' : ''}>
              {n}
            </span>
          ))}
        </nav>
        <div className="mk-main">
          <div className="mk-top">
            <div>
              <small>Sample portfolio</small>
              <b>$12,480.36</b>
              <em>▲ 2.4% today</em>
            </div>
            <span className="mk-chip">Sample data</span>
          </div>
          <div className="mk-chartrow">
            <div className="mk-chart">
              <p>
                <b>NOVA</b> <small>Nova Labs (sample)</small>
              </p>
              <svg viewBox="0 0 520 170" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="mkfill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#3b6bff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#3b6bff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#mkfill)" />
                <path d={d} fill="none" stroke="#7d9bff" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </div>
            <aside className="mk-ai">
              <p className="mk-ai-h">
                <Sparkle weight="fill" aria-hidden="true" /> AI advice
              </p>
              <dl>
                <div>
                  <dt>How much</dt>
                  <dd>12 shares</dd>
                </div>
                <div>
                  <dt>When to buy</dt>
                  <dd>Next 3 days</dd>
                </div>
                <div>
                  <dt>Estimated sell</dt>
                  <dd>In 4–6 weeks</dd>
                </div>
              </dl>
              <small>Based on real-world data · hypothetical</small>
            </aside>
          </div>
          <div className="mk-cards">
            <section>
              <h4>Holdings</h4>
              {HOLD.map((h) => (
                <p key={h.t}>
                  <b>{h.t}</b>
                  <span>{h.stage}</span>
                  <em className={h.up ? 'is-up' : 'is-down'}>{h.v}</em>
                </p>
              ))}
            </section>
            <section>
              <h4>Pending</h4>
              {PEND.map((p) => (
                <p key={p.a}>
                  <b>{p.t}</b>
                  <span>{p.a}</span>
                  <em>{p.s}</em>
                </p>
              ))}
            </section>
            <section>
              <h4>Top performers</h4>
              {TOP.map((p) => (
                <p key={p.t}>
                  <b>{p.t}</b>
                  <span>You may like</span>
                  <em className="is-up">{p.v}</em>
                </p>
              ))}
            </section>
            <section className="mk-calc">
              <h4>
                <Calculator weight="duotone" aria-hidden="true" /> AI calculator
              </h4>
              <p>
                <span>Budget</span>
                <b>$1,000</b>
              </p>
              <p>
                <span>Best amount</span>
                <b>12 shares</b>
              </p>
              <p>
                <span>Buy window</span>
                <b>3 days</b>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- building blocks */

/** A block whose children rise into focus one after another. */
function Rise({ className, children }: { className: string; children: ReactNode }) {
  const ref = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`sd-rise ${className}`}>
      {children}
    </div>
  );
}

/** A page section: small label, two-tone heading, optional lede. */
function Block({ label, lead, rest, lede, children }: { label: string; lead: string; rest?: string; lede?: string; children: ReactNode }) {
  return (
    <section className="pg-block">
      <header className="pg-bhead">
        <p className="sd-label">
          <i aria-hidden="true" /> {label}
        </p>
        <h3>
          {lead} {rest && <span>{rest}</span>}
        </h3>
        {lede && <p className="pg-lede">{lede}</p>}
      </header>
      {children}
    </section>
  );
}

type Card = { title: string; line: string; icon?: typeof Sparkle };
function Cards({ items, cols = 3, tone }: { items: Card[]; cols?: 2 | 3 | 4; tone?: 'warm' }) {
  return (
    <Rise className={`pg-cards is-${cols} ${tone ? `is-${tone}` : ''}`}>
      {items.map((c, i) => {
        const I = c.icon;
        return (
          <article key={c.title} className="pg-card" style={at(i)}>
            {I && <I weight="duotone" aria-hidden="true" />}
            <h4>{c.title}</h4>
            <p>{c.line}</p>
          </article>
        );
      })}
    </Rise>
  );
}

function Numbered({ items }: { items: Card[] }) {
  return (
    <Rise className="pg-steps">
      {items.map((s, i) => (
        <article key={s.title} style={at(i)}>
          <span className="pg-n">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h4>{s.title}</h4>
            <p>{s.line}</p>
          </div>
        </article>
      ))}
    </Rise>
  );
}

/** Big figures in the bento colours (white, blue, black, glass). */
function Stats({ items }: { items: { v: string; k: string; s?: string }[] }) {
  const tones = ['is-white', 'is-blue', 'is-black', 'is-glass'];
  return (
    <Rise className="pg-stats">
      {items.map((s, i) => (
        <article key={s.k} className={`pg-stat ${tones[i % tones.length]}`} style={at(i)}>
          <b>{s.v}</b>
          <span>{s.k}</span>
          {s.s && <small>{s.s}</small>}
        </article>
      ))}
    </Rise>
  );
}

function Note({ children, icon: I = Warning }: { children: ReactNode; icon?: typeof Sparkle }) {
  return (
    <p className="pg-note">
      <I weight="fill" aria-hidden="true" /> {children}
    </p>
  );
}

/* ---------------------------------------------------------------- the pages */

const ONCURE_ICONS = [Brain, Dna, Target, Target, Heartbeat, CheckCircle, ClockCountdown, TrendUp, HandHeart];

function OncurePage() {
  return (
    <>
      <Note>{oncure.disclaimer}</Note>
      <figure className="pg-media">
        <video src={oncure.video} controls muted playsInline preload="metadata" />
      </figure>
      <Block label="The problem" lead="Why cancer care" rest="needs a new idea." lede="Figures as the proposal cites them, with its sources.">
        <Stats
          items={[
            { v: '20M', k: 'People diagnosed each year', s: 'WHO, IARC / GLOBOCAN' },
            { v: '$100K+', k: 'Late-stage chemotherapy', s: 'Out of pocket, American Cancer Society' },
            { v: '6–8 mo', k: 'A standard regimen', s: 'Late-stage lung cancer' },
            { v: '15–25%', k: 'Develop clinical depression', s: 'NIH' },
          ]}
        />
        <Cards items={oncure.problems} />
      </Block>
      <Block label="The story" lead="In his" rest="own words.">
        <div className="pg-prose">
          {oncure.story.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Block>
      <Block label="How it would work" lead="Five steps," rest="from injection to apoptosis." lede="A conceptual workflow, not a tested procedure.">
        <Numbered items={oncure.steps} />
      </Block>
      <Block label="Inside each nanobot" lead="What every nanobot" rest="would carry.">
        <Rise className="pg-chips">
          {oncure.parts.map((p, i) => (
            <span key={p} style={at(i)}>
              {p}
            </span>
          ))}
        </Rise>
      </Block>
      <Block label="Features" lead="What it is" rest="designed to do.">
        <Cards items={oncure.features.map((f, i) => ({ ...f, icon: ONCURE_ICONS[i] }))} />
      </Block>
      <Block label="Challenges" lead="What would have" rest="to be solved first.">
        <Numbered items={oncure.challenges} />
      </Block>
      <Block label="Why it is possible" lead="Robots keep" rest="getting smaller.">
        <Cards items={oncure.evidence.map((e, i) => ({ title: i ? 'Smaller than a grain of salt' : 'A battery-free flying robot', line: e, icon: Flask }))} cols={2} />
      </Block>
      <Block label="Roadmap" lead="From feasibility" rest="to clinical development.">
        <Numbered items={oncure.roadmap} />
      </Block>
      <Block label="Scientific considerations" lead="What the proposal" rest="must refine.">
        <Cards items={oncure.considerations.map((c) => ({ ...c, icon: Warning }))} tone="warm" />
      </Block>
      <Block label="Values" lead="What it" rest="stands for.">
        <Cards items={oncure.values} cols={4} />
      </Block>
      <div className="pg-verdict">
        <Heartbeat weight="duotone" aria-hidden="true" />
        <small>Overall assessment</small>
        <p>{oncure.assessment}</p>
      </div>
    </>
  );
}

const FIN_ICONS = [Sparkle, Database, ChartLineUp, ClockCountdown, TrendUp, Calculator, CheckCircle];

export function TradingPage() {
  return (
    <>
      <Note icon={Warning}>A personal project, {stockApp.status.toLowerCase()}. Figures are hypothetical sample data, not financial advice.</Note>
      <div className="pg-mock">
        <AppMockup />
      </div>
      <Block label="What it is" lead="Friendly to beginners," rest="welcoming to veterans." lede={stockApp.summary}>
        <Numbered items={stockApp.approach.map((a, i) => ({ title: ['No jargon', 'The best hypothetical choice', 'A time frame', 'Advice along the way'][i] ?? '', line: a }))} />
      </Block>
      <Block label="Next to the chart" lead="AI advice where" rest="you are already looking." lede="For the stock you are viewing, the AI model shows three things beside the graph.">
        <Stats
          items={[
            { v: 'How much', k: 'The best amount of the stock to buy' },
            { v: 'When', k: 'A time frame to buy' },
            { v: 'Sell', k: 'An estimated time to sell, from real-world factors' },
          ]}
        />
      </Block>
      <Block label="Everything it will have" lead="All the parts of" rest="a trading site.">
        <Cards items={stockApp.features.map((f, i) => ({ ...f, icon: FIN_ICONS[i] }))} />
      </Block>
      <div className="pg-verdict">
        <ChartLineUp weight="duotone" aria-hidden="true" />
        <small>Who it is for</small>
        <p>{stockApp.forWhom}</p>
      </div>
    </>
  );
}

function AwardsPage() {
  return (
    <>
      <Stats
        items={[
          { v: 'Top 99%', k: 'PSAT', s: '8th and 10th grade' },
          { v: 'Top 99%', k: 'MAP', s: '10th grade' },
          { v: '1280', k: 'PSAT 8/9', s: 'out of 1440' },
          { v: String(achievements.length), k: 'Awards, honors and certificates' },
        ]}
      />
      <Block label="Every award" lead="Recognition from" rest="elementary to high school.">
        <Rise className="pg-cards is-3">
          {achievements.map((a, i) => (
            <article key={a.id} className="pg-card" style={at(i)}>
              <Medal weight="duotone" aria-hidden="true" />
              <small className="pg-kind">
                {a.kind} · {a.when}
              </small>
              <h4>{a.title}</h4>
              <b className="pg-val">{a.value}</b>
              <p>{a.detail}</p>
            </article>
          ))}
        </Rise>
      </Block>
      <Block label="Scores" lead="How he compares" rest="nationwide." lede="Percentile ranks: higher than that share of students.">
        <Rise className="pg-bars">
          {percentiles.map((p, i) => (
            <div key={`${p.test}${p.grade}`} style={at(i)}>
              <span>
                {p.test} · {p.grade}
              </span>
              <i>
                <em style={{ width: `${p.value}%` }} />
              </i>
              <b>{p.value}%</b>
            </div>
          ))}
        </Rise>
      </Block>
    </>
  );
}

function LifePage() {
  return (
    <>
      <Block label="Activities" lead="Sport, music" rest="and competitions.">
        <Cards items={activities.map((a) => ({ title: a.title, line: a.role, icon: Sparkle }))} />
      </Block>
      <Block label="Volunteering" lead="Giving" rest="back.">
        <Cards items={volunteering.map((v) => ({ title: v.title, line: v.role, icon: HandHeart }))} />
      </Block>
    </>
  );
}

function TutoringPage() {
  return (
    <>
      <div className="pg-prose">
        <p>{resume.summary}</p>
      </div>
      <Block label="What he does" lead="One on one" rest="and in groups." lede={`${volunteering[2]?.role ?? ''}, at lunch and after school.`}>
        <Numbered items={resume.tutoring.map((t) => ({ title: t.split(/[,.]/)[0] ?? t, line: t }))} />
      </Block>
    </>
  );
}

function GoalsPage() {
  return <GoalPath />;
}

/** His goals as a path: first university, then three things he wants to build. */
export function GoalPath() {
  const steps = [
    { k: 'First', t: 'University', d: goals.education, icon: GraduationCap },
    { k: 'Then', t: 'Lead AI engineering', d: goals.career[0] ?? '', icon: Brain },
    { k: 'And', t: 'An oncology research lab', d: goals.career[1] ?? '', icon: Dna },
    { k: 'And', t: 'A trading platform', d: goals.career[2] ?? '', icon: Rocket },
  ];
  return (
    <Rise className="gp">
      {steps.map((s, i) => (
        <Fragment key={s.t}>
          <article className={`gp-step ${i === 0 ? 'is-first' : ''}`} style={at(i)}>
            <span className="gp-top">
              <span className="gp-ico">
                <s.icon weight="duotone" aria-hidden="true" />
              </span>
              <span className="gp-n">{String(i + 1).padStart(2, '0')}</span>
            </span>
            <small>{s.k}</small>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </article>
          {i < steps.length - 1 && (
            <span className="gp-arrow" style={at(i)} aria-hidden="true">
              <ArrowRight weight="bold" />
            </span>
          )}
        </Fragment>
      ))}
    </Rise>
  );
}

const PAGES: Record<PageId, { label: string; lead: string; rest: string; lede: string; img: string; body: () => ReactNode }> = {
  oncure: { label: 'Research concept', lead: 'Oncure.', rest: 'AI‑guided nanobots against cancer.', lede: oncure.summary, img: 'microscope', body: OncurePage },
  trading: { label: 'Personal project · in progress', lead: 'Stock trading', rest: 'made simple.', lede: 'AI advice right beside the chart: how much to buy, when to buy it and an estimate of when to sell.', img: 'stock-charts', body: TradingPage },
  awards: { label: 'Achievements', lead: 'Awards', rest: 'and honors.', lede: 'Every award, honor and certificate, and how his test scores compare nationwide.', img: 'trophy', body: AwardsPage },
  life: { label: 'Beyond the classroom', lead: 'Activities', rest: 'and volunteering.', lede: 'Swimming, Muay Thai, guitar, Science Olympiad, DECA and giving back.', img: 'guitar', body: LifePage },
  tutoring: { label: 'Peer tutoring', lead: 'Helping others', rest: 'learn.', lede: 'Math and Science for 7th and 8th graders, at lunch and after school.', img: 'chalkboard-math', body: TutoringPage },
  goals: { label: 'Goals', lead: 'Where he', rest: 'is heading.', lede: 'First university, then three things he wants to build.', img: 'stethoscope', body: GoalsPage },
};

/** A full-screen inner page. */
export function InnerPage({ id, onClose }: { id: PageId; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const p = PAGES[id];
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    box.current?.scrollTo(0, 0);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    document.documentElement.classList.add('sd-locked');
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.classList.remove('sd-locked');
      prev?.focus?.();
    };
  }, [id, onClose]);
  const Body = p.body;
  return createPortal(
    <div ref={box} className="pg" role="dialog" aria-modal="true" aria-label={`${p.lead} ${p.rest}`} tabIndex={-1} data-lenis-prevent>
      <div className="pg-bar">
        <span>{p.label}</span>
        <button type="button" className="sd-x" onClick={onClose} aria-label="Close">
          <X weight="bold" />
        </button>
      </div>
      <header className="pg-hero">
        <img src={`${BASE}assets/photos/${p.img}.jpg`} alt="" />
        <span className="pg-hero-shade" aria-hidden="true" />
        <div className="pg-hero-in">
          <p className="sd-label">
            <i aria-hidden="true" /> {p.label}
          </p>
          <h2>
            {p.lead} <span>{p.rest}</span>
          </h2>
          <p className="pg-lede">{p.lede}</p>
        </div>
      </header>
      <div className="pg-body">
        <Body />
        <button type="button" className="sd-pill is-white pg-back" onClick={onClose}>
          Back to his work
        </button>
      </div>
    </div>,
    document.body,
  );
}
