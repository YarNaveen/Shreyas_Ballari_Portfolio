import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretDown, CaretLeft, CaretRight, HandWaving, MapTrifold, Microphone, MicrophoneSlash, SlidersHorizontal, SpeakerHigh, SpeakerSlash, SquaresFour, VirtualReality } from '@phosphor-icons/react';
import { useVoice } from '@/features/voice/useVoice';
import { CHAPTERS } from '../story/chapters';
import { playUi, spatial, useSpatial } from '../store';
import { ActivitiesApp, ControlCenter, FinanceApp, GamesApp, HomeView } from '../os/Apps';
import { Dashboard } from '../os/Dashboard';
import { ProfileWindow } from '../os/Profile';
import { OSWindow } from '../os/Window';
import { envNow } from '../os/localTime';
import { ChatBubble } from '../os/ChatBubble';
import { Tour } from '../os/Tour';
import { VideoOverlay } from '../os/VideoOverlay';
import { prefetchRooms } from '../house/prefetch';
import { runCommand } from './commands';
import { Hands } from './Hands';
import { VoiceControl } from './VoiceControl';

/**
 * The Liquid Glass layer over the 3D home, built like a spatial OS: the app rail (tab bar) on the
 * left, a capsule at the top with the app you are in and the guided tour, Home View and Control
 * Center at the top right, and the app itself in a floating window that swings in as you switch.
 * Mouse, touch, keyboard, voice and hands all drive the same actions.
 */

/**
 * The bigger apps are downloaded the first time they are opened (the browser keeps them after
 * that), so the home opens faster. A moment after the home is ready they are fetched quietly in
 * the background, so most visitors never wait for them.
 */
const loadOncure = () => import('../os/OncureApp');
const loadAwards = () => import('../os/Awards');
const loadChat = () => import('../os/Chat');
const OncureApp = lazy(() => loadOncure().then((m) => ({ default: m.OncureApp })));
const AwardsFlow = lazy(() => loadAwards().then((m) => ({ default: m.AwardsFlow })));
const Chat = lazy(() => loadChat().then((m) => ({ default: m.Chat })));
export function prefetchApps() {
  void loadOncure().catch(() => {});
  void loadAwards().catch(() => {});
  void loadChat().catch(() => {});
  void import('../os/games/Games').catch(() => {});
  prefetchRooms();
}

/** Shown for the moment an app is still downloading. */
export function AppLoading() {
  return (
    <div className="os-loading" role="status">
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <span>Opening…</span>
    </div>
  );
}

function AppBody({ id, expanded, setExpanded }: { id: string; expanded: string | null; setExpanded: (v: string | null) => void }) {
  const apps: Record<string, () => ReactNode> = {
    home: () => <Dashboard />,
    oncure: () => <OncureApp />,
    finance: () => <FinanceApp />,
    awards: () => <AwardsFlow expanded={expanded} onExpand={setExpanded} />,
    chat: () => <Chat />,
    games: () => <GamesApp />,
    activities: () => <ActivitiesApp />,
  };
  return <Suspense fallback={<AppLoading />}>{apps[id]?.()}</Suspense>;
}

/** The app window: deals the new app in, sweeps the previous one out. */
function Stage({ chapter, dir }: { chapter: number; dir: 1 | -1 }) {
  const [shown, setShown] = useState(chapter);
  const [leaving, setLeaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    if (chapter === shown) return;
    setLeaving(true);
    const t = window.setTimeout(() => {
      setShown(chapter);
      setLeaving(false);
      setExpanded(null);
    }, 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);
  const c = CHAPTERS[shown]!;
  const back = expanded ? () => setExpanded(null) : shown !== 0 ? () => spatial.goChapter('home') : undefined;
  const free = FREE.has(c.id);
  return (
    <div className={`os-stage ${leaving ? 'is-leaving' : ''} dir-${dir > 0 ? 'next' : 'prev'} is-${c.id}`} aria-live="polite">
      {free ? (
        <div key={shown} className={`os-free is-${c.id}`}>
          {back && (
            <button type="button" className="os-round os-back" aria-label="Back to the dashboard" data-voice="back" onClick={back}>
              <CaretLeft weight="bold" />
            </button>
          )}
          <AppBody id={c.id} expanded={expanded} setExpanded={setExpanded} />
        </div>
      ) : (
        <OSWindow key={`${shown}-${expanded ?? ''}`} id={c.id} title={expanded ? 'Award' : c.title} variant={c.id === 'chat' ? 'light' : 'dark'} className={`os-main is-${c.id} ${expanded ? 'is-expanded' : ''}`} onBack={back}>
          <div className="os-main-body">
            <AppBody id={c.id} expanded={expanded} setExpanded={setExpanded} />
          </div>
        </OSWindow>
      )}
    </div>
  );
}

/** Apps laid out as cards and screens floating in the room, rather than in one window. */
const FREE = new Set(['home', 'oncure', 'finance', 'activities', 'games']);

function Captions() {
  const cap = useSpatial((s) => s.caption);
  if (!cap) return null;
  // Show the sentence being spoken, with the current word lit.
  const text = cap.text;
  const start = Math.max(0, text.lastIndexOf('.', Math.max(0, cap.at - 1)) + 1);
  let end = text.indexOf('.', cap.at);
  end = end < 0 ? text.length : end + 1;
  const raw = text.slice(start, end);
  const sentence = raw.trim();
  const offset = cap.at - (start + (raw.length - raw.trimStart().length));
  const words = sentence.split(' ');
  let pos = 0;
  return (
    <p className="st-caption" role="status">
      {words.map((w, i) => {
        const on = offset >= pos && offset < pos + w.length + 1;
        pos += w.length + 1;
        return (
          <span key={i} className={on ? 'is-on' : ''}>
            {w}{' '}
          </span>
        );
      })}
    </p>
  );
}

export function SpatialUI({ replayIntro }: { replayIntro: () => void }) {
  const chapter = useSpatial((s) => s.chapter);
  const dir = useSpatial((s) => s.dir);
  const tour = useSpatial((s) => s.tour);
  /** The apps are tucked into the corner button during the tour. */
  const apps = tour;
  const toast = useSpatial((s) => s.toast);
  const dock = useSpatial((s) => s.dock);
  const windows = useSpatial((s) => s.windows);
  const homeView = useSpatial((s) => s.homeView);
  const control = useSpatial((s) => s.control);
  const envAuto = useSpatial((s) => s.envAuto);
  const narrate = useSpatial((s) => s.narrate);
  const [hands, setHands] = useState(false);
  /** The AI voice starts muted; ask once, after the splash. */
  const [asked, setAsked] = useState(false);
  /** The apps being drawn into the tour button, or coming back out of it. */
  const [genie, setGenie] = useState<'idle' | 'swallowing' | 'releasing'>('idle');
  const wasTour = useRef(tour);
  useEffect(() => {
    if (wasTour.current && !tour) {
      setGenie('releasing');
      playUi('open');
      const t = window.setTimeout(() => setGenie('idle'), 950);
      wasTour.current = tour;
      return () => window.clearTimeout(t);
    }
    wasTour.current = tour;
  }, [tour]);
  /** The corner button: swallow the apps and start the tour, or let them back out. */
  const tourButton = () => {
    if (tour) {
      spatial.endTour(CHAPTERS[spatial.get().chapter]?.id ?? 'home');
      return;
    }
    if (genie !== 'idle') return;
    setGenie('swallowing');
    playUi('close');
    window.setTimeout(() => {
      replayIntro();
      setGenie('idle');
    }, 760);
  };
  const ccRef = useRef<HTMLDivElement>(null);
  /** Voice mode (like hand mode): explained and agreed to first, then a live status panel. */
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');
  const voice = useVoice((text) => {
    const did = runCommand(text, { replayIntro, sound: (on) => spatial.set({ sound: on }), voiceOff: () => setVoiceOn(false) });
    setVoiceResult(did ?? 'Not sure what to do. Try “what can I say”');
  });
  const voiceMode = { ...voice, listening: voiceOn, start: () => setVoiceOn(true), stop: () => setVoiceOn(false) };
  // Fetch the bigger apps quietly once the home is on screen.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    const t = window.setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(prefetchApps, { timeout: 4000 }) : prefetchApps()), 3000);
    return () => window.clearTimeout(t);
  }, []);
  // The light follows the real time of day (checked every minute) until the visitor picks one.
  useEffect(() => {
    if (!envAuto) return;
    const tick = () => {
      const e = envNow();
      if (spatial.get().env !== e) spatial.set({ env: e });
    };
    tick();
    const t = window.setInterval(tick, 60000);
    return () => window.clearInterval(t);
  }, [envAuto]);
  // Close the Control Center when clicking elsewhere.
  useEffect(() => {
    if (!control) return;
    const off = (e: PointerEvent) => {
      const t = e.target;
      if (t instanceof Node && ccRef.current?.contains(t)) return;
      if (t instanceof HTMLElement && t.closest('[data-cc-toggle]')) return;
      spatial.set({ control: false });
    };
    window.addEventListener('pointerdown', off);
    return () => window.removeEventListener('pointerdown', off);
  }, [control]);
  const c = CHAPTERS[chapter]!;
  const I = c.icon;
  return (
    <div className={`sp-ui ${tour ? 'is-touring' : ''} is-${genie}`}>
      <div className="sp-apps">
      {/* Capsule */}
      <nav className="sp-capsule" aria-label="Apps">
        <button type="button" className="sp-icon-btn" aria-label="Previous app" data-voice="previous" onClick={() => spatial.prev()} disabled={chapter === 0}>
          <CaretLeft weight="bold" />
        </button>
        {/* The app's name: tap it to see every app. */}
        <button type="button" className="sp-capsule-room" aria-live="polite" aria-label={`${c.title}: show all apps`} data-voice="all apps" onClick={() => spatial.set({ homeView: !homeView, control: false })}>
          <I weight="duotone" aria-hidden="true" />
          <span>
            <b>
              {c.title}
              <CaretDown className="sp-capsule-caret" weight="bold" aria-hidden="true" />
            </b>
            <small>{c.line}</small>
          </span>
        </button>
        <button type="button" className="sp-icon-btn" aria-label="Next app" data-voice="next" onClick={() => spatial.next()} disabled={chapter === CHAPTERS.length - 1}>
          <CaretRight weight="bold" />
        </button>
      </nav>

      {/* App rail */}
      <nav className={`sp-rail ${dock ? '' : 'is-hidden'}`} aria-label="Apps">
        {CHAPTERS.map((x, i) => {
          const Ic = x.icon;
          return (
            <button key={x.id} type="button" role="tab" aria-selected={i === chapter} aria-label={x.title} data-voice={x.title} className={i === chapter ? 'is-on' : ''} onClick={() => spatial.goChapter(i)}>
              <Ic weight={i === chapter ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="sp-rail-tip">{x.title}</span>
            </button>
          );
        })}
      </nav>

      <Stage chapter={chapter} dir={dir} />
      {windows.includes('profile') && (
        <>
          <div className="os-scrim" aria-hidden="true" onClick={() => spatial.closeWindow('profile')} />
          <ProfileWindow />
        </>
      )}
      {homeView && <HomeView />}
      <Captions />
      </div>

      {/* The AI is always one tap away, in the tour too. */}
      <ChatBubble />

      {/* The tour button: draws the apps in and walks you through the house; then lets them out. */}
      <button
        type="button"
        className={`sp-tourbtn ${tour ? 'is-tour' : ''} ${genie === 'swallowing' ? 'is-gulp' : ''}`}
        aria-label={apps ? 'Back to the apps' : 'Take the house tour'}
        data-voice={apps ? 'vision apps' : 'house tour'}
        onClick={tourButton}
      >
        <span className="sp-tourbtn-ico" key={apps ? 'apps' : 'tour'}>
          {apps ? <VirtualReality weight="fill" /> : <MapTrifold weight="fill" />}
        </span>
        <span className="sp-tourbtn-text" key={apps ? 'a' : 't'}>
          <b>{apps ? 'Vision apps' : 'House tour'}</b>
          <small>{apps ? 'Bring the apps back' : 'Walk through his home'}</small>
        </span>
        <span className="sp-cap" aria-hidden="true">
          {apps ? 'Apps' : 'Tour'}
        </span>
      </button>

      {!asked && !tour && (
        <div className="sp-voiceask" role="dialog" aria-label="AI voice guide">
          <span className="cb-orb is-small" aria-hidden="true" />
          <span>
            <b>Would you like an AI voice to guide you?</b>
            <small>It reads each app aloud. You can change this any time with the speaker button.</small>
          </span>
          <div className="sp-voiceask-actions">
            <button type="button" className="sp-voiceask-btn" data-voice="keep muted" onClick={() => (spatial.setNarrate(false), setAsked(true))}>
              Keep muted
            </button>
            <button type="button" className="sp-voiceask-btn is-primary" data-voice="turn voice on" onClick={() => (spatial.setNarrate(true), setAsked(true))}>
              <SpeakerHigh weight="fill" aria-hidden="true" /> Turn voice on
            </button>
          </div>
        </div>
      )}

      {/* Modes */}
      <div className="sp-modes" role="toolbar" aria-label="Controls">
        <button
          type="button"
          className={`sp-icon-btn ${narrate ? 'is-on' : ''}`}
          aria-pressed={narrate}
          aria-label={narrate ? 'Mute the AI voice' : 'Turn the AI voice on'}
          title={narrate ? 'AI voice on' : 'AI voice muted'}
          data-voice={narrate ? 'mute voice' : 'unmute voice'}
          onClick={() => (spatial.setNarrate(!narrate), setAsked(true), spatial.toast(narrate ? 'AI voice muted' : 'AI voice on'))}
        >
          {narrate ? <SpeakerHigh weight="fill" /> : <SpeakerSlash weight="bold" />}
          <span className="sp-mode-label">AI voice</span>
        </button>
        <button type="button" className={`sp-icon-btn ${homeView ? 'is-on' : ''}`} aria-pressed={homeView} aria-label="Home View" data-voice="home view" onClick={() => spatial.set({ homeView: !homeView, control: false })}>
          <SquaresFour weight={homeView ? 'fill' : 'bold'} />
          <span className="sp-mode-label">All apps</span>
        </button>
        <button
          type="button"
          className={`sp-icon-btn ${voiceOn ? 'is-on' : ''}`}
          aria-pressed={voiceOn}
          aria-label={voiceOn ? 'Stop voice control' : 'Voice control'}
          title={voiceOn ? 'Stop voice control' : 'Voice control'}
          onClick={() => setVoiceOn(!voiceOn)}
        >
          {voiceOn ? <Microphone weight="fill" /> : <MicrophoneSlash weight="bold" />}
          <span className="sp-mode-label">Voice</span>
        </button>
        <button type="button" className={`sp-icon-btn ${hands ? 'is-on' : ''}`} aria-pressed={hands} aria-label="Hand gestures" onClick={() => setHands(!hands)}>
          <HandWaving weight={hands ? 'fill' : 'bold'} />
          <span className="sp-mode-label">Hands</span>
        </button>
        <button type="button" data-cc-toggle="" className={`sp-icon-btn ${control ? 'is-on' : ''}`} aria-pressed={control} aria-label="Control Center" data-voice="control center" onClick={() => spatial.set({ control: !control, homeView: false })}>
          <SlidersHorizontal weight="bold" />
          <span className="sp-cc-label">Controls</span>
        </button>
      </div>
      {control && (
        <div ref={ccRef}>
          <ControlCenter voice={voiceMode} hands={hands} setHands={setHands} replayIntro={replayIntro} />
        </div>
      )}

      {toast && (
        <p className="sp-toast" role="status">
          {toast}
        </p>
      )}

      {tour && <Tour />}
      <VideoOverlay />

      <Hands on={hands} onOff={() => setHands(false)} />
      <VoiceControl on={voiceOn} voice={voice} result={voiceResult} onOff={() => setVoiceOn(false)} />
    </div>
  );
}
