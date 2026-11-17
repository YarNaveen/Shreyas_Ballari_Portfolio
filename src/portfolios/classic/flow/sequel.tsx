import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowsOut, ArrowClockwise, ArrowCounterClockwise, Info, Pause, Play, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { oncure } from '@/content/portfolio';
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

/** His Oncure video with its own controls; plays (muted) while mostly on screen. */
export function Film() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const userPaused = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = video.current;
        if (!v) return;
        if (e && e.intersectionRatio >= 0.5) {
          if (!userPaused.current) void v.play().catch(() => undefined);
        } else v.pause();
      },
      { threshold: [0, 0.5] },
    );
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
    <div ref={root} className="fv is-free">
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
