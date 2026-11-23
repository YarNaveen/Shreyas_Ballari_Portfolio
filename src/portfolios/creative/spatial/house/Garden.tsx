import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Path as ShapePath,
  Shape,
  ShapeGeometry,
  RepeatWrapping,
  type BufferGeometry,
  type Material,
  type Mesh,
  type PointLight,
} from 'three';
import { B, Blob, Slab, canvasTexture, rng, useMats } from './kit';
import { MUSIC_DOOR } from './layout';
import { POOL } from './poolPlan';
import { MODEL, Model } from './Model';

/**
 * The garden: a lawn around the house, a stone terrace outside the living room's glass wall, a
 * path of concrete pavers from the music room's slider, a teak deck with a stone fire pit and
 * outdoor sofas, a bistro table by the kitchen, trees, hedges, ferns, grass and path lights.
 */

type V3 = [number, number, number];

/**
 * The lawn, with a rectangular opening for the pavilion's sunken pool (x0..x1, z0..z1 in world
 * metres), so the water and the tiled basin show through. The mesh is laid flat at z = cz.
 */
function lawnWithPool(w: number, d: number, tile: number, cz: number, hole: { x0: number; x1: number; z0: number; z1: number }) {
  const outer = new Shape();
  outer.moveTo(-w / 2, -d / 2);
  outer.lineTo(w / 2, -d / 2);
  outer.lineTo(w / 2, d / 2);
  outer.lineTo(-w / 2, d / 2);
  outer.closePath();
  // Plane space (x, y) maps to world (x, cz - y) once rotated flat.
  const y0 = cz - hole.z1;
  const y1 = cz - hole.z0;
  const h = new ShapePath();
  h.moveTo(hole.x0, y0);
  h.lineTo(hole.x0, y1);
  h.lineTo(hole.x1, y1);
  h.lineTo(hole.x1, y0);
  h.closePath();
  outer.holes.push(h);
  const g = new ShapeGeometry(outer);
  const p = g.attributes.position!;
  const uv = g.attributes.uv!;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, (p.getY(i) - cz) / tile);
  return g;
}

/* ───────────────────────── foliage ───────────────────────── */

let leafMat: MeshStandardMaterial | null = null;
function getLeafMat() {
  if (leafMat) return leafMat;
  const t = canvasTexture(128, 128, (g) => {
    const r = rng(3);
    g.clearRect(0, 0, 128, 128);
    for (let i = 0; i < 9; i++) {
      const x = 22 + r() * 84;
      const y = 22 + r() * 84;
      const a = r() * Math.PI * 2;
      const v = 0.75 + r() * 0.35;
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.fillStyle = `rgb(${Math.round(78 * v)},${Math.round(112 * v)},${Math.round(52 * v)})`;
      g.beginPath();
      g.ellipse(0, 0, 9 + r() * 5, 20 + r() * 6, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(40,60,20,0.5)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, -18);
      g.lineTo(0, 18);
      g.stroke();
      g.restore();
    }
  });
  leafMat = new MeshStandardMaterial({ map: t, alphaTest: 0.5, side: DoubleSide, roughness: 0.8 });
  return leafMat;
}

const LEAF = new PlaneGeometry(1, 1);

interface Blobby {
  c: V3;
  r: V3;
}

/** Leaf cards scattered on (and just inside) ellipsoids, one instanced draw call, plus dark cores. */
function Foliage({ blobs, count, seed, size = 0.32, tint = '#ffffff' }: { blobs: Blobby[]; count: number; seed: number; size?: number; tint?: string }) {
  const ref = useRef<InstancedMesh>(null);
  const core = useMemo(() => new MeshStandardMaterial({ color: new Color(tint).multiply(new Color('#3c5226')), roughness: 1 }), [tint]);
  const coreGeo = useMemo(() => {
    const g = new IcosahedronGeometry(1, 2);
    const p = g.attributes.position!;
    const r = rng(seed + 9);
    for (let i = 0; i < p.count; i++) {
      const k = 0.85 + r() * 0.2;
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(seed);
    const o = new Object3D();
    const c = new Color();
    const base = new Color(tint);
    for (let i = 0; i < count; i++) {
      const b = blobs[i % blobs.length]!;
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const k = 0.75 + r() * 0.32;
      o.position.set(b.c[0] + Math.cos(th) * s * b.r[0] * k, b.c[1] + u * b.r[1] * k, b.c[2] + Math.sin(th) * s * b.r[2] * k);
      o.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
      const sc = size * (0.7 + r() * 0.6);
      o.scale.set(sc, sc, sc);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      // Lighter leaves on top, darker below
      const l = 0.75 + (u + 1) * 0.18 + r() * 0.15;
      mesh.setColorAt(i, c.copy(base).multiplyScalar(l));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [blobs, count, seed, tint]);
  return (
    <group>
      {blobs.map((b, i) => (
        <mesh key={i} geometry={coreGeo} material={core} position={b.c} scale={[b.r[0] * 0.8, b.r[1] * 0.8, b.r[2] * 0.8]} castShadow receiveShadow />
      ))}
      <instancedMesh ref={ref} args={[LEAF, getLeafMat(), count]} castShadow receiveShadow />
    </group>
  );
}

const BARK = new MeshStandardMaterial({ color: '#6d6358', roughness: 0.95 });
const TRUNK = new CylinderGeometry(0.6, 1, 1, 10, 1);

/** A garden tree: a few leaning stems and a loose canopy. */
export function Tree({ position, h = 5.5, spread = 1.8, seed = 1, stems = 2, tint = '#ffffff' }: { position: V3; h?: number; spread?: number; seed?: number; stems?: number; tint?: string }) {
  const parts = useMemo(() => {
    const r = rng(seed);
    const trunks: { p: V3; rot: V3; s: V3 }[] = [];
    const blobs: Blobby[] = [];
    for (let i = 0; i < stems; i++) {
      const lean = 0.08 + r() * 0.18;
      const yaw = (i / stems) * Math.PI * 2 + r();
      const len = h * (0.55 + r() * 0.1);
      const top: V3 = [Math.sin(lean) * Math.cos(yaw) * len, Math.cos(lean) * len, Math.sin(lean) * Math.sin(yaw) * len];
      trunks.push({ p: [top[0] / 2, top[1] / 2, top[2] / 2], rot: [Math.sin(yaw) * lean, 0, -Math.cos(yaw) * lean], s: [0.11 - i * 0.015, len, 0.11 - i * 0.015] });
      const n = 3 + Math.floor(r() * 2);
      for (let k = 0; k < n; k++) {
        const a = r() * Math.PI * 2;
        const d = r() * spread * 0.55;
        const rr = spread * (0.45 + r() * 0.25);
        blobs.push({ c: [top[0] + Math.cos(a) * d, top[1] + (r() - 0.3) * spread * 0.6, top[2] + Math.sin(a) * d], r: [rr, rr * 0.8, rr] });
      }
    }
    return { trunks, blobs };
  }, [h, spread, seed, stems]);
  return (
    <group position={position}>
      {parts.trunks.map((t, i) => (
        <mesh key={i} position={t.p} rotation={t.rot} scale={t.s} geometry={TRUNK} material={BARK} castShadow receiveShadow />
      ))}
      <Foliage blobs={parts.blobs} count={parts.blobs.length * 260} seed={seed * 7} tint={tint} />
      <Blob p={[0, 0]} s={[spread * 1.6, spread * 1.6]} y={0.012} />
    </group>
  );
}

/* ───────────────────────── grass clumps ───────────────────────── */

function GrassClumps({ spots, seed }: { spots: [number, number, number][]; seed: number }) {
  const gltf = useGLTF(MODEL('grass_medium_01'));
  const kinds = useMemo(() => {
    const out: { geo: BufferGeometry; mat: Material }[] = [];
    gltf.scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && /(mid|large|tall)_/.test(m.name)) out.push({ geo: m.geometry, mat: m.material as Material });
    });
    return out;
  }, [gltf]);
  const per = useMemo(() => {
    const r = rng(seed);
    const lists: { p: V3; s: number; ry: number }[][] = kinds.map(() => []);
    for (const [x, z, rad] of spots) {
      const n = Math.max(3, Math.round(rad * rad * 14));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * rad;
        lists[Math.floor(r() * kinds.length)]!.push({ p: [x + Math.cos(a) * d, 0, z + Math.sin(a) * d], s: 1.3 + r() * 1.4, ry: r() * Math.PI * 2 });
      }
    }
    return lists;
  }, [kinds, spots, seed]);
  return (
    <group>
      {kinds.map((k, i) => (
        <Clumps key={i} geo={k.geo} mat={k.mat} items={per[i]!} />
      ))}
    </group>
  );
}

function Clumps({ geo, mat, items }: { geo: BufferGeometry; mat: Material; items: { p: V3; s: number; ry: number }[] }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(0, it.ry, 0);
      o.scale.setScalar(it.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} receiveShadow />;
}

/* ───────────────────────── fire ───────────────────────── */

function Fire({ position }: { position: V3 }) {
  const tex = useMemo(() => {
    const t = canvasTexture(256, 256, (g) => {
      g.fillStyle = '#000';
      g.fillRect(0, 0, 256, 256);
      const r = rng(8);
      for (let i = 0; i < 26; i++) {
        const x = 30 + r() * 196;
        const h = 90 + r() * 140;
        const grad = g.createLinearGradient(0, 256, 0, 256 - h);
        grad.addColorStop(0, 'rgba(255,200,110,0.95)');
        grad.addColorStop(0.45, 'rgba(255,120,30,0.75)');
        grad.addColorStop(1, 'rgba(255,60,10,0)');
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(x, 256, 10 + r() * 14, h, 0, Math.PI, 0);
        g.fill();
      }
    });
    t.wrapS = RepeatWrapping;
    return t;
  }, []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 2.4, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, alphaMap: tex }), [tex]);
  const light = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    tex.offset.x = (t * 0.07) % 1;
    mat.emissiveIntensity = 2.2 + Math.sin(t * 8) * 0.2 + Math.sin(t * 19) * 0.12;
    if (light.current) light.current.intensity = 9 + Math.sin(t * 7) * 1.5 + Math.sin(t * 15) * 0.8;
  });
  return (
    <group position={position}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
        <mesh key={a} rotation={[0, a, 0]} position={[0, 0.3, 0]} material={mat} scale={[0.75, 0.6, 1]}>
          <planeGeometry />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 0.7, 0]} color="#ff9a4a" intensity={9} distance={7} decay={2} />
    </group>
  );
}

/* ───────────────────────── outdoor furniture ───────────────────────── */

function OutdoorSofa({ position, rotation = 0, len = 2.2 }: { position: V3; rotation?: number; len?: number }) {
  const m = useMats();
  const cushion = useMemo(() => new MeshStandardMaterial({ color: '#e7e1d6', roughness: 1 }), []);
  const accent = useMemo(() => new MeshStandardMaterial({ color: '#5f6e5a', roughness: 1 }), []);
  const n = Math.round(len / 0.75);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Slab p={[0, 0.17, 0]} s={[len, 0.22, 0.85]} m={m.teak} tile={1.2} />
      <Slab p={[0, 0.45, -0.37]} s={[len, 0.6, 0.12]} m={m.teak} tile={1.2} />
      {[-1, 1].map((s) => (
        <Slab key={s} p={[s * (len / 2 - 0.05), 0.35, 0]} s={[0.1, 0.4, 0.85]} m={m.teak} tile={1.2} />
      ))}
      <RoundedBox args={[len - 0.2, 0.14, 0.7]} radius={0.05} position={[0, 0.35, 0.04]} material={cushion} castShadow receiveShadow />
      {Array.from({ length: n }, (_, i) => (
        <RoundedBox key={i} args={[(len - 0.25) / n - 0.03, 0.4, 0.14]} radius={0.06} position={[-(len - 0.25) / 2 + ((i + 0.5) * (len - 0.25)) / n, 0.62, -0.25]} rotation={[-0.15, 0, 0]} material={cushion} castShadow />
      ))}
      <RoundedBox args={[0.38, 0.32, 0.12]} radius={0.06} position={[len / 2 - 0.45, 0.58, -0.12]} rotation={[-0.2, 0.2, 0]} material={accent} castShadow />
      <Blob p={[0, 0]} s={[len + 0.4, 1.2]} y={0.13} />
    </group>
  );
}

function Bollard({ position }: { position: [number, number] }) {
  const m = useMats();
  return (
    <group position={[position[0], 0, position[1]]}>
      <B p={[0, 0.3, 0]} s={[0.1, 0.6, 0.1]} m={m.black} />
      <B p={[0, 0.5, 0]} s={[0.102, 0.06, 0.102]} m={m.warmGlow} cast={false} />
    </group>
  );
}

/* ───────────────────────── the garden ───────────────────────── */

const PATH: [number, number][] = [
  [(MUSIC_DOOR[0] + MUSIC_DOOR[1]) / 2, -8.45],
  [4.9, -7.6],
  [4.6, -6.7],
  [3.9, -6.0],
];
const FIRE: V3 = [9.3, 0, -6.6];

function pavers(): { p: V3; r: number }[] {
  const out: { p: V3; r: number }[] = [];
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i]!;
    const [bx, bz] = PATH[i + 1]!;
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 0.72));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({ p: [ax + (bx - ax) * t, 0.012, az + (bz - az) * t], r: Math.atan2(bx - ax, bz - az) });
    }
  }
  // A branch across the lawn to the fire-pit deck
  for (let k = 0; k < 5; k++) out.push({ p: [5.4 + k * 0.72, 0.012, -6.3 - k * 0.05], r: Math.PI / 2 });
  return out;
}

export function Garden({ low }: { low?: boolean }) {
  const m = useMats();
  const lawn = useMemo(() => lawnWithPool(90, 80, 2.6, -2, POOL), []);
  const path = useMemo(pavers, []);
  const grass = useMemo<[number, number, number][]>(
    () => [
      [-4.2, -8.3, 0.5],
      [-3.0, -4.3, 0.45],
      [-4.4, -4.6, 0.4],
      [6.3, -8.4, 0.55],
      [6.0, -4.2, 0.6],
      [7.4, -9.0, 0.5],
      [11.9, -8.9, 0.6],
      [12.2, -4.0, 0.5],
      [5.8, -1.2, 0.6],
      [5.9, 2.8, 0.6],
      [5.8, 5.6, 0.5],
      [-5.9, 5.4, 0.5],
      [-12.5, 5.6, 0.6],
      [2.9, -7.6, 0.35],
      [3.6, -4.4, 0.4],
      [8.0, -3.6, 0.45],
    ],
    [],
  );
  return (
    <group>
      <mesh geometry={lawn} material={m.grass} position={[0, -0.03, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
      {/* Terrace outside the living room's glass wall */}
      <Slab p={[0.1, -0.04, -4.65]} s={[10.5, 0.1, 2.1]} m={m.pavers} tile={1.2} cast={false} />
      <B p={[0.1, 0.004, -5.7]} s={[10.5, 0.02, 0.04]} m={m.black} cast={false} />
      {/* Planters along the terrace edge */}
      {[-3.6, 3.8].map((x) => (
        <group key={x}>
          <Slab p={[x, 0.25, -5.25]} s={[1.8, 0.5, 0.55]} m={m.concrete} tile={1.2} />
          <Model id="fern_02" pick={0} position={[x - 0.45, 0.42, -5.25]} scale={0.9} />
          <Model id="fern_02" pick={1} position={[x + 0.4, 0.42, -5.25]} scale={0.9} />
        </group>
      ))}
      {/* Stepping pavers */}
      {path.map((s, i) => (
        <Slab key={i} p={s.p} s={[0.95, 0.05, 0.5]} m={m.pavers} tile={1.2} rot={s.r + Math.PI / 2} cast={false} />
      ))}
      {[
        [4.0, -8.0],
        [5.6, -7.0],
        [4.9, -5.6],
        [8.0, -5.6],
        [10.9, -4.0],
        [2.0, -5.95],
      ].map((p, i) => (
        <Bollard key={i} position={p as [number, number]} />
      ))}
      {/* Fire-pit deck, the fire pit and outdoor sofas */}
      <Slab p={[FIRE[0], 0.06, FIRE[2]]} s={[4.6, 0.12, 4.4]} m={m.teak} tile={1.8} cast={false} />
      <Model id="stone_fire_pit" position={[FIRE[0], 0.12, FIRE[2]]} />
      <Fire position={[FIRE[0], 0.2, FIRE[2]]} />
      <OutdoorSofa position={[FIRE[0], 0.12, FIRE[2] - 1.55]} len={2.4} />
      <OutdoorSofa position={[FIRE[0] + 1.6, 0.12, FIRE[2] + 0.1]} rotation={-Math.PI / 2} len={2.0} />
      <Model id="side_table_01" position={[FIRE[0] + 1.6, 0.12, FIRE[2] - 1.5]} />
      {/* Bistro table by the kitchen glass */}
      <Model id="outdoor_table_chair_set_01" position={[-2.2, 0, -7.5]} rotation={0.3} />
      <Blob p={[-2.2, -7.5]} s={[1.8, 1.8]} y={0.01} />
      {/* Trees */}
      <Tree position={[-3.7, 0, -6.4]} h={5.2} spread={1.6} seed={3} stems={3} />
      <Tree position={[9.6, 0, -11.8]} h={6.5} spread={2.1} seed={8} stems={2} tint="#e8f0d8" />
      <Tree position={[13.0, 0, -2.0]} h={7.0} spread={2.4} seed={5} stems={2} />
      <Tree position={[11.6, 0, 5.0]} h={6.0} spread={2.0} seed={12} stems={3} tint="#f2ead2" />
      <Tree position={[-9.6, 0, 9.0]} h={6.2} spread={2.2} seed={21} stems={2} />
      <Tree position={[7.2, 0, 9.4]} h={5.0} spread={1.7} seed={30} stems={3} tint="#e8f0d8" />
      <Tree position={[-15.5, 0, -6.0]} h={6.8} spread={2.3} seed={41} stems={2} />
      {/* Shrubs (leaf mounds) */}
      {(
        [
          [[-4.4, 0.45, -8.4], 0.7],
          [[6.6, 0.4, -8.4], 0.6],
          [[12.3, 0.5, -9.0], 0.8],
          [[5.8, 0.45, 4.6], 0.65],
          [[-6.2, 0.4, 5.6], 0.55],
          [[-13.6, 0.5, 5.5], 0.7],
          [[12.6, 0.45, -5.0], 0.6],
        ] as [V3, number][]
      ).map(([c, r], i) => (
        <Foliage key={i} blobs={[{ c, r: [r, r * 0.75, r] }, { c: [c[0] + r * 0.7, c[1] - 0.1, c[2] + r * 0.3], r: [r * 0.7, r * 0.55, r * 0.7] }]} count={low ? 160 : 320} seed={i + 50} size={0.22} tint={i % 2 ? '#e2ecc8' : '#ffffff'} />
      ))}
      {[
        [-4.0, -5.1, 2],
        [-4.5, -7.6, 3],
        [6.8, -5.0, 0],
        [12.0, -7.2, 1],
        [6.2, 1.0, 2],
      ].map(([x, z, k], i) => (
        <Model key={i} id="fern_02" pick={k} position={[x!, 0, z!]} scale={1.3} />
      ))}
      {!low && <GrassClumps spots={grass} seed={4} />}
      {/* Teak slat cladding on the living room's garden-side wall, with two wall lights */}
      <B p={[5.265, 1.85, -0.25]} s={[0.02, 3.7, 6.7]} m={m.felt} cast={false} />
      {Array.from({ length: 67 }, (_, i) => (
        <B key={`c${i}`} p={[5.3, 1.85, -3.55 + i * 0.1]} s={[0.05, 3.7, 0.065]} m={m.teak} cast={false} />
      ))}
      {[-1.6, 2.2].map((z) => (
        <group key={`l${z}`}>
          <B p={[5.36, 2.2, z]} s={[0.08, 0.32, 0.1]} m={m.black} cast={false} />
          <B p={[5.36, 2.035, z]} s={[0.06, 0.01, 0.07]} m={m.warmGlow} cast={false} />
        </group>
      ))}
      {/* Hedges at the edges of the garden */}
      {/* East hedge, with a gap (z -4.7 to -1.8) on the path to the Sports & Fitness Pavilion. */}
      <Slab p={[17, 0.9, -10.85]} s={[1, 1.8, 12.3]} m={m.hedge} tile={1.2} />
      <Slab p={[17, 0.9, 5.6]} s={[1, 1.8, 14.8]} m={m.hedge} tile={1.2} />
      <Slab p={[1.5, 0.9, -17]} s={[32, 1.8, 1]} m={m.hedge} tile={1.2} />
      {/* The pavilion's own garden beyond it. */}
      <Slab p={[26, 0.9, -17]} s={[17, 1.8, 1]} m={m.hedge} tile={1.2} />
      <Slab p={[34.5, 0.9, -2]} s={[1, 1.8, 30]} m={m.hedge} tile={1.2} />
      <Slab p={[-16, 0.9, -2]} s={[1, 1.8, 30]} m={m.hedge} tile={1.2} />
    </group>
  );
}

