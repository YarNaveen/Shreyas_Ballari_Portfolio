import { useMemo, type ReactNode } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CapsuleGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry, TorusGeometry } from 'three';

/**
 * People for the house: stylised but natural human figures with real proportions and joints
 * (neck, shoulders, elbows, wrists, hips, knees, ankles), hair, skin tones, clothes and shoes,
 * posed for what they are doing: writing at a table, pointing at a whiteboard, carrying a box,
 * training Muay Thai (a round kick at a bag, or the guard stance). No faces and nobody real:
 * they show the activity, not Shreyas. Shared geometry and one material per colour keep them cheap.
 *
 * Facing +z. Rotations: a joint's x turns its limb forward (negative) or back (positive); z turns
 * it out to the side (left limbs negative, right limbs positive).
 */

type V3 = [number, number, number];

export interface Look {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
  /** Short sleeves show the forearm's skin; shorts show the shin's. */
  shortSleeves?: boolean;
  shorts?: boolean;
  /** Boxing gloves instead of hands. */
  gloves?: string;
  /** Muay Thai: the mongkhon headband and pra jiad armbands. */
  mongkhon?: string;
  /** Long hair falls to the shoulders. */
  longHair?: boolean;
}

export interface Pose {
  /** Height of the hips (0.91 standing). */
  hipY: number;
  /** Whole-body lean: x forward/back, z sideways. */
  lean?: [number, number];
  head?: [number, number, number];
  lShoulder: V3;
  rShoulder: V3;
  lElbow: number;
  rElbow: number;
  lHip: V3;
  rHip: V3;
  lKnee: number;
  rKnee: number;
}

const STAND: Pose = { hipY: 0.91, lShoulder: [0.05, 0, -0.08], rShoulder: [0.05, 0, 0.08], lElbow: -0.2, rElbow: -0.2, lHip: [0, 0, -0.03], rHip: [0, 0, 0.03], lKnee: 0, rKnee: 0 };

export const POSES = {
  stand: STAND,
  /** Seated at a table, writing. */
  write: { hipY: 0.47, lean: [0.18, 0], head: [0.32, 0, 0], lShoulder: [-0.55, 0, -0.12], rShoulder: [-0.75, 0, 0.1], lElbow: -1.05, rElbow: -0.85, lHip: [-1.57, 0, -0.06], rHip: [-1.57, 0, 0.06], lKnee: 1.57, rKnee: 1.57 },
  /** Seated, listening (hands resting on the table). */
  listen: { hipY: 0.47, lean: [0.05, 0], head: [0.05, 0.25, 0], lShoulder: [-0.4, 0, -0.1], rShoulder: [-0.4, 0, 0.1], lElbow: -1.3, rElbow: -1.3, lHip: [-1.57, 0, -0.08], rHip: [-1.57, 0, 0.08], lKnee: 1.6, rKnee: 1.5 },
  /** Standing at the board, pointing with the right hand. */
  point: { hipY: 0.91, lean: [0, 0.03], head: [-0.05, 0.35, 0], lShoulder: [0.1, 0, -0.1], rShoulder: [-1.75, 0.2, 0.25], lElbow: -0.35, rElbow: -0.15, lHip: [0, 0, -0.05], rHip: [0.05, 0, 0.06], lKnee: 0.05, rKnee: 0.1 },
  /** Carrying a box in front. */
  carry: { hipY: 0.9, lean: [-0.06, 0], head: [0.1, 0, 0], lShoulder: [-0.55, 0, -0.18], rShoulder: [-0.55, 0, 0.18], lElbow: -1.1, rElbow: -1.1, lHip: [-0.25, 0, -0.03], rHip: [0.2, 0, 0.03], lKnee: 0.3, rKnee: 0.15 },
  /** Muay Thai round kick with the right leg, at a bag, hands up in guard. */
  kick: { hipY: 0.88, lean: [0.05, -0.42], head: [0.05, 0.25, 0.2], lShoulder: [-1.25, 0, -0.35], rShoulder: [-0.8, 0, 0.55], lElbow: -1.9, rElbow: -1.2, lHip: [-0.15, 0.2, -0.1], rHip: [-0.35, 0, 1.25], lKnee: 0.25, rKnee: 0.15 },
  /** Muay Thai guard: hands high, weight on the back leg, front foot light. */
  guard: { hipY: 0.86, lean: [0.08, 0], head: [0.12, 0, 0], lShoulder: [-1.15, 0, -0.3], rShoulder: [-1.0, 0, 0.3], lElbow: -2.05, rElbow: -2.15, lHip: [-0.35, 0, -0.08], rHip: [0.28, 0, 0.1], lKnee: 0.25, rKnee: 0.35 },
} satisfies Record<string, Pose>;

const G = {
  head: new SphereGeometry(0.105, 24, 18),
  hair: new SphereGeometry(0.112, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
  ear: new SphereGeometry(0.022, 10, 8),
  neck: new CylinderGeometry(0.045, 0.052, 0.1, 14),
  torso: new CylinderGeometry(0.165, 0.14, 0.46, 20),
  chest: new SphereGeometry(0.17, 20, 12),
  pelvis: new CapsuleGeometry(0.13, 0.08, 6, 16),
  upperArm: new CapsuleGeometry(0.046, 0.22, 6, 12),
  foreArm: new CapsuleGeometry(0.039, 0.2, 6, 12),
  hand: new SphereGeometry(0.043, 14, 10),
  glove: new SphereGeometry(0.075, 16, 12),
  thigh: new CapsuleGeometry(0.068, 0.32, 6, 14),
  shin: new CapsuleGeometry(0.052, 0.33, 6, 14),
  joint: new SphereGeometry(0.05, 12, 10),
  band: new TorusGeometry(0.105, 0.016, 8, 24),
  armBand: new TorusGeometry(0.05, 0.012, 6, 16),
};

const MATS = new Map<string, MeshStandardMaterial>();
function mat(color: string, rough = 0.7) {
  const k = `${color}|${rough}`;
  let m = MATS.get(k);
  if (!m) {
    m = new MeshStandardMaterial({ color, roughness: rough });
    MATS.set(k, m);
  }
  return m;
}

function Arm({ side, look, shoulder, elbow }: { side: -1 | 1; look: Look; shoulder: V3; elbow: number }) {
  const top = mat(look.top);
  const skin = mat(look.skin, 0.6);
  const fore = look.shortSleeves || look.gloves ? skin : top;
  return (
    <group position={[side * 0.205, 0.43, 0]} rotation={shoulder}>
      <mesh geometry={G.joint} material={top} scale={1.05} castShadow />
      <mesh geometry={G.upperArm} material={look.shortSleeves || look.gloves ? skin : top} position={[0, -0.14, 0]} castShadow />
      {look.shortSleeves && <mesh geometry={G.upperArm} material={top} position={[0, -0.06, 0]} scale={[1.18, 0.45, 1.18]} />}
      {look.mongkhon && <mesh geometry={G.armBand} material={mat(look.mongkhon, 0.5)} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />}
      <group position={[0, -0.29, 0]} rotation={[elbow, 0, 0]}>
        <mesh geometry={G.joint} material={fore} scale={0.8} />
        <mesh geometry={G.foreArm} material={fore} position={[0, -0.13, 0]} castShadow />
        {look.gloves ? (
          <mesh geometry={G.glove} material={mat(look.gloves, 0.35)} position={[0, -0.3, 0.01]} scale={[0.95, 1.1, 1.05]} castShadow />
        ) : (
          <mesh geometry={G.hand} material={skin} position={[0, -0.27, 0]} scale={[0.75, 1.15, 0.55]} castShadow />
        )}
      </group>
    </group>
  );
}

function Leg({ side, look, hip, knee }: { side: -1 | 1; look: Look; hip: V3; knee: number }) {
  const pants = mat(look.bottom, 0.85);
  const skin = mat(look.skin, 0.6);
  return (
    <group position={[side * 0.092, -0.02, 0]} rotation={hip}>
      <mesh geometry={G.thigh} material={pants} position={[0, -0.21, 0]} scale={look.shorts ? [1.12, 1, 1.12] : 1} castShadow />
      <group position={[0, -0.44, 0]} rotation={[knee, 0, 0]}>
        <mesh geometry={G.joint} material={look.shorts ? skin : pants} scale={1.05} />
        <mesh geometry={G.shin} material={look.shorts ? skin : pants} position={[0, -0.2, 0]} castShadow />
        <group position={[0, -0.43, 0]} rotation={[-knee * 0.15, 0, 0]}>
          {look.shorts && look.gloves ? (
            <mesh geometry={G.hand} material={skin} position={[0, 0.0, 0.05]} scale={[1.6, 0.9, 2.6]} castShadow />
          ) : (
            <RoundedBox args={[0.1, 0.075, 0.26]} radius={0.03} smoothness={2} position={[0, 0.0, 0.05]} material={mat(look.shoes, 0.5)} castShadow />
          )}
        </group>
      </group>
    </group>
  );
}

export function Person({ position, rotation = 0, look, pose = POSES.stand, children }: { position: V3; rotation?: number; look: Look; pose?: Pose; children?: ReactNode }) {
  const skin = mat(look.skin, 0.6);
  const hair = mat(look.hair, 0.9);
  const top = mat(look.top);
  const lean = pose.lean ?? [0, 0];
  const head = pose.head ?? [0, 0, 0];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group position={[0, pose.hipY, 0]}>
        <mesh geometry={G.pelvis} material={mat(look.bottom, 0.85)} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.78]} castShadow />
        <Leg side={-1} look={look} hip={pose.lHip} knee={pose.lKnee} />
        <Leg side={1} look={look} hip={pose.rHip} knee={pose.rKnee} />
        <group rotation={[lean[0], 0, lean[1]]}>
          <mesh geometry={G.torso} material={top} position={[0, 0.26, 0]} scale={[1, 1, 0.72]} castShadow />
          <mesh geometry={G.chest} material={top} position={[0, 0.44, 0]} scale={[1.18, 0.5, 0.78]} castShadow />
          <mesh geometry={G.neck} material={skin} position={[0, 0.55, 0.005]} />
          <group position={[0, 0.6, 0.01]} rotation={head}>
            <mesh geometry={G.head} material={skin} position={[0, 0.1, 0]} scale={[0.9, 1.12, 1]} castShadow />
            <mesh geometry={G.hair} material={hair} position={[0, 0.115, -0.012]} scale={[0.96, 1.1, 1.04]} />
            {look.longHair && <mesh geometry={G.head} material={hair} position={[0, 0.06, -0.035]} scale={[0.95, 1.15, 0.85]} />}
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={G.ear} material={skin} position={[s * 0.094, 0.09, 0]} scale={[0.6, 1, 0.9]} />
            ))}
            {look.mongkhon && <mesh geometry={G.band} material={mat(look.mongkhon, 0.5)} position={[0, 0.15, 0]} rotation={[Math.PI / 2 - 0.12, 0, 0]} />}
          </group>
          <Arm side={-1} look={look} shoulder={pose.lShoulder} elbow={pose.lElbow} />
          <Arm side={1} look={look} shoulder={pose.rShoulder} elbow={pose.rElbow} />
          {children}
        </group>
      </group>
    </group>
  );
}

/** A few ready-made looks (varied skin tones, hair and clothes). */
export const LOOKS = {
  student1: { skin: '#c68863', hair: '#1c1614', top: '#3b5b92', bottom: '#2b2f3a', shoes: '#f1f1f1' },
  student2: { skin: '#8d5a3b', hair: '#120e0c', top: '#d9634c', bottom: '#3a3f4b', shoes: '#222222', shortSleeves: true },
  student3: { skin: '#e0b48a', hair: '#5a3a22', top: '#6fa38a', bottom: '#4a4f5c', shoes: '#e9e4da', longHair: true },
  tutor: { skin: '#b5774f', hair: '#16110f', top: '#f2f2f0', bottom: '#2d3442', shoes: '#3a2b22' },
  volunteer: { skin: '#a8704b', hair: '#1a1411', top: '#f39c3d', bottom: '#2f3540', shoes: '#ffffff', shortSleeves: true },
  medic: { skin: '#d9a77c', hair: '#2b1d16', top: '#ffffff', bottom: '#5b7fb5', shoes: '#ffffff', longHair: true },
  fighter: { skin: '#a96c45', hair: '#14100e', top: '#151517', bottom: '#c3262e', shoes: '#a96c45', shorts: true, shortSleeves: true, gloves: '#c3262e', mongkhon: '#e8c547' },
  partner: { skin: '#7a4a2e', hair: '#0e0b0a', top: '#1f4fb5', bottom: '#151517', shoes: '#7a4a2e', shorts: true, shortSleeves: true, gloves: '#1f4fb5' },
} satisfies Record<string, Look>;

/** Hook-free helper to make a look with a different top colour. */
export const withTop = (l: Look, top: string): Look => ({ ...l, top });

/** For props that one person holds (a box of supplies). */
export function useBoxMat() {
  return useMemo(() => mat('#c9a37a', 0.9), []);
}
