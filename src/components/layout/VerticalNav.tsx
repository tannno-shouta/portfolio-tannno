interface ItemProps {
  side: 'right' | 'left-bottom';
  number: string;
  label: string;
  href?: string;
}

function NavItem({ side, number, label, href }: ItemProps) {
  const positionStyle: React.CSSProperties =
    side === 'right'
      ? { right: '1.8rem', top: '50%', transform: 'translateY(-50%)' }
      : { left: '1.8rem', bottom: '2.2rem' };

  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      {...(href ? { href } : {})}
      style={{
        position: 'fixed',
        zIndex: 15,
        pointerEvents: href ? 'auto' : 'none',
        userSelect: 'none',
        textDecoration: 'none',
        ...positionStyle,
        // 縦書き
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        fontFamily: 'var(--font-en-body)',
        fontStyle: 'italic',
        fontSize: '0.72rem',
        letterSpacing: '0.45em',
        textTransform: 'uppercase',
        color: 'rgba(200,155,255,0.75)',
        textShadow: '0 0 10px rgba(139,61,240,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7em',
        transition: 'color 0.3s ease, text-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!href) return;
        e.currentTarget.style.color = 'var(--bone)';
        e.currentTarget.style.textShadow = '0 0 16px rgba(200,155,255,0.8)';
      }}
      onMouseLeave={(e) => {
        if (!href) return;
        e.currentTarget.style.color = 'rgba(200,155,255,0.75)';
        e.currentTarget.style.textShadow = '0 0 10px rgba(139,61,240,0.4)';
      }}
    >
      <span style={{ opacity: 0.55 }}>{number}</span>
      <span aria-hidden style={{ opacity: 0.5 }}>·</span>
      <span>{label}</span>
    </Tag>
  );
}

// 右に「WORKS · 02」、左下に「WHO I AM · 01」を縦書きで配置
export function VerticalNav() {
  return (
    <>
      <NavItem side="left-bottom" number="01" label="WHO I AM" href="#about" />
      <NavItem side="right"       number="02" label="WORKS"    href="#works" />
    </>
  );
}
