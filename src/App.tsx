import { IntroScene } from './components/intro/IntroScene';
import { ScrollProgressProvider } from './hooks/ScrollProgressContext';
import { SectionFade } from './components/layout/SectionFade';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Works } from './components/sections/Works';
import { Skills } from './components/sections/Skills';
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
        {/* Hero: 1st viewport（背景の名前ロゴを見せつつ微細装飾） */}
        <Hero />

        {/* 以下は Step 8 で本実装する仮プレースホルダー */}
        <About />
        <Works />
        <Skills />

        <SectionFade as="section" id="contact" style={sectionStyle}>
          CONTACT — coming soon
        </SectionFade>
      </main>
    </ScrollProgressProvider>
  );
}
