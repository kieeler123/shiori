2026-03-06

🇯🇵 日本語

Q. AdminDataPage の役割は何ですか？

A.
プラットフォームのコンテンツ状態を管理者が確認・管理するためのページです。
公開コンテンツ、ユーザー削除コンテンツ、管理者削除コンテンツを区別して管理できます。

Q. なぜ Soft Delete 構造を採用しましたか？

A.
データを完全削除するとモデレーション履歴が失われるためです。
削除理由と履歴を保存することで、監査や分析が可能になります。

🇺🇸 English

Q. What is the purpose of the AdminDataPage?

A.
It allows administrators to inspect and manage platform content based on moderation status.

Q. Why use a Soft Delete structure instead of immediate deletion?

A.
Because keeping deletion metadata preserves moderation history and enables future analytics and auditing.

🇰🇷 한국어

Q. AdminDataPage의 역할은 무엇인가요?

A.
플랫폼 콘텐츠 상태를 관리자가 확인하고 관리할 수 있도록 만든 관리자 인터페이스입니다.

Q. 왜 Soft Delete 구조를 사용했나요?

A.
데이터를 바로 삭제하면 Moderation 기록이 사라지기 때문입니다.
삭제 사유와 기록을 보존하면 감사 및 분석이 가능해집니다.