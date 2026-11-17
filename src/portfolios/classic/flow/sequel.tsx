import { useRef, useState, type CSSProperties } from 'react';
import { ArrowsOut, ArrowClockwise, ArrowCounterClockwise, Info, Pause, Play, SpeakerHigh, SpeakerSlash, Sparkle } from '@phosphor-icons/react';
import { oncure } from '@/content/portfolio';
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
            // The full proposal opens in the detail sheet.
            window.dispatchEvent(new CustomEvent('sd-sheet', { detail: 'oncure' }));
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
