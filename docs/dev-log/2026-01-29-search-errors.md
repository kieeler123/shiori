🇯🇵 日本語
🔧 本日の開発ログ（検索機能実装時のエラー）
❗ 1. Cannot find name 'items'

原因

検索hook useNoteSearch に渡す items の参照元が曖昧だった。
コンポーネントスコープ外の変数を参照しようとしていた。

問題の本質

データの流れ（Data Flow）が整理されていなかった。

Reactでは

“UIは state をもとに描画する”
が原則だが、それを崩していた。

解決

logs状態をAppまたは上位で管理

その配列を props として検索hookへ渡す

const { visibleItems } = useNoteSearch(logs);

❗ 2. SuggestionType 型エラー
Type 'string' is not assignable to type 'SuggestionType'


原因

suggestions 作成時に

{ type: "tag", value: v }


と書いたため、TypeScriptが "tag" を string と推論した。

解決

リテラル型として固定：

{ type: "tag" as const, value: v }


→ union型との一致が保証された。

❗ 3. hover時に文字が見えない問題

原因

hoverスタイルで文字色が背景と同系色になっていた。

対応

ボタン背景：明るい色

hover時文字色：濃い色

Tailwindのhoverクラス見直し

📌 今日学んだこと

データフローが曖昧だとエラーが連鎖する

TypeScriptは「型の意図」を明示しないと助けてくれない

UIバグはロジックではなく「視覚設計」の問題なことも多い

🇺🇸 English
Dev Log — Search Feature Errors

1. Cannot find name 'items'

Cause: items reference was outside component state flow.
Fix: Pass state-derived logs array into the search hook.

2. SuggestionType mismatch

Cause: "tag" inferred as string.
Fix: Use literal type (as const).

3. Hover text invisible

Cause: Low contrast between background and text.
Fix: Adjust hover styles.

Lessons

Data flow clarity prevents chain errors

TypeScript needs explicit intent

UI bugs can be visual, not logical

🇰🇷 한국어
오늘의 개발 로그 — 검색 기능 구현 중 에러

1. Cannot find name 'items'

원인: items 참조가 state 흐름 밖에 있었음
해결: state 기반 logs를 hook에 전달

2. SuggestionType 타입 에러

원인: "tag"가 string으로 추론됨
해결: as const 사용

3. hover 시 글자가 안 보임

원인: 배경색과 글자색 대비 부족
해결: hover 스타일 수정

오늘 배운 점

데이터 흐름 정리가 가장 중요

타입스크립트는 의도를 명확히 해야 도와줌

UI 버그는 로직이 아니라 시각 문제일 수도 있음