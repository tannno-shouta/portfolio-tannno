import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';

// 画面奥に広がる紫の霧。ドクロのシルエットを溶かし、奥行きを作る
const MIST_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MIST_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(hash(i),          hash(i+vec2(1,0)), f.x),
      mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)), f.x),
      f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    mat2 rot = mat2(0.866, 0.5, -0.5, 0.866);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = rot * p * 2.05 + vec2(0.4, 0.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // 緩やかなドリフト
    float t = uTime * 0.05;
    vec2 q = vec2(fbm(uv * 1.5 + vec2(0.0, t)),
                  fbm(uv * 1.5 + vec2(3.2, -t * 0.7)));
    float m = fbm(uv * 2.0 + 0.8 * q + vec2(t * 0.3, t * 0.1));

    // 中央付近を少し濃く（光源近くの霧）
    float center = 1.0 - length(uv - 0.5) * 1.2;
    center = clamp(center, 0.0, 1.0);
    float density = m * (0.4 + center * 0.6);

    // ラベンダーグラデーション（明るさを抑えて文字が読みやすく）
    vec3 deep   = vec3(0.08, 0.05, 0.16);
    vec3 violet = vec3(0.30, 0.22, 0.52);
    vec3 glow   = vec3(0.55, 0.45, 0.78);
    vec3 col = mix(deep, violet, smoothstep(0.2, 0.55, density));
    col      = mix(col, glow,    smoothstep(0.55, 0.85, density));

    float alpha = smoothstep(0.15, 0.75, density) * 0.32 * uIntensity;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface Props {
  intensity?: number;
}

export function PurpleMist({ intensity = 1.0 }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const scrollProgress = useScrollProgressValue();

  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uIntensity: { value: intensity },
  }), [intensity]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    // スクロール時は煙だけ残る感じで濃さ UP（ドクロが消えるのを補完）
    const targetIntensity = intensity * (1.0 + Math.min(scrollProgress, 0.5) * 0.6);
    uniforms.uIntensity.value = THREE.MathUtils.lerp(
      uniforms.uIntensity.value, targetIntensity, 0.05,
    );
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   MIST_VERT,
    fragmentShader: MIST_FRAG,
    uniforms,
    transparent:    true,
    depthWrite:     false,
    side:           THREE.DoubleSide,
    blending:       THREE.NormalBlending,
  }), [uniforms]);

  // CameraLockedLayer 内で使われる前提（カメラ相対座標）。
  // ドクロより奥に置いて背景レイヤーとして機能させる
  return (
    <group>
      <mesh material={mat} ref={matRef as unknown as React.RefObject<THREE.Mesh>} position={[0, 0, -8]}>
        <planeGeometry args={[24, 14, 1, 1]} />
      </mesh>
      <mesh material={mat} position={[0.5, -0.3, -6]} rotation={[0, 0.2, 0]}>
        <planeGeometry args={[18, 11, 1, 1]} />
      </mesh>
      <mesh material={mat} position={[-0.6, 0.4, -5]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[14, 9, 1, 1]} />
      </mesh>
    </group>
  );
}
