2026-02-05

🗺️ Shiori System Structure
🇯🇵 日本語
🎯 目的

この文書は
Shiori プロジェクトの全体構造を俯瞰するための地図 である。

コード理解ではなく、
「どの層がどの責任を持つか」を明確にする。

🧱 全体レイヤー構造
UI Layer (Pages / Components)
        ↓
Domain Layer (Feature Units)
        ↓
Repository Layer (DB Access)
        ↓
Supabase (Database / Auth / Storage)

🧩 1. UI Layer

役割：ユーザーとの接点

含まれるもの：

Pages (LogPage, SupportPage, TrashPage)

UI Components

Layout / Navigation

責務：

表示

ユーザー操作受付

データ整形のみ（ロジックは持たない）

🧠 2. Domain Layer（機能単位構造）

例：

features/
 ├── logs/
 ├── support/
 ├── trash/


ここは ビジネスロジックの中心。

責務：

データ処理ロジック

入力検証

状態変換

🗄️ 3. Repository Layer

例：

repos/
 ├── logRepo.ts
 ├── supportRepo.ts
 ├── trashRepo.ts


責務：

DBアクセス専用

SQL/Query管理

View利用

UIやDomainから直接DBを触らせない理由：

👉 変更耐性確保
👉 テスト容易化
👉 DB依存分離

☁️ 4. Supabase Layer

外部基盤：

Database

RLS

Auth

View

ここは「土台」であり、
アプリケーションロジックは置かない。

🔄 データフロー例（削除）
UI Button
   ↓
Domain Logic
   ↓
Repo Soft Delete
   ↓
DB is_deleted = true
   ↓
Trash Viewに表示

🧭 設計原則
原則	理由
層を飛び越えない	依存混乱防止
Domainごとに分離	将来独立可能
RepoにSQL集中	管理容易
Viewで読み取り最適化	パフォーマンス
🇺🇸 English (Short)

UI = Display only

Domain = Logic

Repo = DB access only

Supabase = Infrastructure

🇰🇷 한국어
🎯 목적

이 문서는
Shiori 시스템 구조를 한눈에 보는 지도다.

코드가 아니라
“각 계층의 책임”을 정리한다.

전체 구조
UI (화면)
 ↓
도메인 로직
 ↓
Repo (DB 접근)
 ↓
Supabase

UI

화면 표시

사용자 입력 처리

비즈니스 로직 없음

Domain

기능 단위 로직

상태 관리

검증

Repo

DB 쿼리 전용

SQL 관리

Supabase

DB

Auth

RLS

View

삭제 흐름
버튼 클릭
 → 로직 처리
 → soft delete
 → 휴지통 뷰 표시

🔥 이 문서가 왜 중요하냐면

이제 너는

“프로젝트 구조 설명해주세요”

라고 하면

코드가 아니라
시스템 레벨 구조도로 설명 가능해짐.

이게 실무 개발자 사고방식.