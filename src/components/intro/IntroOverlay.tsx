import { useEffect, useState } from 'react';
import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';
import { LogoMark } from '../layout/LogoMark';
import { VerticalNav } from '../layout/VerticalNav';
import { ScrollIndicator } from '../layout/ScrollIndicator';

interface Props {
  phase: number;
  onSkip: () => void;
}

// 名前出現演出: SVG feTurbulence + feDisplacementMap で水っぽくぬるっと整う
// スクロール時はその逆で「ぬるっと歪んで消える」
export function IntroOverlay({ phase, onSkip }: Props) {
  const showName = phase >= 3;
  // 0 = 最大歪み、1 = 完全に整列
  const [liquidProgress, setLiquidProgress] = useState(0);
  // スクロール量（0..1）
  const scrollProgress = useScrollProgressValue();
  // 0..0.08 で 0..1 に正規化（軽いスクロールで一気に消える）
  const dissolveProgress = Math.min(scrollProgress / 0.08, 1);

  useEffect(() => {
    if (!showName) {
      setLiquidProgress(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 2200; // 2.2秒で水→整う
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setLiquidProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [showName]);

  // イントロ中もスクロールは禁止しない（iOS Safari のタッチハンドラスリープ問題を回避）
  // ユーザーがスクロールすると dissolveProgress が増加してイントロが自然に溶けて消える

  // 歪み量: 出現時は (1 - liquidProgress) で減衰、スクロール時は dissolveProgress で増加
  // 両者の最大値を取る → 出現が完了した後はスクロールで再び歪む
  const distortion = Math.max(1 - liquidProgress, dissolveProgress);
  const baseFreq = 0.005 + (0.055 * distortion);
  const displaceScale = 120 * distortion;
  const blur = 5 * distortion;
  // 出現時のフェードイン
  const fadeIn = Math.min(liquidProgress * 6.66, 1);
  // スクロール時のフェードアウト
  const fadeOutScroll = 1 - Math.min(dissolveProgress * 1.2, 1);
  const finalOpacity = (showName ? fadeIn : 0) * fadeOutScroll;

  // hero モード突入後に常駐ナビを表示（イントロ中は非表示）
  const showPersistentNav = phase >= 5;
  // ScrollIndicator: 常駐ナビと同じく hero モード以降、最上部のみ
  const showScrollIndicator = phase >= 5 && scrollProgress < 0.04;

  return (
    <>
      {/* 常駐ナビ（hero モード以降） */}
      {showPersistentNav && (
        <>
          <LogoMark />
          <VerticalNav />
        </>
      )}
      <ScrollIndicator visible={showScrollIndicator} />

      {/* SVG filter 定義（テキストに液状ディスプレースメントを掛ける） */}
      <svg
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id="liquid-name" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreq}
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displaceScale}
            />
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none',
          touchAction: 'pan-y',
          zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* 名前: 水っぽくぬるっと整う + フェードイン、スクロールで再び歪んで消える */}
        <div
          style={{
            opacity: finalOpacity,
            // distortion がほぼ 0 のときは SVG フィルタを無効化（モバイル GPU 負荷削減）
            filter: distortion > 0.001 ? 'url(#liquid-name)' : 'none',
            transition: 'opacity 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6em',
            userSelect: 'none',
            // 画面下方に押し下げ。ビューポート高さが低い時は ScrollIndicator と
            // 重ならないよう、画面下から最低 220px の余白を確保するように clamp
            transform: 'translateY(clamp(20px, calc(50vh - 220px), 180px))',
          }}
        >
          {/* 1行統合 */}
          <div
            style={{
              fontFamily: 'var(--font-en-head)',
              fontSize: 'clamp(2.0rem, 7vw, 4.6rem)',
              fontWeight: 900,
              color: 'var(--bone)',
              letterSpacing: '0.30em',
              textTransform: 'uppercase',
              textShadow:
                '0 0 30px rgba(200,155,255,0.6), 0 0 80px rgba(139,61,240,0.4), 0 0 4px rgba(255,255,255,0.5)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            TANNO SHOTA
          </div>
          <div
            className="hero-subtitle"
            style={{
              fontFamily: 'var(--font-en-body)',
              fontStyle: 'italic',
              fontSize: 'clamp(0.55rem, 1.6vw, 0.85rem)',
              color: 'rgba(200,155,255,0.85)',
              letterSpacing: '0.4em',
              marginTop: '0.4em',
              textTransform: 'uppercase',
              textShadow:
                '0 0 18px rgba(200,155,255,0.6), 0 0 50px rgba(139,61,240,0.4), 0 0 3px rgba(255,255,255,0.4)',
            }}
          >
            Making companies and people look the part.
          </div>
        </div>

        {/* Skip ボタン: phase < 5（イントロ進行中）のみ表示 */}
        {phase < 5 && (
          <button
            onClick={onSkip}
            style={{
              position: 'fixed',
              bottom: '2rem', right: '2rem',
              background: 'transparent',
              border: '1px solid rgba(200,155,255,0.4)',
              color: 'var(--violet-glow)',
              fontFamily: 'var(--font-en-body)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              padding: '0.4rem 0.9rem',
              cursor: 'pointer',
              pointerEvents: 'auto',
              opacity: phase >= 1 ? 1 : 0,
              transition: 'opacity 0.4s, background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,61,240,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Skip ▸
          </button>
        )}
      </div>
    </>
  );
}
