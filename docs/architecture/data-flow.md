2026-02-05

🔄 Shiori Data Flow
Supabase 기반 구조
4
🇯🇵 日本語
🎯 目的

この文書は
Shiori におけるデータの流れ（状態変化） を整理するためのもの。

コードではなく
「データがどの層をどう移動するか」を理解する。

🧩 全体フロー
User Action
   ↓
UI Event
   ↓
Domain Logic
   ↓
Repository
   ↓
Supabase DB
   ↓
View / Query
   ↓
UI Rendering

✍️ 1️⃣ ログ作成フロー
ユーザー入力
 → Form送信
 → Domain: validate
 → Repo: insert log
 → DB保存
 → UI再取得
 → 一覧更新


ポイント：

UIはデータを持たない

Domainが責任を持つ

RepoがDBを触る唯一の場所

✏️ 2️⃣ 編集フロー
編集ボタン
 → UI: 編集モード
 → Domain: 差分チェック
 → Repo: update
 → DB反映
 → UI再描画

🗑️ 3️⃣ 削除フロー（Soft Delete）
削除ボタン
 → Domain: 削除判定
 → Repo: update is_deleted = true
 → DB変更
 → Trash Viewに表示

なぜ View を使う？

元データを保持

読み取り専用で安全

UIは削除状態を意識しなくていい

♻️ 4️⃣ 復元フロー
復元ボタン
 → Repo: update is_deleted = false
 → DB更新
 → 元の一覧に戻る

🧠 状態変化まとめ
アクション	DB変化	UI変化
作成	insert	追加表示
編集	update	内容更新
削除	is_deleted = true	消える
復元	is_deleted = false	再表示
🧭 設計意図
設計	理由
Soft Delete	データ安全
View活用	UI簡潔化
Repo経由	責任分離
Domainロジック集中	テスト容易
🇺🇸 English (Short)

CRUD = UI → Domain → Repo → DB → UI

Soft delete moves data to trash view instead of removing rows.

🇰🇷 한국어
🎯 목적

이 문서는
Shiori에서 데이터가 어떻게 흐르고 상태가 변하는지 설명한다.

전체 흐름
사용자 행동
 → UI 이벤트
 → 도메인 로직
 → Repo
 → DB
 → 다시 UI 렌더링

로그 생성

입력 → 검증 → 저장 → 목록 업데이트

수정

수정모드 → 변경 확인 → update → 재렌더

삭제 (Soft Delete)

delete 버튼 → is_deleted = true → 휴지통 view 표시

복구

복구 버튼 → is_deleted = false → 원래 목록으로 복귀

🔥 이 문서가 중요한 이유

면접에서:

“삭제 로직 어떻게 설계했어요?”

라고 하면

❌ "그냥 지웠어요"
⭕ "Soft delete + View 분리 설계했습니다"

이 차이가 주니어 vs 실무형 차이임.