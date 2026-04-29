interface Props {
  visible: boolean;
}

// マウス型カプセル + ドット下降アニメ + SCROLL ラベル
// hero モード&スクロール 0% でのみ表示
export function ScrollIndicator({ visible }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '3.2rem',
        left: '50%',
        transform: `translate(-50%, ${visible ? 0 : '20px'})`,
        zIndex: 15,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.7rem',
        userSelect: 'none',
      }}
    >
      {/* マウス枠 */}
      <div className="scroll-mouse" aria-hidden />
      {/* ラベル */}
      <span
        style={{
          fontFamily: 'var(--font-en-head)',
          fontSize: '0.7rem',
          letterSpacing: '0.45em',
          color: 'rgba(200,155,255,0.85)',
          textShadow: '0 0 10px rgba(139,61,240,0.55)',
          textTransform: 'uppercase',
        }}
      >
        SCROLL
      </span>
    </div>
  );
}
