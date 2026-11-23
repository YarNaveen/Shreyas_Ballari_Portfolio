import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { Color, DoubleSide, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three';
import { B, canvasTexture, useMats } from './kit';
import { LOOKS, POSES, Person } from './People';

/**
 * The community room's people and props. On the west side, tutoring: three students at the study
 * table writing and listening, a tutor at the whiteboard pointing at the steps, notebooks, pencils,
 * a calculator and books. On the east side (the next stop of the house tour), volunteering: a TAMA
 * Medical Camp table with a first-aid kit, a stethoscope and water, a temple step with lit oil
 * lamps under a marigold garland for the Sri Shirdi Sai Temple, supply boxes, and two volunteers.
 * The people are illustrations of the activities, not Shreyas.
 */

type V3 = [number, number, number];
const Z0 = -14;
const T = { x: -1.6, z: -11.6 };

function notebookTexture(seed: number) {
  return canvasTexture(256, 180, (g) => {
    g.fillStyle = '#fbfaf6';
    g.fillRect(0, 0, 256, 180);
    g.strokeStyle = 'rgba(80,120,200,0.35)';
    g.lineWidth = 1.5;
    for (let y = 22; y < 180; y += 14) {
      g.beginPath();
      g.moveTo(10, y);
      g.lineTo(246, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(200,60,60,0.4)';
    g.beginPath();
    g.moveTo(30, 0);
    g.lineTo(30, 180);
    g.stroke();
    g.fillStyle = '#2d3a5c';
    g.font = '600 15px Caveat, cursive';
    const lines = seed % 2 ? ['a² + b² = c²', '3² + 4² = 25', 'c = 5'] : ['F = m · a', 'v = d / t', 'H₂O → 2H + O'];
    lines.forEach((l, i) => g.fillText(l, 38, 40 + i * 28));
  });
}

function signTexture(title: string, sub: string, bg: string, accent: string) {
  return canvasTexture(1024, 300, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 300);
    g.fillStyle = accent;
    g.fillRect(0, 0, 18, 300);
    g.fillStyle = '#ffffff';
    g.font = '700 84px Geist, Manrope, system-ui, sans-serif';
    g.fillText(title, 60, 140);
    g.font = '500 46px Geist, Manrope, system-ui, sans-serif';
    g.globalAlpha = 0.85;
    g.fillText(sub, 62, 225);
  });
}

function crossTexture() {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#d7263d';
    g.fillRect(50, 20, 28, 88);
    g.fillRect(20, 50, 88, 28);
  });
}

/** Marigold flowers along a drooping string: one instanced draw call. */
function Garland({ from, to, sag = 0.35, n = 46 }: { from: V3; to: V3; sag?: number; n?: number }) {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new SphereGeometry(0.045, 10, 8), []);
  const m = useMemo(() => new MeshStandardMaterial({ roughness: 0.8 }), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    const c = new Color();
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      o.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - sag * 4 * t * (1 - t), from[2] + (to[2] - from[2]) * t);
      o.scale.setScalar(i % 3 === 0 ? 0.8 : 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c.set(i % 3 === 0 ? '#ffd166' : '#ff8c1a'));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [from, to, sag, n]);
  return <instancedMesh ref={ref} args={[geo, m, n]} />;
}

function Diya({ p, flame, clay }: { p: V3; flame: MeshStandardMaterial; clay: MeshStandardMaterial }) {
  return (
    <group position={p}>
      <mesh material={clay} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[0.07, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh material={flame} position={[0.04, 0.05, 0]} scale={[0.5, 1, 0.5]}>
        <coneGeometry args={[0.022, 0.08, 10]} />
      </mesh>
    </group>
  );
}

function Tutoring() {
  const t = useMemo(() => {
    const books = ['#7b2d26', '#1f4f7a', '#2f6b4f'].map((c) => new MeshStandardMaterial({ color: c, roughness: 0.7 }));
    const notes = [0, 1, 2].map((i) => new MeshStandardMaterial({ map: notebookTexture(i), roughness: 0.9 }));
    const pencil = new MeshStandardMaterial({ color: '#f2b705', roughness: 0.5 });
    const calc = new MeshStandardMaterial({ color: '#2a2d33', roughness: 0.4 });
    return { books, notes, pencil, calc };
  }, []);
  const top = 0.77;
  return (
    <group>
      {/* Three students: two writing, one listening; the tutor points at the steps on the board. */}
      <Person position={[T.x - 0.6, 0, T.z - 0.8]} look={LOOKS.student1} pose={POSES.write} />
      <Person position={[T.x + 0.6, 0, T.z - 0.8]} look={LOOKS.student3} pose={POSES.listen} />
      <Person position={[T.x + 0.6, 0, T.z + 0.8]} rotation={Math.PI} look={LOOKS.student2} pose={POSES.write} />
      <Person position={[-0.25, 0, Z0 + 0.72]} rotation={-2.1} look={LOOKS.tutor} pose={POSES.point} />
      {/* Open notebooks, pencils, a calculator and a stack of books. */}
      {(
        [
          [T.x - 0.6, T.z - 0.25, 0.1],
          [T.x + 0.6, T.z - 0.25, -0.15],
          [T.x + 0.6, T.z + 0.25, Math.PI + 0.1],
        ] as V3[]
      ).map(([x, z, r], i) => (
        <group key={i} position={[x, top, z]} rotation={[0, r, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={t.notes[i]!}>
            <planeGeometry args={[0.36, 0.25]} />
          </mesh>
          <mesh position={[0.12, 0.008, 0.05]} rotation={[Math.PI / 2, 0, 0.6]} material={t.pencil}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 6]} />
          </mesh>
        </group>
      ))}
      <B p={[T.x, top + 0.01, T.z + 0.05]} s={[0.1, 0.018, 0.16]} m={t.calc} cast={false} />
      {t.books.map((b, i) => (
        <B key={i} p={[T.x - 0.85, top + 0.025 + i * 0.045, T.z + 0.28]} s={[0.24 - i * 0.02, 0.04, 0.17]} m={b} r={[0, i * 0.15, 0]} />
      ))}
      {/* A marker tray under the board. */}
      {['#d7263d', '#1f4fb5', '#111111'].map((c, i) => (
        <mesh key={c} position={[-3.2 + i * 0.08, 0.78, Z0 + 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Volunteering() {
  const m = useMats();
  const t = useMemo(() => {
    const tama = signTexture('TAMA Medical Camp', 'Student volunteer', '#8c1d2f', '#ff6b8a');
    const temple = signTexture('Sri Shirdi Sai Temple', 'Operations volunteer', '#6b3410', '#ffb347');
    return {
      tama: new MeshStandardMaterial({ map: tama, roughness: 0.7, side: DoubleSide }),
      temple: new MeshStandardMaterial({ map: temple, roughness: 0.7, side: DoubleSide }),
      cross: new MeshStandardMaterial({ map: crossTexture(), roughness: 0.5 }),
      kit: new MeshStandardMaterial({ color: '#f7f7f5', roughness: 0.45 }),
      bottle: new MeshStandardMaterial({ color: '#6fb7e6', roughness: 0.15, transparent: true, opacity: 0.8 }),
      tube: new MeshStandardMaterial({ color: '#1d3f8f', roughness: 0.5 }),
      clay: new MeshStandardMaterial({ color: '#b8622f', roughness: 0.8 }),
      flame: new MeshStandardMaterial({ color: '#000000', emissive: new Color('#ffb347'), emissiveIntensity: 3 }),
      wood: new MeshStandardMaterial({ color: '#5b3420', roughness: 0.7 }),
      box: new MeshStandardMaterial({ color: '#c9a37a', roughness: 0.9 }),
    };
  }, []);
  return (
    <group>
      {/* TAMA Medical Camp table */}
      <B p={[0.8, 0.74, Z0 + 0.6]} s={[1.3, 0.04, 0.6]} m={m.white} />
      {[-0.6, 0.6].flatMap((dx) => [-0.25, 0.25].map((dz) => <B key={`${dx}${dz}`} p={[0.8 + dx, 0.37, Z0 + 0.6 + dz]} s={[0.03, 0.74, 0.03]} m={m.steel} />))}
      <mesh position={[0.8, 0.5, Z0 + 0.905]} material={t.tama}>
        <planeGeometry args={[1.2, 0.35]} />
      </mesh>
      <RoundedBox args={[0.34, 0.18, 0.22]} radius={0.02} position={[0.45, 0.85, Z0 + 0.58]} material={t.kit} castShadow />
      <mesh position={[0.45, 0.85, Z0 + 0.695]} material={t.cross}>
        <planeGeometry args={[0.1, 0.1]} />
      </mesh>
      {/* A stethoscope lying on the table */}
      <mesh position={[0.95, 0.768, Z0 + 0.6]} rotation={[-Math.PI / 2, 0, 0]} material={t.tube}>
        <torusGeometry args={[0.09, 0.008, 8, 28, Math.PI * 1.6]} />
      </mesh>
      <mesh position={[1.04, 0.768, Z0 + 0.5]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 18]} />
      </mesh>
      {[1.25, 1.33, 1.41].map((x) => (
        <mesh key={x} position={[x, 0.85, Z0 + 0.62]} material={t.bottle}>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 12]} />
        </mesh>
      ))}
      <B p={[0.75, 0.765, Z0 + 0.75]} s={[0.22, 0.01, 0.3]} m={m.white} r={[0, 0.2, 0]} cast={false} />
      <Person position={[0.8, 0, Z0 + 0.15]} look={LOOKS.medic} pose={POSES.stand} />

      {/* Temple step with oil lamps under a marigold garland */}
      <B p={[2.35, 0.08, Z0 + 0.4]} s={[1.3, 0.16, 0.55]} m={t.wood} />
      <B p={[2.35, 0.2, Z0 + 0.3]} s={[1.1, 0.08, 0.32]} m={t.wood} />
      {[1.9, 2.12, 2.35, 2.58, 2.8].map((x, i) => (
        <Diya key={x} p={[x, i % 2 ? 0.255 : 0.175, Z0 + (i % 2 ? 0.3 : 0.55)]} flame={t.flame} clay={t.clay} />
      ))}
      <mesh position={[2.35, 0.1, Z0 + 0.68]} material={t.temple}>
        <planeGeometry args={[1.2, 0.32]} />
      </mesh>
      <Garland from={[0.15, 2.42, Z0 + 0.06]} to={[2.95, 2.42, Z0 + 0.06]} sag={0.22} n={56} />
      <Garland from={[1.75, 0.98, Z0 + 0.06]} to={[2.95, 0.98, Z0 + 0.06]} sag={0.1} n={26} />
      {/* Supplies for the temple's operations, and a volunteer carrying another box. */}
      {(
        [
          [2.85, 0.15, Z0 + 1.25, 0.1],
          [2.85, 0.45, Z0 + 1.25, -0.1],
          [2.55, 0.15, Z0 + 1.35, 0.3],
        ] as [number, number, number, number][]
      ).map(([x, y, z, r], i) => (
        <B key={i} p={[x, y, z]} s={[0.36, 0.3, 0.3]} m={t.box} r={[0, r, 0]} />
      ))}
      <Person position={[1.95, 0, Z0 + 1.45]} rotation={-2.5} look={LOOKS.volunteer} pose={POSES.carry}>
        <B p={[0, 0.2, 0.34]} s={[0.36, 0.26, 0.28]} m={t.box} />
      </Person>
    </group>
  );
}

export function CommunityExtras() {
  return (
    <group>
      <Tutoring />
      <Volunteering />
    </group>
  );
}
