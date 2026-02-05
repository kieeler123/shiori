🔐 Permission & Auth Flow (Support System)
4
🇯🇵 日本語
🎯 目的

この文書は Shiori サポート機能の認証・権限制御構造 を整理するためのもの。

👤 ユーザー状態
状態	説明
未ログイン	読み取りのみ可能
ログイン済み	作成・編集・削除可能（自分の投稿のみ）
🧩 権限マトリクス
機能	未ログイン	ログイン
FAQ閲覧	○	○
問い合わせ一覧	○	○
問い合わせ作成	✕	○
自分の問い合わせ確認	✕	○
編集	✕	自分のみ
削除	✕	自分のみ
ゴミ箱確認	✕	自分のみ
🔄 認証フロー
ページアクセス
 → useSession() 実行
 → セッション確認
   → 未ログイン → AuthPanel表示
   → ログイン済 → 機能表示

✏️ 編集権限チェック
SupportDetailPage
 → user.id === ticket.user_id ?
   → true → 編集ボタン表示
   → false → 非表示

🗑️ 削除権限チェック
削除処理
 → supabase.auth.getUser()
 → ticket.user_id === current_user.id ?
   → true → is_deleted=true
   → false → エラー

📦 Trash表示制御
support_trash_v
WHERE deleted_by = current_user.id


→ 他人の削除データは絶対見えない

🧠 設計思想
設計	理由
UIでも権限制御	UX向上
DBでも権限制御	セキュリティ確保
自分の投稿のみ編集可	データ整合性
Soft Delete	事故防止
🇺🇸 English (Short)

Auth = Supabase session.
Permission = owner-based control.
UI hides actions + DB enforces ownership.

🇰🇷 한국어
🎯 목적

Shiori 고객센터 기능의 인증 및 권한 구조 설명

사용자 상태
상태	설명
비로그인	읽기만 가능
로그인	작성·수정·삭제 가능 (본인 글만)
권한 매트릭스
기능	비로그인	로그인
FAQ 보기	O	O
문의 목록	O	O
문의 작성	X	O
내 문의	X	O
수정	X	본인만
삭제	X	본인만
휴지통	X	본인만
인증 흐름

페이지 → useSession() → 세션 확인

수정 권한

user.id === ticket.user_id 일 때만 가능

삭제 권한

삭제 시 DB에서도 본인 여부 재확인

휴지통 권한

deleted_by = 현재 로그인 유저

💥 이 문서 가치

면접에서 이 말 나오면:

“권한 설계는 어떻게 했나요?”

이 문서 하나로:

UI 권한 제어

DB 레벨 권한 제어

사용자 데이터 보호 설계

→ 실무 레벨 신뢰도 상승