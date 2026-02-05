2026-02-05

🧩 Support System Architecture
4
🇯🇵 日本語
🎯 目的

この文書は Shiori のサポートシステム構造 を整理するためのもの。

対象：

問い合わせ（チケット）

FAQ

マイ問い合わせ

ゴミ箱（削除データ）

🧱 構成要素
要素	役割
support_tickets	ユーザー問い合わせ
support_faq	よくある質問
support_trash_v	削除済みチケット
MyTicketsPage	自分の問い合わせ一覧
SupportTrashPage	自分が削除した問い合わせ
🔄 チケットの流れ
ユーザーが問い合わせ作成
 → support_tickets insert
 → 公開 or マイページ表示

✏️ 編集フロー
自分の投稿
 → 編集
 → update
 → UI更新

🗑️ 削除フロー（Soft Delete）
削除
 → is_deleted = true
 → deleted_at 記録
 → support_trash_v に表示

🔹 なぜ削除View分離？

ログとサポートは性質が違う

混在すると管理困難

拡張性のため分離

♻️ 復元フロー
Trash → 復元
 → is_deleted = false
 → 元リストへ戻る

❓ FAQ構造
カラム	役割
title	質問
body	回答
sort_order	表示順
category	分類

FAQは固定情報なので編集頻度低い。

🧠 設計思想
設計	理由
ログとサポート分離	ドメイン責務分離
Soft Delete	データ安全
View利用	UI単純化
MyTicketsページ	ユーザー体験向上
🇺🇸 English (Short)

Support system = Ticket CRUD + FAQ + Soft delete trash.

Separate domain from logs for scalability.

🇰🇷 한국어
🎯 목적

Shiori 고객센터 시스템의 데이터 구조와 흐름 설명 문서

구성
요소	역할
support_tickets	사용자 문의
support_faq	자주 묻는 질문
support_trash_v	삭제된 문의
MyTicketsPage	내가 쓴 문의
SupportTrashPage	내가 삭제한 문의
문의 흐름

작성 → 저장 → 목록 표시

수정

내 글 → 수정 → 업데이트

삭제 (Soft Delete)

삭제 → is_deleted=true → 고객센터 휴지통으로 이동

복구

휴지통 → 복구 → 원래 목록 복귀

FAQ 구조

질문(title) + 답변(body) + 정렬(sort_order)

🔥 이 문서가 중요한 이유

면접에서:

“고객센터 구조 어떻게 설계했어요?”

이 문서 있으면:

단순 CRUD 아님

서비스 구조 이해

도메인 분리 이해

→ 실무 이해도 높은 개발자로 보임