import { useState, type CSSProperties } from 'react';
import type { Experience } from '@/content/experience';
import './motion.css';

/**
 * A short, looping "video" for an activity. With a real video (MP4) it plays that. Until then it
 * plays a motion preview: the picture slowly pans and zooms while an animated layer tells the
 * topic (water light for swimming, a heartbeat line for the medical camp, lamp light for the
 * temple, chalk equations for tutoring, guitar notes, atom orbits, a rising chart, impact rings).
 * Pure CSS, so it costs nothing when off screen; it pauses with the button and for reduced motion.
 */

const EQUATIONS = ['a² + b² = c²', 'F = m · a', '6 × 7 = 42', 'H₂O'];

function Layer({ motion }: { motion: Experience['motion'] }) {
  switch (motion) {
    case 'water':
      return (
        <span className="xm-fx is-water" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      );
    case 'pulse':
      return (
        <svg className="xm-fx is-pulse" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,60 70,60 90,60 105,30 120,85 135,15 150,72 165,60 240,60 255,45 270,60 400,60" />
        </svg>
      );
    case 'lamps':
      return (
        <span className="xm-fx is-lamps" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ '--x': `${8 + ((i * 37) % 86)}%`, '--d': `${(i % 5) * 0.9}s` } as CSSProperties} />
          ))}
        </span>
      );
    case 'chalk':
      return (
        <span className="xm-fx is-chalk" aria-hidden="true">
          {EQUATIONS.map((e, i) => (
            <b key={e} style={{ '--i': i } as CSSProperties}>
              {e}
            </b>
          ))}
        </span>
      );
    case 'notes':
      return (
        <span className="xm-fx is-notes" aria-hidden="true">
          {['♪', '♫', '♩', '♬', '♪', '♫'].map((n, i) => (
            <i key={i} style={{ '--x': `${12 + i * 15}%`, '--d': `${i * 0.8}s` } as CSSProperties}>
              {n}
            </i>
          ))}
        </span>
      );
    case 'atom':
      return (
        <svg className="xm-fx is-atom" viewBox="0 0 200 200" aria-hidden="true">
          <g>
            <ellipse cx="100" cy="100" rx="80" ry="28" />
            <ellipse cx="100" cy="100" rx="80" ry="28" transform="rotate(60 100 100)" />
            <ellipse cx="100" cy="100" rx="80" ry="28" transform="rotate(-60 100 100)" />
          </g>
          <circle cx="100" cy="100" r="9" />
        </svg>
      );
    case 'chart':
      return (
        <svg className="xm-fx is-chart" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,170 60,150 110,160 170,110 220,125 280,70 330,85 400,30" />
        </svg>
      );
    case 'rings':
      return (
        <span className="xm-fx is-rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      );
  }
}

export function MotionMedia({ item, className = '', controls = true, label = true }: { item: Experience; className?: string; controls?: boolean; label?: boolean }) {
  const [paused, setPaused] = useState(false);
  return (
    <figure className={`xm is-${item.motion} ${paused ? 'is-paused' : ''} ${className}`} style={{ '--tint': item.tint } as CSSProperties}>
      {item.video ? (
        <video src={item.video} autoPlay muted loop playsInline controls={controls} />
      ) : (
        <>
          <img className="xm-img" src={item.image} alt="" loading="lazy" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
          <span className="xm-shade" aria-hidden="true" />
          <Layer motion={item.motion} />
          {label && (
            <figcaption className="xm-badge">
              <i aria-hidden="true" /> Motion preview · {item.imageNote}
            </figcaption>
          )}
          {controls && (
            <div className="xm-bar">
              <button type="button" className="xm-play" aria-label={paused ? 'Play the preview' : 'Pause the preview'} data-voice={paused ? 'play' : 'pause'} onClick={() => setPaused(!paused)}>
                {paused ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <span className="xm-progress">
                <i />
              </span>
              <small>0:12</small>
            </div>
          )}
        </>
      )}
    </figure>
  );
}
