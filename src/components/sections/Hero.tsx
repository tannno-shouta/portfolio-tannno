import { useScrollProgressValue } from '../../hooks/ScrollProgressContext';

// 1st viewport: 背景の Canvas（霧・ドクロ・名前）が主役のセクション。
// DOM 側はスペース確保 + 微細な装飾要素のみ（参考サイト準拠でミニマル）。
export function Hero() {
  const scrollProgress = useScrollProgressValue();
  // ヒーロー上部の微細装飾はスクロール時に消す
  const decorOpacity = Math.max(1 - scrollProgress * 8, 0);

  return (
    <section
      id="hero"
      aria-label="Hero — TANNO SHOTA"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '2.4rem',
      }}
    >
      {/* 上部中央: PORTFOLIO 2026 の微細マーカー */}
      <div
        className="hero-decor"
        aria-hidden
        style={{
          opacity: decorOpacity,
          transition: 'opacity 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.6rem',
          letterSpacing: '0.5em',
          color: 'rgba(200,155,255,0.45)',
          textTransform: 'uppercase',
          userSelect: 'none',
          marginTop: '0.6rem',
        }}
      >
        <span>· Portfolio 2026 ·</span>
        <span
          className="hero-decor__line"
          style={{
            width: '1px',
            height: '46px',
            background:
              'linear-gradient(180deg, rgba(200,155,255,0.6), rgba(200,155,255,0))',
          }}
        />
      </div>

      {/* スクリーンリーダー用見出し（視覚は Canvas 上の SVG テキスト） */}
      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        TANNO SHOTA — Engineer · Creative Director · Photographer, based in Fukuoka.
      </h1>
    </section>
  );
}
