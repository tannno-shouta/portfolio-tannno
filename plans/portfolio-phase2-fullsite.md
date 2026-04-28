# 丹野勝太 ポートフォリオ Phase 2 — フルサイト構築計画

## Context

Phase 1（イントロ + hero モード）が完了したので、参考サイト tplh.net を踏襲しつつ、本編（About / Works / Skills / Contact）を含むフルポートフォリオを作り込む。

- 参考: https://www.tplh.net/
- 既に完成済の演出: ローディング → イントロ → hero モード（霧・火の粉・花びら・薄ドクロ・名前 永続）
- 世界観: ダークファンタジー × 紫炎、ラベンダー寄り

## 参考サイト tplh.net 分析

ユーザー共有スクショ + 知見からの推定。

### 構成
- **Hero (1st viewport)**: 中央に大きなドクロ + 紫炎、煙、舞う葉。中央下部に「YOICHI KOBAYASHI」、サブ「FRONT-END & CREATIVE DEVELOPER」
- **常駐 UI 要素（全セクションで固定表示）**:
  - 左上: 「YK」エンブレム（モノグラム）
  - 右側面: 縦書き「WORKS」（ドット併記、上から下）
  - 左下: 縦書き「WHO I AM」（下から上）
  - 右下: 「FRONT-END & CREATIVE DEVELOPER」サブテキスト or スクロール促し
- **スクロール挙動**: ドクロが上にせり上がりつつ薄くなり、背景の煙に溶ける
- **セクション**: About → Works → Skills → Contact（推定、スクロールで切り替わる）
- **配色**: 漆黒背景 #0a0807 / 琥珀メイン #d97a2c / クリーム #e6d5b8（テキスト）
- **フォント**: 大見出しに Cinzel 系の重厚セリフ、英文細身セリフ、縦書きはイタリック
- **演出**: 全要素が静的じゃなく、煙・火の粉が常時アニメーション

### 本プロジェクトでの差し替え方針
| 参考サイト | 本サイト |
|---|---|
| 琥珀色 | **ラベンダー（既存パレット維持）** |
| YK モノグラム | **「丹」or 「T」** |
| YOICHI KOBAYASHI | **TANNO SHOTA** |
| FRONT-END & CREATIVE DEVELOPER | **Frontend Engineer · AI Consultant · Style Consultant** |

## 全体設計

### レイアウト構造
```
┌─────────────────────────────────────────────┐
│ Canvas (position: fixed, inset: 0, z: 1)    │  ← 既存の hero モード
│   霧・火の粉・花びら・薄ドクロ                │     スクロールで変化
│                                             │
│  ┌───────────────────────────────────┐      │
│  │ <main> (z: 10, 通常スクロール)      │      │
│  │   Section: Hero (100vh)            │      │
│  │   Section: About                   │      │
│  │   Section: Works                   │      │
│  │   Section: Skills                  │      │
│  │   Section: Contact                 │      │
│  └───────────────────────────────────┘      │
│                                             │
│  常駐ナビ (z: 20, position: fixed)           │
│   左上: 「丹」エンブレム                      │
│   右側面: 縦書き "WORKS"                      │
│   左下: 縦書き "WHO I AM"                     │
│   右下スクロール促し（Hero時のみ）             │
└─────────────────────────────────────────────┘
```

### スクロール演出（核心）
- **背景 Canvas**: スクロール量に応じて以下を変動
  - ドクロが **Y軸正方向にせり上がる**（オフセット最大 +3 程度）
  - ドクロの **uOpacity が低下**（最終的に 0 に近く）
  - 紫の霧が **濃くなる**（intensity UP）
  - 火の粉・花びらの上昇速度が **微増**
- **DOM セクション**: IntersectionObserver でフェードイン（framer-motion）
- **スクロールバー**: 右に薄い縦線で進捗表示（オプション）

### 通信機構
スクロール量を `useScrollProgress` フックで提供 → Canvas 内の Skull / FloatingMotes / PurpleMist が読み取って動作変更。

## ディレクトリ構成

```
src/
├── App.tsx                        # 全体レイアウト
├── components/
│   ├── intro/                     # 既存
│   │   ├── IntroScene.tsx         # 改修: スクロール対応、ナビ統合
│   │   ├── Skull.tsx              # 改修: scrollProgress prop 追加
│   │   ├── PurpleFlame.tsx        # 既存
│   │   ├── PurpleMist.tsx         # 改修: scrollProgress prop 追加
│   │   ├── FloatingMotes.tsx      # 既存
│   │   ├── IntroOverlay.tsx       # 既存
│   │   ├── LoadingScreen.tsx      # 既存
│   │   └── useIntroState.ts       # 既存
│   ├── layout/
│   │   ├── LogoMark.tsx           # 左上「丹」エンブレム
│   │   ├── VerticalNav.tsx        # 右"WORKS" / 左下"WHO I AM" 縦書き
│   │   ├── ScrollIndicator.tsx    # Hero下部のスクロール促し
│   │   └── SectionFade.tsx        # framer-motion ラッパー（IntersectionObserver）
│   ├── sections/
│   │   ├── Hero.tsx               # 1st viewport（名前は IntroOverlay と統合）
│   │   ├── About.tsx              # 自己紹介＋3本柱
│   │   ├── Works.tsx              # ダミー3件カードグリッド
│   │   ├── Skills.tsx             # スキルバッジ
│   │   └── Contact.tsx            # SNS / メール
│   └── ui/
│       ├── RuneDivider.tsx        # 装飾区切り
│       └── GlyphButton.tsx        # 共通CTAボタン
├── hooks/
│   └── useScrollProgress.ts       # スクロール進捗 0..1 を返す
└── styles/
    └── globals.css                # 既存
```

## セクション設計（テキスト案を含む）

### Hero
- 既存の TANNO SHOTA + 職名 を維持（IntroOverlay）
- スクロール促しを追加（右下 or 中央下に「SCROLL ↓」）
- 100vh

### About
- セクションタイトル: 「ABOUT」or 「WHO I AM」
- 自己紹介文（暫定案、ユーザー承認後に確定）
- **3本柱を縦組みでカード化**:
  - **FRONTEND** — React / TypeScript / Next.js / WebGL
  - **AI** — 生成AI を活用した業務自動化、プロンプト設計、Claude/GPT API
  - **STYLE** — 垢抜けコンサル：パーソナルブランディング、見た目最適化

### Works
- セクションタイトル: 「WORKS」
- ダミー3件カード（タイトル / 概要 / タグ）
- ホバーで紫炎のグロー
- カード案:
  1. **マッチング写真LP** — マッチアプリ用ハイクラス写真撮影LP（Next.js / Three.js / TypeScript）
  2. **AI 業務自動化システム** — 生成AIを使った社内ワークフロー自動化（Claude API / Python）
  3. **パーソナルブランディングLP** — 個人事業主向け洗練LP（Next.js / Tailwind）

### Skills
- セクションタイトル: 「SKILLS」
- バッジグリッド（カテゴリ別）
- 案:
  - **Frontend**: React, Next.js, TypeScript, Three.js, WebGL, GSAP
  - **AI**: Claude API, GPT API, プロンプト設計, RAG, LangChain
  - **Backend**: Node.js, Python, PostgreSQL
  - **Design**: Figma, ブランディング, 撮影ディレクション

### Contact
- セクションタイトル: 「CONTACT」
- メール: ダミー（後で本物に差し替え）
- SNS: X, GitHub, LinkedIn（ダミーURL）
- フッター: © 2026 TANNO SHOTA
- 100vh

## 実装ステップ（セクション単位、各ステップでユーザー確認）

ユーザー指定 C2「セクション1個ずつ実装 → 確認 → 次へ」 + B2「先にテキスト案を提案 → 承認後に実装」。

| Step | タスク | 工数感 |
|---|---|---|
| **1** | 共通基盤: `useScrollProgress` フック / App.tsx レイアウト変更 / SectionFade コンポーネント | 中 |
| **2** | スクロール連動: Skull の Y シフト + 透明度低下、Mist intensity UP | 中 |
| **3** | 常駐ナビ: LogoMark / VerticalNav / ScrollIndicator | 中 |
| **4** | Hero セクション (DOM側) — 既存の IntroOverlay を Hero に再構成 | 小 |
| **5** | **About 提案 → 承認 → 実装** | 中 |
| **6** | **Works 提案 → 承認 → 実装** | 中 |
| **7** | **Skills 提案 → 承認 → 実装** | 中 |
| **8** | **Contact 提案 → 承認 → 実装** | 小 |
| **9** | レスポンシブ最終調整（モバイル幅 375px） | 中 |
| **10** | `npm run build` 検証 + パフォーマンス計測 | 小 |

各セクション実装の前に：本文テキスト案を提示 → ユーザー承認 → 実装 のループ。

## 主要な技術判断

### スクロール連動の実装
- **CSS scroll-snap は使わない**: 通常スクロールで自然な動き
- **Lenis (smooth scroll) は導入せず**: 軽量を優先
- スクロール進捗は `window.scrollY / (document.body.scrollHeight - window.innerHeight)` で 0..1
- `useScrollProgress` フック: rAF + passive event listener で軽量化

### Canvas と DOM の同期
- スクロール進捗を Zustand などのグローバルステートで持つ
- もしくは React Context + useScrollProgress
- → シンプルさ優先で **React Context** を採用

### IntroScene → ヒーロー切替
- 現状の `<IntroScene />` を `<HeroScene />` にリネームし、内部で常駐 Canvas + ナビ + セクション群を管理
- もしくは `<App>` 直下で Canvas + ナビ + セクション
- **後者が責務分離的にクリーン** → App.tsx に Canvas + 常駐 UI、main にセクション

### アニメーションライブラリ
- 既存の framer-motion を使用
- セクションフェードインは `whileInView` API

## 検証手順

1. `cd ~/projects/portfolio-tannno && npm install && npm run dev`
2. ブラウザで http://localhost:5173
   - 初回: ロード→イントロ→hero に遷移
   - スクロールでドクロが上にせり上がる
   - About / Works / Skills / Contact が順にフェードイン
   - 縦書きナビ・LogoMark が常駐
3. モバイル幅 (375px) でレイアウト崩れないこと
4. `npm run build && npm run preview` で本番ビルド検証
5. Lighthouse で Performance / Accessibility 計測

## 既知のリスクと対応

- **背景 Canvas が常時動いてパフォーマンス低下**: scrollProgress > 0.3 でドクロ非表示、0.5 で霧軽量化など適応制御
- **モバイルでパーティクル数が多すぎる**: 既存の isMobile 判定で軽量化済、必要に応じてさらに数を減らす
- **DOM コンテンツが Canvas の暗さに溶ける**: 各セクションで半透明 backdrop-filter: blur() を使い、テキストの可読性を確保
- **スクロール演出と framer-motion の競合**: framer-motion はスクロール連動 hook (useScroll) を使い、自前 hook と併用しない or 統一

## 自己レビューチェックリスト（あい用）

- [x] 参考サイトの構成と本サイトの方針差分が明確
- [x] スクロール演出の核心（ドクロが背景に溶ける）が定義
- [x] セクション単位の進行が C2 と整合
- [x] テキスト案が具体的（後でユーザー承認 → 確定）
- [x] ファイル構成が既存と整合
- [x] パフォーマンスリスクと対応が明記
- [x] 検証手順が実行可能

## 次のアクション

1. このプランをユーザーに提示し承認を取る
2. Step 1 (共通基盤) から実装開始
3. 各セクション提案時は、別途 markdown を作らず会話内でテキスト案を提示
