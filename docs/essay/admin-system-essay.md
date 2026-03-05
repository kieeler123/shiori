2026-03-06

🇯🇵 日本語

今日の作業では、単なる UI ページではなく
Shiori の モデレーション管理の基礎構造を作ることができた。

特に重要だったのは、
削除を「完全削除」ではなく **履歴付き削除（Soft / Admin Trash）**として設計した点である。

これにより、将来的に

AIモデレーション

管理ログ

データ監査

などの拡張が可能になる。

また、Admin UI も Theme Token System を利用することで、
プラットフォーム全体のデザイン一貫性を維持できる構造になった。

🇺🇸 English

Today's work focused on building the foundation of Shiori's moderation management system rather than simply adding another UI page.

Instead of permanently deleting data, the system was designed to store deletion metadata and maintain moderation history.

This approach allows future expansion such as:

AI moderation systems

audit logs

moderation analytics

Additionally, the admin UI was integrated into the platform's theme token system, ensuring design consistency across the entire application.

🇰🇷 한국어

오늘 작업은 단순히 관리자 페이지 UI를 만든 것이 아니라
Shiori 플랫폼의 관리 및 Moderation 구조의 기초를 만든 작업이었다.

특히 중요한 점은 데이터를 바로 삭제하는 방식이 아니라
삭제 기록을 보존하는 Soft Delete 구조를 도입한 것이다.

이를 통해 앞으로 다음과 같은 확장이 가능하다.

AI Moderation

관리자 로그 기록

데이터 감사 기록

또한 Admin UI도 Theme Token 기반으로 구성하여
플랫폼 전체 디자인 시스템과 일관성을 유지하도록 설계하였다.