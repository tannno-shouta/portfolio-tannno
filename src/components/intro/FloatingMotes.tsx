import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';

// ─── 火の粉（小光点） ─────────────────────────────────────────────────────
// uBurnAmount: 0..1。スクロール時に上昇速度UP + 粒径UP（色は紫炎のまま維持）
const EMBER_VERT = /* glsl */`
  attribute float aSeed;
  attribute float aSize;
  varying float vSeed;
  varying float vAlpha;
  uniform float uTime;
  uniform float uBurnAmount;
  void main() {
    vSeed = aSeed;
    // 通常 0.35、燃焼時は 0.65 倍速で勢いUP
    float speed = mix(0.35, 0.65, uBurnAmount);
    float t = uTime * speed + aSeed * 6.28;
    vec3 pos = position;
    pos.y += mod(t, 5.0) - 1.5;
    pos.x += sin(t * 1.3 + aSeed * 9.0) * 0.25;
    pos.z += cos(t * 0.9 + aSeed * 4.0) * 0.18;

    float life = mod(t, 5.0) / 5.0;
    vAlpha = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.55, life);
    // 燃焼時に粒径少しUP
    float sizeBoost = mix(1.0, 1.35, uBurnAmount);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * sizeBoost * (300.0 / -mv.z);
  }
`;
const EMBER_FRAG = /* glsl */`
  varying float vSeed;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float halo = smoothstep(0.5, 0.15, d) * 0.5;

    // ラベンダーパレット
    vec3 inner = vec3(0.98, 0.92, 1.00);
    vec3 outer = vec3(0.72, 0.55, 1.00);
    vec3 col   = mix(outer, inner, core);

    // ちらつき
    float flicker = 0.7 + 0.3 * sin(vSeed * 50.0 + d * 20.0);
    gl_FragColor = vec4(col, (core + halo) * vAlpha * flicker);
  }
`;

function Embers({ count, isMobile, scrollProgress }: {
  count: number; isMobile: boolean; scrollProgress: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uBurnAmount: { value: 0 },
  }), []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // ドクロ周辺に散布
      const r = 1.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3]     = Math.cos(theta) * r * 0.6;
      positions[i * 3 + 1] = -1.0 + Math.random() * 0.8;
      positions[i * 3 + 2] = Math.sin(theta) * r * 0.4;
      seeds[i] = Math.random();
      sizes[i] = (isMobile ? 0.025 : 0.04) + Math.random() * 0.04;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [count, isMobile]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: EMBER_VERT,
    fragmentShader: EMBER_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [uniforms]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    // スクロール量で「燃焼度」を 0..0.08 → 0..1 に正規化（ドクロ消失と同期）
    const burnTarget = Math.min(scrollProgress / 0.08, 1);
    uniforms.uBurnAmount.value = THREE.MathUtils.lerp(
      uniforms.uBurnAmount.value, burnTarget, 0.18,
    );
  });

  return <points geometry={geo} material={mat} ref={matRef as unknown as React.RefObject<THREE.Points>} />;
}

// ─── 紫の薔薇花びら ──────────────────────────────────────────────────────
// InstancedMesh + ShaderMaterial では instanceMatrix を手動で適用する必要がある
// （three.js のデフォルトシェーダーは内部で適用してくれるが、自前のは適用しない）
const PETAL_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const PETAL_FRAG = /* glsl */`
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    // 花びら形マスク: 楕円＋先端を尖らす
    vec2 p = vUv - 0.5;
    p.x *= 1.6;                         // 縦長
    float r = length(p);
    // 上半分を尖らせる
    float taper = smoothstep(0.5, -0.1, p.y);
    float mask = smoothstep(0.5, 0.35, r) * taper;
    if (mask < 0.02) discard;

    // ラベンダーグラデ
    vec3 base   = vec3(0.42, 0.28, 0.65);   // ダスティラベンダー
    vec3 mid    = vec3(0.68, 0.55, 0.95);   // ミッドラベンダー
    vec3 tip    = vec3(0.92, 0.85, 1.00);   // ペールラベンダー
    float g = vUv.y;
    vec3 col = mix(base, mid, smoothstep(0.0, 0.5, g));
    col      = mix(col, tip, smoothstep(0.6, 1.0, g) * 0.6);

    // 中央スジ（葉脈風）
    float vein = 1.0 - smoothstep(0.0, 0.04, abs(vUv.x - 0.5));
    col += vein * 0.08;

    gl_FragColor = vec4(col, mask * uAlpha);
  }
`;

interface PetalState {
  radius: number;        // 螺旋の半径
  baseAngle: number;     // 初期角度（0〜2π）
  angVel: number;        // 角速度（回転の速さ・向き）
  riseSpeed: number;     // 上昇速度
  rotSpeed: THREE.Vector3;
  scale: number;
  seed: number;
  // 半径の動的揺らぎ用
  radiusWobbleFreq: number;
  radiusWobbleAmp: number;
}

function Petals({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const uniforms = useMemo(() => ({ uAlpha: { value: 0.85 } }), []);

  const states = useMemo<PetalState[]>(() => {
    const arr: PetalState[] = [];
    for (let i = 0; i < count; i++) {
      // 内周(0.6-1.2) と 外周(1.4-2.2) にバランス分布
      const isOuter = Math.random() > 0.55;
      const radius = isOuter
        ? 1.4 + Math.random() * 0.8
        : 0.6 + Math.random() * 0.6;
      arr.push({
        radius,
        baseAngle: Math.random() * Math.PI * 2,
        angVel: (0.25 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1), // 半数は逆回り
        riseSpeed: 0.18 + Math.random() * 0.28,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.6,
        ),
        scale: 0.16 + Math.random() * 0.14,
        seed: Math.random() * 100,
        radiusWobbleFreq: 0.3 + Math.random() * 0.6,
        radiusWobbleAmp:  0.10 + Math.random() * 0.15,
      });
    }
    return arr;
  }, [count]);

  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1.4, 1, 1), []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: PETAL_VERT,
    fragmentShader: PETAL_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  }), [uniforms]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 螺旋の Y範囲（下→上の上昇）と中心
  const Y_BOTTOM = -3.0;
  const Y_TOP    =  3.0;
  const Y_RANGE  = Y_TOP - Y_BOTTOM;
  const CENTER_Y = 0.0;     // 螺旋中心のY (FloatingMotes親localで)

  // 初期マトリクス設定（マウント直後の単位行列を防ぐ）
  useEffect(() => {
    if (!meshRef.current) return;
    states.forEach((s, i) => {
      const x = Math.cos(s.baseAngle) * s.radius;
      const z = Math.sin(s.baseAngle) * s.radius;
      dummy.position.set(x, CENTER_Y, z);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [states, dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    states.forEach((s, i) => {
      // 上昇位置: 下から上へ循環
      const lifeT = ((t * s.riseSpeed + s.seed) % 1 + 1) % 1;  // 0→1 ループ
      const y = Y_BOTTOM + lifeT * Y_RANGE;

      // 螺旋角度: ベース角 + 角速度 * t
      const angle = s.baseAngle + t * s.angVel;
      // 半径が呼吸するように揺らぐ
      const r = s.radius + Math.sin(t * s.radiusWobbleFreq + s.seed) * s.radiusWobbleAmp;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      dummy.position.set(x, CENTER_Y + y, z);

      // 葉が円周方向に向くよう少しヨーを乗せる + ランダム回転
      dummy.rotation.set(
        t * s.rotSpeed.x + s.seed,
        t * s.rotSpeed.y + s.seed + angle,
        t * s.rotSpeed.z + s.seed,
      );
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} />;
}

// ─── Public ──────────────────────────────────────────────────────────────
interface Props {
  isMobile?: boolean;
}

export function FloatingMotes({ isMobile = false }: Props) {
  const scrollProgress = useScrollProgressValue();
  const emberCount = isMobile ? 30 : 80;
  const petalCount = isMobile ? 10 : 20;

  // CameraLockedLayer 内で使われる前提でカメラ前方にシフト（カメラ相対座標）
  return (
    <group position={[0, 0, -3]}>
      <Embers count={emberCount} isMobile={isMobile} scrollProgress={scrollProgress} />
      <Petals count={petalCount} />
    </group>
  );
}
