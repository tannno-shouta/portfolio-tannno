import { useEffect, useState } from 'react';

interface Props {
  progress: number;
  visible: boolean;
}

// 円形プログレスバー: GLTFロード進捗を表示
export function LoadingScreen({ progress, visible }: Props) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // 進捗をなめらかに追従
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.5) return progress;
        return prev + diff * 0.15;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const radius = 54;
  const stroke = 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayProgress / 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease',
      }}
    >
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block' }}>
          <defs>
            <radialGradient id="loadingGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c89bff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c89bff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* 後光 */}
          <circle cx="70" cy="70" r="68" fill="url(#loadingGlow)" />
          {/* 背景リング */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(200, 155, 255, 0.12)"
            strokeWidth={stroke}
            fill="none"
          />
          {/* 進捗リング */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#c89bff"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{
              filter: 'drop-shadow(0 0 6px #8b3df0)',
            }}
          />
        </svg>
        {/* 中央の % 表記 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#c89bff',
            fontFamily: 'var(--font-en-head, "Cinzel Decorative", serif)',
            letterSpacing: '0.2em',
            textShadow: '0 0 10px #8b3df0',
          }}
        >
          <span style={{ fontSize: '1.6rem', fontWeight: 600 }}>
            {Math.round(displayProgress)}
          </span>
          <span style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: 2 }}>
            LOADING
          </span>
        </div>
      </div>
    </div>
  );
}
