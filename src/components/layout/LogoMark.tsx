// 左上の常駐エンブレム「TS」
export function LogoMark() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '2.2rem',
        left: '2.2rem',
        zIndex: 15,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-en-head)',
          fontSize: '1.6rem',
          fontWeight: 900,
          color: 'var(--bone)',
          letterSpacing: '0.10em',
          lineHeight: 1,
          textShadow:
            '0 0 14px rgba(200,155,255,0.45), 0 0 30px rgba(139,61,240,0.30)',
        }}
      >
        TS
      </div>
      {/* 下線アクセント */}
      <div
        aria-hidden
        style={{
          width: '24px',
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
          marginTop: '0.2rem',
        }}
      />
    </div>
  );
}
