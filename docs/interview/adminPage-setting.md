🎤 3️⃣ 面接 Q&A
🇯🇵 日本語

Q. なぜ display_date を作りましたか？
A. 並び順・表示・重複基準が分かれていると運用で混乱が起きるため、
coalesce により統一基準を設けました。

Q. なぜ重複を削除しなかったのですか？
A. 運用では復元可能性が必要だからです。
is_hidden で安全に管理しています。

🇺🇸 English**

Q. Why did you introduce display_date?
A. To unify sorting, display, and deduplication logic under a single standard.

Q. Why not hard-delete duplicates?
A. To preserve recoverability and maintain data integrity.

🇰🇷 한국어**

Q. 왜 display_date를 만들었나요?
A. 정렬/표시/중복 기준을 하나로 통일하기 위해서입니다.

Q. 왜 중복을 삭제하지 않았나요?
A. 복구 가능성을 유지하기 위해 숨김 구조를 사용했습니다.