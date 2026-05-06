import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useProgress } from '@react-three/drei';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Skull } from './Skull';
import { PurpleFlame } from './PurpleFlame';
import { PurpleMist } from './PurpleMist';
import { FloatingMotes } from './FloatingMotes';
import { IntroOverlay } from './IntroOverlay';
import { LoadingScreen } from './LoadingScreen';
import { useIntroState } from './useIntroState';

// カメラを上→正面へ弧を描いて移動させる
// phase 0-1: 真上から俯瞰 (0, 4, 0.5)
// phase 1-2: 正面に向かって弧を描く
// phase 2+:  正面固定 (0, 0.2, 3.5)
function CameraRig({ phase }: { phase: number }) {
  const { camera } = useThree();
  const progressRef = useRef(0);

  useFrame(() => {
    // 0=真上, 1=正面 のイージング進行（高速化: 約1秒で正面到達）
    const targetProgress = phase >= 1 ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgress, 0.06);
    const p = progressRef.current;

    // 球面補間でアーク移動: 真上 → 正面
    const startPhi = Math.PI * 0.08; // 上から少し前（ほぼ真上）
    const endPhi   = Math.PI * 0.5;  // 正面
    const phi = THREE.MathUtils.lerp(startPhi, endPhi, easeInOut(p));

    const radius = 3.8;
    const x = 0;
    const y = Math.cos(phi) * radius;
    const z = Math.sin(phi) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function AmbientGlow({ phase }: { phase: number }) {
  const keyRef  = useRef<THREE.PointLight>(null!);
  const rimRef  = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 0.8 + Math.sin(t * 7.3) * 0.1 + Math.sin(t * 13.1) * 0.05;
    if (keyRef.current) {
      keyRef.current.intensity = phase >= 2
        ? 4.2 * flicker
        : phase >= 1 ? 1.8 : 0.4;
    }
    if (rimRef.current) {
      rimRef.current.intensity = phase >= 2
        ? 1.9 * (0.9 + Math.sin(t * 4.1) * 0.1)
        : phase >= 1 ? 0.7 : 0.0;
    }
  });
  return (
    <>
      {/* キーライト: ドクロ前方斜め下から（凸部だけ照らす） */}
      <pointLight ref={keyRef} color="#c8a8ff" position={[0.8, 0.4, 2.2]} />
      {/* リムライト: 後方上からラベンダーを当てて輪郭を縁取る */}
      <pointLight ref={rimRef} color="#8870c8" position={[-1.0, 1.5, -1.2]} />
    </>
  );
}

// カメラに張り付くレイヤー: 背景・舞う物をカメラ移動の影響から分離する
function CameraLockedLayer({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position);
    ref.current.quaternion.copy(camera.quaternion);
  });
  return <group ref={ref}>{children}</group>;
}

function MouseDistortion({ setMouse }: { setMouse: (x: number, y: number) => void }) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse(
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2
      );
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [setMouse]);
  return null;
}

export function IntroScene() {
  // GLTFロード進捗
  const { progress, active } = useProgress();
  const [hasLoaded, setHasLoaded] = useState(false);

  // 100% 到達後、少し溜めてからイントロ開始（演出の一拍）
  useEffect(() => {
    if (progress >= 100 && !active && !hasLoaded) {
      const timer = setTimeout(() => setHasLoaded(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, active, hasLoaded]);

  // ロード完了するまでイントロタイマーは始動しない
  const { phase, skip } = useIntroState(hasLoaded);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* ── 背景レイヤー (z=1): Canvas のみ。main の下に来て常時見えるが、touch 透過 ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: 'var(--bg-void)',
          pointerEvents: 'none',
          touchAction: 'pan-y',
        }}
      >
        <Canvas
          camera={{ position: [0, 3.8, 0.3], fov: 50 }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
          gl={{ antialias: !isMobile, alpha: false }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.015} color="#c89bff" />
          <AmbientGlow phase={phase} />
          <CameraRig phase={phase} />

          {/* 背景・舞う物はカメラに張り付かせ、カメラ移動の影響を受けない */}
          {/* 火の粉・花びら・霧は最初から舞っている */}
          <CameraLockedLayer>
            <FloatingMotes isMobile={isMobile} />
            <PurpleMist intensity={1.0} />
          </CameraLockedLayer>

          {/* ドクロ・炎はワールド固定（カメラ移動の影響を受けて立体感が出る） */}
          {phase >= 1 && (
            <>
              <Skull phase={phase} mouseX={mouse.x} mouseY={mouse.y} />
              {/* 炎は phase 2 で mount し、内部のフェードイン uniform で立ち上げ */}
              {phase >= 2 && <PurpleFlame isMobile={isMobile} intensity={0.55} phase={phase} />}
            </>
          )}

          <EffectComposer>
            <Bloom
              intensity={phase >= 2 ? 2.4 : 0.5}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={isMobile ? new THREE.Vector2(0, 0) : new THREE.Vector2(0.002, 0.002)}
            />
            <Vignette eskil={false} offset={0.4} darkness={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* ── UI レイヤー (z=20): main(z=5) より上に来て、Skip / Nav のクリックが効く ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
          touchAction: 'pan-y',
        }}
      >
        <LoadingScreen progress={progress} visible={!hasLoaded} />
        <IntroOverlay phase={phase} onSkip={skip} />
      </div>

      {/* マウス位置トラッキング（不可視、layout 関係なし） */}
      <MouseDistortion setMouse={(x, y) => setMouse({ x, y })} />
    </>
  );
}
