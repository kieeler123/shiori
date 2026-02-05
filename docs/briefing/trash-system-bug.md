🎤 Interview Q&A — Trash System Bug (Structure Mismatch Case)
🇯🇵 日本語（面接用）
❓ Q1. 最近経験した技術的な問題と解決方法を教えてください。

A：

顧客センターの投稿を削除したにも関わらず、
専用のゴミ箱画面に表示されない問題がありました。

DBにはデータが存在し削除も成功していたため、
表示ロジック側の問題だと判断しました。

Networkタブを確認したところ：

column support_trash_v.deleted_by_nickname does not exist


というエラーが出ていました。

原因は、
Viewに存在しないカラムをSELECTしていたことでした。

ログ用trash構造を流用したことで
support用View構造と不一致が起きていました。

解決策：

SELECT文から該当カラム削除

support専用trashRepoを分離し責務明確化

❓ Q2. なぜこの問題が発生したと思いますか？

A：

プロジェクト規模拡大に伴い、

logs用trashRepo

support用trashRepo

を分離した際、
似た構造のため既存SELECTを流用してしまったことが原因です。

つまり、

モジュール分離による構造同期ミス

が根本原因でした。

❓ Q3. どうやって原因を特定しましたか？

A：

画面ではなくNetworkタブ確認

SQLで直接データ確認

エラーメッセージとView定義照合

👉 コンソールではなくNetworkから追ったのが決め手でした。

❓ Q4. この経験から何を学びましたか？

A：

エラーはコードミスではなく構造ズレのことがある

Repo分離時はDB構造との差分確認が必須

表示されない問題はRLSより先にクエリ確認

🇰🇷 한국어 (면접 대비)
❓ Q1. 최근 겪은 기술적인 문제와 해결 과정을 설명해주세요.

A:

고객센터 글을 삭제했는데
전용 휴지통 화면에 나타나지 않는 문제가 있었습니다.

DB에는 데이터가 있었고 삭제도 정상 처리되었습니다.
그래서 표시 로직 문제라고 판단했습니다.

Network 탭을 확인했더니:

column support_trash_v.deleted_by_nickname does not exist


프론트에서 존재하지 않는 컬럼을 조회하고 있었습니다.

원인은
로그용 trash 구조를 고객센터에도 그대로 재사용했기 때문이었습니다.

해결:

잘못된 컬럼 제거

support 전용 trash repo 분리

❓ Q2. 왜 이런 문제가 발생했다고 생각합니까?

A:

프로젝트가 커지면서

logs용 repo

support용 repo

를 분리했는데,
비슷한 구조라 기존 쿼리를 그대로 사용하면서 구조 동기화가 깨졌습니다.

👉 모듈 분리로 인한 구조 불일치

❓ Q3. 원인을 어떻게 찾았습니까?

A:

콘솔이 아니라 Network 탭 확인

DB 직접 조회

에러 메시지와 View 구조 비교

❓ Q4. 이 경험에서 배운 점은 무엇입니까?

A:

이건 단순 버그가 아니라
프로젝트 확장 시 발생하는 구조적 문제라는 걸 배웠습니다.

🇺🇸 English (Interview Use)
Q1. Tell me about a recent technical issue you solved.

I had a case where deleted support tickets did not appear in the Support Trash page.

The deletion worked in the DB, so I knew it was a display/query issue.

Network tab showed:

column support_trash_v.deleted_by_nickname does not exist


Frontend was querying a column that did not exist in the view.

Cause:
The trash structure from logs was reused for support without checking schema differences.

Fix:

Removed invalid column

Separated support trash repo responsibilities

Q2. Why did this happen?

Because of project growth and module separation,
similar but different DB structures became mixed.

It was a structural synchronization failure.

Q3. How did you debug it?

Network tab first

Direct SQL verification

Compared view definition

Q4. What did you learn?

Errors often indicate architectural boundaries, not just code mistakes.