import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowClockwise,
  CornersOut,
  SquaresFour,
  Brain,
  Briefcase,
  ChalkboardTeacher,
  ChartLineUp,
  ChatsCircle,
  ClosedCaptioning,
  Database,
  Flask,
  FirstAid,
  Flower,
  MapTrifold,
  Guitar,
  HandFist,
  HandWaving,
  Microphone,
  Moon,
  Pause,
  Play,
  SkipForward,
  Sparkle,
  SpeakerHigh,
  SpeakerSimpleSlash,
  Sun,
  SunHorizon,
  SwimmingPool,
  Target,
  UserCircle,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import { activities, profile, volunteering } from '@/content/portfolio';
import { createGuitar, TRACKS, type GuitarEngine, type GuitarState, type TrackId } from '../fun';
import { CHAPTERS } from '../story/chapters';
import { speak } from '../story/narrator';
import { appCalcTexture, appDashboardTexture, appStockTexture } from '../house/Story3D';
import { playUi, spatial, useSpatial } from '../store';
import { askAI } from './Dashboard';
import { envNow } from './localTime';
import { storyById } from './media';


/** The app screens (Oncure, Finance, Games, Activities), the Home View and the Control Center. */

const st = (i: number, extra?: CSSProperties) => ({ '--i': i, ...extra }) as CSSProperties;
const chapter = (id: string) => CHAPTERS.find((x) => x.id === id)!;

function Actions({ id, ask }: { id: string; ask: string }) {
  return (
    <div className="os-app-actions">
      <button type="button" className="os-chip" data-voice="listen" onClick={() => speak(chapter(id).say)}>
        <SpeakerHigh weight="bold" aria-hidden="true" /> Listen
      </button>
      <button type="button" className="os-chip" data-voice="ask ai" onClick={() => askAI(ask)}>
        <ChatsCircle weight="bold" aria-hidden="true" /> Ask AI
      </button>
    </div>
  );
}

// --- Finance: three screens angled round the visitor ------------------------------------------


const SCREENS = [
  { k: 'Dashboard', alt: 'Concept screen: dashboard with holdings, their buy or sell stage, pending orders and top performers', line: 'Your holdings and the buy or sell stage each is at, pending buys and sells, and top performers you may like.' },
  { k: 'AI advice', alt: 'Concept screen: a stock graph with the AI advice beside it', line: 'Next to the graph: how much to buy, when to buy and an estimated time to sell, from an AI model using real-world data.' },
  { k: 'Calculator', alt: 'Concept screen: the AI amount and timing calculator', line: 'AI calculators for the best amount to buy and when to buy or sell. Hypothetical, not financial advice.' },
];

/** The concept screens, drawn once and kept (drawing and encoding them takes a moment). */
let shotCache: string[] | null = null;
function financeShots() {
  shotCache ??= [appDashboardTexture(), appStockTexture(), appCalcTexture()].map((t) => {
    const url = (t.image as HTMLCanvasElement).toDataURL('image/jpeg', 0.88);
    t.dispose();
    return url;
  });
  return shotCache;
}

export function FinanceApp() {
  const img = storyById('finance')!.image;
  const [screen, setScreen] = useState(0);
  const shots = financeShots();
  return (
    <div className="os-scene fi">
      <section className="os-pane is-side is-left fi-how" style={st(1)}>
        <p className="os-label">How it would work</p>
        {[
          { icon: Database, k: 'Real-world data', v: 'The app reads market data' },
          { icon: Brain, k: 'An AI model', v: 'Looks for patterns in it' },
          { icon: Target, k: 'A suggestion', v: 'How much to buy, when to buy, when to sell' },
        ].map(({ icon: I, k, v }, i) => (
          <div key={k} className="fi-flow" style={st(i + 2)}>
            <span className="fi-flow-ico">
              <I weight="duotone" aria-hidden="true" />
            </span>
            <span>
              <b>{k}</b>
              <small>{v}</small>
            </span>
          </div>
        ))}
      </section>

      <section className="os-pane fi-main" style={st(0)}>
        <header className="fi-head">
          <span className="os-app-ico" style={{ background: chapter('finance').tint }}>
            <ChartLineUp weight="fill" aria-hidden="true" />
          </span>
          <div>
            <h2>AI trading app</h2>
            <p>A beginner-friendly stock trading website · in progress</p>
          </div>
          <Actions id="finance" ask="What is his trading app?" />
        </header>
        <div className="fi-screens">
          <div className="fi-tabs" role="tablist" aria-label="App screens">
            {SCREENS.map((x, i) => (
              <button key={x.k} type="button" role="tab" aria-selected={screen === i} className={screen === i ? 'is-on' : ''} data-voice={x.k} onClick={() => setScreen(i)}>
                {x.k}
              </button>
            ))}
            <span className="sc-tag">Concept design · sample data</span>
          </div>
          <figure className="fi-shot" key={screen}>
            <img src={shots[screen]} alt={SCREENS[screen]!.alt} />
          </figure>
          <p className="fi-caption">{SCREENS[screen]!.line}</p>
        </div>
      </section>

      <section className="os-pane is-side is-right fi-about" style={st(2)}>
        <figure className="fi-img">
          <img src={img} alt="Market charts on a trading screen" />
        </figure>
        <p className="os-label">Made for beginners</p>
        <p className="fi-text">People buying their first stock get clear, simple suggestions instead of a wall of numbers.</p>
        <span className="on-status">In progress · launch date to be supplied</span>
        <small className="fi-fine">Suggestions are hypothetical, not financial advice.</small>
      </section>
    </div>
  );
}

// --- Games --------------------------------------------------------------------------------------

/** The games (and their sounds) are downloaded the first time Games is opened. */
const GamesHub = lazy(() => import('./games/Games').then((m) => ({ default: m.GamesHub })));

export function GamesApp() {
  return (
    <div className="os-scene gm">
      <Suspense fallback={<p className="os-loading" role="status">Opening the games…</p>}>
        <GamesHub />
      </Suspense>
    </div>
  );
}

// --- Activities: a media player for his guitar pieces, with everything else he does ------------

const ACT_ICONS: [RegExp, typeof Flask][] = [
  [/swim/i, SwimmingPool],
  [/muay|martial/i, HandFist],
  [/olympiad|science/i, Flask],
  [/deca|business/i, Briefcase],
  [/guitar|music/i, Guitar],
  [/medical|camp/i, FirstAid],
  [/temple/i, Flower],
  [/tutor/i, ChalkboardTeacher],
];
const iconFor = (t: string) => ACT_ICONS.find(([r]) => r.test(t))?.[1] ?? Sparkle;
const ACTS = [
  ...activities.map((a) => ({ t: a.title, s: a.role, kind: 'Activity' })),
  ...volunteering.map((v) => ({ t: v.title, s: v.role, kind: 'Giving back' })),
];

function useGuitar() {
  const eng = useRef<GuitarEngine | null>(null);
  const [state, setState] = useState<GuitarState>({ playing: false, paused: false, current: null });
  const [frac, setFrac] = useState(0);
  const get = () => {
    if (!eng.current) {
      const e = createGuitar();
      e.onChange(setState);
      e.onProgress((p) => setFrac(p.fraction));
      eng.current = e;
    }
    return eng.current;
  };
  useEffect(
    () => () => {
      eng.current?.dispose();
      eng.current = null;
    },
    [],
  );
  return { get, state, frac, analyser: () => eng.current?.analyser ?? null };
}

function Visualizer({ analyser, on }: { analyser: () => AnalyserNode | null; on: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bars = ref.current ? [...ref.current.children] as HTMLElement[] : [];
    let raf = 0;
    const data = new Uint8Array(64);
    // Moves only while music plays; otherwise the bars rest in a gentle wave (no redraws).
    const tick = () => {
      const a = analyser();
      const live = !!a && on;
      if (live) a.getByteFrequencyData(data);
      bars.forEach((b, i) => {
        const v = live ? data[2 + i]! / 255 : 0.08 + Math.sin(i * 0.5) * 0.04;
        b.style.transform = `scaleY(${Math.max(0.04, v)})`;
      });
      if (on) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [analyser, on]);
  return (
    <div ref={ref} className="ac-vis" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

export function ActivitiesApp() {
  const g = useGuitar();
  const [sel, setSel] = useState<TrackId>(TRACKS[0]!.id);
  const track = TRACKS.find((t) => t.id === (g.state.current ?? sel))!;
  const playing = g.state.playing && !g.state.paused;
  const img = storyById('guitar')!.image;
  const toggle = () => {
    const e = g.get();
    if (!g.state.current) void e.play(sel);
    else void e.toggle();
  };
  return (
    <div className="os-scene ac">
      <section className="os-pane ac-main">
        <div className={`ac-player ${playing ? 'is-playing' : ''}`}>
          <img src={img} alt="" />
          <span className="ac-shade" />
          <Visualizer analyser={g.analyser} on={playing} />
          <button type="button" className="ac-big" aria-label={playing ? 'Pause' : 'Play'} data-voice={playing ? 'pause' : 'play'} onClick={toggle}>
            {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
          </button>
          <div className="ac-bar">
            <button type="button" className="os-round is-sm" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
              {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
            </button>
            <button type="button" className="os-round is-sm" aria-label="Next track" data-voice="next track" onClick={() => void g.get().next()}>
              <SkipForward weight="fill" />
            </button>
            <span className="ac-progress">
              <i style={{ transform: `scaleX(${g.frac})` }} />
            </span>
            <small>{Math.round(track.duration)}s loop</small>
          </div>
        </div>
        <div className="ac-info">
          <div>
            <h2>
              {track.title} <small>(original, generated)</small>
            </h2>
            <p>
              {track.style} · synthesised in your browser
            </p>
          </div>
          <Actions id="activities" ask="What are his activities?" />
        </div>
        <p className="ac-desc">Shreyas has played guitar since 2021 at Atlanta Piano Fortissimo. These pieces are original and generated live, not recordings of him.</p>
      </section>
      <aside className="os-pane ac-side">
        <p className="os-label">Up next</p>
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`ac-track ${t.id === track.id ? 'is-on' : ''}`}
            style={st(i)}
            data-voice={t.title}
            onClick={() => {
              setSel(t.id);
              playUi('tap');
              void g.get().play(t.id);
            }}
          >
            <span className="ac-thumb" style={{ backgroundImage: `url(${img})` }}>
              {t.id === track.id && playing ? <i className="ac-eq" /> : <Play weight="fill" />}
            </span>
            <span>
              <b>{t.title}</b>
              <small>
                {t.style}
              </small>
            </span>
          </button>
        ))}
        <p className="os-label">Beyond class</p>
        <div className="ac-acts">
          {ACTS.map((a, i) => {
            const I = iconFor(a.t);
            return (
              <article key={a.t} className="ac-act" style={st(i + 2)} tabIndex={0} title={`${a.t}: ${a.s}`}>
                <span className="ac-act-ico">
                  <I weight="duotone" aria-hidden="true" />
                </span>
                <span>
                  <b>{a.t}</b>
                  <small>{a.s}</small>
                </span>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

// --- Home View ----------------------------------------------------------------------------------

export function HomeView() {
  return (
    <div className="os-homeview" role="dialog" aria-label="Home View" onClick={(e) => e.target === e.currentTarget && spatial.set({ homeView: false })}>
      <div className="os-hv-grid">
        <button type="button" className="os-hv-app" style={st(0)} data-voice="profile" onClick={() => (spatial.set({ homeView: false }), spatial.openWindow('profile'))}>
          <span className="os-hv-ico is-photo">
            <img src={profile.portrait} alt="" />
          </span>
          <small>Profile</small>
        </button>
        <button type="button" className="os-hv-app" style={st(1)} data-voice="contact" onClick={() => (spatial.set({ homeView: false }), spatial.openWindow('contact'))}>
          <span className="os-hv-ico" style={{ '--tint': '#1f4dff' } as CSSProperties}>
            <EnvelopeSimple weight="fill" aria-hidden="true" />
          </span>
          <small>Contact</small>
        </button>
        {CHAPTERS.map((c, i) => {
          const I = c.icon;
          return (
            <button key={c.id} type="button" className="os-hv-app" style={st(i + 2)} data-voice={c.title} onClick={() => spatial.goChapter(c.id)}>
              <span className="os-hv-ico" style={{ '--tint': c.tint } as CSSProperties}>
                <I weight="fill" aria-hidden="true" />
              </span>
              <small>{c.title}</small>
            </button>
          );
        })}
      </div>
      <p className="os-hv-hint">Pick an app, or say its name</p>
    </div>
  );
}

// --- Control Center -----------------------------------------------------------------------------

export function ControlCenter({ voice, hands, setHands, replayIntro }: { voice: { supported: boolean; listening: boolean; start: () => void; stop: () => void }; hands: boolean; setHands: (on: boolean) => void; replayIntro: () => void }) {
  const env = useSpatial((s) => s.env);
  const envAuto = useSpatial((s) => s.envAuto);
  const narrate = useSpatial((s) => s.narrate);
  const sound = useSpatial((s) => s.sound);
  const auto = useSpatial((s) => s.auto);
  const tiles = [
    { k: 'Narrator', on: narrate, icon: ClosedCaptioning, act: () => spatial.setNarrate(!narrate) },
    { k: 'Sound', on: sound, icon: sound ? SpeakerHigh : SpeakerSimpleSlash, act: () => spatial.set({ sound: !sound }) },
    { k: 'Voice', on: voice.listening, icon: Microphone, act: () => (spatial.set({ control: false }), voice.listening ? voice.stop() : voice.start()) },
    { k: 'Hands', on: hands, icon: HandWaving, act: () => setHands(!hands) },
    { k: 'Profile', on: false, icon: UserCircle, act: () => (spatial.set({ control: false }), spatial.openWindow('profile')) },
    { k: 'Contact', on: false, icon: EnvelopeSimple, act: () => (spatial.set({ control: false }), spatial.openWindow('contact')) },
    { k: 'House tour', on: false, icon: MapTrifold, act: () => (spatial.set({ control: false }), replayIntro()) },
    { k: auto ? 'Stop reading' : 'Read apps aloud', on: auto, icon: Play, act: () => (auto ? spatial.pause() : spatial.play()) },
    // The toolbar's other actions, so on phones this one panel holds every control.
    { k: 'Home View', on: false, icon: SquaresFour, act: () => spatial.set({ control: false, homeView: true }) },
    {
      k: 'Full view',
      on: false,
      icon: CornersOut,
      act: () => {
        spatial.set({ control: false });
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.().catch(() => spatial.toast('Full view is not available in this browser'));
      },
    },
    { k: 'Refresh', on: false, icon: ArrowClockwise, act: () => window.location.reload() },
  ];
  return (
    <div className="os-cc" role="dialog" aria-label="Control Center">
      <p className="os-label">Light</p>
      <div className="os-cc-env" role="radiogroup" aria-label="Light">
        <button type="button" role="radio" aria-checked={envAuto} className={envAuto ? 'is-on' : ''} data-voice="auto light" onClick={() => spatial.set({ envAuto: true, env: envNow() })}>
          <Sparkle weight={envAuto ? 'fill' : 'bold'} aria-hidden="true" />
          Auto
        </button>
        {(
          [
            ['day', 'Day', Sun],
            ['sunset', 'Sunset', SunHorizon],
            ['night', 'Night', Moon],
          ] as const
        ).map(([id, k, I]) => (
          <button key={id} type="button" role="radio" aria-checked={!envAuto && env === id} className={!envAuto && env === id ? 'is-on' : ''} data-voice={k} onClick={() => spatial.set({ env: id, envAuto: false })}>
            <I weight={env === id ? 'fill' : 'bold'} aria-hidden="true" />
            {k}
          </button>
        ))}
      </div>
      <p className="os-cc-note">{envAuto ? 'Following the time of day in Georgia' : 'Chosen by you · tap Auto to follow the clock'}</p>
      <div className="os-cc-grid">
        {tiles.map(({ k, on, icon: I, act }, i) => (
          <button key={k} type="button" className={`os-cc-tile ${on ? 'is-on' : ''}`} style={st(i)} aria-pressed={on} onClick={act}>
            <I weight={on ? 'fill' : 'bold'} aria-hidden="true" />
            <small>{k}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

