import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  amount?: number;       // viewport にどれくらい入ったらトリガーするか (0..1)
  className?: string;
  style?: CSSProperties;
  as?: 'section' | 'div' | 'article';
  id?: string;           // アンカージャンプ用
}

// IntersectionObserver ベースのフェード＋上昇イン演出。
// once: true でリプレイなし、whileInView でビューポート進入時に発火。
export function SectionFade({
  children,
  delay = 0,
  duration = 1.0,
  yOffset = 40,
  amount = 0.25,
  className,
  style,
  as = 'section',
  id,
}: Props) {
  const Tag =
    as === 'div'     ? motion.div :
    as === 'article' ? motion.article :
                       motion.section;
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: yOffset, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
