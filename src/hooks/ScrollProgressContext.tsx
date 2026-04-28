import { createContext, useContext, type ReactNode } from 'react';
import { useScrollProgress } from './useScrollProgress';

const ScrollProgressContext = createContext<number>(0);

interface Props {
  children: ReactNode;
}

export function ScrollProgressProvider({ children }: Props) {
  const progress = useScrollProgress();
  return (
    <ScrollProgressContext.Provider value={progress}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

// ページのスクロール進捗 0..1 を読み取る
export function useScrollProgressValue() {
  return useContext(ScrollProgressContext);
}
