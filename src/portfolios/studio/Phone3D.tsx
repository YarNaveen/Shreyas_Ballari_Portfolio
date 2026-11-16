import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { AnimationMixer, Box3, Group, LoopOnce, MathUtils, Mesh, MeshStandardMaterial, PMREMGenerator, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { phoneState } from './phoneState';

/**
 * The folding phone in real 3D (public/models/apple_iphone_duo_fold_star_white_2026_animated.glb,
 * "Apple iPhone Duo Fold Star White 2026 (Animated)" by extraakash on Sketchfab). The scroll
 * drives its own open-close animation and turns it towards the visitor; once it is fully open,
 * the live site on the screen takes over (see StudioPortfolio). Drawn only when the scroll moves.
 */

export const PHONE_URL = `${import.meta.env.BASE_URL}models/apple_iphone_duo_fold_star_white_2026_animated.glb`;


function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Phone({ height, width, cover, inside, rim, onReady }: { height: number; width: number; cover: string; inside: string; rim: string; onReady: () => void }) {
  const gltf = useGLTF(PHONE_URL);
  const { invalidate, camera, gl } = useThree();
  const group = useRef<Group>(null);
  const { root, mixer, duration, closedH, openW, closed, open } = useMemo(() => {
    const root = gltf.scene;
    const mixer = new AnimationMixer(root);
    const clip = gltf.animations[0];
    let duration = 1;
    if (clip) {
      const action = mixer.clipAction(clip);
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      duration = clip.duration;
    }
    // The clip runs open → closed: measure the closed phone, centre it on its own middle.
    mixer.setTime(Math.max(0, duration - 1e-3));
    root.position.set(0, 0, 0);
    root.updateMatrixWorld(true);
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const closed = box.getCenter(new Vector3());
    // And the open phone's middle, so it stays centred at every point of the unfold.
    mixer.setTime(0);
    root.updateMatrixWorld(true);
    const openBox = new Box3().setFromObject(root);
    const open = openBox.getCenter(new Vector3());
    const openW = openBox.getSize(new Vector3()).x;
    mixer.setTime(Math.max(0, duration - 1e-3));
    root.position.copy(closed).negate();
    return { root, mixer, duration, closedH: Math.max(size.y, 1e-6), openW: Math.max(openW, 1e-6), closed, open };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);
  const fit = useRef<Group>(null);

  // His pictures on the two screens (the cover outside, the big screen inside).
  useEffect(() => {
    const loader = new TextureLoader();
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as MeshStandardMaterial;
      const src = mat.name === 'C_SW_Screen_Outer' ? cover : mat.name === 'C_StarWhite_Screen_Inner' ? inside : null;
      if (!src) return;
      loader.load(src, (t) => {
        t.colorSpace = SRGBColorSpace;
        t.flipY = false;
        mat.emissiveMap = t;
        mat.needsUpdate = true;
        invalidate();
      });
    });
  }, [root, cover, inside, invalidate]);

  // The frame takes the colour picked under the phone.
  useEffect(() => {
    root.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as MeshStandardMaterial;
      if (/^C_StarWhite_Side|^C_SW_Side_Matte|^C_StarWhite_Backpanel$|^C_SW_ButtonCap/.test(mat.name)) {
        mat.color.set(rim);
        mat.needsUpdate = true;
      }
    });
    invalidate();
  }, [root, rim, invalidate]);

  // Prepare its shaders off the main thread first, then show it.
  useEffect(() => {
    // Ready only once it has really been drawn (a failed load or preparation keeps the drawn phone).
    gl.compileAsync(root, camera).then(() => {
      invalidate();
      requestAnimationFrame(() => requestAnimationFrame(onReady));
    }, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The scroll sets how open it is; each change draws one frame.
  useEffect(() => {
    const apply = () => {
      const u = phoneState.u;
      mixer.setTime(Math.min(duration - 1e-3, (1 - u) * duration));
      root.position.lerpVectors(closed, open, u).negate();
      // Closed it is as tall as the page's phone; open, exactly as wide as the live screen.
      fit.current?.scale.setScalar(MathUtils.lerp(height / closedH, width / openW, u * u));
      const g = group.current;
      if (g) {
        // Closed: a three-quarter product view; opening: it turns to face the visitor.
        g.rotation.set(0.12 * (1 - u), -0.55 * (1 - u) + Math.sin(u * Math.PI) * -0.18, 0);
      }
      invalidate();
    };
    phoneState.redraw = apply;
    apply();
    return () => {
      phoneState.redraw = () => {};
    };
  }, [mixer, duration, invalidate, root, closed, open, height, width, closedH, openW]);

  return (
    <group ref={group}>
      <group ref={fit} scale={height / closedH}>
        <primitive object={root} />
      </group>
    </group>
  );
}

export function Phone3D({ height, width, cover, inside, rim, onReady, onLost }: { height: number; width: number; cover: string; inside: string; rim: string; onReady: () => void; onLost: () => void }) {
  // Camera far enough that 1 unit at the phone is 1 pixel on screen (so it matches the page layout).
  const fov = 22;
  const dist = useMemo(() => (typeof window === 'undefined' ? 1000 : window.innerHeight / 2 / Math.tan((fov * Math.PI) / 360)), []);
  return (
    <Canvas
      className="fo-3d"
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // If the browser drops this 3D view (too many open at once, or the graphics chip resets), the
      // drawn phone comes back instead of a blank space.
      onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', onLost)}
      camera={{ fov, position: [0, 0, dist], near: dist / 10, far: dist * 4 }}
    >
      <Studio />
      <directionalLight position={[300, 500, 800]} intensity={1.2} />
      <Suspense fallback={null}>
        <Phone height={height} width={width} cover={cover} inside={inside} rim={rim} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
