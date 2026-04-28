import { IntroScene } from './components/intro/IntroScene';
import { ScrollProgressProvider } from './hooks/ScrollProgressContext';
import { SectionFade } from './components/layout/SectionFade';
import './styles/globals.css';

const sectionStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '10rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--bone)',
  fontFamily: 'var(--font-en-head)',
  letterSpacing: '0.4em',
  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
  textTransform: 'uppercase',
  textShadow: '0 0 20px rgba(200,155,255,0.4)',
};

export default function App() {
  return (
    <ScrollProgressProvider>
      {/* 背景: 3D シーン（fixed で全画面を占有、Step 2 でスクロール連動） */}
      <IntroScene />

      {/* 上に乗るスクロール可能なコンテンツ */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        {/* Hero: 1st viewport は空のままで、背景の名前ロゴを見せる */}
        <section style={{ minHeight: '100vh' }} aria-label="hero" />

        {/* 以下は Step 5-8 で本実装する仮プレースホルダー */}
        <SectionFade as="section" style={sectionStyle}>
          ABOUT — coming soon
        </SectionFade>

        <SectionFade as="section" style={sectionStyle}>
          WORKS — coming soon
        </SectionFade>

        <SectionFade as="section" style={sectionStyle}>
          SKILLS — coming soon
        </SectionFade>

        <SectionFade as="section" style={sectionStyle}>
          CONTACT — coming soon
        </SectionFade>
      </main>
    </ScrollProgressProvider>
  );
}
