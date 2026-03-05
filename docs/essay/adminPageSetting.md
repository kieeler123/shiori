2026-03-04

✍️ 2️⃣ エッセイ形式
🇯🇵 日本語

今日は機能を増やした日というより、
基準を整理した日だった。

created_at と source_date が混在していたことで、
並び順や表示基準が曖昧になっていた。

そこで display_date という
統一基準を導入した。

source_date があればそれを使い、
なければ created_at を使う。

たった一行の coalesce で、
並び順・表示・重複判断が統一された。

今日は「追加」ではなく
「整理」と「統一」の日だった。

🇺🇸 English

Today was not about adding features,
but about defining consistency.

The coexistence of created_at and source_date
made sorting and display logic ambiguous.

So I introduced display_date
as a unified standard.

If source_date exists, use it.
Otherwise, fall back to created_at.

With a single coalesce line,
sorting, display, and deduplication logic became unified.

Today was about clarity and structure.

🇰🇷 한국어

오늘은 기능을 추가한 날이라기보다
기준을 정리한 날이었다.

created_at과 source_date가 혼재하면서
정렬과 표시 기준이 모호해졌다.

그래서 display_date라는
하나의 통합 기준을 만들었다.

source_date가 있으면 그것을 쓰고,
없으면 created_at을 쓰는 방식.

단 한 줄의 coalesce로
정렬, 표시, 중복 판단이 통일되었다.

오늘은 추가가 아니라 정리의 날이었다.