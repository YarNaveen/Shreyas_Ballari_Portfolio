import { Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group, Material, Mesh, Texture } from 'three';
import { spatial, useSpatial } from '../store';
import { batchGroup, lighten } from './batch';
import { Bedroom } from './Bedroom';
import { Gallery } from './Gallery';
import { Garden } from './Garden';
import { Lab } from './Lab';
import { MatsProvider } from './kit';
import { preloadModels } from './Model';
import { Music } from './Music';
import { Pavilion } from './Pavilion';
import { Projector } from './Projector';
import { Shell } from './Shell';
import { ActivityPosters, CommunityRoom, GalleryScores, GoalsSign, LabStory, ThanksScreen } from './Story3D';
import { Study } from './Study';

/**
 * Everything around the living room: the building's shell, the projector and the garden are
 * always there. The other rooms (bedroom, study, lab, gallery, community room, music room, and the
 * Sports & Fitness Pavilion in the garden) are
 * only needed for the house tour, so they are loaded the first time the tour opens, prepared
 * out of sight, and then shown. Vision mode never pays for them. Render inside the scene's Suspense.
 */

export const HOUSE_MODELS = ['outdoor_table_chair_set_01', 'stone_fire_pit', 'fern_02', 'grass_medium_01'];
preloadModels(HOUSE_MODELS);

/** How close (metres) the camera must be to a room for it to be drawn. Walls hide the rest. */
const NEAR = 12;

/** A room that is only drawn while the camera is near it. */
function Room({ at, children }: { at: [number, number]; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ camera, gl }) => {
    const g = ref.current;
    if (!g) return;
    const on = Math.hypot(camera.position.x - at[0], camera.position.z - at[1]) < NEAR;
    if (g.visible !== on) {
      g.visible = on;
      // Its furniture casts shadows too: redraw the sun's shadow once.
      gl.shadowMap.needsUpdate = true;
    }
  });
  return (
    <group ref={ref} userData={{ room: true }}>
      {children}
    </group>
  );
}

/**
 * Once the rooms have loaded: merge their still furniture, prepare the shaders in the background,
 * send the pictures to the graphics card a few at a time, and only then show the rooms (so the
 * tour never freezes on a room's first frame).
 */
function WarmRooms({ target, low }: { target: RefObject<Group | null>; low: boolean }) {
  const get = useThree((st) => st.get);
  useEffect(() => {
    const group = target.current;
    if (!group) return;
    const { gl, scene, camera } = get();
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      group.visible = true;
      gl.shadowMap.needsUpdate = true;
      spatial.set({ roomsReady: true });
    };
    const rooms = group.children.filter((c) => c.userData.room);
    try {
      rooms.forEach((r) => batchGroup(r));
      if (low) lighten(group);
    } catch {
      /* the rooms still work, just with more draw requests */
    }
    const upload = () => {
      const all = new Set<Texture>();
      group.traverse((o) => {
        const m = (o as Mesh).material as Material | Material[] | undefined;
        if (!m) return;
        (Array.isArray(m) ? m : [m]).forEach((mat) =>
          Object.values(mat).forEach((v) => {
            if (v && (v as Texture).isTexture) all.add(v as Texture);
          }),
        );
      });
      const list = [...all];
      const step = () => {
        if (done) return;
        const t0 = performance.now();
        while (list.length && performance.now() - t0 < 10) gl.initTexture(list.shift()!);
        if (list.length) requestAnimationFrame(step);
        else show();
      };
      requestAnimationFrame(step);
    };
    // Hidden objects are skipped when shaders are prepared, so everything counts as visible for this call.
    group.visible = true;
    rooms.forEach((r) => (r.visible = true));
    const compiling = gl.compileAsync(group, camera, scene);
    group.visible = false;
    compiling.then(upload, show);
    const t = window.setTimeout(show, 20000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Rooms({ low }: { low: boolean }) {
  const ref = useRef<Group>(null);
  return (
    <>
      <group ref={ref} visible={false}>
        <Room at={[-10, 2.5]}>
          <Bedroom />
        </Room>
        <Room at={[-10, -2.5]}>
          <Study />
        </Room>
        <Room at={[-10, -7.5]}>
          <Lab />
          <LabStory />
        </Room>
        <Room at={[-10.5, -12.5]}>
          <Gallery low={low} />
          <GalleryScores />
        </Room>
        <Room at={[-1.5, -12]}>
          <CommunityRoom />
        </Room>
        <Room at={[4.5, -12]}>
          <ActivityPosters />
          <Music />
        </Room>
        <Room at={[25, -3.5]}>
          <Pavilion />
        </Room>
      </group>
      <WarmRooms target={ref} low={low} />
    </>
  );
}

export function House({ low = false }: { low?: boolean }) {
  const tour = useSpatial((s) => s.tour);
  /** Loaded the first time the tour opens, then kept. */
  const [rooms, setRooms] = useState(false);
  useEffect(() => {
    if (tour) setRooms(true);
  }, [tour]);
  return (
    <MatsProvider>
      <Shell />
      <GoalsSign />
      <Projector />
      <ThanksScreen />
      <Garden low={low} />
      {rooms && (
        <Suspense fallback={null}>
          <Rooms low={low} />
        </Suspense>
      )}
    </MatsProvider>
  );
}
