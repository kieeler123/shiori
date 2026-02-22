🇯🇵 日本語（エッセイ）

今日は Shiori プロジェクトにおいて、データ移行と表示ロジックの整合性を中心に改善を行った。

まず、過去に MongoDB から export したデータを Supabase に import した際、source_date が正しく表示されない問題を確認した。DB には値が存在していたが、実際には SELECT クエリに source_date が含まれていなかったため、フロントエンド側で取得できていなかったことが原因だった。

この問題を修正することで、「作成日(created_at)」と「原本作成日(source_date)」を分離して扱う設計が完成した。Import データは原本の日付を保持しつつ、Shiori 内では新しい管理日付を持つ構造になった。

さらに、一覧表示の UX 改善として、表示日付を

source_date ?? created_at

の優先順位で表示するロジックを導入した。

また、Supabase のレスポンス構造において、profile がオブジェクトではなく配列として返るケースを確認し、型安全性を保つための変換処理を追加した。これにより TypeScript の型エラーを解消し、API 応答の揺らぎに対応できる構造になった。

最後に、検索機能の次のステップとしてハイライト表示や AI タグ自動生成の方向性を設計レベルで整理した。

今日は新機能を大量に追加する日ではなく、データ構造の理解と設計の安定化に重点を置いた一日だった。

🇺🇸 English (Essay)

Today’s work on the Shiori project focused on data migration consistency and display logic refinement.

While importing legacy data exported from MongoDB into Supabase, I discovered that source_date was not appearing in the UI even though it existed in the database. The root cause was that the field was missing from the SELECT query, preventing it from being fetched on the frontend.

After fixing the query, the system now properly separates:

created_at (Shiori system timestamp)

source_date (original content creation date)

This allows imported content to preserve its historical timeline while still integrating into the new platform.

I also improved the display logic by introducing a fallback rule:

source_date ?? created_at

ensuring consistent UX regardless of import origin.

Additionally, I encountered a type mismatch caused by Supabase returning relational data (profile) as an array instead of an object. I implemented normalization logic to maintain TypeScript type safety and prevent runtime issues.

Finally, I planned future enhancements such as search highlighting and AI-generated tags for posts without tags.

Rather than adding many new features, today was dedicated to stabilizing architecture and deepening understanding of data flow.

🇰🇷 한국어 (에세이)

오늘은 Shiori 프로젝트에서 데이터 이관과 표시 로직 정합성을 중심으로 작업을 진행했다.

MongoDB에서 export한 데이터를 Supabase로 import하는 과정에서 source_date가 화면에 표시되지 않는 문제를 발견했다. 데이터베이스에는 값이 존재했지만 SELECT 쿼리에서 해당 필드를 조회하지 않아 프론트엔드로 전달되지 않는 것이 원인이었다.

쿼리를 수정하면서 다음 구조가 명확해졌다.

created_at : Shiori 시스템 생성 날짜

source_date : 원본 콘텐츠 작성 날짜

이를 통해 기존 데이터의 시간 흐름을 유지하면서도 새로운 플랫폼 구조에 자연스럽게 통합할 수 있게 되었다.

또한 목록 화면에서는

source_date ?? created_at

우선순위 로직을 적용하여 import 여부와 관계없이 일관된 날짜 표시가 가능하도록 개선했다.

Supabase 응답에서 profile이 객체가 아닌 배열로 내려오는 경우도 확인했고, 이를 정규화하여 TypeScript 타입 오류를 해결했다. 이 과정에서 API 응답 구조가 항상 동일하지 않다는 점을 실제로 체감할 수 있었다.

오늘은 기능을 많이 추가하기보다는 데이터 흐름과 구조 이해를 깊게 만드는 데 집중한 하루였다.