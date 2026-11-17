import { useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowsOut, ArrowClockwise, ArrowCounterClockwise, BookOpen, ChalkboardTeacher, ChatCircleText, Cpu, Info, Lightning, Pause, Play, SpeakerHigh, SpeakerSlash, Sparkle } from '@phosphor-icons/react';
import { achievements, languages, oncure, profile, resumeExtra } from '@/content/portfolio';
import { show, useFx, type Reg } from './fx';
import { F, out, seg, smooth, within } from './timeline';
import './sequel.css';

/**
 * After the sparkle:
 *  Film     – the sparkle fills the screen and opens on his Oncure video, full screen, with
 *             play/pause, 10 s back and forward, a scrubber, sound and full screen. Scrolling on
 *             tips it up and away.
 *  Vortex   – his awards and scores spiral round a burst of light; the one in front is named on the
 *             left with its number; a tick scale shows where you are.
 *  Finance  – a blue card opens to full screen as the trading app: headline, a phone with the app
 *             (sample data), and floating widgets.
 *  Stack    – everything else in a receding 3D stack, the front one titled below, the background
 *             a soft blur of the current picture.
 */

const BASE = import.meta.env.BASE_URL;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// --- Film -------------------------------------------------------------------------------------

export function Film({ reg }: { reg: Reg }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const userPaused = useRef(false);
  const inView = useRef(false);

  useFx(reg, (t) => {
    const el = root.current;
    const v = video.current;
    if (!el || !v) return;
    const appear = seg(t, F.fill[1] - 0.012, F.fill[1] + 0.004);
    const leave = smooth(seg(t, F.video[1] - 0.03, F.video[1]));
    const on = appear > 0 && leave < 1;
    show(el, on);
    el.style.opacity = String(appear);
    // Leaving: tip back and rise away.
    el.style.transform = `perspective(1400px) translateY(${-leave * 105}vh) rotateX(${leave * 28}deg) scale(${1 - leave * 0.25})`;
    el.style.borderRadius = `${leave * 40}px`;
    const wasIn = inView.current;
    inView.current = on && appear >= 1 && leave < 0.6;
    if (inView.current && !wasIn && !userPaused.current) void v.play().catch(() => undefined);
    if (!inView.current && wasIn) v.pause();
  });

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      void v.play().catch(() => undefined);
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const jump = (d: number) => {
    const v = video.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d));
  };
  return (
    <div ref={root} className="fv">
      <video
        ref={video}
        src={oncure.video}
        muted={muted}
        playsInline
        preload="metadata"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onClick={toggle}
      />
      <div className="fv-bar" role="group" aria-label="Video controls">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>
        <button type="button" onClick={() => jump(-10)} aria-label="Back 10 seconds">
          <ArrowCounterClockwise weight="bold" />
        </button>
        <button type="button" onClick={() => jump(10)} aria-label="Forward 10 seconds">
          <ArrowClockwise weight="bold" />
        </button>
        <span className="fv-time">
          {fmt(time)} / {fmt(dur)}
        </span>
        <input
          type="range"
          min={0}
          max={dur || 1}
          step={0.1}
          value={time}
          aria-label="Seek"
          onChange={(e) => {
            const v = video.current;
            if (v) v.currentTime = Number(e.target.value);
          }}
          style={{ '--p': `${dur ? (time / dur) * 100 : 0}%` } as CSSProperties}
        />
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Sound on' : 'Mute'}>
          {muted ? <SpeakerSlash weight="bold" /> : <SpeakerHigh weight="bold" />}
        </button>
        <button type="button" onClick={() => void video.current?.requestFullscreen?.().catch(() => undefined)} aria-label="Full screen">
          <ArrowsOut weight="bold" />
        </button>
        <button
          type="button"
          className="fv-more"
          data-voice="view more oncure"
          onClick={() => {
            video.current?.pause();
            // The full proposal is a section further down the page.
            document.getElementById('cx-oncure')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Info weight="bold" aria-hidden="true" /> Read the full proposal
        </button>
      </div>
    </div>
  );
}

// --- The trading app ---------------------------------------------------------------------------

const ROWS = [
  { t: 'NOVA', n: 'Nova Labs', stage: 'Holding', v: '+4.2%', up: true },
  { t: 'ORBT', n: 'Orbit Foods', stage: 'Buying · 2 of 3', v: '+1.8%', up: true },
  { t: 'LUMA', n: 'Luma Energy', stage: 'Sell window soon', v: '−0.9%', up: false },
  { t: 'KITE', n: 'Kite Mobility', stage: 'Watching', v: '+0.6%', up: true },
];

export function Finance({ reg }: { reg: Reg }) {
  const root = useRef<HTMLDivElement>(null);
  useFx(reg, (t) => {
    const el = root.current;
    if (!el) return;
    const o = smooth(seg(t, F.open[0], F.open[1]));
    const k = within(t, 'finance');
    const close = smooth(seg(t, F.mara[0], F.mara[0] + 0.035));
    const on = o > 0 && close < 1;
    show(el, on);
    if (!on) return;
    if (close > 0) {
      // Closing down into the front card of the awards stack (same size and place).
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(440, vw < 760 ? vw * 0.62 : vw * 0.3);
      const h = (w * 11) / 16;
      el.style.clipPath = `inset(${close * (vh * 0.46 - h / 2)}px ${(close * (vw - w)) / 2}px ${close * (vh * 0.54 - h / 2)}px round ${close * 8}px)`;
      el.style.opacity = String(1 - seg(close, 0.7, 1));
    } else {
      // A small blue card at the centre opens to the whole screen.
      el.style.clipPath = `inset(${(1 - o) * 38}% ${(1 - o) * 41}% round ${24 + (1 - o) * 10}px)`;
      el.style.opacity = '1';
    }
    const c = out(seg(k, 0.05, 0.3));
    el.style.setProperty('--c', c.toFixed(3));
    const ph = out(seg(k, 0.15, 0.55));
    el.style.setProperty('--ph', ph.toFixed(3));
    const wd = out(seg(k, 0.4, 0.7));
    el.style.setProperty('--wd', wd.toFixed(3));
  });
  return (
    <div ref={root} className="ff">
      <div className="ff-copy">
        <span className="ff-badge">
          <Sparkle weight="fill" aria-hidden="true" /> Personal project · in progress
        </span>
        <h2>
          Trading advice,
          <br />
          right beside the chart
        </h2>
        <p>An AI model reads real-world data and suggests how much to buy, when to buy and an estimated time to sell, in plain words, for beginners and veterans alike.</p>
        <div className="ff-btns">
          <span className="ff-btn">Hypothetical · not financial advice</span>
        </div>
      </div>
      <div className="ff-phone" aria-label="The app, with sample data">
        <div className="ff-notch" />
        <p className="ff-status">
          <span>9:41</span>
          <span>TradeMind</span>
        </p>
        <h3>Today</h3>
        <p className="ff-sub">Sample portfolio · $12,480.36</p>
        <ul>
          {ROWS.map((r) => (
            <li key={r.t}>
              <span className="ff-ico">{r.t.slice(0, 1)}</span>
              <span>
                <b>{r.t}</b>
                <small>{r.n} (sample)</small>
              </span>
              <span className="ff-right">
                <small>{r.stage}</small>
                <em className={r.up ? 'is-up' : 'is-down'}>{r.v}</em>
              </span>
            </li>
          ))}
        </ul>
        <p className="ff-ai">
          <Sparkle weight="fill" aria-hidden="true" /> AI: hold NOVA, review LUMA this week
        </p>
      </div>
      <div className="ff-widget is-left" aria-hidden="true">
        <b>3</b>
        <small>AI suggestions today</small>
        <span className="ff-gauge">
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </span>
      </div>
      <div className="ff-widget is-right" aria-hidden="true">
        <p>
          <b>NOVA</b> <small>Holding</small> <em>+4.2%</em>
        </p>
        <p>
          <b>Pending orders</b> <small>2 waiting</small>
        </p>
      </div>
      <p className="ff-note">Concept design · sample data · names and figures are made up</p>
    </div>
  );
}

// --- Everything else, as a receding 3D stack -----------------------------------------------------

const ISSUER: Record<string, string> = {
  cbnrp: 'College Board',
  honors: 'Fulton Science Academy',
  psat: 'College Board · PSAT',
  map: 'NWEA · MAP Growth',
  arrow: 'Indian Prairie School District 204',
  authors: 'Indian Prairie School District 204',
  minimed: 'Mini-Medical School',
};
const CERT_TONES = ['#c9a227', '#2f5fd6', '#7a3cff', '#14b8a6', '#e8432f', '#f97316', '#0ea5e9'];
const STACK = achievements.map((a, i) => ({
  id: a.id,
  title: a.title,
  line: a.detail,
  kind: a.kind,
  value: a.value,
  when: a.when,
  issuer: ISSUER[a.id] ?? '',
  tone: CERT_TONES[i % CERT_TONES.length]!,
}));

export function Stack3D({ reg }: { reg: Reg }) {
  const root = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const last = useRef(-1);
  useFx(reg, (t, vw) => {
    const el = root.current;
    if (!el) return;
    const k = within(t, 'mara');
    const enter = t >= F.mara[0] ? 1 : 0;
    const leave = seg(t, F.tech[0], F.tech[0] + 0.025);
    show(el, enter > 0 && leave < 1);
    if (enter <= 0 || leave >= 1) return;
    el.style.opacity = String(1 - leave);
    const n = STACK.length;
    const f = smooth(seg(k, 0.05, 0.95)) * (n - 1);
    const W = Math.min(440, vw * 0.3);
    el.querySelectorAll<HTMLElement>('.fm-card').forEach((c, i) => {
      const d = i - f;
      let x = 0;
      let y = 0;
      let z = 0;
      let ry = 0;
      let op = 1;
      if (d >= 0) {
        // Waiting: a stack receding up and to the right.
        x = d * W * 0.36 + Math.min(d, 1) * W * 0.32;
        y = -d * 14;
        z = -d * 120;
        ry = -Math.min(d, 1) * 42;
        op = d > 8 ? 0 : 1;
      } else {
        // Seen: slide to the left and fade.
        x = d * W * 0.22 - Math.min(-d, 1) * W * 0.4;
        z = d * 80;
        ry = Math.min(-d, 1) * 34;
        op = Math.max(0, 1 + d * 0.45);
      }
      c.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`;
      c.style.opacity = String(op);
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 5));
    });
    el.querySelectorAll<HTMLElement>('.fm-bg').forEach((b, i) => {
      b.style.opacity = String(Math.max(0, 1 - Math.abs(i - f) * 1.4));
    });
    const i = Math.round(f);
    if (i !== last.current) setCur((last.current = i));
  });
  const c = STACK[cur]!;
  return (
    <div ref={root} className="fm">
      {STACK.map((s) => (
        <div key={s.title} className="fm-bg" style={{ '--tone': s.tone } as CSSProperties} aria-hidden="true" />
      ))}
      <p className="fm-about">
        <b>Awards &amp; certificates</b>
        <br />
        Recognition from elementary school to high school. Cards are designed presentations, not scans of the original certificates.
      </p>
      <div className="fm-space">
        {STACK.map((s) => (
          <div key={s.title} className="fm-card is-cert" style={{ '--tone': s.tone } as CSSProperties}>
            <div className="cert">
              <span className="cert-issuer">{s.issuer}</span>
              <span className="cert-kind">{s.kind}</span>
              <b className="cert-title">{s.title}</b>
              <span className="cert-to">presented to</span>
              <span className="cert-name">{profile.name}</span>
              <span className="cert-meta">
                {s.value} · {s.when}
              </span>
              <span className="cert-seal" aria-hidden="true">
                ★
              </span>
            </div>
            {/* A real scan or photo dropped in public/assets/certificates/<id>.jpg replaces the design. */}
            <img className="cert-photo" src={`${BASE}assets/certificates/${s.id}.jpg`} alt="" loading="lazy" onError={(e) => e.currentTarget.remove()} />
          </div>
        ))}
      </div>
      <h2 className="fm-title" key={c.title}>
        <span className="fm-n">{String(cur + 1).padStart(2, '0')}</span> {c.title}
      </h2>
      <p className="fm-line" key={`l${c.title}`}>
        {c.line}
      </p>
      <a
        href="#cx-contact"
        className="fm-cta"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('cx-contact')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Get in touch <ArrowRight weight="bold" aria-hidden="true" />
      </a>
    </div>
  );
}

// --- Technical skills: the language cards come out of the stack and line up ---------------------

const LANG_NOTE: Record<string, string> = {
  JavaScript: 'The language of the web',
  Python: 'A favourite for data and AI',
  Java: 'The language of AP Computer Science A',
};

/** A few lines in each language, coloured like a code editor (for show; not a real program). */
const CODE: Record<string, { file: string; lines: [string, string][][] }> = {
  JavaScript: {
    file: 'goal.js',
    lines: [
      [['k', 'const '], ['v', 'goal'], ['p', ' = '], ['s', "'AI for good'"], ['p', ';']],
      [['k', 'function '], ['f', 'learn'], ['p', '(topic) {']],
      [['p', '  '], ['k', 'return '], ['s', '`${topic} ✓`'], ['p', ';']],
      [['p', '}']],
    ],
  },
  Python: {
    file: 'detect.py',
    lines: [
      [['k', 'def '], ['f', 'detect'], ['p', '(cells):']],
      [['p', '    '], ['k', 'return '], ['p', '[c '], ['k', 'for '], ['p', 'c '], ['k', 'in '], ['p', 'cells']],
      [['p', '            '], ['k', 'if '], ['p', 'c.'], ['v', 'is_tumour'], ['p', ']']],
    ],
  },
  Java: {
    file: 'Oncure.java',
    lines: [
      [['k', 'public class '], ['f', 'Oncure'], ['p', ' {']],
      [['p', '  '], ['k', 'boolean '], ['v', 'precise'], ['p', ' = '], ['k', 'true'], ['p', ';']],
      [['p', '}']],
    ],
  },
};
const GROUP_ICON = [BookOpen, Cpu, ChalkboardTeacher, ChatCircleText, Lightning];

export function TechSkills({ reg }: { reg: Reg }) {
  const root = useRef<HTMLDivElement>(null);
  useFx(reg, (t, vw) => {
    const el = root.current;
    if (!el) return;
    const k = within(t, 'tech');
    const enter = seg(t, F.tech[0], F.tech[0] + 0.025);
    show(el, enter > 0);
    if (enter <= 0) return;
    el.style.opacity = String(enter);
    const W = Math.min(440, vw * 0.3);
    el.querySelectorAll<HTMLElement>('.ft-lang').forEach((c, i) => {
      const v = smooth(seg(k, 0.04 + i * 0.08, 0.36 + i * 0.08));
      // From the stack's receding positions on the right into a row.
      const sx = W * 0.7 + (i + 1) * W * 0.36;
      const sz = -(i + 1) * 120;
      c.style.transform = `translate3d(${(1 - v) * sx}px, ${(1 - v) * -(i + 1) * 14}px, ${(1 - v) * sz}px) rotateY(${(1 - v) * -42}deg)`;
      c.style.opacity = String(Math.min(1, 0.2 + v));
      c.style.setProperty('--type', String(clamp01((k - 0.2 - i * 0.08) / 0.3)));
    });
    el.querySelectorAll<HTMLElement>('.ft-group').forEach((c, i, all) => {
      const v = out(seg(k, 0.42 + (i / all.length) * 0.3, 0.55 + (i / all.length) * 0.3));
      c.style.opacity = String(v);
      c.style.transform = `translateY(${(1 - v) * 24}px)`;
    });
  });
  return (
    <div ref={root} className="ft">
      <div className="ft-head">
        <p className="ft-kicker">Technical skills</p>
        <h2 className="ft-h">Three languages, and the skills around them.</h2>
      </div>
      <div className="ft-row">
        {languages.map((l, i) => {
          const code = CODE[l];
          return (
            <article key={l} className="ft-lang" style={{ '--i': i } as CSSProperties}>
              <header className="ft-win">
                <i />
                <i />
                <i />
                <span>{code?.file ?? l}</span>
              </header>
              <pre className="ft-code" aria-hidden="true">
                {code?.lines.map((line, n) => (
                  <span key={n} className="ft-line">
                    <em>{n + 1}</em>
                    {line.map(([kind, text], j) => (
                      <span key={j} className={`tk-${kind}`}>
                        {text}
                      </span>
                    ))}
                  </span>
                ))}
              </pre>
              <footer className="ft-foot">
                <b>{l}</b>
                <small>{LANG_NOTE[l] ?? ''}</small>
              </footer>
            </article>
          );
        })}
      </div>
      <div className="ft-groups">
        {resumeExtra.skills.map((g, i) => {
          const I = GROUP_ICON[i % GROUP_ICON.length]!;
          return (
            <div key={g.group} className="ft-group">
              <span className="ft-group-ico">
                <I weight="duotone" aria-hidden="true" />
              </span>
              <b>{g.group}</b>
              <small>{g.items.slice(0, 4).join(' · ')}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
