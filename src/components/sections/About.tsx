import { SectionFade } from '../layout/SectionFade';

interface PillarProps {
  number: string;
  title: string;
  tagline: string;
  achievements: string[];
}

function Pillar({ number, title, tagline, achievements }: PillarProps) {
  return (
    <div
      style={{
        position: 'relative',
        padding: '2.2rem 1.8rem',
        border: '1px solid rgba(200, 155, 255, 0.18)',
        borderRadius: '4px',
        background:
          'linear-gradient(180deg, rgba(20, 10, 40, 0.32), rgba(8, 4, 18, 0.28))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow:
          '0 12px 40px rgba(8, 4, 18, 0.5), inset 0 0 24px rgba(139, 61, 240, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 番号バッジ */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1.4rem',
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          color: 'rgba(200,155,255,0.45)',
        }}
      >
        / {number}
      </div>
      {/* タイトル */}
      <div
        style={{
          fontFamily: 'var(--font-en-head)',
          fontWeight: 900,
          fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
          letterSpacing: '0.16em',
          color: 'var(--bone)',
          textTransform: 'uppercase',
          textShadow: '0 0 16px rgba(139, 61, 240, 0.4)',
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      {/* タグライン */}
      <div
        style={{
          marginTop: '0.6rem',
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: 'clamp(0.78rem, 1.2vw, 0.95rem)',
          color: 'var(--violet-glow)',
          letterSpacing: '0.04em',
          lineHeight: 1.5,
        }}
      >
        “{tagline}”
      </div>
      {/* 装飾の細線 */}
      <div
        aria-hidden
        style={{
          margin: '1.4rem 0 1.2rem',
          width: '40px',
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
        }}
      />
      {/* 技術・実績ラベル */}
      <div
        style={{
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.72rem',
          letterSpacing: '0.4em',
          color: 'rgba(200, 155, 255, 0.55)',
          textTransform: 'uppercase',
          marginBottom: '0.7rem',
        }}
      >
        技術・実績
      </div>
      {/* 箇条書き */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
        }}
      >
        {achievements.map((line, i) => (
          <li
            key={i}
            style={{
              position: 'relative',
              paddingLeft: '1rem',
              fontFamily: 'var(--font-ja-body), var(--font-en-body)',
              fontSize: 'clamp(0.78rem, 1.1vw, 0.92rem)',
              lineHeight: 1.75,
              color: 'rgba(232, 226, 212, 0.82)',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: '0.7em',
                width: '6px',
                height: '1px',
                background: 'var(--violet-glow)',
                boxShadow: '0 0 6px var(--violet-core)',
              }}
            />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function About() {
  return (
    <SectionFade
      as="section"
      id="about"
      style={{
        position: 'relative',
        padding: '12rem 1.5rem 8rem',
        maxWidth: '1180px',
        margin: '0 auto',
      }}
    >
      {/* セクション番号 */}
      <div
        style={{
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.78rem',
          letterSpacing: '0.5em',
          color: 'rgba(200,155,255,0.65)',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(139,61,240,0.45)',
        }}
      >
        · 01 ·
      </div>
      {/* 大見出し */}
      <h2
        style={{
          marginTop: '0.6rem',
          fontFamily: 'var(--font-en-head)',
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          letterSpacing: '0.22em',
          color: 'var(--bone)',
          textTransform: 'uppercase',
          textShadow:
            '0 0 30px rgba(200,155,255,0.5), 0 0 60px rgba(139,61,240,0.3)',
          lineHeight: 1.1,
        }}
      >
        WHO I AM
      </h2>
      <div
        style={{
          marginTop: '0.4rem',
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: 'clamp(0.85rem, 1.6vw, 1.05rem)',
          color: 'var(--violet-glow)',
          letterSpacing: '0.18em',
        }}
      >
        About me
      </div>

      {/* 装飾の縦線 */}
      <div
        aria-hidden
        style={{
          margin: '2.4rem 0',
          width: '1px',
          height: '64px',
          background:
            'linear-gradient(180deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
        }}
      />

      {/* イントロ文 */}
      <p
        style={{
          fontFamily: 'var(--font-ja-body), var(--font-en-body)',
          fontSize: 'clamp(0.95rem, 1.7vw, 1.18rem)',
          lineHeight: 2,
          color: 'rgba(232, 226, 212, 0.92)',
          letterSpacing: '0.05em',
          maxWidth: '720px',
        }}
      >
        <strong
          style={{
            fontFamily: 'var(--font-en-head)',
            fontWeight: 700,
            color: 'var(--bone)',
            letterSpacing: '0.1em',
            textShadow: '0 0 12px rgba(200,155,255,0.4)',
          }}
        >
          Engineer & Creative Director — Code, Style, and the Lens.
        </strong>
        <br />
        Based in Fukuoka, Japan.
        <br />
        AI・ITコンサルタント / フロントエンドエンジニア × ファッションディレクター / カメラマン。
        AI・IT で課題を解き、Style で垢抜けさせ、カメラマンとして魅せる。
        「世の中にかっこいい会社とかっこいい人を満たす」を掲げています。
      </p>

      {/* 3本柱 — 3カラムグリッド（モバイルで1列フォールバック） */}
      <div className="about-pillars-grid">
        <Pillar
          number="01"
          title="Frontend"
          tagline="Interfaces that move and feel"
          achievements={[
            'React・TypeScript 等を用いたアジャイル開発',
            '高齢者向けシステムの UI 抜本改善により顧客満足度に貢献',
            '高単価 EC サイトでの A/B テストを通じた高速な仮説検証・運用',
          ]}
        />
        <Pillar
          number="02"
          title="Generative AI"
          tagline="AI as a daily collaborator"
          achievements={[
            'Claude Code を用いた「バイブコーディング」で、圧倒的なスピードで AI を実務ツールとして開発',
            '非エンジニア層を巻き込んだ AI 導入レクチャーの主導',
            '業務自動化により部署全体の売上目標達成率 20%↑',
          ]}
        />
        <Pillar
          number="03"
          title="Style"
          tagline="Sense, made measurable"
          achievements={[
            'ファッション・写真・身だしなみのパーソナルブランディング',
            '8 年間のプロ美容師としての知識を、センスではなく科学的な根拠に基づいた再現性のあるロジックへ昇華',
            '直感ではなく構造で、ポテンシャルを最大化するメソッドを提供',
          ]}
        />
      </div>
    </SectionFade>
  );
}
