2026-03-20

✍️ 2️⃣ 에세이 형식
🇯🇵 日本語

今回の開発では、学習ログの中にテーブルを自然に挿入できる機能を実装しました。
単純にテーブルを描画するのではなく、[[table:1]] のようなトークンを本文に埋め込むことで、表示位置を柔軟に制御できる設計にしました。

また、テーブルの内容は table_data というJSON構造として分離し、コンテンツとデータを明確に分けました。これにより、拡張性や管理のしやすさが大きく向上しました。

さらに、TableEditor を実装し、ユーザーが直感的に行や列を追加・削除できるUIを構築しました。カーソル位置への挿入機能も追加し、実際の文章作成の流れを壊さないUXを実現しました。

最終的には、i18n対応まで考慮し、将来的な多言語対応にも対応できる構造を整えました。

🇺🇸 English

In this implementation, I developed a system that allows users to insert tables directly within their learning logs.

Instead of rendering tables in fixed positions, I designed a token-based approach using [[table:1]], enabling flexible placement within the content.

The table data was separated into a structured table_data JSON format, which improves scalability and maintainability by clearly separating content and data.

I also built a TableEditor component that allows users to dynamically add and remove rows and columns. Additionally, I implemented cursor-based insertion, ensuring that the editing experience remains intuitive and uninterrupted.

Finally, I prepared the system for internationalization (i18n), making it ready for multilingual support in the future.

🇰🇷 한국어

이번 작업에서는 학습 로그 안에 표를 자연스럽게 삽입할 수 있는 기능을 구현했습니다.

단순히 표를 렌더링하는 방식이 아니라, [[table:1]]과 같은 토큰을 본문에 삽입하여 원하는 위치에 표를 표시할 수 있도록 설계했습니다.

또한 표 데이터는 table_data라는 JSON 구조로 분리하여 관리함으로써, 콘텐츠와 데이터를 명확히 분리하고 확장성과 유지보수성을 높였습니다.

TableEditor 컴포넌트를 통해 사용자가 직관적으로 행과 열을 추가/삭제할 수 있도록 했으며, 커서 위치에 표를 삽입하는 기능을 구현하여 자연스러운 작성 경험을 유지했습니다.

마지막으로 i18n 구조를 적용하여 다국어 확장이 가능하도록 설계했습니다.
