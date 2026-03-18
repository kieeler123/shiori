2026-03-19

✍️ 📌 에세이 형식
🇯🇵 日本語

詳細ページの下部に、同一作者の投稿を表示する機能を実装した。
このセクションでは、最新順と人気順を切り替えられるようにし、最大5件まで表示する構造とした。

実装中、人気順に切り替えた際に「データが存在しない」と表示される問題が発生した。
最初はソートが反映されていないと考えたが、状態変更ログは正常に出力されていた。

その後、DBから取得したデータと、最終的に表示されるデータをそれぞれログ出力して比較したところ、
データは取得されているにもかかわらず、フロントのフィルタによって全て除外されていることが分かった。

この問題の原因は、メインリスト用に設計された強いフィルタを、
少量データのrelated logsにもそのまま適用していたことにあった。

この経験から、フィルタは一律に適用するものではなく、
UIの目的やデータ量に応じて調整すべきであることを理解した。

🇺🇸 English

I implemented a section under the log detail page to display other posts by the same author.
The section supports sorting by recent and views, and displays up to five items.

During implementation, an issue occurred where no data was shown when switching to views sort.
Initially, I suspected that the sort state was not applied, but logs confirmed that the state change was working correctly.

I then compared raw fetched data with the filtered result using logs.
Although the database returned valid data, all items were removed by the frontend filter.

The root cause was applying a strict filter designed for the main list to a small related logs section.

From this, I learned that filtering strategies should be adjusted based on context,
especially when dealing with limited datasets.

🇰🇷 한국어

상세페이지 하단에 같은 작성자의 글을 보여주는 기능을 구현했다.
이 섹션은 최신순과 인기순으로 정렬할 수 있으며, 최대 5개의 글을 표시하도록 구성했다.

구현 과정에서 인기순으로 변경했을 때 데이터가 보이지 않는 문제가 발생했다.
처음에는 정렬 상태가 적용되지 않는 문제라고 생각했지만, 로그를 통해 상태 변경은 정상임을 확인했다.

이후 DB에서 가져온 데이터와 필터링 이후 데이터를 각각 로그로 비교한 결과,
데이터는 정상적으로 조회되었지만 프론트 필터에서 모두 제거되고 있음을 확인했다.

문제의 원인은 메인 리스트용으로 만든 강한 필터를
related logs에도 그대로 적용한 것이었다.

이 경험을 통해 필터는 일괄적으로 적용하는 것이 아니라,
UI의 목적과 데이터 구조에 맞게 다르게 설계해야 한다는 것을 이해하게 되었다.