import { SectionFade } from '../layout/SectionFade';

interface Work {
  number: string;
  title: string;
  category: string;
  description: string;
  role: string;
  stack: string[];
  href?: string;
}

const works: Work[] = [
  {
    number: '01',
    title: 'MATCHING PHOTO LP',
    category: 'Landing Page · 3D Web',
    description:
      'マッチングアプリ向けハイクラス写真撮影サービスのランディングページ。世界観を3Dとモーションで表現し、依頼導線まで一貫設計した。',
    role: 'フロントエンド設計 / WebGLアニメ / コンバージョン最適化',
    stack: ['Next.js', 'Three.js', 'TypeScript', 'Framer Motion'],
    href: 'https://matching-photo-lp.vercel.app/',
  },
  {
    number: '02',
    title: 'AI WORKFLOW SYSTEM',
    category: 'AI Tooling · Internal Ops',
    description:
      '生成AIを使った社内ワークフロー自動化システム。非エンジニア層を巻き込んだAI導入レクチャーを主導し、部署全体の目標達成率を10%向上させた。',
    role: 'プロンプト設計 / 実装 / 運用レクチャー',
    stack: ['Claude API', 'Python', 'GAS', 'Slack API'],
  },
  {
    number: '03',
    title: 'PERSONAL BRANDING LP',
    category: 'Landing Page · Brand',
    description:
      '個人事業主・経営者向けに「見た目で得をする」洗練ランディングページ。コピー・デザイン・実装まで一貫対応。',
    role: 'コピー / UI・UX / 実装',
    stack: ['Next.js', 'Tailwind', 'Framer Motion'],
  },
];

function WorkCard({ work }: { work: Work }) {
  const hasLink = !!work.href;
  const Wrapper = hasLink ? 'a' : 'article';
  const wrapperProps = hasLink
    ? { href: work.href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as object)}
      className={`work-card${hasLink ? ' work-card--link' : ''}`}
    >
      {/* 巨大番号透かし */}
      <span className="work-card__watermark" aria-hidden>
        {work.number}
      </span>

      {/* 上部: 番号 + リンクラベル */}
      <div className="work-card__head">
        <span className="work-card__index">/ {work.number}</span>
        <span className="work-card__link-label">
          {hasLink ? '↗ View site' : '— Coming soon'}
        </span>
      </div>

      {/* 装飾線 */}
      <div className="work-card__divider" aria-hidden />

      {/* タイトル + カテゴリ */}
      <h3 className="work-card__title">{work.title}</h3>
      <div className="work-card__category">{work.category}</div>

      {/* 概要 */}
      <p className="work-card__description">{work.description}</p>

      {/* Role */}
      <div className="work-card__row">
        <span className="work-card__label">Role</span>
        <span className="work-card__value">{work.role}</span>
      </div>

      {/* Stack */}
      <div className="work-card__row">
        <span className="work-card__label">Stack</span>
        <span className="work-card__tags">
          {work.stack.map((s) => (
            <span key={s} className="work-card__tag">
              #{s}
            </span>
          ))}
        </span>
      </div>
    </Wrapper>
  );
}

export function Works() {
  return (
    <SectionFade
      as="section"
      id="works"
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
        · 02 ·
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
        WORKS
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
        Selected projects
      </div>

      {/* 装飾の縦線 */}
      <div
        aria-hidden
        style={{
          margin: '2.4rem 0 3.5rem',
          width: '1px',
          height: '64px',
          background:
            'linear-gradient(180deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
        }}
      />

      {/* 案件カード（縦積み） */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
        }}
      >
        {works.map((w) => (
          <WorkCard key={w.number} work={w} />
        ))}
      </div>
    </SectionFade>
  );
}
