import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowsOut, ArrowClockwise, ArrowCounterClockwise, Info, Pause, Play, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { oncure } from '@/content/portfolio';
import { show, useFx, type Reg } from './fx';
import { F, seg, smooth } from './timeline';
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

  // The film is the last chapter, so it scrolls away with the page: pause it once it is off screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) video.current?.pause();
      else if (inView.current && !userPaused.current) void video.current?.play().catch(() => undefined);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
            window.dispatchEvent(new CustomEvent('sd-page', { detail: 'oncure' }));
          }}
        >
          <Info weight="bold" aria-hidden="true" /> Read the full proposal
        </button>
      </div>
    </div>
  );
}
