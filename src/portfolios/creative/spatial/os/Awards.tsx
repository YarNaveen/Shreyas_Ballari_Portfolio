import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowsOutSimple, CaretLeft, CaretRight, Medal, Shuffle, SpeakerHigh, Trophy } from '@phosphor-icons/react';
import { nationalMerit, percentiles, profile } from '@/content/portfolio';
import { speak } from '../story/narrator';
import { playUi } from '../store';
import { AWARDS } from './media';

/**
 * Awards as a spatial carousel: tall photo cards fanned in depth around the one in focus. Move
 * with the arrows, the dots, a swipe or drag across the deck, the wheel, or voice ("next award").
 * Shuffle riffles the deck and deals it again. Expand opens the award as a certificate with its
 * trophy, details and (for tests) the percentile rings.
 */

type Award = (typeof AWARDS)[number];

function Certificate({ a }: { a: Award }) {
  const merit = a.id === 'nmsc';
  const tests = percentiles.filter((p) => p.test.toLowerCase() === (merit ? 'psat' : a.id));
  return (
    <div className={`aw-detail ${merit ? 'is-merit' : ''}`}>
      <div className="aw-cert">
        <span className="aw-cert-issuer">{a.issuer}</span>
        <b className="aw-cert-title">{a.title}</b>
        <span className="aw-cert-to">presented to</span>
        <span className="aw-cert-name">{profile.name}</span>
        <span className="aw-cert-line">
          {a.value} · {a.when}
        </span>
        <span className="aw-cert-seal" aria-hidden="true">
          <Medal weight="fill" />
        </span>
        <span className="aw-cert-note">
          {merit && !nationalMerit.certificate ? 'Presentation card · the official certificate will be added when received' : 'A presentation card, not the original certificate'}
        </span>
      </div>
      <div className="aw-side">
        <span className="aw-trophy" aria-hidden="true">
          <Trophy weight="fill" />
        </span>
        <p className="aw-kind">{a.kind}</p>
        <p className="aw-text">{a.detail}</p>
        {tests.length > 0 && (
          <div className="aw-rings">
            {tests.map((p, i) => (
              <div key={p.grade} className="aw-ring" style={{ '--v': p.value, '--i': i } as CSSProperties}>
                <svg viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="18" className="aw-ring-bg" />
                  <circle cx="22" cy="22" r="18" className="aw-ring-fg" />
                </svg>
                <b>{merit && p.grade.startsWith('11') ? '99+' : p.value}</b>
                <small>{p.grade}</small>
              </div>
            ))}
          </div>
        )}
        <button type="button" className="os-chip" data-voice="listen" onClick={() => speak(`${a.title}. ${a.detail}`)}>
          <SpeakerHigh weight="bold" aria-hidden="true" /> Listen
        </button>
      </div>
    </div>
  );
}

export function AwardsFlow({ expanded, onExpand }: { expanded: string | null; onExpand: (id: string | null) => void }) {
  const [order, setOrder] = useState(() => AWARDS.map((a) => a.id));
  const [at, setAt] = useState(0);
  const [shuffling, setShuffling] = useState(false);
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const wheelAt = useRef(0);
  const n = order.length;
  const go = (i: number) => {
    setAt(((i % n) + n) % n);
    playUi('tap');
  };
  const shuffle = () => {
    setShuffling(true);
    playUi('move');
    window.setTimeout(() => {
      setOrder((o) => [...o].sort(() => Math.random() - 0.5));
      setAt(0);
    }, 700);
    window.setTimeout(() => setShuffling(false), 1500);
  };
  // Voice / keyboard hooks: the story layer dispatches these.
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<string>).detail;
      if (d === 'next') go(at + 1);
      if (d === 'prev') go(at - 1);
      if (d === 'shuffle') shuffle();
      // A specific award by id ("national merit" opens on its card).
      if (order.includes(d)) go(order.indexOf(d));
    };
    window.addEventListener('os-awards', on);
    return () => window.removeEventListener('os-awards', on);
  });
  const cur = AWARDS.find((a) => a.id === order[at])!;
  if (expanded) {
    const a = AWARDS.find((x) => x.id === expanded)!;
    return <Certificate a={a} />;
  }
  return (
    <div className="aw">
      <div className="aw-bar">
        <button type="button" className="os-round" aria-label="Previous award" data-voice="previous award" onClick={() => go(at - 1)}>
          <CaretLeft weight="bold" />
        </button>
        <span className="aw-bar-title">Awards &amp; achievements</span>
        <button type="button" className="os-chip" data-voice="shuffle" onClick={shuffle}>
          <Shuffle weight="bold" aria-hidden="true" /> Shuffle
        </button>
        <button type="button" className="os-round" aria-label="Next award" data-voice="next award" onClick={() => go(at + 1)}>
          <CaretRight weight="bold" />
        </button>
      </div>
      <div
        className={`aw-deck ${shuffling ? 'is-shuffling' : ''}`}
        onPointerDown={(e) => (drag.current = { x: e.clientX, moved: 0 })}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 70) {
            go(at + (dx < 0 ? 1 : -1));
            drag.current = { x: e.clientX, moved: d.moved + 1 };
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
        onWheel={(e) => {
          // Scroll (up / down or sideways) steps through the deck, one card per gesture.
          const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
          const now = performance.now();
          if (Math.abs(d) < 12 || now - wheelAt.current < 420) return;
          wheelAt.current = now;
          go(at + (d > 0 ? 1 : -1));
        }}
      >
        {order.map((id, k) => {
          const a = AWARDS.find((x) => x.id === id)!;
          let off = k - at;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          return (
            <article
              key={id}
              className={`aw-card ${off === 0 ? 'is-focus' : ''} ${id === 'nmsc' ? 'is-merit' : ''}`}
              style={{ '--off': off, '--abs': abs, '--k': k, zIndex: 20 - abs, opacity: abs > 3 ? 0 : 1 } as CSSProperties}
              aria-hidden={off !== 0}
              onClick={() => (off === 0 ? onExpand(id) : go(k))}
            >
              {id === 'nmsc' ? (
                <span className="aw-merit-art" aria-hidden="true">
                  <span className="aw-merit-seal">
                    <Medal weight="fill" />
                  </span>
                  <span className="aw-merit-k">{nationalMerit.test}</span>
                  <span className="aw-merit-v">99th</span>
                  <span className="aw-merit-s">percentile and above</span>
                </span>
              ) : (
                <img src={a.image} alt="" draggable={false} />
              )}
              <span className="aw-card-shade" />
              {off === 0 && (
                <button
                  type="button"
                  className="aw-expand"
                  data-voice="expand"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand(id);
                  }}
                >
                  <ArrowsOutSimple weight="bold" aria-hidden="true" /> Expand
                </button>
              )}
              <div className="aw-card-text">
                <span className="aw-card-n">
                  {k + 1} / {n}
                </span>
                <b>{a.title}</b>
                <p>{off === 0 ? a.detail : a.value}</p>
                <small>
                  {a.issuer} · {a.when}
                </small>
              </div>
            </article>
          );
        })}
      </div>
      <div className="aw-dots" role="tablist" aria-label="Awards">
        {order.map((id, k) => (
          <button key={id} type="button" role="tab" aria-selected={k === at} aria-label={AWARDS.find((x) => x.id === id)!.title} className={k === at ? 'is-on' : ''} onClick={() => go(k)} />
        ))}
      </div>
      <div className="aw-pill">
        <button type="button" className="os-round" aria-label="Previous" onClick={() => go(at - 1)}>
          <CaretLeft weight="bold" />
        </button>
        <img src={cur.image} alt="" />
        <span>
          <b>{cur.title}</b>
          <small>{cur.value}</small>
        </span>
        <button type="button" className="os-round" aria-label="Next" onClick={() => go(at + 1)}>
          <CaretRight weight="bold" />
        </button>
      </div>
    </div>
  );
}
