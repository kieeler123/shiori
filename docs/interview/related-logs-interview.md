🎤 📌 면접 질문 / 답변
🇯🇵 日本語

Q. 人気順でデータが表示されなかった原因は何ですか？
A. DBからの取得は正常でしたが、フロントのフィルタによって全て除外されていました。

Q. どのように原因を特定しましたか？
A. rawデータとフィルタ後データを別々にログ出力し、どの段階で消えているかを確認しました。

Q. 今回の学びは何ですか？
A. フィルタはリストの性質に応じて調整する必要があることです。

🇺🇸 English

Q. Why was no data displayed in views sort?
A. The data was fetched correctly, but all items were filtered out on the frontend.

Q. How did you debug it?
A. By logging raw data and filtered data separately to identify where data was lost.

Q. What did you learn?
A. Filtering strategies must vary depending on UI context and data volume.

🇰🇷 한국어

Q. 인기순에서 데이터가 안 보인 이유는 무엇인가요?
A. DB 조회는 정상적으로 되었지만, 프론트 필터에서 모든 데이터가 제거되었습니다.

Q. 어떻게 원인을 찾았나요?
A. raw 데이터와 필터 이후 데이터를 각각 로그로 찍어 비교했습니다.

Q. 무엇을 배웠나요?
A. 필터는 리스트의 성격과 데이터 양에 따라 다르게 적용해야 합니다.

🔥 마지막으로 (중요)

오늘 기록에서 제일 중요한 건 이거 하나다:

👉 “DB 문제인지, 프론트 문제인지 분리해서 확인했다”

이게 진짜 실력이다.