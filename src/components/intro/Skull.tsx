import { useRef, useMemo, Suspense, Component, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';

// ─── shared GLSL helpers ────────────────────────────────────────────────────
const GLSL_HASH = /* glsl */`
  float hash(float n) { return fract(sin(n) * 43758.5453); }
`;
const GLSL_NOISE = /* glsl */`
  float noise3(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f*f*(3.0-2.0*f);
    float n = i.x + i.y*157.0 + 113.0*i.z;
    return mix(
      mix(mix(hash(n),hash(n+1.),f.x),mix(hash(n+157.),hash(n+158.),f.x),f.y),
      mix(mix(hash(n+113.),hash(n+114.),f.x),mix(hash(n+270.),hash(n+271.),f.x),f.y),
      f.z);
  }
`;

// ─── bone shader ────────────────────────────────────────────────────────────
// === 表面凹凸パラメータ（自由に調整して質感を変えられる）===
//   SURFACE_BUMP_AMP : 頂点ディスプレースメントの大きさ（0=平ら, 0.10=ボコボコ）
//   SURFACE_BUMP_FREQ: 凹凸の細かさ（大きいほど細かい）
//   uBurnProgress    : 0..1。スクロールで「水っぽくぬるっと」歪みながら消える
const BONE_VERT = /* glsl */`
  uniform float uTime;
  uniform float uBurnProgress;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  const float SURFACE_BUMP_AMP  = 0.040;
  const float SURFACE_BUMP_FREQ = 3.5;

  ${GLSL_HASH}${GLSL_NOISE}
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 pos  = position;
    // 通常の表面凹凸
    pos += normal * noise3(pos * SURFACE_BUMP_FREQ + uTime * 0.25) * SURFACE_BUMP_AMP;
    // ─ 水っぽい消失ディスプレース: スクロール時に大きく歪んで形が崩れる ─
    if (uBurnProgress > 0.0001) {
      vec3 disDir = vec3(
        noise3(pos * 1.8 + vec3(uTime * 0.4,        0.0,         0.0)),
        noise3(pos * 1.8 + vec3(0.0,         uTime * 0.45, 7.3)),
        noise3(pos * 1.8 + vec3(0.0,         0.0,        uTime * 0.5  + 13.7))
      ) - 0.5;
      pos += disDir * uBurnProgress * 1.4;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
// === 質感パラメータ（自由に調整可）===
//   NORMAL_NOISE_AMP   : マイクロ凹凸の強さ（0=つるん, 0.4=ザラザラ）
//   NORMAL_NOISE_FREQ  : マイクロ凹凸の細かさ
//   SPECULAR_STRENGTH  : 光沢の強さ（0=完全マット, 2=ピカピカ）
//   SPECULAR_POWER     : 光沢のシャープさ（小さいほどぼんやり広い、大きいほど局所的に鋭い）
//   FRESNEL_POWER      : リムライトの広さ（小さいほど広い）
//   FRESNEL_STRENGTH   : リムライトの強さ
//   BASE_DARK / BASE_LIT : 暗部・明部の基本色
const BONE_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uFlamePhase;
  uniform float uOpacity;
  uniform float uBurnProgress;   // スクロール連動の燃え尽き進行 (0..1)
  varying vec3  vNormal;
  varying vec3  vWorldPos;

  const float NORMAL_NOISE_AMP  = 0.22;
  const float NORMAL_NOISE_FREQ = 14.0;
  const float SPECULAR_STRENGTH = 1.35;
  const float SPECULAR_POWER    = 38.0;
  const float FRESNEL_POWER     = 1.9;
  const float FRESNEL_STRENGTH  = 0.55;
  // 暗部を底上げ: 黒に沈みすぎないようにして歯などのディテールを残す
  const vec3  BASE_DARK = vec3(0.080, 0.070, 0.110);
  const vec3  BASE_LIT  = vec3(0.80, 0.76, 0.70);

  ${GLSL_HASH}${GLSL_NOISE}
  float fbm(vec3 p) {
    float v=0.0; float a=0.5;
    for(int i=0;i<4;i++){v+=a*noise3(p);p*=2.1;a*=0.5;}
    return v;
  }

  // 法線ノイズ摂動: 骨表面のマイクロ凹凸（小さな穴・隆起）を表現
  vec3 perturbNormal(vec3 N, vec3 p) {
    float e = 0.002;
    float n0 = fbm(p * NORMAL_NOISE_FREQ);
    vec3  d  = vec3(
      fbm(p * NORMAL_NOISE_FREQ + vec3(e,0,0)) - n0,
      fbm(p * NORMAL_NOISE_FREQ + vec3(0,e,0)) - n0,
      fbm(p * NORMAL_NOISE_FREQ + vec3(0,0,e)) - n0
    ) / e;
    return normalize(N + d * NORMAL_NOISE_AMP);
  }

  void main() {
    // マイクロ凹凸入りの法線
    vec3 N = perturbNormal(normalize(vNormal), vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdV = max(dot(N,V),0.0);
    vec3 L = normalize(vec3(0.45, 0.35, 0.85));
    float diff = max(dot(N,L),0.0);
    float sss  = pow(max(dot(-V,N),0.0),2.0)*0.5;

    // ─ 1) 骨色ベース（弱め）─
    float shaded  = smoothstep(-0.10, 0.60, diff);
    vec3 bone     = mix(BASE_DARK, BASE_LIT, shaded);
    bone += vec3(0.45, 0.32, 0.78) * sss * 0.3;

    // ─ 2) 内側発光コア（中心に向かって明るく光る）─
    float core = pow(NdV, 2.5);
    vec3 coreCol = mix(
      vec3(0.18, 0.10, 0.30),         // 外周は暗紫
      vec3(0.95, 0.78, 1.00),         // 内側は明るいラベンダー
      core
    );

    // ─ 3) 骨色 ↔ 発光コア を混合（骨感を弱め、発光優位に）─
    vec3 col = mix(bone * 0.35, coreCol, 0.7 + core * 0.25);

    // ─ 4) 表面を這う紫炎（uFlamePhase で出現）─
    float flame = fbm(vWorldPos*3.5 + vec3(0., -uTime*2., 0.));
    flame = smoothstep(0.35, 0.85, flame) * uFlamePhase;
    col = mix(col, vec3(0.85, 0.55, 1.00), flame * 0.45);

    // ─ 5) リムは控えめに（過剰発光防止）─
    float fresnel = pow(1.0 - NdV, FRESNEL_POWER);
    col += vec3(0.78, 0.65, 1.00) * fresnel * FRESNEL_STRENGTH * 0.5;

    // ─ 6) 凸部のスペキュラ（控えめに、煙に溶ける感を残す）─
    vec3 H = normalize(L+V);
    col += vec3(1.0, 0.95, 1.0) * pow(max(dot(N,H),0.0), SPECULAR_POWER) * SPECULAR_STRENGTH * 0.4;

    // ─ 7) ★ 煙アルファマスク: 強めの煙化 ─
    // 2層のノイズで複雑な煙テクスチャ
    float smokeN1 = fbm(vWorldPos * 6.0 + vec3(0., -uTime * 0.5, 0.));
    float smokeN2 = fbm(vWorldPos * 12.0 + vec3(0., -uTime * 0.8, 0.));
    float smokeN = smokeN1 * 0.65 + smokeN2 * 0.35;

    float edgeMask  = smoothstep(0.0, 0.50, NdV);                  // エッジを広く透明化
    float noiseMask = smoothstep(0.05, 0.95, smokeN + 0.05);        // ノイズの欠け感を強く
    float alpha     = edgeMask * mix(0.15, 0.80, noiseMask);        // 中心も少し透ける

    // hero モードでさらに薄く
    alpha *= uOpacity;

    // ─ 8) ★ 水っぽいぬるっと消失ディゾルブ ─
    // 名前出現の SVG ディスプレース演出の「逆」: 歪んでバラけながら消える
    if (uBurnProgress > 0.0001) {
      // 大きめノイズで「先に消えるピクセル」をランダムに決める
      float dissolveN = fbm(vWorldPos * 2.5 + vec3(uTime * 0.25, 0.0, 0.0));
      // 閾値が uBurnProgress を超えたピクセルは discard
      float dissolveThreshold = uBurnProgress * 1.4 - 0.2;
      if (dissolveN < dissolveThreshold) discard;
      // 残るピクセルもアルファをじわっと下げる
      alpha *= (1.0 - smoothstep(0.6, 1.0, uBurnProgress));
      // 消失境界に薄紫グロー（カラーマップ）
      float distFromEdge = dissolveN - dissolveThreshold;
      float edgeGlow = smoothstep(0.0, 0.04, distFromEdge) *
                       (1.0 - smoothstep(0.04, 0.30, distFromEdge));
      vec3 dissolveGradient =
        mix(vec3(0.40, 0.20, 0.85),    // 薄紫
            vec3(0.78, 0.55, 1.00),    // ラベンダー
            smoothstep(0.0, 0.20, distFromEdge));
      col += dissolveGradient * edgeGlow * 2.2;
    }

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── shared hook for uniforms + rotation ────────────────────────────────────
function useSkullFrame(
  groupRef: React.RefObject<THREE.Group>,
  uniforms: {
    uTime: { value: number };
    uFlamePhase: { value: number };
    uOpacity: { value: number };
    uBurnProgress: { value: number };
  },
  phase: number,
  mouseX: number,
  mouseY: number,
  scrollProgress: number,
) {
  useFrame(({ clock, camera }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    // カメラが正面に近づいてから炎が燃え上がる
    const cameraIsFront = camera.position.z > 2.8;
    let flameTarget: number;
    if (phase >= 2 && phase < 4 && cameraIsFront) flameTarget = 1.0;       // intro: 燃え上がり
    else if (phase >= 4 && cameraIsFront)         flameTarget = 0.45;      // hero: 弱火で継続
    else                                          flameTarget = 0;
    const flameLerp = uniforms.uFlamePhase.value < flameTarget ? 0.04 : 0.07;
    uniforms.uFlamePhase.value = THREE.MathUtils.lerp(
      uniforms.uFlamePhase.value, flameTarget, flameLerp,
    );

    // ドクロの透明度: phase 5 (hero) で薄く残し、煙に溶ける表現に
    const opacityTarget = phase >= 5 ? 0.28 : phase >= 4 ? 0.55 : 1.0;
    uniforms.uOpacity.value = THREE.MathUtils.lerp(
      uniforms.uOpacity.value, opacityTarget, 0.04,
    );

    // 水っぽい消失: hero(phase 5)以降のスクロールで進行
    // scrollProgress 0..0.08 で 0..1 に正規化（軽いスクロールで一気に消える）
    const canBurn = phase >= 5;
    const burnTarget = canBurn ? Math.min(scrollProgress / 0.08, 1) : 0;
    uniforms.uBurnProgress.value = THREE.MathUtils.lerp(
      uniforms.uBurnProgress.value, burnTarget, 0.18,
    );

    // マウスで微妙に傾く程度（自動回転はなし）
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, mouseY * 0.12, 0.04,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, mouseX * 0.15, 0.04,
      );
    }
  });
}

// 表示するノード名（頭蓋骨 + 顎骨のみ）
const VISIBLE_NODES = new Set(['default013', 'Object014']);
// プレビュー用の複製・赤インジケーターは非表示
const HIDDEN_NODES  = new Set(['Object015', 'default014', 'Cylinder001', 'Cylinder002', 'Box001']);
// アニメーションは 0.333s(閉) → 1.333s(最大開き40°) → 3.000s(閉) の1サイクル。
// OPENを3.0にすると閉→閉のlerpで開閉が2回出るので、最大開きの1.333を指定。
const JAW_ANIM_OPEN          = 1.333;   // intro: 全開（約40°）
const JAW_ANIM_CLOSE         = 0.333;   // 閉
const JAW_ANIM_BREATH_OPEN   = 0.700;   // hero: 控えめな呼吸開き（約12°、全開の1/3）

// ─── GLTF skull (used when /skull.glb is present) ───────────────────────────
function GLTFSkull({ phase, mouseX, mouseY, uniforms, scrollProgress }: {
  phase: number; mouseX: number; mouseY: number;
  uniforms: {
    uTime: { value: number };
    uFlamePhase: { value: number };
    uOpacity: { value: number };
    uBurnProgress: { value: number };
  };
  scrollProgress: number;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const mixerRef  = useRef<THREE.AnimationMixer | null>(null);

  const { scene: rawScene, animations } = useGLTF('/skull.glb');

  const boneMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: BONE_VERT,
    fragmentShader: BONE_FRAG,
    uniforms,
    transparent: true,        // 煙のように半透明描画
    depthWrite: false,        // 透明部分が後ろのオブジェクトを隠さない
    side: THREE.DoubleSide,   // 内側からも見える（煙感）
  }), [uniforms]);

  const clone = useMemo(() => {
    const c = rawScene.clone(true);

    // 先祖ノードのどこかに VISIBLE_NODES の名前があるか確認
    const hasVisibleAncestor = (obj: THREE.Object3D): boolean => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (VISIBLE_NODES.has(cur.name)) return true;
        if (HIDDEN_NODES.has(cur.name))  return false;
        cur = cur.parent;
      }
      return false;
    };

    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const visible = hasVisibleAncestor(obj);
      mesh.visible  = visible;
      if (visible) mesh.material = boneMat;
    });

    // 正確なバウンディングボックスで中央・スケール合わせ
    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c, true);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const fitScale = 2.1 / Math.max(size.x, size.y, size.z);

    c.scale.setScalar(fitScale);
    // 外側 group が Y軸 -π/2 回転してる → ローカル -Z 方向がワールド +X (画面右) になる
    c.position.set(
      -center.x * fitScale,
      -center.y * fitScale + 0.45,   // 少し上方にシフト
      -center.z * fitScale - 0.1,    // ほんの少し右（マイナスzで画面右）
    );

    return c;
  }, [rawScene, boneMat]);

  // AnimationMixer セットアップ
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  useMemo(() => {
    if (!animations?.length) return;
    const mixer  = new THREE.AnimationMixer(clone);
    const action = mixer.clipAction(animations[0]);
    action.play();
    action.timeScale = 0; // 時刻を手動制御
    action.time = JAW_ANIM_CLOSE;
    mixer.update(0);
    mixerRef.current  = mixer;
    actionRef.current = action;
  }, [clone, animations]);

  // 顎アニメ
  useFrame(({ camera, clock }) => {
    const mixer  = mixerRef.current;
    const action = actionRef.current;
    if (!mixer || !action) return;

    const t = clock.getElapsedTime();
    const cameraIsFront = camera.position.z > 2.8;

    // 呼吸モード（控えめ開閉、sin駆動）
    const breath = 0.5 + 0.5 * Math.sin(t * 0.6 - Math.PI / 2);
    const breathTarget = JAW_ANIM_CLOSE + (JAW_ANIM_BREATH_OPEN - JAW_ANIM_CLOSE) * breath;

    if (phase === 2 && cameraIsFront) {
      // intro: ゆっくり最大開き（lerp 0.06）
      action.time = THREE.MathUtils.lerp(action.time, JAW_ANIM_OPEN, 0.06);
    } else if (phase === 3 && cameraIsFront) {
      // 名前出現中: 開いたまま維持
      action.time = THREE.MathUtils.lerp(action.time, JAW_ANIM_OPEN, 0.06);
    } else if (phase >= 5) {
      // hero モード: ゆっくり呼吸（既存）
      action.time = THREE.MathUtils.lerp(action.time, breathTarget, 0.08);
    } else {
      // phase 0/1/4: 閉じる
      action.time = THREE.MathUtils.lerp(action.time, JAW_ANIM_CLOSE, 0.13);
    }

    mixer.update(0);
  });

  useSkullFrame(groupRef, uniforms, phase, mouseX, mouseY, scrollProgress);

  return (
    // 外側: 静的な向き補正（ローカル+Xが顔 → -π/2 でカメラ方向+Zに向ける）
    // 内側: マウス追従の動的回転（useSkullFrameが書き換える）
    // → 分離しないとマウス追従が初期rotationを打ち消すバグになる
    <group rotation={[0, -Math.PI / 2, 0]}>
      <group ref={groupRef}>
        <primitive object={clone} />
      </group>
    </group>
  );
}

// ─── Error boundary for GLTF load failure ───────────────────────────────────
interface EBProps { children: ReactNode; fallback: ReactNode; }
interface EBState { hasError: boolean; }
class GLTFBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// preload so the GLTF is ready before phase 1 triggers
useGLTF.preload('/skull.glb');

// ─── Public Skull component ──────────────────────────────────────────────────
interface Props { phase: number; mouseX?: number; mouseY?: number; }

export function Skull({ phase, mouseX = 0, mouseY = 0 }: Props) {
  const scrollProgress = useScrollProgressValue();

  const uniforms = useMemo(() => ({
    uTime:         { value: 0 },
    uFlamePhase:   { value: 0 },
    uOpacity:      { value: 1.0 },
    uBurnProgress: { value: 0 },
  }), []);

  // fallback = nothing (漆黒のまま待つ。プリミティブのちゃっちいドクロは見せない)
  const fallback = <group />;

  return (
    <GLTFBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLTFSkull
          phase={phase}
          mouseX={mouseX}
          mouseY={mouseY}
          uniforms={uniforms}
          scrollProgress={scrollProgress}
        />
      </Suspense>
    </GLTFBoundary>
  );
}
