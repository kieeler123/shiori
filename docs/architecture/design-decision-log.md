2026-02-05

📐 design-decision-log.md

Why this system is built this way

🇯🇵 日本語 — 設計判断ログ
🔹 1. なぜ「ログ」と「サポート」を分離したのか

判断:
logs と support_tickets を完全に別モジュールとして分離。

理由:

役割が異なる

logs = ユーザーの記録コンテンツ

support = 問い合わせ・運営連絡

権限設計が違う（RLSポリシーが別）

将来 support は FAQ / AI分類 / 管理画面へ拡張予定

👉 初期から責務分離しておくことで拡張コストを下げる設計

🔹 2. なぜ Repo 層を分けたのか

判断:
logRepo, supportRepo, trashRepo, supportTrashRepo に分割。

理由:

DBアクセスロジックとUIロジックを分離

テーブルごとの責務を明確化

エラーの発生源を追いやすくするため

👉 「データ取得の責任は Repo」 という設計原則

🔹 3. なぜソフトデリートを採用したのか

判断:
物理削除ではなく is_deleted フラグで管理。

理由:

ユーザー誤操作対策

復元機能を将来追加可能

管理者ログの監査用データとして保持

👉 データ安全性を優先した設計

🔹 4. なぜ Trash を2種類に分けたのか
種類	理由
Log Trash	ユーザー記録用
Support Trash	問い合わせ履歴用

理由:

テーブルが異なる

権限が異なる

復元フローも将来別設計になる可能性

👉 将来の仕様変更を見越した構造分離

🔹 5. なぜ TypeScript 型を List / Detail で分けたのか

判断:
SupportTicketListRow と SupportTicketDetailRow を分離。

理由:

一覧では body 不要

不要データの取得を防ぐ

パフォーマンスと責務明確化

👉 画面ごとに最適なデータ構造を定義する設計

🔹 6. なぜ Header にメニュー集中管理したのか

判断:
グローバルナビゲーションを Header で管理。

理由:

画面増加に対応

UXの一貫性

レイアウト責務の集約

👉 画面構造ではなく“役割構造”で管理

🇺🇸 English — Design Decision Log
1. Why logs and support are separated

Different responsibilities, different permission models, future expansion.

2. Why Repo layer is separated

DB logic isolated, easier maintenance, clearer data flow.

3. Why soft delete is used

Safety, recovery option, audit trail.

4. Why trash is separated into two

Different data domains → separate lifecycle.

5. Why list/detail types are separated

Performance optimization + clear responsibility.

6. Why navigation centralized in Header

Scalability + consistent UX.

🇰🇷 한국어 — 설계 판단 기록
1. 로그와 고객센터를 분리한 이유

기능, 권한, 확장 방향이 다르기 때문.

2. Repo 계층을 나눈 이유

UI와 DB 책임 분리, 유지보수성 향상.

3. 소프트 삭제를 채택한 이유

복구 가능, 실수 방지, 로그 보존.

4. 휴지통을 2개로 나눈 이유

데이터 성격과 권한 구조가 다름.

5. List/Detail 타입 분리 이유

화면 목적에 맞는 데이터만 사용.

6. Header에 메뉴 집중한 이유

확장 대비, UX 일관성 유지.

✅ 이 문서가 하는 역할

이건 단순 설명이 아니라:

“이 개발자는 우연히 만든 게 아니라
의도적으로 구조를 설계했다”는 증거