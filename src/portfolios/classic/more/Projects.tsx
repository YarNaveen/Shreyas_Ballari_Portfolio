import type { CSSProperties } from 'react';
import {
  Atom,
  Brain,
  Calculator,
  ChartLineUp,
  CheckCircle,
  ClockCountdown,
  CurrencyDollar,
  Database,
  Dna,
  Drop,
  Eye,
  Flask,
  Globe,
  Heartbeat,
  Lightbulb,
  Lightning,
  MagnifyingGlass,
  Microscope,
  Rocket,
  Scales,
  ShieldCheck,
  Sparkle,
  Target,
  TrendUp,
  UserCheck,
  Users,
  Warning,
  WifiHigh,
} from '@phosphor-icons/react';
import { oncure, stockApp } from '@/content/portfolio';
import { Reveal, Sec } from './ui';

/**
 * The two projects in full, right on the page (no "view more"): Oncure, his research proposal, and
 * his AI stock trading app with a mockup of the app. Every fact comes from content/portfolio.ts.
 */

const at = (i: number, extra?: Record<string, string>) => ({ '--i': i, ...extra }) as CSSProperties;

const FEATURE_ICONS = [Brain, Atom, MagnifyingGlass, Target, Dna, UserCheck, ClockCountdown, CurrencyDollar, ShieldCheck];
const STEP_ICONS = [Drop, Eye, UserCheck, Target, Sparkle];
const PART_ICONS = [Lightning, Eye, Lightbulb, Dna, WifiHigh];

export function OncureFull() {
  const [high, cost, long, side, mind, access] = oncure.problems;
  return (
    <Sec
      id="oncure"
      kicker={
        <>
          <Microscope weight="fill" aria-hidden="true" /> Research concept
        </>
      }
      lead="Oncure."
      rest="AI-guided nanobots against cancer."
      lede={oncure.summary}
    >
      <p className="pj-disclaimer">
        <Warning weight="fill" aria-hidden="true" /> {oncure.disclaimer}
      </p>

      {/* The pitch and the vision */}
      <Reveal className="pj-pitch">
        <blockquote style={at(0)}>“{oncure.pitch}”</blockquote>
        <div className="pj-vision" style={at(1)}>
          <Globe weight="duotone" aria-hidden="true" />
          <small>The vision</small>
          <p>{oncure.vision}</p>
        </div>
      </Reveal>

      {/* The problem, with its numbers */}
      <h3 className="pj-h3">The problem it wants to solve</h3>
      <Reveal className="pj-stats">
        <article className="pj-stat is-violet" style={at(0)}>
          <b>20M</b>
          <span>new cancer cases a year</span>
          <small>and nearly 10 million deaths (WHO, IARC / GLOBOCAN)</small>
        </article>
        <article className="pj-stat is-white" style={at(1)}>
          <b>$100K+</b>
          <span>out of pocket for late-stage chemotherapy</span>
          <small>even with insurance (American Cancer Society)</small>
        </article>
        <article className="pj-stat is-blue" style={at(2)}>
          <b>6–8 mo</b>
          <span>for a standard late-stage lung cancer regimen</span>
          <small>with serious side effects (National Cancer Institute)</small>
        </article>
        <article className="pj-stat is-black" style={at(3)}>
          <b>15–25%</b>
          <span>of people with cancer develop clinical depression</span>
          <small>caregivers often feel as much distress (NIH)</small>
        </article>
      </Reveal>
      <Reveal className="pj-grid is-3">
        {[high, cost, long, side, mind, access].filter(Boolean).map((p, i) => (
          <article key={p!.title} className="pj-card" style={at(i)}>
            <b>{p!.title}</b>
            <p>{p!.line}</p>
          </article>
        ))}
      </Reveal>

      {/* The story, in his words */}
      <h3 className="pj-h3">The story behind it</h3>
      <Reveal className="pj-story">
        {oncure.story.map((t, i) => (
          <p key={i} style={at(i)}>
            {t}
          </p>
        ))}
      </Reveal>

      {/* How it would work */}
      <h3 className="pj-h3">How it is intended to work</h3>
      <Reveal as="ol" className="pj-steps">
        {oncure.steps.map((s, i) => {
          const I = STEP_ICONS[i] ?? Sparkle;
          return (
            <li key={s.title} style={at(i)}>
              <span className="pj-step-ico">
                <I weight="duotone" aria-hidden="true" />
              </span>
              <small>Step {i + 1}</small>
              <b>{s.title}</b>
              <p>{s.line}</p>
            </li>
          );
        })}
      </Reveal>
      <p className="pj-note">A conceptual workflow only. The complete process has not been demonstrated as a working treatment.</p>

      {/* What a nanobot would carry */}
      <h3 className="pj-h3">Inside each nanobot, as first proposed</h3>
      <Reveal className="pj-bot">
        <div className="pj-bot-core" style={at(0)}>
          <Atom weight="duotone" aria-hidden="true" />
          <b>Nanobot</b>
        </div>
        <ul>
          {oncure.parts.map((p, i) => {
            const I = PART_ICONS[i] ?? Sparkle;
            return (
              <li key={p} style={at(i + 1)}>
                <I weight="duotone" aria-hidden="true" /> {p}
              </li>
            );
          })}
        </ul>
      </Reveal>

      {/* Key features */}
      <h3 className="pj-h3">Key features</h3>
      <Reveal className="pj-grid is-3">
        {oncure.features.map((f, i) => {
          const I = FEATURE_ICONS[i] ?? Sparkle;
          return (
            <article key={f.title} className="pj-card has-ico" style={at(i)}>
              <I weight="duotone" aria-hidden="true" />
              <b>{f.title}</b>
              <p>{f.line}</p>
            </article>
          );
        })}
      </Reveal>

      {/* Technical challenges */}
      <h3 className="pj-h3">Technical challenges</h3>
      <Reveal as="ul" className="pj-list">
        {oncure.challenges.map((c, i) => (
          <li key={c.title} style={at(i)}>
            <b>{c.title}</b>
            <span>{c.line}</span>
          </li>
        ))}
      </Reveal>

      {/* Why it could one day exist */}
      <h3 className="pj-h3">Why it could one day be possible</h3>
      <Reveal className="pj-grid is-2">
        {oncure.evidence.map((e, i) => (
          <article key={e} className="pj-card is-glow" style={at(i)}>
            <Rocket weight="duotone" aria-hidden="true" />
            <p>{e}</p>
          </article>
        ))}
      </Reveal>

      {/* The roadmap */}
      <h3 className="pj-h3">Future development priorities</h3>
      <Reveal as="ol" className="pj-road">
        {oncure.roadmap.map((r, i) => (
          <li key={r.title} style={at(i)}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <b>{r.title}</b>
            <p>{r.line}</p>
          </li>
        ))}
      </Reveal>

      {/* Honest science */}
      <h3 className="pj-h3">Important scientific considerations</h3>
      <Reveal className="pj-grid is-3">
        {oncure.considerations.map((c, i) => (
          <article key={c.title} className="pj-card is-amber" style={at(i)}>
            <Scales weight="duotone" aria-hidden="true" />
            <b>{c.title}</b>
            <p>{c.line}</p>
          </article>
        ))}
      </Reveal>

      {/* Values and the verdict */}
      <h3 className="pj-h3">Core value proposition</h3>
      <Reveal className="pj-values">
        {oncure.values.map((v, i) => (
          <article key={v.title} style={at(i)}>
            <b>{v.title}</b>
            <p>{v.line}</p>
          </article>
        ))}
      </Reveal>
      <Reveal className="pj-verdict">
        <div style={at(0)}>
          <Heartbeat weight="duotone" aria-hidden="true" />
          <small>Overall assessment</small>
          <p>{oncure.assessment}</p>
        </div>
      </Reveal>
    </Sec>
  );
}

// --- The trading app -------------------------------------------------------------------------

const FIN_ICONS = [Sparkle, Database, ChartLineUp, ClockCountdown, TrendUp, Calculator, CheckCircle];
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

function AppMockup() {
  const { d, area } = chartPath(520, 170);
  return (
    <div className="mk" role="img" aria-label="A mockup of the trading app with sample data: a portfolio dashboard, a stock chart with AI advice beside it, holdings with their buy or sell stage, pending orders and top performers.">
      <div className="mk-bar">
        <i />
        <i />
        <i />
        <span>tradeMind.app · concept</span>
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
                    <stop offset="0" stopColor="#3b82f6" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#mkfill)" />
                <path d={d} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" />
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

export function TradingFull() {
  return (
    <Sec
      id="trading"
      tone="ink"
      kicker={
        <>
          <ChartLineUp weight="bold" aria-hidden="true" /> Personal project · {stockApp.status.toLowerCase()}
        </>
      }
      lead="AI trading app."
      rest="Advice right beside the chart."
      lede={stockApp.summary}
    >
      <Reveal className="pj-approach">
        {stockApp.approach.map((a, i) => (
          <p key={a} style={at(i)}>
            <CheckCircle weight="fill" aria-hidden="true" /> {a}
          </p>
        ))}
      </Reveal>

      <Reveal className="mk-wrap">
        <div style={at(0)}>
          <AppMockup />
        </div>
      </Reveal>
      <p className="pj-note">Concept design · sample data · names and figures are made up · hypothetical, not financial advice.</p>

      <h3 className="pj-h3">Everything it will have</h3>
      <Reveal className="pj-grid is-3">
        {stockApp.features.map((f, i) => {
          const I = FIN_ICONS[i] ?? Sparkle;
          return (
            <article key={f.title} className="pj-card has-ico" style={at(i)}>
              <I weight="duotone" aria-hidden="true" />
              <b>{f.title}</b>
              <p>{f.line}</p>
            </article>
          );
        })}
      </Reveal>

      <Reveal className="pj-verdict">
        <div style={at(0)}>
          <Users weight="duotone" aria-hidden="true" />
          <small>Who it is for</small>
          <p>{stockApp.forWhom}</p>
        </div>
      </Reveal>
      <Reveal className="pj-grid is-2 pj-mini">
        <article className="pj-card" style={at(0)}>
          <Flask weight="duotone" aria-hidden="true" />
          <b>Status</b>
          <p>A project in progress. The screens above are a concept design.</p>
        </article>
        <article className="pj-card" style={at(1)}>
          <Scales weight="duotone" aria-hidden="true" />
          <b>Hypothetical, not financial advice</b>
          <p>Its suggestions are hypothetical choices to help people learn, not financial advice.</p>
        </article>
      </Reveal>
    </Sec>
  );
}
