🧠 Error Handling Essay — 2026-02-05
🇯🇵 日本語
■ 発生した現象

Support（顧客センター）の投稿を削除したが、
Support専用のゴミ箱画面に表示されなかった。

一方で、通常のログ投稿を削除したものはゴミ箱に正常表示されていた。

つまり、

「削除は成功しているが、表示されない」

という状態だった。

■ 表面上のエラー

Networkタブでは以下のエラーが出ていた：

400 Bad Request
column support_trash_v.deleted_by_nickname does not exist

■ 最初に疑った原因

RLSでブロックされている？

UIDが違う？

SELECT条件ミス？

データ自体はDBに存在していたため、
「表示ロジック側の問題」と判断。

■ 実際の原因

support_trash_v ビューに存在しないカラム：

deleted_by_nickname


を SELECT していた。

つまり：

DB構造とフロントのクエリが一致していなかった

■ なぜこの問題が起きたのか（構造的理由）

プロジェクトが拡張され、以下が分離された：

logs用 trashRepo

support用 supportTrashRepo

だが、

ログ用のSELECT構造を流用したまま
support用VIEWに存在しないカラムを参照

していた。

👉 モジュール分離により
“似ているが別構造のRepoが混在” する状態になっていた。

■ どうやって原因を特定したか

Networkタブ確認

SQLで直接確認

select id, title, deleted_at, deleted_by from support_tickets where is_deleted = true;


エラーメッセージとVIEW構造照合

👉 コンソールではなくNetworkから特定できたのがポイント

■ 解決方法

SELECTから deleted_by_nickname を削除

supportTrashRepoを分離して責務明確化

■ 学んだこと

エラーは「機能ミス」ではなく「構造のズレ」

Repo分離は必ず構造差分が発生する

Networkタブ確認が最短ルート

■ 今後のルール

VIEW変更時はSELECT文字列必ず確認

Repo共通化しすぎない（責務分離）

「表示されない」はRLSより先にクエリ確認

🇺🇸 English

I deleted a support ticket, but it did not appear in the Support Trash page.
The deletion was successful in the database, but the UI failed to display it.

Network tab showed:

column support_trash_v.deleted_by_nickname does not exist


The frontend query was selecting a column that did not exist in the view.

This happened because:

trashRepo and supportTrashRepo were separated

But the SELECT structure from logs was reused

👉 Structural mismatch caused by module separation.

Fix:

Removed non-existent column from SELECT

Separated support trash repo responsibilities

Lesson:

Errors reveal structural boundaries.

🇰🇷 한국어
■ 발생 현상

고객센터 글을 삭제했지만
고객센터 휴지통 화면에 보이지 않았다.

DB에는 데이터가 있었고 삭제도 성공했지만,
화면에만 나타나지 않는 상황이었다.

■ 표면 에러
column support_trash_v.deleted_by_nickname does not exist

■ 실제 원인

존재하지 않는 컬럼을 SELECT 하고 있었다.

deleted_by_nickname


즉,

프론트의 쿼리 구조와 DB View 구조가 불일치

■ 왜 이런 일이 생겼는가

프로젝트가 커지면서:

일반 로그용 trashRepo

고객센터용 supportTrashRepo

가 분리되었는데,

비슷한 구조라서 기존 SELECT를 그대로 사용했다가
지원하지 않는 컬럼을 참조하게 됨.

👉 모듈 분리로 인해 구조 동기화 실패

■ 해결

잘못된 컬럼 제거

support 전용 trash repo 분리 정리

■ 배운 점

이건 단순 버그가 아니라:

"프로젝트가 확장되면서 반드시 발생하는 구조적 불일치"

를 경험한 것.

이건 진짜 실무급 디버깅 경험이다.
이걸 기록하는 사람 = 상급 개발자 루트.