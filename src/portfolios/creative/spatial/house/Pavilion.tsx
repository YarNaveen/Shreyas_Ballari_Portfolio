import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { Color, DoubleSide, InstancedMesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, RepeatWrapping, SphereGeometry, type Texture } from 'three';
import { pavilion } from '@/content/portfolio';
import { B, Slab, canvasTexture, rng, useMats } from './kit';
import { POOL } from './poolPlan';
import { LOOKS, POSES, Person } from './People';

/**
 * The Sports & Fitness Pavilion: an open, roofed pavilion in the garden, east of the hedge (reached
 * through a gap in it, along stepping stones). Under one roof: a four-lane pool for his swimming
 * with the Swim Atlanta Senior Team, a Muay Thai training area (mats, heavy bags, gloves) for his
 * training since 2025, and a stone wall at the far end with Science Olympiad and DECA boards.
 *
 * Nothing moves: the water is a still, reflective surface with a ripple texture (so the house
 * keeps rendering only on demand), and it uses the scene's sky for its reflections. Only drawn when
 * the camera is near (see House.tsx), and only loaded with the other rooms for the tour.
 *
 * Floor plan (metres, same frame as layout.ts): x 18.5 to 31.5, z -10 to 3. Pool x 20.5 to 29.5,
 * z -8.6 to -4.6. Mats x 21 to 29.5, z -2.8 to 2.6.
 */

type V3 = [number, number, number];

const X0 = 18.5;
const X1 = 31.5;
const Z0 = -10;
const Z1 = 3;
const LANES = 4;
const ROOF_Y = 4.0;
export const PAVILION_CENTER: [number, number] = [(X0 + X1) / 2, (Z0 + Z1) / 2];

/* ───────────────────────── textures ───────────────────────── */

function tileTexture() {
  const t = canvasTexture(256, 256, (g) => {
    const r = rng(7);
    g.fillStyle = '#e9f6f8';
    g.fillRect(0, 0, 256, 256);
    const n = 8;
    const s = 256 / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = 0.92 + r() * 0.08;
        g.fillStyle = `rgb(${Math.round(196 * v)},${Math.round(232 * v)},${Math.round(238 * v)})`;
        g.fillRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
      }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function rippleNormal() {
  // A soft, seamless ripple normal map (drawn once).
  const t = canvasTexture(
    256,
    256,
    (g) => {
      const img = g.createImageData(256, 256);
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 256; x++) {
          const a = (x / 256) * Math.PI * 2;
          const b = (y / 256) * Math.PI * 2;
          const dx = 0.5 * Math.cos(a * 3 + Math.sin(b * 2) * 1.4) + 0.3 * Math.cos(a * 5 + b * 3);
          const dy = 0.5 * Math.cos(b * 4 + Math.sin(a * 2) * 1.2) + 0.3 * Math.sin(b * 6 - a * 2);
          const i = (y * 256 + x) * 4;
          img.data[i] = 128 + dx * 60;
          img.data[i + 1] = 128 + dy * 60;
          img.data[i + 2] = 255;
          img.data[i + 3] = 255;
        }
      g.putImageData(img, 0, 0);
    },
    false,
  );
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(5, 2.2);
  return t;
}

function matTexture() {
  // Interlocking foam training mats: deep blue with red borders.
  const t = canvasTexture(256, 256, (g) => {
    g.fillStyle = '#26365c';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#8f2a30';
    g.fillRect(0, 0, 256, 7);
    g.fillRect(0, 249, 256, 7);
    g.fillRect(0, 0, 7, 256);
    g.fillRect(249, 0, 7, 256);
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, 253, 253);
    const r = rng(11);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(255,255,255,${r() * 0.035})`;
      g.fillRect(r() * 256, r() * 256, 2, 2);
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** A text board: title, organisation and years, in one of two looks. */
function boardTexture(kind: 'olympiad' | 'deca') {
  const z = pavilion.zones.find((x) => x.id === kind)!;
  return canvasTexture(1024, 700, (g) => {
    if (kind === 'olympiad') {
      g.fillStyle = '#0d2346';
      g.fillRect(0, 0, 1024, 700);
      g.strokeStyle = 'rgba(140,190,255,0.16)';
      g.lineWidth = 1;
      for (let x = 0; x <= 1024; x += 32) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 700);
        g.stroke();
      }
      for (let y = 0; y <= 700; y += 32) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(1024, y);
        g.stroke();
      }
      // An atom.
      g.strokeStyle = '#8fd0ff';
      g.lineWidth = 6;
      for (const a of [0, Math.PI / 3, -Math.PI / 3]) {
        g.save();
        g.translate(820, 200);
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, 0, 130, 46, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
      g.fillStyle = '#ffd770';
      g.beginPath();
      g.arc(820, 200, 18, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = '#0b1530';
      g.fillRect(0, 0, 1024, 700);
      const gr = g.createLinearGradient(0, 0, 1024, 0);
      gr.addColorStop(0, '#c99a3c');
      gr.addColorStop(1, '#f4d68a');
      g.fillStyle = gr;
      g.fillRect(0, 640, 1024, 60);
      // A rising chart.
      g.strokeStyle = '#f4d68a';
      g.lineWidth = 10;
      g.lineJoin = 'round';
      g.beginPath();
      [
        [660, 330],
        [730, 270],
        [790, 300],
        [860, 190],
        [930, 120],
      ].forEach(([x, y], i) => (i ? g.lineTo(x!, y!) : g.moveTo(x!, y!)));
      g.stroke();
    }
    g.fillStyle = '#ffffff';
    g.font = '600 92px Geist, Manrope, system-ui, sans-serif';
    g.fillText(z.title, 64, 420);
    g.font = '500 44px Geist, Manrope, system-ui, sans-serif';
    g.fillStyle = 'rgba(255,255,255,0.78)';
    g.fillText(z.org, 64, 500);
    g.font = '600 52px Geist, Manrope, system-ui, sans-serif';
    g.fillStyle = kind === 'deca' ? '#f4d68a' : '#8fd0ff';
    g.fillText(z.when.replace(' and ', ' · '), 64, 590);
  });
}

/** A banner with one line of large text. */
function bannerTexture(text: string, sub: string, bg: string, ink: string) {
  return canvasTexture(1600, 280, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 1600, 280);
    g.fillStyle = ink;
    g.font = '700 120px Geist, Manrope, system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.fillText(text, 70, 118);
    g.font = '500 54px Geist, Manrope, system-ui, sans-serif';
    g.globalAlpha = 0.8;
    g.fillText(sub, 74, 220);
  });
}

function signTexture() {
  return canvasTexture(2048, 160, (g) => {
    g.clearRect(0, 0, 2048, 160);
    g.fillStyle = '#ffffff';
    g.font = '600 96px Geist, Manrope, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '18px';
    g.fillText(pavilion.title.toUpperCase(), 1024, 84);
  });
}

/* ───────────────────────── pieces ───────────────────────── */

/** Floats on the lane ropes: one instanced draw call. */
function LaneRopes() {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new SphereGeometry(0.055, 10, 8), []);
  const mat = useMemo(() => new MeshStandardMaterial({ roughness: 0.4 }), []);
  const spots = useMemo(() => {
    const out: { p: V3; c: string }[] = [];
    for (let l = 1; l < LANES; l++) {
      const z = POOL.z0 + l * ((POOL.z1 - POOL.z0) / LANES);
      for (let x = POOL.x0 + 0.15; x < POOL.x1 - 0.1; x += 0.16) {
        const end = x < POOL.x0 + 1.6 || x > POOL.x1 - 1.6;
        const k = Math.round((x - POOL.x0) / 0.16);
        out.push({ p: [x, -0.07, z], c: end ? '#d8343c' : k % 6 < 3 ? '#1f6fd1' : '#ffffff' });
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new Object3D();
    const c = new Color();
    spots.forEach((s, i) => {
      o.position.set(...s.p);
      o.scale.set(1.25, 0.8, 0.8);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(s.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [spots]);
  return <instancedMesh ref={ref} args={[geo, mat, spots.length]} castShadow={false} />;
}

function Pool({ tiles, water }: { tiles: MeshStandardMaterial; water: MeshPhysicalMaterial }) {
  const m = useMats();
  const { x0, x1, z0, z1, depth } = POOL;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const w = x1 - x0;
  const d = z1 - z0;
  const lane = d / LANES;
  const line = useMemo(() => new MeshStandardMaterial({ color: '#1b3f73', roughness: 0.5 }), []);
  const glow = useMemo(() => new MeshStandardMaterial({ color: '#000000', emissive: new Color('#bff3ff'), emissiveIntensity: 2.4 }), []);
  return (
    <group>
      {/* Basin: floor and four walls, tiled. */}
      <B p={[cx, -depth, cz]} s={[w, 0.05, d]} m={tiles} cast={false} />
      <B p={[cx, -depth / 2, z0 - 0.025]} s={[w, depth, 0.05]} m={tiles} cast={false} />
      <B p={[cx, -depth / 2, z1 + 0.025]} s={[w, depth, 0.05]} m={tiles} cast={false} />
      <B p={[x0 - 0.025, -depth / 2, cz]} s={[0.05, depth, d]} m={tiles} cast={false} />
      <B p={[x1 + 0.025, -depth / 2, cz]} s={[0.05, depth, d]} m={tiles} cast={false} />
      {/* Lane lines on the floor, with their T at each end. */}
      {Array.from({ length: LANES }, (_, i) => {
        const z = z0 + lane * (i + 0.5);
        return (
          <group key={i}>
            <B p={[cx, -depth + 0.03, z]} s={[w - 2, 0.01, 0.22]} m={line} cast={false} />
            <B p={[x0 + 1.0, -depth + 0.03, z]} s={[0.22, 0.01, 0.8]} m={line} cast={false} />
            <B p={[x1 - 1.0, -depth + 0.03, z]} s={[0.22, 0.01, 0.8]} m={line} cast={false} />
            {/* Underwater lights on the side walls. */}
            <mesh position={[x0 + 0.01, -0.55, z]} rotation={[0, Math.PI / 2, 0]} material={glow}>
              <circleGeometry args={[0.09, 20]} />
            </mesh>
            <mesh position={[x1 - 0.01, -0.55, z]} rotation={[0, -Math.PI / 2, 0]} material={glow}>
              <circleGeometry args={[0.09, 20]} />
            </mesh>
            {/* Starting blocks. */}
            <B p={[x0 - 0.26, 0.3, z]} s={[0.36, 0.36, 0.42]} m={m.white} />
            <B p={[x0 - 0.22, 0.5, z]} s={[0.46, 0.04, 0.46]} m={m.concrete} />
          </group>
        );
      })}
      {/* The water: still, clear and reflective. */}
      <mesh position={[cx, -0.09, cz]} rotation={[-Math.PI / 2, 0, 0]} material={water} renderOrder={2}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <LaneRopes />
      {/* Coping stones round the edge. */}
      <B p={[cx, 0.12, z0 - 0.15]} s={[w + 0.6, 0.06, 0.3]} m={m.marble} />
      <B p={[cx, 0.12, z1 + 0.15]} s={[w + 0.6, 0.06, 0.3]} m={m.marble} />
      <B p={[x0 - 0.15, 0.12, cz]} s={[0.3, 0.06, d]} m={m.marble} />
      <B p={[x1 + 0.15, 0.12, cz]} s={[0.3, 0.06, d]} m={m.marble} />
      {/* A pool ladder. */}
      {[-0.22, 0.22].map((o) => (
        <mesh key={o} position={[x1 - 0.7 + o, 0.2, z1 + 0.05]} material={m.steel}>
          <torusGeometry args={[0.28, 0.022, 8, 18, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}

function HeavyBag({ x, z, leather }: { x: number; z: number; leather: MeshStandardMaterial }) {
  const m = useMats();
  return (
    <group position={[x, 0, z]}>
      {/* A long Thai-style "banana" bag, for kicks and knees as well as punches. */}
      <mesh position={[0, 1.05, 0]} material={leather} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 1.55, 24]} />
      </mesh>
      <mesh position={[0, 1.84, 0]} material={m.black}>
        <cylinderGeometry args={[0.13, 0.17, 0.06, 24]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={m.black}>
        <cylinderGeometry args={[0.17, 0.14, 0.05, 24]} />
      </mesh>
      {[0.75, 1.45].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={m.offWhite}>
          <cylinderGeometry args={[0.173, 0.173, 0.06, 24]} />
        </mesh>
      ))}
      {/* Chain to the beam. */}
      <mesh position={[0, (1.87 + 3.1) / 2, 0]} material={m.steel}>
        <cylinderGeometry args={[0.012, 0.012, 3.1 - 1.87, 6]} />
      </mesh>
    </group>
  );
}

function Glove({ p, r, mat }: { p: V3; r: number; mat: MeshStandardMaterial }) {
  const m = useMats();
  return (
    <group position={p} rotation={[0, r, 0]}>
      <RoundedBox args={[0.24, 0.18, 0.3]} radius={0.08} smoothness={3} material={mat} castShadow />
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
        <cylinderGeometry args={[0.08, 0.085, 0.12, 14]} />
      </mesh>
      <mesh position={[0.11, 0.02, 0.02]} rotation={[0, 0, 0.3]} material={mat}>
        <sphereGeometry args={[0.055, 12, 10]} />
      </mesh>
    </group>
  );
}

function MuayThai({ mats }: { mats: MeshStandardMaterial }) {
  const m = useMats();
  const leather = useMemo(() => new MeshStandardMaterial({ color: '#7d1d21', roughness: 0.48, metalness: 0.05 }), []);
  const red = useMemo(() => new MeshStandardMaterial({ color: '#c3262e', roughness: 0.4 }), []);
  const blue = useMemo(() => new MeshStandardMaterial({ color: '#1f4fb5', roughness: 0.4 }), []);
  return (
    <group>
      {/* Training mats, raised a little off the deck. */}
      <B p={[25.25, 0.13, -0.1]} s={[8.5, 0.06, 5.4]} m={mats} cast={false} />
      {/* A steel beam for the heavy bags, on two posts. */}
      <B p={[24.7, 3.1, 0.7]} s={[5.6, 0.12, 0.12]} m={m.black} />
      {[21.95, 27.45].map((x) => (
        <B key={x} p={[x, 1.55, 0.7]} s={[0.12, 3.1, 0.12]} m={m.black} />
      ))}
      {[22.9, 24.7, 26.5].map((x) => (
        <HeavyBag key={x} x={x} z={0.7} leather={leather} />
      ))}
      {/* A bench with gloves and a towel. */}
      <Slab p={[28.7, 0.45, 2.2]} s={[1.5, 0.08, 0.45]} m={m.teak} tile={1.2} />
      {[28.1, 29.3].map((x) => (
        <B key={x} p={[x, 0.27, 2.2]} s={[0.06, 0.36, 0.4]} m={m.black} />
      ))}
      <Glove p={[28.35, 0.58, 2.2]} r={0.3} mat={red} />
      <Glove p={[28.72, 0.58, 2.24]} r={-0.2} mat={red} />
      <Glove p={[29.15, 0.58, 2.16]} r={0.1} mat={blue} />
      <B p={[29.35, 0.51, 2.24]} s={[0.36, 0.04, 0.3]} m={m.linen} cast={false} />
      {/* Kick shields leaning on the post. */}
      <RoundedBox args={[0.42, 0.7, 0.14]} radius={0.05} position={[27.2, 0.52, 2.05]} rotation={[0.18, 0.2, 0]} material={red} castShadow />
      <RoundedBox args={[0.42, 0.7, 0.14]} radius={0.05} position={[27.7, 0.52, 2.1]} rotation={[0.18, -0.15, 0]} material={blue} castShadow />
      {/* Training: a round kick at the middle bag (mongkhon headband, pra jiad armbands), and a
          partner in the guard stance. Illustrations of the sport, not Shreyas. */}
      <Person position={[25.55, 0.16, 0.95]} rotation={Math.PI} look={LOOKS.fighter} pose={POSES.kick} />
      <Person position={[22.3, 0.16, -1.5]} rotation={Math.PI + 0.75} look={LOOKS.partner} pose={POSES.guard} />
      {/* A ring corner: a padded post and three ropes along two edges of the mats. */}
      {(
        [
          [29.3, -2.65],
          [26.6, -2.65],
          [29.3, 0.1],
        ] as [number, number][]
      ).map(([x, z]) => (
        <group key={`${x}${z}`}>
          <B p={[x, 0.75, z]} s={[0.1, 1.3, 0.1]} m={m.black} />
          <B p={[x, 1.05, z]} s={[0.16, 0.7, 0.16]} m={x === 29.3 && z < 0 ? red : m.offWhite} />
        </group>
      ))}
      {[0.6, 0.9, 1.2].map((y, i) => (
        <group key={y}>
          <B p={[(29.3 + 26.6) / 2, y, -2.65]} s={[2.7, 0.035, 0.035]} m={[red, m.white, blue][i]!} cast={false} />
          <B p={[29.3, y, (-2.65 + 0.1) / 2]} s={[0.035, 0.035, 2.75]} m={[red, m.white, blue][i]!} cast={false} />
        </group>
      ))}
    </group>
  );
}

/** Stepping stones from the garden, through the gap in the hedge, to the pavilion. */
function Steps() {
  const m = useMats();
  return (
    <group>
      {[13.6, 14.7, 15.8, 16.9, 18.0].map((x, i) => (
        <Slab key={x} p={[x, 0.0, -3.25 + (i % 2 ? 0.08 : -0.06)]} s={[0.8, 0.05, 0.9]} m={m.pavers} tile={1.2} cast={false} />
      ))}
    </group>
  );
}

export function Pavilion() {
  const m = useMats();
  const t = useMemo(() => {
    const tile = tileTexture();
    tile.repeat.set(9, 1.3);
    const tiles = new MeshStandardMaterial({ map: tile, color: '#ffffff', roughness: 0.35 });
    const normal = rippleNormal();
    const water = new MeshPhysicalMaterial({
      color: '#2aa7cf',
      transparent: true,
      opacity: 0.72,
      roughness: 0.06,
      metalness: 0.0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      normalMap: normal,
      envMapIntensity: 1.5,
      depthWrite: false,
    });
    water.normalScale.set(0.35, 0.35);
    const matTex = matTexture();
    matTex.repeat.set(8.5 / 1.0, 5.4 / 1.0);
    const mats = new MeshStandardMaterial({ map: matTex, roughness: 0.85 });
    const sign = signTexture();
    const signMat = new MeshStandardMaterial({ map: sign, transparent: true, roughness: 0.6, emissive: new Color('#ffffff'), emissiveMap: sign, emissiveIntensity: 0.35 });
    const boards = (['olympiad', 'deca'] as const).map((k) => new MeshStandardMaterial({ map: boardTexture(k), roughness: 0.5, emissive: new Color('#ffffff'), emissiveIntensity: 0.18 }));
    boards.forEach((b) => (b.emissiveMap = b.map as Texture));
    const swim = pavilion.zones[0];
    const muay = pavilion.zones[1];
    const banners = [
      bannerTexture(swim.org.toUpperCase(), `${swim.title} · ${swim.role}`, '#0c3d63', '#ffffff'),
      bannerTexture(muay.title.toUpperCase(), `The art of eight limbs · training ${muay.when.toLowerCase()}`, '#2a0d10', '#ffffff'),
    ].map((map) => new MeshStandardMaterial({ map, roughness: 0.8, side: DoubleSide }));
    const canopy = new MeshPhysicalMaterial({ color: '#f4f8ff', transparent: true, opacity: 0.22, roughness: 0.35, metalness: 0, side: DoubleSide, depthWrite: false });
    return { tiles, water, mats, signMat, boards, banners, canopy };
  }, []);
  return (
    <group>
      <Steps />
      {/* Deck round the pool (four pieces, leaving the pool open). */}
      <Slab p={[(X0 + POOL.x0) / 2, 0.05, (Z0 + Z1) / 2]} s={[POOL.x0 - X0, 0.1, Z1 - Z0]} m={m.marble} tile={1.6} cast={false} />
      <Slab p={[(POOL.x1 + X1) / 2, 0.05, (Z0 + Z1) / 2]} s={[X1 - POOL.x1, 0.1, Z1 - Z0]} m={m.marble} tile={1.6} cast={false} />
      <Slab p={[(POOL.x0 + POOL.x1) / 2, 0.05, (Z0 + POOL.z0) / 2]} s={[POOL.x1 - POOL.x0, 0.1, POOL.z0 - Z0]} m={m.marble} tile={1.6} cast={false} />
      <Slab p={[(POOL.x0 + POOL.x1) / 2, 0.05, (POOL.z1 + Z1) / 2]} s={[POOL.x1 - POOL.x0, 0.1, Z1 - POOL.z1]} m={m.marble} tile={1.6} cast={false} />
      <Pool tiles={t.tiles} water={t.water} />
      <MuayThai mats={t.mats} />

      {/* Stone feature wall at the far end, with the Science Olympiad and DECA boards. */}
      <Slab p={[X1 - 0.1, ROOF_Y / 2, (Z0 + Z1) / 2]} s={[0.2, ROOF_Y, Z1 - Z0]} m={m.teak} tile={1.2} />
      {[
        [-3.2, 0],
        [0.8, 1],
      ].map(([z, k]) => (
        <group key={k}>
          <B p={[X1 - 0.22, 1.85, z!]} s={[0.04, 1.32, 1.9]} m={m.black} />
          <mesh position={[X1 - 0.245, 1.85, z!]} rotation={[0, -Math.PI / 2, 0]} material={t.boards[k!]}>
            <planeGeometry args={[1.8, 1.23]} />
          </mesh>
          <B p={[X1 - 0.3, 2.62, z!]} s={[0.12, 0.03, 0.9]} m={m.warmGlow} cast={false} />
        </group>
      ))}

      {/* Banners: swimming over the pool's far side, Muay Thai behind the bags. */}
      <mesh position={[25, 2.75, Z0 + 0.05]} material={t.banners[0]}>
        <planeGeometry args={[4.4, 0.77]} />
      </mesh>
      <mesh position={[22.55, 2.75, Z1 - 0.05]} rotation={[0, Math.PI, 0]} material={t.banners[1]}>
        <planeGeometry args={[4.4, 0.77]} />
      </mesh>

      {/* Slim steel columns and a thin white roof with light strips underneath. */}
      {[X0 + 0.1, 25, X1 - 0.1].flatMap((x) => [Z0 + 0.1, Z1 - 0.1].map((z) => <B key={`${x}${z}`} p={[x, ROOF_Y / 2, z]} s={[0.14, ROOF_Y, 0.14]} m={m.black} />))}
      <B p={[25, 2.75, Z0 + 0.02]} s={[4.6, 0.9, 0.04]} m={m.black} cast={false} />
      <B p={[22.55, 2.75, Z1 - 0.02]} s={[4.6, 0.9, 0.04]} m={m.black} cast={false} />
      {/* Glass canopy: a slim white frame with frosted glass, so daylight falls into the pavilion. */}
      <B p={[25, ROOF_Y + 0.11, Z0 - 0.2]} s={[X1 - X0 + 0.6, 0.22, 0.2]} m={m.white} />
      <B p={[25, ROOF_Y + 0.11, Z1 + 0.2]} s={[X1 - X0 + 0.6, 0.22, 0.2]} m={m.white} />
      <B p={[X0 - 0.2, ROOF_Y + 0.11, (Z0 + Z1) / 2]} s={[0.2, 0.22, Z1 - Z0 + 0.6]} m={m.white} />
      {[21.75, 25, 28.25].map((x) => (
        <B key={x} p={[x, ROOF_Y + 0.11, (Z0 + Z1) / 2]} s={[0.12, 0.18, Z1 - Z0]} m={m.white} cast={false} />
      ))}
      <mesh position={[25, ROOF_Y + 0.16, (Z0 + Z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={t.canopy}>
        <planeGeometry args={[X1 - X0, Z1 - Z0]} />
      </mesh>

      {/* The name on the roof's edge, facing the garden. */}
      <mesh position={[X0 - 0.31, ROOF_Y + 0.11, (Z0 + Z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={t.signMat}>
        <planeGeometry args={[9, 0.2]} />
      </mesh>
      {/* Planters along the open sides. */}
      {[21.5, 24.5, 27.5].map((x) => (
        <group key={x}>
          <Slab p={[x, 0.3, Z0 - 0.55]} s={[2.2, 0.6, 0.6]} m={m.concrete} tile={1.2} />
          <B p={[x, 0.62, Z0 - 0.55]} s={[2.0, 0.12, 0.45]} m={m.hedge} cast={false} />
        </group>
      ))}
    </group>
  );
}
