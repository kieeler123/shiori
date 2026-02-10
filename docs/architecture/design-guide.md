🇯🇵 日本語（Shiori デザインガイド v1）
0. 方向性（キーワード）

Quiet / Clean / Structured

「派手さ」より 読みやすさ・整然さ・迷わない導線

グラデーションや強い影は避ける（静かなUI）

1. レイアウト規則

コンテナ幅：max-w-5xl ~ max-w-6xl

余白：px-4 sm:px-6、上 pt-6 ~ pt-10

リスト表示（Logs）

Mobile：1列

Tablet：2列

Desktop：3列（必要なら4列）

2. タイポグラフィ規則

タイトルは「サイズ」で強調し、太字は控えめ

行間を確保して疲れにくくする

目安

ページタイトル：text-xl sm:text-2xl font-semibold tracking-tight

セクション：text-base font-semibold

本文：text-sm leading-6

補助：text-xs text-zinc-500

3. カラー規則（最小主義）

文字：zinc-900

補助文字：zinc-500

背景：zinc-50

枠線：zinc-200

アクセントカラーは1つだけ（Primary/リンク専用）

4. コンポーネント規則（統一すべき4つ）

Button

Primary：塗り

Secondary：枠

Danger：必要時のみ

基本：h-10 / rounded-xl / text-sm font-medium

Input

h-10、Focusは控えめなリング

エラーは「文字＋線」中心（面で赤くしない）

Card

border border-zinc-200、影は弱く（または無し）

p-4 sm:p-5、rounded-2xl

Tag chip

text-xs、rounded-full

背景は薄いグレー（主張しすぎない）

5. インタラクション規則（日本的“静かさ”）

Hoverは微差（zinc-50 → zinc-100程度）

transition-colors duration-150

トースト/通知は邪魔しない位置（右下推奨）

6. 実装優先順位

Logs一覧

詳細（読みやすさ）

新規/編集フォーム（入力UX）

Support（端正に）

7. 禁止ルール（3つ）

強すぎるコントラスト（真っ黒×真っ白）

強い影・グラデーションの多用

色の使いすぎ（アクセントは1色だけ）

🇺🇸 English (Shiori Design Guide v1)
0) Direction (Keywords)

Quiet / Clean / Structured

Prioritize readability, order, and clear flow over “flashy”

Avoid heavy shadows and gradients (calm UI)

1) Layout Rules

Container: max-w-5xl ~ max-w-6xl

Spacing: px-4 sm:px-6, top pt-6 ~ pt-10

Logs grid:

Mobile: 1 column

Tablet+: 2 columns

Desktop+: 3 columns (4 if needed)

2) Typography Rules

Emphasize titles by size, not excessive boldness

Keep comfortable line-height

Suggested:

Page title: text-xl sm:text-2xl font-semibold tracking-tight

Section: text-base font-semibold

Body: text-sm leading-6

Secondary: text-xs text-zinc-500

3) Color Rules (Minimal)

Text: zinc-900

Secondary text: zinc-500

Background: zinc-50

Borders: zinc-200

Use only one accent color (Primary + links)

4) Component Rules (Standardize these 4)

Button

Primary: filled

Secondary: outlined

Danger: only when necessary

Base: h-10, rounded-xl, text-sm font-medium

Input

h-10, subtle focus ring

Errors: prefer “text + line” (avoid big red blocks)

Card

border border-zinc-200, minimal shadow (or none)

p-4 sm:p-5, rounded-2xl

Tag chip

text-xs, rounded-full

light gray background (low emphasis)

5) Interaction Rules (Calm)

Gentle hover changes (e.g., zinc-50 → zinc-100)

transition-colors duration-150

Toast/notifications: non-intrusive (bottom-right recommended)

6) Implementation Priority

Logs list

Detail (readability)

New/Edit forms (input UX)

Support (clean & structured)

7) Hard “No” List (3)

Harsh black/white contrast

Heavy shadows/gradients

Too many colors (one accent only)

🇰🇷 한국어（Shiori 디자인 가이드 v1）
0) 방향성(키워드)

Quiet / Clean / Structured

“화려함”보다 가독성, 정돈감, 흐름의 명확성

강한 그림자/그라데이션은 피하고 조용한 UI

1) 레이아웃 규칙

컨테이너: max-w-5xl ~ max-w-6xl

여백: px-4 sm:px-6, 상단 pt-6 ~ pt-10

Logs 그리드:

모바일 1열

태블릿 2열

데스크탑 3열(필요 시 4열)

2) 타이포 규칙

제목은 두께보다 크기로 강조

line-height 확보(눈 안 피로하게)

권장:

페이지 타이틀: text-xl sm:text-2xl font-semibold tracking-tight

섹션 타이틀: text-base font-semibold

본문: text-sm leading-6

보조: text-xs text-zinc-500

3) 컬러 규칙(미니멀)

기본 텍스트: zinc-900

보조 텍스트: zinc-500

배경: zinc-50

구분선: zinc-200

포인트 컬러는 1개만(Primary/링크에만)

4) 컴포넌트 규칙(이 4개만 통일)

버튼(Button)

Primary: 채움

Secondary: 테두리

Danger: 꼭 필요할 때만

기본: h-10, rounded-xl, text-sm font-medium

입력(Input)

h-10, 포커스 링은 은은하게

에러는 “문구+라인” 중심(빨간 면적 크게 금지)

카드(Card)

border border-zinc-200, 그림자는 약하게(또는 없음)

p-4 sm:p-5, rounded-2xl

태그 칩(Tag chip)

text-xs, rounded-full

옅은 회색 배경(과한 강조 금지)

5) 인터랙션 규칙(일본 감성 포인트)

hover는 과하지 않게 미세 변화(zinc-50 → zinc-100 정도)

transition-colors duration-150

알림/토스트는 방해 안 되게(우측 하단 추천)

6) 구현 우선순위

Logs 리스트

상세(가독성)

작성/수정 폼(입력 UX)

Support(단정하게)

7) 금지 3가지

강한 흑백 대비(눈 아픔)

과한 그림자/그라데이션

색 남발(포인트 1개 원칙)

🇯🇵 日本語：Shiori Theme Architecture Note（“Quiet Luxury” UI）
1) コンセプト

主張しないのに、なぜか目に留まる

目立たせるのは「色」ではなく、整った余白・タイポ・階層・反応速度

デザインは“見せる”より 使っていて疲れない ことを優先する

2) 設計方針（変わらない軸）

哲学は固定：Quiet / Clean / Structured

表現は差し替え可能：White / Black / Blue の3テーマ

“派手さ”は禁止。変えるのは 強度（contrast / spacing / emphasis） だけ

3) テーマの責務分離（アーキテクチャ）

Theme = UIの見た目を決める“設定”であって、機能ではない。

ThemeTokens：色・余白・角丸・影・文字色などのトークン定義

ThemeProvider：現在テーマの状態管理（localStorage等）

ThemeApplier：data-theme もしくは CSS変数を :root に反映

ThemeSwitcher：UI上でテーマを切り替える操作部品

これにより「ページ機能」と「見た目」が分離され、拡張が容易になる。

4) 実装ルール（重要）

Tailwindのクラスをページに散らさず、共通UI（Button/Input/Card/TagChip）に集約

色は直接指定せず、CSS変数（tokens）経由にする

例：bg-[var(--bg)] text-[var(--fg)] border-[var(--border)]

テーマ差分は「数値（強度）」で表現

White ↔ Black は背景/文字のコントラスト強度

Blue は CTA/リンクの強度

5) デザインの“静かな強さ”を作る要素

余白：一定のリズム（spacing scaleを固定）

階層：タイトル/本文/補助の差は明確、でも過剰にしない

反応：hover/activeは微差で速い（duration-150）

ノイズ削減：影・線・色を増やさない

6) ロードマップ（段階的拡張）

v1：White / Black / Blue の切替（グローバル適用）

v1.1：テーマ保存（localStorage）

v2：ユーザーごとのカスタマイズ（利用者が増えた段階で）

7) 成功条件（判断基準）

UIが目立たなくても、操作が迷わない

見た目が変わっても、情報構造は崩れない

テーマ追加が 1ファイル追加で可能

🇺🇸 English: Shiori Theme Architecture Note (“Quiet Luxury” UI)
1) Concept

Not loud, but somehow attention-grabbing

The “wow” comes from spacing, typography, hierarchy, and responsiveness—not flashy colors

Prioritize low fatigue and long-term usability

2) Principles (Stable Core)

Core philosophy stays: Quiet / Clean / Structured

Expression can swap: White / Black / Blue (3 themes)

Avoid “loud design”; adjust only the intensity (contrast / emphasis)

3) Responsibility Separation

Theme is a configuration layer, not a feature.

ThemeTokens: colors, radius, shadows, text colors, spacing scale

ThemeProvider: current theme state (and persistence later)

ThemeApplier: applies data-theme or CSS variables to :root

ThemeSwitcher: UI control to switch themes

This keeps features independent from appearance.

4) Implementation Rules (Key)

Don’t scatter Tailwind classes across pages
→ centralize styling into shared UI components (Button/Input/Card/TagChip)

Don’t hardcode colors
→ use CSS variables (tokens) as the single source of truth

Theme differences should be “strength changes”

White vs Black: contrast intensity

Blue: CTA/link emphasis intensity

5) What creates “Quiet Premium”

Consistent spacing rhythm (fixed scale)

Clear hierarchy without over-bolding

Fast but subtle interactions (duration-150)

Remove visual noise (avoid extra shadows/lines/colors)

6) Roadmap

v1: White/Black/Blue switch + global application

v1.1: persist theme in localStorage

v2: user-level customization once users grow

7) Success Criteria

UI isn’t flashy, but navigation is effortless

Changing themes never breaks information structure

Adding a theme is possible by adding one token file

🇰🇷 한국어: Shiori 테마 아키텍처 기록 (“조용한 고급스러움” UI)
1) 컨셉

티내지 않는데도 자꾸 보게 되는 느낌

인상은 색이 아니라 여백/타이포/계층/반응성에서 나온다

“예쁨”보다 오래 써도 피로하지 않은 UI를 우선한다

2) 설계 원칙(흔들리지 않는 축)

철학은 고정: Quiet / Clean / Structured

표현은 교체 가능: White / Black / Blue 3테마

화려함 금지. 바꾸는 건 강도(대비/강조/여백) 뿐

3) 책임 분리(아키텍처)

테마는 기능이 아니라 UI 설정 레이어다.

ThemeTokens: 색/여백/라운드/그림자/텍스트 톤 같은 토큰 정의

ThemeProvider: 현재 테마 상태 관리(추후 저장 포함)

ThemeApplier: data-theme 또는 CSS 변수를 :root에 적용

ThemeSwitcher: 버튼으로 테마 전환하는 UI

→ 기능 로직과 디자인이 분리되어 확장/유지보수가 쉬워진다.

4) 구현 규칙(핵심)

페이지에 className을 흩뿌리지 말고
공통 UI(Button/Input/Card/TagChip)에 스타일을 집중

색을 직접 박지 말고 CSS 변수(tokens)로만 접근

예: bg-[var(--bg)] text-[var(--fg)] border-[var(--border)]

테마 차이는 “값의 강도”로 표현

White ↔ Black: 대비 강도

Blue: CTA/링크 강조 강도

5) “조용한 강함”을 만드는 요소

여백 리듬: spacing scale 고정

계층 구조: 제목/본문/보조 차이는 명확, 과장은 금지

반응 속도: 빠르고 은은하게(duration-150)

노이즈 제거: 그림자/선/색 남발 금지

6) 로드맵(단계적 확장)

v1: White/Black/Blue 전환 + 전역 적용

v1.1: 테마 저장(localStorage)

v2: 사용자 커스터마이징(유입/데이터가 쌓이면)

7) 성공 기준(판단 기준)

UI가 튀지 않아도 길을 안 잃는다

테마가 바뀌어도 정보 구조는 무너지지 않는다

테마 추가가 토큰 파일 1개 추가로 끝난다