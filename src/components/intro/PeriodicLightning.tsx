import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lightning from './Lightning';

interface Props {
  enabled: boolean;
  isMobile?: boolean;
}

// 演出意図: イントロ完了後、嵐の世界観として遠雷が時々閃く。
// Lightning コンポーネントは常時描画されるため、wrapper の opacity だけを
// 鋭く立ち上げ→ゆっくり減衰させて「閃光→残光」の質感を出す。
export function PeriodicLightning({ enabled, isMobile = false }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const triggerStrike = () => {
      const div = wrapperRef.current;
      if (!div) return;

      // ピーク強度をランダム化（0.45〜0.70）→ 雷の大小感
      const peak = 0.45 + Math.random() * 0.25;

      // 急峻な立ち上がり（60ms）
      div.style.transition = 'opacity 60ms ease-out';
      div.style.opacity = String(peak);

      // ホールド後、ゆったりフェードアウト
      fadeTimeoutId = setTimeout(() => {
        if (!wrapperRef.current) return;
        wrapperRef.current.style.transition = 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)';
        wrapperRef.current.style.opacity = '0';
      }, 180);

      // 次の閃光を予約: 6〜14秒のランダム間隔
      const nextDelay = 6000 + Math.random() * 8000;
      timeoutId = setTimeout(triggerStrike, nextDelay);
    };

    // 初回閃光: イントロ終了後 1.5 秒の余韻のあとに
    timeoutId = setTimeout(triggerStrike, 1500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
    };
  }, [enabled, isMobile, prefersReducedMotion]);

  // モバイルとアクセシビリティ要件下では完全無効化（描画コストもゼロにする）
  if (isMobile || prefersReducedMotion) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      {/* hue=280: 紫炎カラー（--violet-core 相当の HSV）に統一 */}
      <Lightning hue={280} intensity={1.2} speed={1.4} size={1.6} />
    </div>
  );
}
