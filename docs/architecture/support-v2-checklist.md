🇯🇵 Shiori Support v2 チェックリスト
🎯 目的

Supportシステムを「個人機能」から「運用可能なサービス」へ拡張する。

✅ 1. 管理者機能（Admin Layer）

 管理者専用ページ存在

 全問い合わせ一覧表示

 user_id制限を超えた閲覧（adminのみ）

 状態(Status)変更可能

✅ 2. ステータスワークフロー

 open

 reviewing

 answered

 closed

 状態変更履歴を考慮した設計

✅ 3. 管理者返信（Admin Reply）

 管理者回答表示領域

 回答未登録UI

 回答追加可能

 ユーザー側閲覧可能

✅ 4. フィルタ / 管理ビュー

 未対応のみ表示

 解決済み表示

 削除済み表示

 検索（title / user）

✅ 5. 通知拡張

 回答追加時Toast

 状態変更通知

 Undo可能操作維持

✅ 6. UX改善

 相対時間表示（◯分前）

 状態バッジ色分離

 Empty State強化

✅ 7. データ設計拡張

 admin_reply フィールド or テーブル検討

 updated_at活用

 将来コメント構造対応可能

🚫 v2でも不要

リアルタイムチャット

メール送信

AI自動回答

🇺🇸 Shiori Support v2 Checklist
🎯 Purpose

Evolve the support system from a personal feature into an operational service layer.

✅ Admin Layer

 Admin-only page exists

 View all tickets

 Admin bypass for user scope

 Status change capability

✅ Status Workflow

 open

 reviewing

 answered

 closed

 Status history-ready design

✅ Admin Reply

 Admin response section

 Placeholder when empty

 Reply creation

 Visible to users

✅ Management Views

 Unresolved filter

 Resolved filter

 Deleted filter

 Search support

✅ Notification Expansion

 Toast on reply

 Status change feedback

 Undo interactions preserved

✅ UX Improvements

 Relative time display

 Status badge colors

 Enhanced empty states

✅ Data Expansion

 admin_reply field/table planning

 updated_at usage

 Future comment-ready structure

🚫 Still Not Required

Realtime chat

Email notifications

AI auto-response

🇰🇷 Shiori Support v2 체크리스트
🎯 목적

Support 시스템을 개인 기능에서 실제 운영 서비스 구조로 확장한다.

✅ 관리자 기능

 관리자 전용 페이지

 전체 문의 조회

 관리자 권한 조회 분리

 상태 변경 기능

✅ 상태 워크플로우

 open (접수)

 reviewing (확인중)

 answered (답변완료)

 closed (종료)

 상태 확장 고려 구조

✅ 관리자 답변

 관리자 답변 영역 존재

 답변 없음 UI

 답변 작성 가능

 사용자 조회 가능

✅ 관리 필터

 미처리 문의 보기

 해결된 문의 보기

 삭제된 문의 보기

 검색 기능

✅ 알림 확장

 답변 등록 Toast

 상태 변경 알림

 Undo 유지

✅ UX 개선

 상대 시간 표시

 상태별 배지 색상

 Empty State 개선

✅ 데이터 구조 확장

 admin_reply 구조 설계

 updated_at 활용

 댓글 구조 확장 가능성 유지

🚫 v2에서도 불필요

실시간 채팅

이메일 알림

AI 자동 응답