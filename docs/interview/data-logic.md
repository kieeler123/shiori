🇯🇵 日本語

Q. 今日どのような問題を解決しましたか？
A. Import データの source_date が表示されない問題を調査し、SELECT クエリにフィールドが含まれていないことを特定して修正しました。

Q. データ設計で学んだことは？
A. システム生成日時と原本日時を分離することで、データ移行後も履歴を維持できることを学びました。

Q. TypeScript 関連の問題はありましたか？
A. Supabase の join 結果が配列で返るケースがあり、型定義と実レスポンスの差を吸収する変換処理を追加しました。

Q. UX 面で改善した点は？
A. source_date ?? created_at の表示優先順位を導入し、一貫した日付表示を実現しました。

🇺🇸 English

Q. What issue did you solve today?
A. I fixed a problem where source_date was not displayed because it was missing from the SELECT query despite existing in the database.

Q. What did you learn about data modeling?
A. Separating system timestamps from original content timestamps preserves historical integrity during migration.

Q. Did you face any TypeScript issues?
A. Yes. Supabase returned relational data as arrays, so I added normalization logic to align runtime data with type definitions.

Q. What UX improvement did you implement?
A. I introduced a fallback display rule using source_date ?? created_at.

🇰🇷 한국어

Q. 오늘 어떤 문제를 해결했나요?
A. import 데이터의 source_date가 표시되지 않는 문제를 조사했고, SELECT 쿼리에 필드가 포함되지 않았던 원인을 찾아 수정했습니다.

Q. 데이터 설계에서 무엇을 배웠나요?
A. 시스템 생성 날짜와 원본 작성 날짜를 분리하면 데이터 이관 이후에도 시간 흐름을 유지할 수 있다는 점을 배웠습니다.

Q. 타입 관련 문제는 있었나요?
A. Supabase join 결과가 배열로 내려오는 경우가 있어 타입과 실제 응답을 맞추는 정규화 처리를 추가했습니다.

Q. UX 개선은 무엇을 했나요?
A. source_date ?? created_at 규칙을 적용해 일관된 날짜 표시를 구현했습니다.