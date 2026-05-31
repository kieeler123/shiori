# 日本語

## 今日の振り返り

今日は Shiori の添付ファイル機能で発生していた文字化け問題の調査と修正を行った。最初は Markdown Viewer の問題だと思ったが、VS Code やブラウザとの挙動を比較しながら原因を絞り込んだ。その結果、Supabase Storage の Public URL 経由で取得した Markdown ファイルの文字コード処理に問題があることを発見した。Vercel のログを活用しながら Serverless Function を実装し、最終的に UTF-8 として正しく表示できるようになった。原因調査に時間はかかったが、ログ解析やエンコーディングの理解を深める良い経験になった。

# English

## Reflection

Today I investigated and fixed an encoding issue in the Shiori attachment feature. At first, I suspected the Markdown Viewer extension, but by comparing the behavior across VS Code, browsers, and the storage layer, I gradually narrowed down the root cause. Eventually, I discovered that Markdown files served through Supabase Storage Public URLs were not being interpreted correctly. Using Vercel logs and a custom Serverless Function, I was able to ensure proper UTF-8 decoding and rendering. Although the debugging process took time, it provided valuable experience in log analysis, serverless development, and character encoding.

# 한국어

## 회고

오늘은 Shiori 첨부파일 기능에서 발생하던 한글 깨짐 문제를 조사하고 수정했다. 처음에는 Markdown Viewer 확장프로그램 문제라고 생각했지만, VS Code와 브라우저, Supabase Storage의 동작을 비교하면서 원인을 단계적으로 좁혀 나갔다. 그 결과 Public URL을 통해 제공되는 Markdown 파일의 인코딩 처리 과정에 문제가 있음을 확인했다. Vercel 로그를 분석하고 Serverless Function을 구현하여 UTF-8로 정상 표시되도록 수정했다. 원인 추적에 시간이 많이 걸렸지만, 로그 분석과 인코딩 처리, 서버리스 환경에 대한 이해를 높일 수 있었던 의미 있는 작업이었다.
