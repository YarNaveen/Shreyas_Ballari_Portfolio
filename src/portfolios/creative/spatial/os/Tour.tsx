import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChatsCircle, HandPointing, Info, Play, SpeakerHigh, SquaresFour, X } from '@phosphor-icons/react';
import { HOTSPOTS, hotspotEls, type Hotspot } from '../house/hotspots';
import { CHAPTERS } from '../story/chapters';
import { speak, stopSpeaking } from '../story/narrator';
import { TOUR } from '../story/tour';
import { playUi, spatial, useSpatial } from '../store';
import { openExperience, openPavilion } from '../ui/commands';

/**
 * The house tour overlay. Left: the rooms (tap one to walk there). Right: a glass card that tells
 * the story of the room you are in, and changes into the details of anything you tap in the room
 * (the glowing points sit on real objects: certificates, the trophy, the hologram, the guitars…),
 * or on the buttons on the card. The room stays visible behind everything.
 *
 * On phones the card would cover the whole house, so it starts closed: a small bar names the
 * room, and the card opens only when the visitor taps a glowing point or "About this room".
 * Every card has a close button.
 */

const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

export function RoomPoints({ station, open, onOpen }: { station: string | null; open: string | null; onOpen: (h: Hotspot) => void }) {
  const points = station ? HOTSPOTS.filter((h) => h.station === station) : HOTSPOTS;
  // Ask the 3D view for a frame so the points are placed on their objects.
  useEffect(() => {
    if (points.length) window.dispatchEvent(new Event('sp-points'));
  }, [points.length, station]);
  return (
    <div className="tour-points" aria-label="Things to explore in this room">
      {points.map((h, i) => (
        <button
          key={h.id}
          ref={(el) => {
            if (el) hotspotEls.set(h.id, el);
            else hotspotEls.delete(h.id);
          }}
          type="button"
          className={`tour-point ${open === h.id ? 'is-on' : ''}`}
          style={{ '--tint': h.tint ?? '#fff', '--i': i } as CSSProperties}
          aria-label={`${h.label}: show details`}
          data-voice={h.label}
          onClick={() => onOpen(h)}
        >
          <i aria-hidden="true" />
          <span>{h.label}</span>
        </button>
      ))}
    </div>
  );
}

/** What a point offers: ask the AI, watch the video, or open an app. */
export function goSpot(h: Hotspot) {
  if (h.ask) spatial.set({ bubble: true });
  else if (h.video) spatial.set({ video: true });
  else if (h.app?.id.startsWith('pavilion')) openPavilion(h.app.id.split(':')[1] ?? null);
  else if (h.app?.id.startsWith('experience')) openExperience(h.app.id.split(':')[1] ?? null);
  else if (h.app) spatial.endTour(h.app.id);
}

export function SpotAction({ spot, onGo }: { spot: Hotspot; onGo: (h: Hotspot) => void }) {
  if (!spot.app && !spot.ask && !spot.video) return null;
  return (
    <button type="button" className="tour-go is-primary" onClick={() => onGo(spot)}>
      {spot.ask ? (
        <>
          <ChatsCircle weight="fill" aria-hidden="true" /> Ask the AI
        </>
      ) : spot.video ? (
        <>
          <Play weight="fill" aria-hidden="true" /> Watch in full view
        </>
      ) : (
        <>
          {spot.app!.label} <ArrowRight weight="bold" aria-hidden="true" />
        </>
      )}
    </button>
  );
}

export function Tour() {
  const at = useSpatial((s) => s.tourIndex);
  const target = useSpatial((s) => s.tourTarget);
  const narrate = useSpatial((s) => s.narrate);
  const [spot, setSpot] = useState<Hotspot | null>(null);
  /** The room's story card: open by default on larger screens, on request on phones. */
  const [info, setInfo] = useState(() => !isPhone());
  const stop = TOUR[at]!;
  const last = at === TOUR.length - 1;
  const app = stop.app ? CHAPTERS.find((c) => c.id === stop.app) : undefined;
  const spots = HOTSPOTS.filter((h) => h.station === stop.station);
  const count = spots.length;
  /** Only the living room is drawn (the camera stays there), so only its points sit on objects;
      every other stop lists its things as buttons on the card. */
  const roomsReady = useSpatial((s) => s.roomsReady);
  const here = roomsReady || stop.station === 'living' || stop.station === 'sofa' || stop.station === 'entry';

  // A new room closes any open details.
  useEffect(() => {
    setSpot(null);
    setInfo(!isPhone());
  }, [at]);
  useEffect(() => () => hotspotEls.clear(), []);
  // "Walk there in 3D" (from an app): go to that stop as soon as the other rooms are ready.
  const want = useSpatial((s) => s.tourWant);
  useEffect(() => {
    if (want == null || !roomsReady) return;
    spatial.set({ tourWant: null });
    spatial.tourTo(want, TOUR.length);
  }, [want, roomsReady]);

  // Read each room aloud as you arrive (only when the AI voice is on).
  useEffect(() => {
    if (!narrate) return;
    const t = window.setTimeout(() => speak(spot ? `${spot.title}. ${spot.text}` : `${stop.title}. ${stop.text}`), 600);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
    };
  }, [at, narrate, spot, stop.title, stop.text]);

  const openSpot = (h: Hotspot) => {
    playUi('open');
    setSpot((s) => (s?.id === h.id ? null : h));
  };
  const go = (h: Hotspot) => goSpot(h);

  return (
    <div className="tour">
      <header className="tour-top">
        <span className="tour-badge">House tour</span>
        {!roomsReady && (
          <span className="tour-badge is-loading" role="status">
            Opening the other rooms…
          </span>
        )}
        <button type="button" className="tour-skip" data-voice="skip tour" onClick={() => spatial.endTour('home')}>
          Skip to dashboard <X weight="bold" aria-hidden="true" />
        </button>
      </header>

      {here && <RoomPoints station={stop.station} open={spot?.id ?? null} onOpen={openSpot} />}

      {/* Rooms, on the left */}
      <nav className="tour-rooms" aria-label="Rooms">
        <button type="button" className="tour-arrow" aria-label="Previous" disabled={at === 0} onClick={() => spatial.tourStep(-1, TOUR.length)}>
          <ArrowUp weight="bold" />
        </button>
        <ol>
          {TOUR.map((t, i) => (
            <li key={t.station}>
              <button type="button" className={i === at ? 'is-on' : i < at ? 'is-past' : ''} aria-current={i === at ? 'step' : undefined} data-voice={t.room} onClick={() => spatial.tourTo(i, TOUR.length)}>
                <i aria-hidden="true" />
                <span>{t.room}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="tour-arrow" aria-label="Next" disabled={last} onClick={() => spatial.tourStep(1, TOUR.length)}>
          <ArrowDown weight="bold" />
        </button>
      </nav>

      {/* The story card, on the right */}
      {spot ? (
        <article key={spot.id} className="tour-card is-detail" style={{ '--tint': spot.tint ?? '#fff' } as CSSProperties} aria-live="polite">
          <button type="button" className="os-round is-sm tour-close" aria-label="Close" data-voice="close" onClick={() => (setSpot(null), setInfo(false))}>
            <X weight="bold" />
          </button>
          <button type="button" className="tour-back" onClick={() => (setSpot(null), setInfo(true))}>
            <ArrowLeft weight="bold" aria-hidden="true" /> About this room
          </button>
          <span className="tour-n">{spot.kicker}</span>
          <h2>{spot.title}</h2>
          <div className="tour-body">
            <p>{spot.text}</p>
            {spot.items && (
              <ul className="tour-list">
                {spot.items.map((x, i) => (
                  <li key={x} style={{ '--i': i } as CSSProperties}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <footer className="tour-actions">
            <button type="button" className="os-round" aria-label="Read this aloud" onClick={() => speak(`${spot.title}. ${spot.text}`)}>
              <SpeakerHigh weight="bold" />
            </button>
            <SpotAction spot={spot} onGo={go} />
          </footer>
        </article>
      ) : !info ? (
        <div className="tour-mini" role="status">
          <span>
            <b>{stop.room}</b>
            <small>{count > 0 ? `${count} thing${count > 1 ? 's' : ''} to explore` : `${at + 1} of ${TOUR.length}`}</small>
          </span>
          <button type="button" className="tour-go" data-voice="about this room" onClick={() => setInfo(true)}>
            <Info weight="bold" aria-hidden="true" /> About
          </button>
        </div>
      ) : (
        <article key={at} className="tour-card" aria-live="polite">
          <button type="button" className="os-round is-sm tour-close" aria-label="Close" data-voice="close" onClick={() => setInfo(false)}>
            <X weight="bold" />
          </button>
          {stop.image && (
            <figure className="tour-img">
              <img src={stop.image} alt="" style={{ objectPosition: stop.focus ?? '50% 50%' }} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
              <figcaption>
                {String(at + 1).padStart(2, '0')} / {String(TOUR.length).padStart(2, '0')}
              </figcaption>
            </figure>
          )}
          <span className="tour-n">{stop.room}</span>
          <h2>{stop.title}</h2>
          <div className="tour-body">
            <p>{stop.text}</p>
            {stop.items && (
              <ul className="tour-items">
                {stop.items.map((x, i) => (
                  <li key={x} style={{ '--i': i } as CSSProperties}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {count > 0 && (
            <div className="tour-explore">
              <span>
                <HandPointing weight="fill" aria-hidden="true" /> Explore
              </span>
              <div className="tour-chips">
                {spots.map((h) => (
                  <button key={h.id} type="button" className="tour-chip" style={{ '--tint': h.tint ?? '#fff' } as CSSProperties} data-voice={h.label} onClick={() => openSpot(h)}>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <footer className="tour-actions">
            <button type="button" className="os-round" aria-label="Read this room aloud" onClick={() => speak(`${stop.title}. ${stop.text}`)}>
              <SpeakerHigh weight="bold" />
            </button>
            {last ? (
              <button type="button" className="tour-go is-primary" data-voice="open dashboard" onClick={() => spatial.endTour('home')}>
                <SquaresFour weight="fill" aria-hidden="true" /> Open his dashboard
              </button>
            ) : stop.app?.startsWith('experience') ? (
              <button type="button" className="tour-go is-primary" data-voice="open activities and experience" onClick={() => openExperience(stop.app!.split(':')[1] ?? null)}>
                Watch and read more <ArrowRight weight="bold" aria-hidden="true" />
              </button>
            ) : stop.app === 'pavilion' ? (
              <button type="button" className="tour-go is-primary" data-voice="enter the pavilion" onClick={() => openPavilion()}>
                Enter the pavilion <ArrowRight weight="bold" aria-hidden="true" />
              </button>
            ) : (
              app && (
                <button type="button" className="tour-go" data-voice={`open ${app.title}`} onClick={() => spatial.endTour(app.id)}>
                  Open {app.title} <ArrowRight weight="bold" aria-hidden="true" />
                </button>
              )
            )}
          </footer>
        </article>
      )}

      {/* Move through the house with a joystick: push up or down for the next or previous room,
          hold left or right to turn. */}
      <Joystick canNext={!last} canBack={at > 0} />

      <div className="tour-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${Math.min(1, target / (TOUR.length - 1))})` }} />
      </div>
      {at === 0 && (
        <p className="tour-hint">
          <span className="tour-mouse" aria-hidden="true" /> Swipe or use the arrows to walk room to room
        </p>
      )}
    </div>
  );
}

/** A thumb joystick: drag the knob up or down to walk to the next or previous room, and hold it
 *  left or right to turn. Arrow keys do the same when it has focus. */
function Joystick({ canNext, canBack }: { canNext: boolean; canBack: boolean }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const fired = useRef(false);
  const turnX = useRef(0);
  const timer = useRef(0);
  const R = 40;

  const step = (dir: 1 | -1) => {
    if ((dir === 1 && !canNext) || (dir === -1 && !canBack)) return;
    spatial.tourStep(dir, TOUR.length);
  };
  const startTurning = () => {
    if (timer.current) return;
    timer.current = window.setInterval(() => {
      if (Math.abs(turnX.current) > 0.25) window.dispatchEvent(new CustomEvent('sp-look', { detail: -turnX.current * 0.32 }));
    }, 60);
  };
  const stopTurning = () => {
    window.clearInterval(timer.current);
    timer.current = 0;
    turnX.current = 0;
  };
  useEffect(() => stopTurning, []);

  const moveTo = (cx: number, cy: number) => {
    const r = base.current!.getBoundingClientRect();
    let dx = cx - (r.left + r.width / 2);
    let dy = cy - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    setKnob({ x: dx, y: dy, active: true });
    turnX.current = dx / R;
    // A firm push up or down walks one room; let go (or come back to the middle) to walk again.
    if (!fired.current && Math.abs(dy) > R * 0.7 && Math.abs(dy) > Math.abs(dx)) {
      fired.current = true;
      step(dy < 0 ? 1 : -1);
    } else if (Math.hypot(dx, dy) < R * 0.3) fired.current = false;
  };
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    fired.current = false;
    moveTo(e.clientX, e.clientY);
    startTurning();
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (knob.active) moveTo(e.clientX, e.clientY);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setKnob({ x: 0, y: 0, active: false });
    fired.current = false;
    stopTurning();
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') step(1);
    else if (e.key === 'ArrowDown') step(-1);
    else if (e.key === 'ArrowLeft') window.dispatchEvent(new CustomEvent('sp-look', { detail: 0.6 }));
    else if (e.key === 'ArrowRight') window.dispatchEvent(new CustomEvent('sp-look', { detail: -0.6 }));
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={base}
      className={`tour-stick ${knob.active ? 'is-active' : ''}`}
      role="application"
      tabIndex={0}
      aria-label="Joystick: push up for the next room, down for the previous room, left or right to turn. Arrow keys work too."
      data-voice="joystick"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <svg className="tour-stick-arrows" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M60 14 l-6 7 h12 z" className={canNext ? '' : 'is-off'} />
        <path d="M60 106 l-6 -7 h12 z" className={canBack ? '' : 'is-off'} />
        <path d="M14 60 l7 -6 v12 z" />
        <path d="M106 60 l-7 -6 v12 z" />
      </svg>
      <span className="tour-stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} aria-hidden="true" />
    </div>
  );
}
