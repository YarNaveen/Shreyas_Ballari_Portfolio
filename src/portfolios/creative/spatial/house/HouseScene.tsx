import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ACESFilmicToneMapping, Color, DirectionalLight, EquirectangularReflectionMapping, HemisphereLight, MathUtils, Object3D, RectAreaLight, SRGBColorSpace, TextureLoader, Vector3, PCFShadowMap, type CatmullRomCurve3, type Material, type Mesh, type Texture } from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { spatial } from '../store';
import { batchStatic, lighten } from './batch';
import { House } from './House';
import { LivingRoom } from './LivingRoom';
import { HOTSPOTS, hotspotEls } from './hotspots';
import { STATIONS, type StationName } from './stations';
import { walkPath } from './route';
import { TOUR } from '../story/tour';

/**
 * The house: the living room is the fixed background of his spatial home. The camera stays in
 * it, and the scene is drawn only when something in it changes (see RenderPacer). The light
 * follows the time of day (day, golden hour, night). Lighting: daylight from the park through the glass wall
 * (sun with soft shadows, sky light across the window), the outdoor HDR for reflections, and
 * warm interior lights.
 */

const HDR = `${import.meta.env.BASE_URL}assets/house/hdri/greenwich_park_02_1k.hdr`;
const VIEW = `${import.meta.env.BASE_URL}assets/house/hdri/greenwich_park_02_view_4k.jpg`;

RectAreaLightUniformsLib.init();

function Environment() {
  const { scene } = useThree();
  const hdr = useLoader(HDRLoader, HDR);
  const view = useLoader(TextureLoader, VIEW);
  useEffect(() => {
    hdr.mapping = EquirectangularReflectionMapping;
    view.mapping = EquirectangularReflectionMapping;
    view.colorSpace = SRGBColorSpace;
    scene.environment = hdr;
    scene.environmentIntensity = 0.85;
    scene.background = view;
    scene.backgroundIntensity = 1;
    scene.backgroundRotation.set(0, 2.2, 0);
  }, [hdr, view, scene]);
  return null;
}

/** Light for day, golden hour and night (the store's `env`), eased so a change fades in. */
const LIGHT = {
  day: { sun: 3.4, sunColor: '#fff1de', sky: 3.4, skyColor: '#f2f6ff', hemi: 0.55, bg: 1, envI: 0.85, exposure: 1.22 },
  sunset: { sun: 2.6, sunColor: '#ff9a52', sky: 1.6, skyColor: '#ffc59a', hemi: 0.38, bg: 0.62, envI: 0.6, exposure: 1.16 },
  night: { sun: 0.04, sunColor: '#8fa6ff', sky: 0.12, skyColor: '#5d74c8', hemi: 0.1, bg: 0.07, envI: 0.18, exposure: 1.05 },
} as const;
const _c = new Color();

function Lights() {
  const sun = useRef<DirectionalLight>(null);
  const sky = useRef<RectAreaLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const { scene, gl } = useThree();
  useEffect(() => {
    if (sun.current) sun.current.target = target;
  }, [target]);
  const first = useRef(true);
  useFrame((_, delta) => {
    const L = LIGHT[spatial.get().env];
    // The first frame starts on the right light; later changes fade in.
    const k = first.current ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 1.6);
    first.current = false;
    if (sun.current) {
      sun.current.intensity = MathUtils.lerp(sun.current.intensity, L.sun, k);
      sun.current.color.lerp(_c.set(L.sunColor), k);
    }
    if (sky.current) {
      sky.current.intensity = MathUtils.lerp(sky.current.intensity, L.sky, k);
      sky.current.color.lerp(_c.set(L.skyColor), k);
    }
    if (hemi.current) hemi.current.intensity = MathUtils.lerp(hemi.current.intensity, L.hemi, k);
    scene.backgroundIntensity = MathUtils.lerp(scene.backgroundIntensity, L.bg, k);
    scene.environmentIntensity = MathUtils.lerp(scene.environmentIntensity, L.envI, k);
    gl.toneMappingExposure = MathUtils.lerp(gl.toneMappingExposure, L.exposure, k);
  });
  return (
    <>
      <primitive object={target} position={[-2, 0, -3]} />
      <directionalLight
        ref={sun}
        position={[8, 18, -29]}
        intensity={3.4}
        color="#fff1de"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={10}
        shadow-camera-far={70}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      {/* Sky light pouring in through the glass wall */}
      <rectAreaLight ref={sky} position={[0, 1.8, -3.5]} rotation={[0, 0, 0]} width={10} height={3.4} intensity={3.4} color="#f2f6ff" />
      <hemisphereLight ref={hemi} args={['#f3f6ff', '#e6ddd0', 0.55]} />
    </>
  );
}

/**
 * The camera. In vision mode it stands still in the living room (the fixed background of his
 * apps), so nothing is redrawn. In the house tour the scroll walks it from room to room along
 * smooth paths through the doorways, and the visitor can drag to look around. When the tour ends
 * it walks back to the living room and stands still again.
 */
const LIVING = STATIONS.living;
const HOME_EYE = new Vector3(...LIVING.eye);
const HOME_LOOK = new Vector3(...LIVING.look);
/** True while the camera moves: the scene is then drawn every frame (see RenderPacer). */
export const camState = { moving: false };
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perf')) Object.assign(window, { __camState: camState });

const _eye = new Vector3();
const _look = new Vector3();
const _ahead = new Vector3();
const _dir = new Vector3();
const WALK_SPEED = 1.15;
const MAX_WALK = 12;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Point the camera from `eye` at a yaw / pitch offset from the direction eye to look. */
function aim(camera: { lookAt: (v: Vector3) => void }, eye: Vector3, look: Vector3, dyaw: number, dpitch: number) {
  _dir.subVectors(look, eye);
  const yaw = Math.atan2(_dir.x, _dir.z) + dyaw;
  const pitch = Math.atan2(_dir.y, Math.hypot(_dir.x, _dir.z)) + dpitch;
  _look.set(eye.x + Math.sin(yaw) * Math.cos(pitch), eye.y + Math.sin(pitch), eye.z + Math.cos(yaw) * Math.cos(pitch));
  camera.lookAt(_look);
}

function CameraRig() {
  const { camera, gl } = useThree();
  const cur = useRef({ eye: new Vector3(...LIVING.eye), look: new Vector3(...LIVING.look) });
  const walk = useRef<{ curve: CatmullRomCurve3; t: number; dur: number; fromLook: Vector3; to: StationName } | null>(null);
  const at = useRef<StationName>('living');
  const turn = useRef({ yaw: 0, pitch: 0, vyaw: 0, drag: null as null | { x: number; y: number } });
  const tourP = useRef(0);
  const wasTour = useRef(false);
  // One smooth path per pair of neighbouring tour stops.
  const tourPaths = useMemo(
    () =>
      TOUR.slice(1).map((stop, i) => {
        const from = TOUR[i]!.station;
        return walkPath(new Vector3(...STATIONS[from].eye), from, stop.station).curve;
      }),
    [],
  );

  useEffect(() => {
    camera.position.set(...LIVING.eye);
    camera.lookAt(...LIVING.look);
    camera.updateMatrixWorld();
  }, [camera]);

  // In the tour: drag anywhere that is not a control (mouse, touch or a pinch) to look around.
  useEffect(() => {
    const doc = gl.domElement.ownerDocument;
    const down = (e: PointerEvent) => {
      if (!spatial.get().tour) return;
      // On touch screens a swipe walks from room to room (see SpatialPortfolio); turning is on
      // the arrow pad. Dragging to look round is for the mouse (and hand mode).
      if (e.pointerType === 'touch' && e.isTrusted) return;
      if (e.target instanceof Element && e.target.closest('button, a, input, [role="toolbar"], nav, .tour-card, .tour-mini, .cb, .sp-voiceask')) return;
      turn.current.drag = { x: e.clientX, y: e.clientY };
    };
    const move = (e: PointerEvent) => {
      const d = turn.current.drag;
      if (!d) return;
      const dx = e.clientX - d.x;
      turn.current.yaw -= dx * 0.0055;
      turn.current.vyaw = -dx * 0.0055;
      turn.current.pitch = MathUtils.clamp(turn.current.pitch - (e.clientY - d.y) * 0.004, -0.6, 0.55);
      turn.current.drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => (turn.current.drag = null);
    // The arrow pad's left / right: a smooth turn of about a third of a circle's quarter.
    const look = (e: Event) => {
      const by = (e as CustomEvent<number>).detail ?? 0;
      turn.current.vyaw += by * 0.05;
    };
    window.addEventListener('sp-look', look);
    doc.addEventListener('pointerdown', down);
    doc.addEventListener('pointermove', move);
    doc.addEventListener('pointerup', up);
    doc.addEventListener('pointercancel', up);
    return () => {
      doc.removeEventListener('pointerdown', down);
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', up);
      doc.removeEventListener('pointercancel', up);
      window.removeEventListener('sp-look', look);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = spatial.get();
    const T = turn.current;

    if (s.tour) {
      if (!wasTour.current) {
        // The tour starts at its first stop.
        wasTour.current = true;
        tourP.current = s.tourTarget;
        walk.current = null;
      }
      // Ease towards where the scroll wants to be; linger in each room, walk between them.
      tourP.current += (s.tourTarget - tourP.current) * (1 - Math.exp(-dt * 1.5));
      const p = MathUtils.clamp(tourP.current, 0, TOUR.length - 1);
      const i = Math.min(TOUR.length - 2, Math.floor(p));
      const u = MathUtils.smoothstep(p - i, 0.12, 0.88);
      const curve = tourPaths[i]!;
      curve.getPointAt(u, cur.current.eye);
      curve.getPointAt(Math.min(1, u + 0.05), _ahead);
      _dir.subVectors(_ahead, cur.current.eye).setY(0);
      if (_dir.lengthSq() > 1e-6) _ahead.copy(cur.current.eye).addScaledVector(_dir.normalize(), 2).setY(cur.current.eye.y - 0.1);
      _eye.set(...STATIONS[TOUR[i]!.station].look);
      _look.set(...STATIONS[TOUR[i + 1]!.station].look);
      const settle = MathUtils.smoothstep(u, 0.6, 1);
      const leave = 1 - MathUtils.smoothstep(u, 0, 0.35);
      if (u <= 0.0001) cur.current.look.copy(_eye);
      else if (u >= 0.9999) cur.current.look.copy(_look);
      else cur.current.look.copy(_ahead).lerp(_eye, leave * (1 - settle)).lerp(_look, settle);
      at.current = TOUR[Math.round(p)]!.station;
      camera.position.copy(cur.current.eye);
      const walking = Math.abs(s.tourTarget - p) > 0.004;
      if (!T.drag) {
        T.vyaw *= Math.exp(-dt * 3);
        T.yaw += T.vyaw;
        if (walking) {
          T.yaw = Math.atan2(Math.sin(T.yaw), Math.cos(T.yaw)) * Math.exp(-dt * 2.5);
          T.pitch *= Math.exp(-dt * 2.5);
        }
      }
      aim(camera, cur.current.eye, cur.current.look, T.yaw, T.pitch);
      camState.moving = walking || !!T.drag || Math.abs(T.vyaw) > 1e-4;
      return;
    }

    // Vision mode: be in the living room (walking back if the tour left the camera elsewhere).
    // The walk back keeps to real time even on slow frames, so it always ends.
    const dtr = Math.min(delta, 0.25);
    if (wasTour.current) {
      wasTour.current = false;
      T.drag = null;
    }
    if (at.current !== 'living' && walk.current?.to !== 'living') {
      const { curve, length } = walkPath(cur.current.eye, at.current, 'living');
      walk.current = { curve, t: 0, dur: MathUtils.clamp(length / WALK_SPEED, 2.6, MAX_WALK), fromLook: cur.current.look.clone(), to: 'living' };
    }
    const w = walk.current;
    if (w) {
      w.t = Math.min(1, w.t + dtr / w.dur);
      const e = ease(w.t);
      w.curve.getPointAt(e, cur.current.eye);
      w.curve.getPointAt(Math.min(1, e + 0.06), _ahead);
      _dir.subVectors(_ahead, cur.current.eye).setY(0);
      if (_dir.lengthSq() > 1e-6) _ahead.copy(cur.current.eye).addScaledVector(_dir.normalize(), 2).setY(cur.current.eye.y - 0.1);
      else _ahead.copy(cur.current.look);
      const settle = MathUtils.smoothstep(e, 0.55, 1);
      const leave = 1 - MathUtils.smoothstep(e, 0, 0.2);
      cur.current.look.copy(_ahead).lerp(w.fromLook, leave * (1 - settle)).lerp(HOME_LOOK, settle);
      if (w.t >= 1) {
        at.current = 'living';
        walk.current = null;
      }
    } else {
      cur.current.eye.lerp(HOME_EYE, 1 - Math.exp(-dtr * 3));
      cur.current.look.lerp(HOME_LOOK, 1 - Math.exp(-dtr * 3));
    }
    // Turn back to the room's view if the visitor had looked around.
    T.yaw = Math.atan2(Math.sin(T.yaw), Math.cos(T.yaw)) * Math.exp(-dtr * 3);
    T.pitch *= Math.exp(-dtr * 3);
    T.vyaw = 0;
    camera.position.copy(cur.current.eye);
    aim(camera, cur.current.eye, cur.current.look, T.yaw, T.pitch);
    const still = !w && cur.current.eye.distanceToSquared(HOME_EYE) < 1e-6 && cur.current.look.distanceToSquared(HOME_LOOK) < 1e-6 && Math.abs(T.yaw) < 1e-4 && Math.abs(T.pitch) < 1e-4;
    if (still) {
      // Arrived: stand exactly on the pose; nothing more to draw.
      cur.current.eye.copy(HOME_EYE);
      cur.current.look.copy(HOME_LOOK);
      T.yaw = 0;
      T.pitch = 0;
      camera.position.copy(HOME_EYE);
      camera.lookAt(HOME_LOOK);
    }
    camState.moving = !still;
  });
  return null;
}

/**
 * Keeps the room's clickable points on their objects. While the camera walks between rooms they
 * would float over walls, so they show once it has settled.
 */
const _hp = new Vector3();
const _fwd = new Vector3();
const _last = new Vector3();
const BY_ID = new Map(HOTSPOTS.map((h) => [h.id, h]));
function HotspotProjector() {
  const still = useRef(0);
  useFrame(({ camera, size }, delta) => {
    if (!hotspotEls.size) return;
    const moved = camera.position.distanceTo(_last) > 0.012;
    _last.copy(camera.position);
    still.current = moved ? 0 : still.current + delta;
    const settled = still.current > 0.25;
    camera.getWorldDirection(_fwd);
    hotspotEls.forEach((el, id) => {
      const h = BY_ID.get(id);
      if (!h) return;
      _hp.set(...h.pos);
      const ahead = _hp.clone().sub(camera.position).normalize().dot(_fwd);
      _hp.project(camera);
      const show = settled && ahead > 0.15 && Math.abs(_hp.x) < 0.94 && Math.abs(_hp.y) < 0.9;
      el.style.opacity = show ? '1' : '0';
      el.style.pointerEvents = show ? 'auto' : 'none';
      el.style.transform = `translate(${((_hp.x + 1) / 2) * size.width}px, ${((1 - _hp.y) / 2) * size.height}px) translate(-50%, -50%)`;
    });
  });
  return null;
}

function Progress({ onProgress }: { onProgress: (p: number, done: boolean) => void }) {
  const { progress, active } = useProgress();
  useEffect(() => onProgress(progress, !active && progress >= 100), [progress, active, onProgress]);
  return null;
}

/**
 * Prepares every material's shader in the background (the browser's parallel compile) before the
 * house is drawn for the first time. Without this, the first frame compiles them all at once and
 * the page freezes for many seconds on Windows (Chrome and Edge).
 */
function WarmUp({ onWarm, low }: { onWarm: () => void; low: boolean }) {
  const get = useThree((st) => st.get);
  useEffect(() => {
    const { gl, scene, camera } = get();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      // The sun and the furniture never move, so the sun's shadow is drawn once (on the next frame)
      // instead of every frame: about half the work per frame where shadows are on.
      gl.shadowMap.autoUpdate = false;
      gl.shadowMap.needsUpdate = true;
      performance.mark('house-warm');
      onWarm();
    };
    // Then the textures go to the graphics card a few per frame, instead of all in the first frame.
    const upload = () => {
      const all = new Set<Texture>();
      scene.traverse((o) => {
        const m = (o as Mesh).material as Material | Material[] | undefined;
        if (!m) return;
        (Array.isArray(m) ? m : [m]).forEach((mat) => {
          Object.values(mat).forEach((v) => {
            if (v && (v as Texture).isTexture) all.add(v as Texture);
          });
        });
      });
      const list = [...all];
      const step = () => {
        if (done) return;
        // As many as fit in about 12 ms, then the next frame.
        const t0 = performance.now();
        while (list.length && performance.now() - t0 < 12) gl.initTexture(list.shift()!);
        if (list.length) requestAnimationFrame(step);
        else finish();
      };
      requestAnimationFrame(step);
    };
    // First merge the still furniture into a few objects (far fewer draw requests per frame).
    try {
      performance.mark('house-batch-start');
      batchStatic(scene);
      performance.mark('house-batch-end');
      if (low) lighten(scene);
      performance.mark('house-lighten-end');
    } catch {
      /* if merging fails, the house still works, just with more draw requests */
    }
    gl.compileAsync(scene, camera).then(() => (performance.mark('house-compiled'), upload()), finish);
    // Never wait forever.
    const t = window.setTimeout(finish, 20000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Reports the house ready once its first frame is on screen (that frame draws the shadows). */
function Ready({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    invalidate();
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => onReady())));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * Draws the house only when something in it changes. In the house tour (and while the camera
 * walks back) it draws every frame; in vision mode the room is still, so most of the time
 * nothing is drawn at all and the computer is free for the glass windows in front of it. A new
 * frame is asked for when the light changes (day, golden hour, night: a few seconds while it
 * fades), when the room's glowing points appear, and once after the visitor arrives.
 */
function RenderPacer() {
  const get = useThree((st) => st.get);
  useEffect(() => {
    let until = performance.now() + 600;
    let raf = 0;
    const loop = () => {
      raf = 0;
      // Every frame in the tour and while the camera walks; otherwise only for a short burst.
      if (performance.now() > until && !camState.moving && !spatial.get().tour) return;
      get().invalidate();
      raf = requestAnimationFrame(loop);
    };
    const burst = (ms: number) => {
      until = Math.max(until, performance.now() + ms);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    burst(600);
    let prev = spatial.get();
    const unsub = spatial.subscribe(() => {
      const s = spatial.get();
      if (s.env !== prev.env) burst(4000);
      else if (s.tour !== prev.tour || s.tourIndex !== prev.tourIndex || s.phase !== prev.phase) burst(250);
      prev = s;
    });
    const points = () => burst(250);
    window.addEventListener('sp-points', points);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener('sp-points', points);
    };
  }, [get]);
  return null;
}

export function HouseScene({ low, live, onProgress, onReady }: { low: boolean; live: boolean; onProgress: (p: number, done: boolean) => void; onReady: () => void }) {
  /** Nothing is drawn until the shaders are ready (see WarmUp). */
  const [warm, setWarm] = useState(false);
  return (
    <Canvas
      frameloop={warm ? 'demand' : 'never'}
      shadows={!low}
      dpr={low ? 1 : [1, 1.25]}
      camera={{ fov: 50, near: 0.05, far: 200, position: STATIONS.living.eye }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
        gl.outputColorSpace = SRGBColorSpace;
        if (!low) gl.shadowMap.type = PCFShadowMap;
        // ?perf in the address: expose the renderer and scene for performance checks.
        if (new URLSearchParams(window.location.search).has('perf')) Object.assign(window, { __gl: gl, __scene: scene });
      }}
    >
      {live && warm && <RenderPacer />}
      <Progress onProgress={onProgress} />
      <Suspense fallback={null}>
        <Environment />
        <Lights />
        <LivingRoom low={low} />
        <House low={low} />
        <WarmUp low={low} onWarm={() => setWarm(true)} />
        {warm && <Ready onReady={onReady} />}
      </Suspense>
      <CameraRig />
      <HotspotProjector />
    </Canvas>
  );
}
