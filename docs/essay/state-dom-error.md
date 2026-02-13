2026-02-13

🇯🇵 日本語（面接でも使えるレベル）
テーマ切り替えバグから学んだこと

今回、テーマ（data-theme）が正常に切り替わらない問題に12時間以上向き合いました。

最初はCSS変数の問題だと思いました。
しかし、DOMを確認すると data-theme 自体は変更されていました。

「なぜ属性は変わるのに見た目は変わらないのか？」

そこから仮説を立て直しました。

調査を進めると、テーマを管理するロジックが複数箇所に存在しており、
それぞれが document を直接操作していることが原因でした。

つまり、単一責任の原則が破られていた状態でした。

私は以下のように構造を修正しました：

テーマ変更の責任を1つのProviderに統一

状態 → useEffect → DOM反映 という流れに整理

他のコンポーネントから直接 document を触らない設計に変更

この経験から学んだことは、

グローバル状態は必ず単一の管理ポイントを持つべきである

ということです。

問題解決自体よりも、
仮説 → 検証 → 再仮説 → 構造改善 という思考プロセスが大きな学びでした。

そして何より、解決した瞬間の達成感は非常に大きかったです。
難しい問題ほど、解決後は楽しくなります。

🇺🇸 English Version
What I Learned from a Theme Switching Bug

I spent more than 12 hours debugging an issue where my theme switcher (data-theme) appeared to change but the UI did not update.

Initially, I suspected a CSS variable issue.
However, when inspecting the DOM, I confirmed that the data-theme attribute was indeed changing.

So the real question became:

“Why does the attribute change, but the visual result does not?”

After deeper investigation, I discovered that multiple parts of the application were directly modifying the document.
There was no single source of truth for theme management.

This violated the Single Responsibility Principle.

To resolve this, I:

Centralized theme control into a single Provider

Organized the flow as state → effect → DOM update

Removed direct document manipulation from other components

The key lesson was:

Global state must have a single authoritative control point.

More important than the fix itself was the debugging mindset:
Hypothesis → Verification → Revised Hypothesis → Structural Improvement.

Solving it was exhausting but deeply rewarding.
Difficult problems become enjoyable once they are understood.

🇰🇷 한국어 (진짜 사고 기록용)
12시간 테마 버그를 잡으면서 느낀 것

처음엔 단순 CSS 문제라고 생각했다.
data-theme는 바뀌는데 화면이 안 바뀌니까 변수 충돌이라 생각했다.

근데 DOM을 찍어보니 속성은 제대로 바뀌고 있었다.

그때부터 이상해졌다.

“그럼 왜 안 바뀌지?”

결국 원인은 구조였다.

테마를 관리하는 로직이 여기저기 흩어져 있었고
여러 곳에서 document를 직접 건드리고 있었다.

React를 쓰면서 선언적 구조를 만들어놓고
결국 imperative하게 DOM을 수정하고 있었던 셈이다.

결론은 하나였다.

전역 책임은 한 군데에서만 관리해야 한다.

Provider 하나로 통합하고
상태 → effect → DOM 반영 구조로 정리하니 바로 해결됐다.

12시간이 걸렸지만
도망가지 않았고
결국 잡았다.

힘들었지만 해결되는 순간
엄청 재밌었다.

아마 이게 개발이 중독되는 이유 아닐까 싶다.