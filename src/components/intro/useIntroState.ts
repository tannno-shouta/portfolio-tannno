import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'intro-played';

export type IntroPhase = 0 | 1 | 2 | 3 | 4 | 5;

export function useIntroState(enabled: boolean = true) {
  // 再訪時は即hero(=5)から開始、初回はphase 0 から
  const [phase, setPhase] = useState<IntroPhase>(() => {
    const alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    return alreadyPlayed ? 5 : 0;
  });

  const skip = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setPhase(5);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

    const timings: [number, IntroPhase][] = [
      [0,    0],   // 漆黒＋霧/火の粉/花びら
      [800,  1],   // ドクロ浮上 + カメラ俯瞰→正面
      [2800, 2],   // 正面到達 → 口開く + 炎立ち昇る
      [4800, 3],   // 名前 "TANNO SHOTA" 出現（液状displacement）
      [6500, 4],   // 顎閉じる + 炎フェードアウト + ドクロ薄く
      [8000, 5],   // hero モード定常（霧/火の粉/花びら/名前/薄ドクロ がループ）
    ];

    const timers = timings.map(([delay, p]) =>
      setTimeout(() => setPhase(p), delay),
    );
    const completionTimer = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }, 8500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completionTimer);
    };
  }, [enabled]);

  return { phase, skip };
}
