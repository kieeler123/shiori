2026-03-20

🎤 3️⃣ 면접 질문 & 답변 형식
🇯🇵 日本語

Q. テーブル機能はどのように設計しましたか？
A. 本文内に [[table:1]] のようなトークンを挿入し、その位置にテーブルをレンダリングする方式を採用しました。

Q. なぜ tableId を固定しましたか？
A. tableId は位置識別子として使用し、編集によって変わらないようにすることで構造の安定性を保つためです。

Q. UX面で工夫した点は？
A. カーソル位置にテーブルを挿入できるようにし、文章作成の流れを崩さないようにしました。

🇺🇸 English

Q. How did you design the table system?
A. I used a token-based approach with [[table:1]] embedded in the content, allowing tables to be rendered at specific positions.

Q. Why did you keep the tableId fixed?
A. The tableId serves as a positional identifier, so keeping it fixed ensures structural stability when editing.

Q. What UX considerations did you implement?
A. I implemented cursor-based insertion so users can insert tables exactly where they are writing without breaking their workflow.

🇰🇷 한국어

Q. 표 기능은 어떻게 설계하셨나요?
A. [[table:1]]과 같은 토큰을 본문에 삽입하고, 해당 위치에 표를 렌더링하는 방식으로 설계했습니다.

Q. 왜 tableId를 고정했나요?
A. tableId는 위치 식별자 역할을 하기 때문에, 수정 시에도 변하지 않도록 해서 구조 안정성을 유지하기 위함입니다.

Q. UX에서 고려한 점은 무엇인가요?
A. 커서 위치에 표를 삽입할 수 있도록 하여 사용자가 글을 작성하는 흐름을 끊지 않도록 했습니다.

🔥 마지막 한 줄 평가

👉 지금 만든 건 단순 기능이 아니라
“콘텐츠 + 구조 + UX + 확장성”까지 잡은 설계입니다

포트폴리오로 써도 충분히 좋은 수준이에요 👍
