import { IntroScene } from './components/intro/IntroScene';
import { ScrollProgressProvider } from './hooks/ScrollProgressContext';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Works } from './components/sections/Works';
import { Skills } from './components/sections/Skills';
import { Contact } from './components/sections/Contact';
import './styles/globals.css';

export default function App() {
  return (
    <ScrollProgressProvider>
      {/* 背景: 3D シーン（fixed で全画面を占有） */}
      <IntroScene />

      {/* 上に乗るスクロール可能なコンテンツ */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        {/* Hero: 1st viewport（背景の名前ロゴを見せつつ微細装飾） */}
        <Hero />
        <About />
        <Works />
        <Skills />
        <Contact />
      </main>
    </ScrollProgressProvider>
  );
}
