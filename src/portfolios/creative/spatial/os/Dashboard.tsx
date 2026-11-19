import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Reach } from '@/features/details/Reach';
import { ArrowRight, ArrowsOutCardinal, EnvelopeSimple, Briefcase, ChatsCircle, Dna, Flask, GameController, Guitar, HandFist, Moon, Play, PushPin, Sparkle, Sun, SunHorizon, SwimmingPool, Trophy, X } from '@phosphor-icons/react';
import { achievements, activities, profile } from '@/content/portfolio';
import { spatial, useSpatial } from '../store';
import { useDrag } from './dnd';
import { envNow, fmtDate, fmtTime, sunTimes } from './localTime';
import { AWARDS, PORTRAIT_STUDIO, STORIES, storyById } from './media';

/**
 * The dashboard: separate glass cards floating in the room (no single window, nothing to
 * scroll), each one a topic: his profile, Oncure, the time and light, the trading app, awards,
 * the pinboard, the AI, games and guitar. Every card can be picked up and dropped on another to
 * swap places (they glide into their new spots), or dropped on the pinboard. Tap a card to open it.
 */

const st = (i: number, extra?: CSSProperties) => ({ '--i': i, ...extra }) as CSSProperties;

export const openApp = (app: string) => (app === 'profile' ? spatial.openWindow('profile') : spatial.goChapter(app));

export function askAI(q: string) {
  spatial.set({ pendingAsk: q });
  spatial.goChapter('chat');
}

type WidgetId = 'profile' | 'oncure' | 'clock' | 'finance' | 'awards' | 'pinboard' | 'chat' | 'games' | 'music';
const DEFAULT: WidgetId[] = ['profile', 'oncure', 'clock', 'finance', 'awards', 'pinboard', 'chat', 'games', 'music'];
/** Slot shapes, in order: tall, wide, small, small, small, tall, small, small, small. */
const SLOT = ['tall', 'wide', 'small', 'small', 'small', 'tall', 'small', 'small', 'small'] as const;
const KEY = 'shreyas-spatial-board';
const TAP: Record<WidgetId, string> = { profile: 'profile', oncure: 'oncure', clock: '', finance: 'finance', awards: 'awards', pinboard: '', chat: 'chat', games: 'games', music: 'activities' };
const PIN_AS: Partial<Record<WidgetId, string>> = { profile: 'profile', oncure: 'oncure', finance: 'finance', awards: 'awards', games: 'games', music: 'guitar' };

function loadOrder(): WidgetId[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as WidgetId[] | null;
    if (Array.isArray(v) && v.length === DEFAULT.length && DEFAULT.every((d) => v.includes(d))) return v;
  } catch {
    /* storage blocked */
  }
  return DEFAULT;
}

// --- Widgets ------------------------------------------------------------------------------------

function Head({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <header className="w-head">
      <span className="w-ico">{icon}</span>
      <span>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
    </header>
  );
}

function ProfileW() {
  return (
    <>
      <img className="w-portrait" src={PORTRAIT_STUDIO} alt={`${profile.name}, in a dark suit and blue tie`} draggable={false} />
      <div className="w-portrait-text">
        <b>{profile.name}</b>
        <small>
          {profile.grade} · {profile.school}
        </small>
        <div className="w-stats">
          <span>
            <b>Top 99%</b>
            <small>PSAT</small>
          </span>
          <span>
            <b>Top 99%</b>
            <small>MAP</small>
          </span>
          <span>
            <b>{achievements.length}</b>
            <small>Awards</small>
          </span>
        </div>
        <div className="w-row">
          <button type="button" className="os-chip is-solid" data-voice="open profile" onClick={() => spatial.openWindow('profile')}>
            Profile <ArrowRight weight="bold" aria-hidden="true" />
          </button>
          <button type="button" className="os-chip" data-voice="ask about him" onClick={() => askAI('Who is Shreyas?')}>
            <ChatsCircle weight="bold" aria-hidden="true" /> Ask
          </button>
          <button type="button" className="os-chip" data-voice="contact" onClick={() => spatial.openWindow('contact')}>
            <EnvelopeSimple weight="bold" aria-hidden="true" /> Message
          </button>
        </div>
        <Reach tone="auto" compact short className="w-reach" />
      </div>
    </>
  );
}

function OncureW() {
  const img = storyById('oncure')!.image;
  return (
    <div className="w-split">
      <figure className="w-media">
        <img src={img} alt="A microscope in a research laboratory" draggable={false} />
        <span className="w-tag">Photo · lab</span>
        <span className="w-pulse" style={{ left: '62%', top: '44%' }} />
        <span className="w-pulse" style={{ left: '30%', top: '58%', animationDelay: '0.8s' }} />
      </figure>
      <div className="w-split-text">
        <Head icon={<Dna weight="fill" />} title="Oncure" sub="Research concept" />
        <p>AI-guided nanobots that could carry cancer therapy straight to tumour cells, sparing healthy tissue.</p>
        <div className="w-row">
          <button type="button" className="os-chip is-solid" data-voice="open oncure" onClick={() => spatial.goChapter('oncure')}>
            Explore <ArrowRight weight="bold" aria-hidden="true" />
          </button>
          <button type="button" className="os-chip" onClick={() => askAI('Tell me about Oncure')}>
            <ChatsCircle weight="bold" aria-hidden="true" /> Ask
          </button>
        </div>
      </div>
    </div>
  );
}

function ClockW() {
  const [now, setNow] = useState(() => new Date());
  const env = useSpatial((s) => s.env);
  const auto = useSpatial((s) => s.envAuto);
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000 * 15);
    return () => window.clearInterval(t);
  }, []);
  const { sunrise, sunset } = sunTimes(now);
  const I = env === 'day' ? Sun : env === 'sunset' ? SunHorizon : Moon;
  return (
    <>
      <div className="w-clock-top">
        <span className={`w-sky is-${env}`}>
          <I weight="fill" aria-hidden="true" />
        </span>
        <span>
          <b className="w-time">{fmtTime(now)}</b>
          <small>{fmtDate(now)} · Georgia</small>
        </span>
      </div>
      <div className="w-sun">
        <span>
          <Sun weight="bold" aria-hidden="true" /> {fmtTime(sunrise)}
        </span>
        <span>
          <SunHorizon weight="bold" aria-hidden="true" /> {fmtTime(sunset)}
        </span>
      </div>
      <button
        type="button"
        className="w-switch"
        role="switch"
        aria-checked={auto}
        data-voice="auto light"
        onClick={() => spatial.set(auto ? { envAuto: false } : { envAuto: true, env: envNow() })}
      >
        <span>Light follows the time</span>
        <i aria-hidden="true" />
      </button>
    </>
  );
}

/** A sample price line for the card (made up, like everything on the concept screens). */
const LINE = [22, 26, 24, 31, 29, 35, 33, 40, 37, 44, 48, 45, 52, 57];
const FIN_ROWS = [
  { t: 'NOVA', stage: 'Holding', v: '+4.2%', up: true },
  { t: 'ORBT', stage: 'Buying · 2 of 3', v: '+1.8%', up: true },
  { t: 'LUMA', stage: 'Sell window soon', v: '−0.9%', up: false },
];
function FinanceW() {
  const max = Math.max(...LINE);
  const min = Math.min(...LINE);
  const pts = LINE.map((v, i) => [(i / (LINE.length - 1)) * 100, 36 - ((v - min) / (max - min)) * 30] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1]!;
  return (
    <>
      <Head icon={<span className="w-ico-txt">$</span>} title="Stock Trading Application" sub="Concept design" />
      <div className="w-fin">
        <div className="w-fin-chart">
          <div className="w-fin-val">
            <small>Sample portfolio</small>
            <b>$12,480.36</b>
            <em>▲ 2.4% today</em>
          </div>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="w-fin-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2fd18b" stopOpacity="0.45" />
                <stop offset="1" stopColor="#2fd18b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L100 40 L0 40 Z`} fill="url(#w-fin-fill)" />
            <path className="w-fin-line" d={line} pathLength={1} />
          </svg>
          <i className="w-fin-dot" style={{ left: `${lx}%`, top: `${(ly / 40) * 100}%` }} aria-hidden="true" />
          <span className="w-fin-ai">
            <Sparkle weight="fill" aria-hidden="true" /> AI: hold NOVA, review LUMA
          </span>
        </div>
        <ul className="w-fin-rows">
          {FIN_ROWS.map((r, i) => (
            <li key={r.t} style={st(i)}>
              <b>{r.t}</b>
              <small>{r.stage}</small>
              <em className={r.up ? 'is-up' : 'is-down'}>{r.v}</em>
            </li>
          ))}
        </ul>
      </div>
      <small className="w-note">Concept design · sample data · not financial advice</small>
    </>
  );
}

function AwardsW() {
  const top = AWARDS.slice(0, 3);
  return (
    <>
      <Head icon={<Trophy weight="fill" />} title="Awards" sub={`${AWARDS.length} achievements`} />
      <div className="w-fan">
        {top.map((a, i) => (
          <img key={a.id} src={a.image} alt="" draggable={false} style={st(i, { '--r': `${(i - 1) * 9}deg` } as CSSProperties)} />
        ))}
      </div>
      <small className="w-note">{AWARDS[0]?.title}</small>
    </>
  );
}

function PinboardW() {
  const pinned = useSpatial((s) => s.pinned);
  return (
    <>
      <Head icon={<PushPin weight="fill" />} title="Pinboard" sub="Drop any card here" />
      <div className="w-pins">
        {pinned.length === 0 && <p className="os-empty">Drag a card onto this board</p>}
        {pinned.map((id, i) => {
          const c = storyById(id);
          if (!c) return null;
          return (
            <div key={id} className="w-pin" style={st(i)}>
              <button type="button" data-voice={`open ${c.title}`} onClick={() => openApp(c.app)}>
                <img src={c.image} alt="" draggable={false} />
                <span>
                  <b>{c.title}</b>
                  <small>{c.sub}</small>
                </span>
              </button>
              <button type="button" className="w-pin-x" aria-label={`Unpin ${c.title}`} onClick={() => spatial.unpin(id)}>
                <X weight="bold" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ChatW() {
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    askAI(q.trim() || 'Who is Shreyas?');
  };
  return (
    <>
      <Head icon={<Sparkle weight="fill" />} title="Shreyas AI" sub="Ask anything about him" />
      <form className="w-ask" onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about his research…" aria-label="Ask the AI" />
        <button type="submit" aria-label="Ask">
          <ArrowRight weight="bold" />
        </button>
      </form>
      <div className="w-row is-wrap">
        {['His awards', 'His goals'].map((x) => (
          <button key={x} type="button" className="os-chip is-soft" onClick={() => askAI(`What are ${x.toLowerCase()}?`)}>
            {x}
          </button>
        ))}
      </div>
    </>
  );
}

function GamesW() {
  const img = STORIES.find((s) => s.id === 'games')!.image;
  return (
    <>
      <img className="w-bg" src={img} alt="" draggable={false} />
      <div className="w-over">
        <Head icon={<GameController weight="fill" />} title="Games" sub="Four games from his story" />
        <button type="button" className="os-chip is-solid" data-voice="play games" onClick={() => spatial.goChapter('games')}>
          <Play weight="fill" aria-hidden="true" /> Play
        </button>
      </div>
    </>
  );
}

const ACT_ICON: [RegExp, typeof Guitar][] = [
  [/swim/i, SwimmingPool],
  [/muay/i, HandFist],
  [/guitar/i, Guitar],
  [/olympiad/i, Flask],
  [/deca/i, Briefcase],
];

/** All his activities, with the guitar player one tap away. */
function MusicW() {
  const img = storyById('guitar')!.image;
  return (
    <>
      <img className="w-bg is-faint" src={img} alt="" draggable={false} />
      <div className="w-over is-acts">
        <Head icon={<Guitar weight="fill" />} title="Activities" sub="Sport, music and competition" />
        <ul className="w-acts">
          {activities.map((a, i) => {
            const I = ACT_ICON.find(([r]) => r.test(a.title))?.[1] ?? Guitar;
            return (
              <li key={a.title} style={st(i)}>
                <I weight="duotone" aria-hidden="true" />
                <span>
                  <b>{a.title}</b>
                  <small>{a.role}</small>
                </span>
              </li>
            );
          })}
        </ul>
        <button type="button" className="os-chip is-solid" data-voice="open activities" onClick={() => spatial.goChapter('activities')}>
          <Play weight="fill" aria-hidden="true" /> Open activities
        </button>
      </div>
    </>
  );
}

const BODY: Record<WidgetId, () => ReactNode> = {
  profile: () => <ProfileW />,
  oncure: () => <OncureW />,
  clock: () => <ClockW />,
  finance: () => <FinanceW />,
  awards: () => <AwardsW />,
  pinboard: () => <PinboardW />,
  chat: () => <ChatW />,
  games: () => <GamesW />,
  music: () => <MusicW />,
};

const LABEL: Record<WidgetId, string> = { profile: 'Profile', oncure: 'Oncure', clock: 'Time and light', finance: 'Stock trading app', awards: 'Awards', pinboard: 'Pinboard', chat: 'AI chat', games: 'Games', music: 'Activities' };

function Widget({ id, slot, swap, k }: { id: WidgetId; slot: number; swap: (a: WidgetId, b: WidgetId) => void; k: number }) {
  const drag = useDrag({
    id,
    onTap: () => TAP[id] && openApp(TAP[id]),
    onDrop: (zone, _id, target) => {
      if (zone === 'pin') {
        const pinAs = PIN_AS[id];
        if (pinAs) {
          spatial.pin(pinAs);
          spatial.toast(`Pinned “${LABEL[id]}”`);
        } else spatial.toast('That card can’t be pinned, but you can move it');
        return;
      }
      const other = target.dataset.widget as WidgetId | undefined;
      if (other && other !== id) swap(id, other);
    },
  });
  // A soft highlight that follows the pointer, like light on glass.
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <article
      className={`os-w is-${SLOT[slot]} w-${id} slot-${slot}`}
      style={st(k)}
      data-widget={id}
      data-drop={id === 'pinboard' ? 'pin' : 'slot'}
      data-voice={LABEL[id]}
      aria-label={`${LABEL[id]}. Drag to move it`}
      tabIndex={0}
      onPointerMove={onMove}
      {...drag}
    >
      <span className="w-grip" aria-hidden="true">
        <ArrowsOutCardinal weight="bold" />
      </span>
      {BODY[id]()}
    </article>
  );
}

export function Dashboard() {
  const [order, setOrder] = useState<WidgetId[]>(loadOrder);
  const board = useRef<HTMLDivElement>(null);
  const rects = useRef(new Map<string, DOMRect>());

  const swap = (a: WidgetId, b: WidgetId) => {
    // Remember where every card is, then let the layout change and glide them (FLIP).
    board.current?.querySelectorAll<HTMLElement>('[data-widget]').forEach((el) => rects.current.set(el.dataset.widget!, el.getBoundingClientRect()));
    setOrder((o) => {
      const n = [...o];
      const i = n.indexOf(a);
      const j = n.indexOf(b);
      [n[i], n[j]] = [n[j]!, n[i]!];
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {
        /* storage blocked */
      }
      return n;
    });
    spatial.toast(`Moved “${LABEL[a]}”`);
  };

  useLayoutEffect(() => {
    if (!rects.current.size) return;
    board.current?.querySelectorAll<HTMLElement>('[data-widget]').forEach((el) => {
      const before = rects.current.get(el.dataset.widget!);
      if (!before) return;
      const after = el.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      const sx = before.width / after.width;
      const sy = before.height / after.height;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      el.animate([{ translate: `${dx}px ${dy}px`, scale: `${sx} ${sy}`, transformOrigin: '0 0' }, { translate: '0 0', scale: '1 1', transformOrigin: '0 0' }], { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
    rects.current.clear();
  }, [order]);

  return (
    <div ref={board} className="os-board" aria-label="Dashboard: drag a card onto another to swap them">
      {order.map((id, slot) => (
        <Widget key={id} id={id} slot={slot} swap={swap} k={DEFAULT.indexOf(id)} />
      ))}
    </div>
  );
}
