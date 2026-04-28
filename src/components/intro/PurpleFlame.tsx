import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';

// FBM fire shader on billboard planes
// Multiple cross-planes create convincing volumetric look

const FLAME_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLAME_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  // value noise 2D
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(hash(i),          hash(i+vec2(1,0)), f.x),
      mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)), f.x),
      f.y);
  }

  // FBM: 6 octaves（ディテール強化）
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    mat2 rot = mat2(0.8660, 0.5, -0.5, 0.8660);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p  = rot * p * 2.05 + vec2(0.3, 0.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float yBase = 1.0 - uv.y;  // 1=底, 0=頂上

    // 上昇速度を上げて流体感UP
    float speed = uTime * 2.5;

    // ── 2段階 domain warping（リアルな乱流）──
    vec2 q = vec2(
      fbm(uv * 3.0 + vec2(0.0, -speed * 0.7)),
      fbm(uv * 3.0 + vec2(5.0,  9.2) - speed * 0.55)
    );
    vec2 r = vec2(
      fbm(uv * 4.0 + 2.0 * q + vec2(1.7, 9.2) + 0.18 * speed),
      fbm(uv * 4.0 + 2.0 * q + vec2(8.3, 2.8) + 0.15 * speed)
    );
    float f = fbm(uv * 2.5 + 2.5 * r - vec2(0.0, speed * 0.85));

    // ── 形状マスク: 底太く・上で消える ──
    float taper = pow(uv.y, 0.45);
    float fireMask = f * yBase * 1.7;
    fireMask *= (1.0 - taper * 0.5);
    float edgeX = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x);
    fireMask *= edgeX;
    fireMask *= (1.0 - smoothstep(0.7, 1.0, uv.y));   // 上端で確実に消える
    fireMask = clamp(fireMask, 0.0, 1.0);

    // ── 温度勾配: 根元ほど熱い ──
    float heat = fireMask * (1.0 - uv.y * 0.35);
    heat = clamp(heat, 0.0, 1.0);

    // ── 5段階カラーランプ: 黒紫 → 暗紫炎 → 紫炎 → 鮮ラベンダー → ホット白 ──
    vec3 c0 = vec3(0.02, 0.01, 0.06);    // 黒紫（最外周）
    vec3 c1 = vec3(0.22, 0.10, 0.46);    // 暗紫炎
    vec3 c2 = vec3(0.62, 0.38, 1.00);    // 紫炎
    vec3 c3 = vec3(0.78, 0.62, 0.95);    // 鮮ラベンダー（控えめ）
    vec3 c4 = vec3(0.88, 0.78, 1.00);    // 明ラベンダー（白までは飛ばさない）

    vec3 col;
    if      (heat < 0.18) col = mix(c0, c1, heat / 0.18);
    else if (heat < 0.42) col = mix(c1, c2, (heat - 0.18) / 0.24);
    else if (heat < 0.72) col = mix(c2, c3, (heat - 0.42) / 0.30);
    else                  col = mix(c3, c4, (heat - 0.72) / 0.28);

    // 高周波 flicker（呼吸感）
    float flicker = 0.82 + 0.18 * noise(vec2(uTime * 4.5, 0.5));
    col *= flicker;

    // alpha: 加算ブレンドでも飛びすぎないバランス（控えめに）
    float alpha = fireMask * 0.45 * uIntensity;

    gl_FragColor = vec4(col, alpha);
  }
`;

interface Props {
  intensity?: number;
  isMobile?: boolean;
  phase: number;
}

export function PurpleFlame({ intensity = 1.0, isMobile = false, phase }: Props) {
  // uIntensityは0から始めて lerp でフェードイン → ドクロの口の開きと同期
  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uIntensity: { value: 0 },
  }), []);

  // スクロール量で炎をフェードアウト（ドクロの燃え尽きと同期）
  const scrollProgress = useScrollProgressValue();

  useFrame(({ clock, camera }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    // カメラが正面付近に来てから炎が立ち昇る（口の開きと同期）
    const cameraIsFront = camera.position.z > 2.8;
    let target: number;
    if (phase >= 2 && phase < 4 && cameraIsFront) target = intensity;       // intro: 燃え上がり
    else if (phase >= 4 && cameraIsFront)         target = intensity * 0.5; // hero: 弱火継続
    else                                          target = 0;
    // スクロール時に炎を薄くしていく（ドクロが消えるのと連動）
    const burnFade = 1.0 - Math.min(scrollProgress / 0.15, 1);
    target *= burnFade;
    // フェードインはやや遅め、フェードアウトは早め
    const lerpSpeed = uniforms.uIntensity.value < target ? 0.04 : 0.07;
    uniforms.uIntensity.value = THREE.MathUtils.lerp(
      uniforms.uIntensity.value, target, lerpSpeed,
    );
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   FLAME_VERT,
    fragmentShader: FLAME_FRAG,
    uniforms,
    transparent:    true,
    depthWrite:     false,
    side:           THREE.DoubleSide,
    blending:       THREE.AdditiveBlending,
  }), [uniforms]);

  // Cross-planes: 3 planes on desktop, 2 on mobile
  const angles = isMobile
    ? [0, Math.PI / 2]
    : [0, Math.PI / 3, (Math.PI * 2) / 3];

  // ドクロの下方から立ち昇る炎（ドクロは少し上、炎は下からが基本）
  const planeArgs: [number, number, number, number] = [1.9, 3.5, 1, 1];

  return (
    <group position={[0, 0.65, 0]}>
      {angles.map((angle, i) => (
        <mesh
          key={i}
          material={mat}
          rotation={[0, angle, 0]}
          position={[0, 0.4, 0]}
        >
          <planeGeometry args={planeArgs} />
        </mesh>
      ))}
    </group>
  );
}
