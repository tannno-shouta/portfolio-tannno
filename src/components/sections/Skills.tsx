import { SectionFade } from '../layout/SectionFade';

interface SkillCategory {
  number: string;
  label: string;
  skills: string[];
}

const categories: SkillCategory[] = [
  {
    number: '01',
    label: 'Frontend',
    skills: ['React', 'TypeScript', 'HTML', 'CSS', 'JavaScript'],
  },
  {
    number: '02',
    label: 'Generative AI',
    skills: ['Claude Code', 'Codex', 'RAG'],
  },
  {
    number: '03',
    label: 'Backend / Infra',
    skills: ['Node.js', 'Ruby on Rails', 'Vercel', 'GitHub'],
  },
  {
    number: '04',
    label: 'Consultant',
    skills: ['IT Consultant', 'AI Consultant'],
  },
  {
    number: '05',
    label: 'Design / Brand',
    skills: ['Figma', '撮影ディレクション', 'パーソナルスタイリング', '美容師経験'],
  },
];

function SkillRow({ cat }: { cat: SkillCategory }) {
  return (
    <div className="skill-row">
      <div className="skill-row__heading">
        <span className="skill-row__number">/ {cat.number}</span>
        <span className="skill-row__label">{cat.label}</span>
      </div>
      <div className="skill-row__badges">
        {cat.skills.map((s) => (
          <span key={s} className="skill-badge">
            #{s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <SectionFade
      as="section"
      id="skills"
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
        · 03 ·
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
        SKILLS
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
        What I bring
      </div>

      {/* 装飾の縦線 */}
      <div
        aria-hidden
        style={{
          margin: '2.4rem 0 2rem',
          width: '1px',
          height: '64px',
          background:
            'linear-gradient(180deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
        }}
      />

      {/* スキル一覧（縦積み + 横並びバッジ） */}
      <div className="skill-list">
        {categories.map((c) => (
          <SkillRow key={c.number} cat={c} />
        ))}
      </div>
    </SectionFade>
  );
}
