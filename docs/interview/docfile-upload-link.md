2026-04-01

🇯🇵 日本語

Q. 添付ファイル機能はどのように実装しましたか？
A. Supabase Storageを利用し、ファイルアップロード後にメタデータをDBに保存し、content内にはトークン（[[attach:id]]）として管理しました。

Q. データ整合性はどのように担保しましたか？
A. validateContentBlocks を導入し、content内のトークンと attachments / links の配列が一致しない場合は保存をブロックしました。

Q. 編集時にデータが消える問題はどう解決しましたか？
A. initialAttachments と initialLinks を LogEditor に渡し、state初期化を正しく行うよう修正しました。

Q. YouTubeリンクが失敗する原因は？
A. YouTubeは動的レンダリングやBot制限があるため、通常のpreview APIでは安定して取得できないためです。

Q. エラーログ設計は？
A. UI用エラーと内部ログを分離し、logErrorでDBに記録し分析可能な構造にしました。

🇺🇸 English

Q. How did you implement file attachments?
A. I used Supabase Storage for uploading files, stored metadata in DB, and referenced them via tokens like [[attach:id]] in content.

Q. How did you ensure data consistency?
A. I implemented validateContentBlocks to validate that content tokens match attachments and links before saving.

Q. How did you fix missing data in edit mode?
A. By properly passing initialAttachments and initialLinks and syncing state in the editor.

Q. Why does YouTube preview fail?
A. Because YouTube uses dynamic rendering and bot protection, making it unreliable for preview APIs.

Q. How did you design error logging?
A. I separated UI errors from internal logs and stored detailed logs in DB using logError.

🇰🇷 한국어

Q. 첨부파일 기능은 어떻게 구현했나요?
A. Supabase Storage를 이용해 파일 업로드 후 DB에 메타데이터를 저장하고, content에는 [[attach:id]] 토큰 형태로 참조하도록 설계했습니다.

Q. 데이터 정합성은 어떻게 보장했나요?
A. validateContentBlocks를 통해 content의 토큰과 attachments/links 배열이 일치하지 않으면 저장을 막도록 했습니다.

Q. 수정 페이지에서 데이터가 사라지는 문제는 어떻게 해결했나요?
A. initialAttachments, initialLinks를 LogEditor에 전달하고 state 초기화를 수정했습니다.

Q. YouTube 링크 preview가 실패하는 이유는?
A. YouTube는 동적 렌더링과 봇 차단이 있어 일반 preview API로는 안정적으로 데이터를 가져오기 어렵기 때문입니다.

Q. 에러 로그는 어떻게 설계했나요?
A. 사용자 UI 에러와 내부 로그를 분리하고, logError를 통해 DB에 저장하여 분석 가능하게 설계했습니다.