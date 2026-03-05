2026-03-06

🇯🇵 日本語
Admin Data Management Architecture

今日、Shiori プラットフォームに 管理者専用データ管理ページ（AdminDataPage） を追加した。
このページは、プラットフォーム内のコンテンツ状態を管理者が確認・管理するための管理インターフェースとして設計された。

管理対象データは主に以下の3つの状態に分類される。

Public
公開されている通常のコンテンツ

User Trash
ユーザー自身が削除したコンテンツ（Soft Delete）

Admin Trash
管理者によって削除されたコンテンツ（Hard Delete / Moderation）

この構造により、削除されたデータを完全に消すのではなく、
履歴と削除理由を保持する Moderation ログ構造を採用した。

また、削除理由（delete_reason）と管理者メモ（delete_note）を導入することで、
将来的に

管理履歴

モデレーション分析

AIベースの判断ログ

などの拡張が可能な構造になっている。

UIは既存の Theme Token System を利用し、
Admin UIでもテーマ変更が反映されるように設計された。

🇺🇸 English
Admin Data Management Architecture

Today, an AdminDataPage was introduced to the Shiori platform as the first administrative interface for managing platform data.

The page was designed to allow administrators to inspect and manage content based on its moderation state.

Content is categorized into three states:

Public
Normal visible content.

User Trash
Content deleted by the user (Soft Delete).

Admin Trash
Content removed by administrators for moderation purposes.

This architecture avoids permanently deleting data immediately and instead stores deletion metadata.

Additional fields such as:

delete_reason

delete_note

deleted_at

deleted_by

enable the platform to maintain moderation history and allow future features such as:

moderation analytics

AI-assisted moderation

audit logs

The UI layer was implemented using the existing theme token system, ensuring the admin interface remains consistent with the overall design system.

🇰🇷 한국어
관리자 데이터 관리 아키텍처

오늘 Shiori 플랫폼에 관리자 전용 데이터 관리 페이지(AdminDataPage) 를 추가했다.

이 페이지는 플랫폼 내 콘텐츠 상태를 관리자가 확인하고 관리할 수 있도록 만든
관리 인터페이스의 첫 구조이다.

콘텐츠 상태는 크게 세 가지로 구분된다.

Public
일반 공개 콘텐츠

User Trash
사용자가 삭제한 콘텐츠 (Soft Delete)

Admin Trash
관리자가 삭제한 콘텐츠 (Moderation)

이 구조는 데이터를 바로 삭제하지 않고
삭제 기록과 삭제 사유를 보존하는 Moderation 구조를 기반으로 한다.

또한 다음 컬럼을 도입하였다.

delete_reason

delete_note

deleted_at

deleted_by

이를 통해 향후 다음과 같은 확장이 가능하다.

관리자 Moderation 로그

데이터 감사 기록

AI 기반 삭제 판단 기록

관리자 페이지 UI는 기존 Theme Token System을 활용하여
테마 변경이 관리자 UI에도 동일하게 적용되도록 설계하였다.