2026-02-26

🇯🇵 Shiori Support v1 チェックリスト
🎯 目的

Supportシステムが「機能」ではなく「実際に運用可能な状態」かを確認する。

✅ 1. 基本機能

 問い合わせ作成（Create）

 問い合わせ編集（Update）

 ゴミ箱移動（Soft Delete）

 復元（Restore）

 完全削除（Hard Delete）

 自分の問い合わせ一覧表示

 問い合わせ詳細ページ

✅ 2. 状態(Status)管理

 open 状態表示

 状態バッジUI表示

 状態変更を想定した設計

推奨状態：

open → reviewing → answered → closed
✅ 3. UX（ユーザー体験）

 空状態(Empty State)表示

 「問い合わせする」導線が分かりやすい

 保存後Toast表示

 削除後Undo Toastあり

 重要操作はConfirm使用

✅ 4. バリデーション

 空文字入力防止

 最小文字数チェック

 Support専用Validator使用

 LogsValidatorと分離済み

✅ 5. 通知ポリシー

 一般通知 → Toast

 重要操作 → Confirm

 セキュリティ通知 → Alert限定

✅ 6. データ構造

 soft delete対応

 trash view存在

 user_id制限あり

 RLS前提設計

✅ 7. 運用準備（重要）

 テスト用問い合わせデータあり

 FAQと役割分離済み

 UIが空に見えない

 サービスが「生きている」印象

🚫 v1では不要

リアルタイムチャット

メール通知

AI自動返信

管理者ダッシュボード

🇺🇸 Shiori Support v1 Checklist
🎯 Purpose

Ensure the support system is operational, not just functionally complete.

✅ Core Features

 Create ticket

 Update ticket

 Soft delete (trash)

 Restore

 Hard delete

 My tickets list

 Ticket detail page

✅ Status Management

 open status visible

 Status badge UI

 Future-ready status flow

Recommended:

open → reviewing → answered → closed
✅ UX

 Empty state UI exists

 Clear “Create Ticket” entry

 Toast after actions

 Undo toast after delete

 Confirm for destructive actions

✅ Validation

 Empty input blocked

 Minimum length enforced

 Dedicated support validator

 Separated from logs validation

✅ Notification Policy

 Toast for normal feedback

 Confirm for important actions

 Alert only for critical notices

✅ Data Structure

 Soft delete supported

 Trash view exists

 user_id scoped queries

 RLS-ready structure

✅ Operational Readiness

 Seed test tickets exist

 FAQ separated from tickets

 UI not visually empty

 System feels alive

🚫 Not Required for v1

Realtime chat

Email notifications

AI auto replies

Admin dashboard

🇰🇷 Shiori Support v1 체크리스트
🎯 목적

Support 시스템이 단순 기능이 아니라 실제 운영 가능한 상태인지 확인한다.

✅ 기본 기능

 문의 생성

 문의 수정

 휴지통 이동(Soft Delete)

 복구

 영구 삭제

 내 문의 목록

 문의 상세 페이지

✅ 상태(Status) 관리

 open 상태 표시

 상태 배지 UI

 상태 확장 가능한 구조

권장 흐름:

open → reviewing → answered → closed
✅ UX

 Empty State 존재

 문의 작성 동선 명확

 작업 후 Toast 표시

 삭제 후 Undo Toast

 중요 작업 Confirm 사용

✅ Validation

 공백 입력 방지

 최소 글자수 체크

 support 전용 validator

 logs validator와 분리

✅ 알림 정책

 일반 알림 → Toast

 중요 작업 → Confirm

 보안 안내 → Alert 제한

✅ 데이터 구조

 soft delete 지원

 trash view 존재

 user_id 기준 접근

 RLS 대응 구조

✅ 운영 준비

 테스트 문의 데이터 존재

 FAQ와 역할 분리

 화면이 비어 보이지 않음

 서비스가 살아있는 느낌

🚫 v1에서 불필요

실시간 채팅

이메일 알림

AI 자동 응답

관리자 대시보드