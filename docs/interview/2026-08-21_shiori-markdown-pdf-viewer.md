# Shiori 開発記録 — Markdown / PDF 添付ファイルビューアー

## 日本語

### 2. 質問・回答形式

#### Q1. 最初に解決しようとした問題は何だったか？

Markdownファイルを添付して開いたとき、デスクトップではブラウザで表示できても、モバイルでは同じデザインで表示されない問題があった。また、アプリ内のルーティングとの関係で、添付ファイルを開こうとするとShioriのメインページへ戻る場合もあった。

#### Q2. Markdownの表示方法をどのように変更したか？

ブラウザにMarkdownファイルを直接処理させるのではなく、`MarkdownViewerPage` を作成した。ログIDと添付ファイルIDをURLから取得し、対象ログの添付ファイルを検索してSupabase StorageからMarkdown本文を取得する方式に変更した。

#### Q3. Markdownのレンダリングには何を使用したか？

`react-markdown` と `remark-gfm` を使用し、HTMLを含むMarkdownに対応するため `rehype-raw` も追加した。これにより見出し、リンク、引用、表などのMarkdown表現をShiori内部でレンダリングできるようになった。

#### Q4. テーマはどのように適用したか？

Markdown専用CSSを既存のShioriテーマシステムと組み合わせた。固定色を大量に指定するのではなく、既存のCSS変数を利用することで、ユーザーが選択したテーマに合わせてMarkdown Viewerの色も変化する構造にした。

#### Q5. Markdown内の画像が最初に表示されなかった理由は何か？

Markdownには `../image.png` のようなローカル相対パスが記録されていた。しかし、ブラウザからそのパスを参照しても、元のPC上に存在していた画像をWebアプリから直接取得することはできない。そのため画像をShioriの添付ファイルとして保存し直す必要があった。

#### Q6. 画像問題をどのように解決したか？

Markdownと画像を一緒にインポートし、画像をSupabase Storageへアップロードした。その後、Markdownに記録された画像ファイル名とログの `attachments` を対応させ、Signed URLを生成してMarkdown内の画像パスを置き換える方式を採用した。

#### Q7. 詳細画面でMarkdown記法がそのまま表示された問題はどうしたか？

`LogContentRenderer` の `TextBlock` が通常の `<p>` として文字列を表示していたため、Markdown記法が解釈されていなかった。そこで `TextBlock` 内でも `ReactMarkdown` を利用し、通常本文についてもMarkdownとしてレンダリングするように変更した。

#### Q8. PDFはどのように扱うことにしたか？

PDFについてもShiori内部で表示するため `PdfViewerPage` を利用した。Supabase StorageからSigned URLを取得し、`react-pdf` でページをレンダリングすることで、ブラウザ標準PDF Viewerだけに依存しない構造にした。

#### Q9. PDFをMarkdownと完全に同じレイアウトにできないのはなぜか？

MarkdownはHTMLへ変換した後、CSSによって画面幅に合わせて文章や画像を再配置できる。一方、PDFはページ内の文字や画像の座標が作成時に固定されている。そのためViewerのページサイズを拡大することはできても、内部レイアウトだけをMarkdownのように再構成することはできない。

#### Q10. 今後どのように拡張する予定か？

既存PDFは原本表示を基本とし、将来的には拡大・縮小、ブラウザで開く、ダウンロード、ページ移動などを追加できる。また、Markdown、PDF、画像などのファイル形式判定とViewerルートの決定は共通処理へ集約し、添付ファイル機能全体を整理していく予定である。

> **ポイント**
> MarkdownとPDFでは文書の性質が異なるため、無理に同じレンダリング方式へ統一するより、Shioriの共通UIと操作体系を統一しながら、それぞれに適したViewerを利用する方が扱いやすい。

### 2. Question and Answer Format

#### Q1. What was the original problem to solve?

When a Markdown attachment was opened, desktop browsers could display it while mobile browsers did not necessarily provide the same presentation. There were also cases where opening an attachment interacted with application routing and returned the user to Shiori's main page.

#### Q2. How was Markdown viewing changed?

Instead of asking the browser to display the Markdown file directly, a dedicated `MarkdownViewerPage` was created. It obtains the log ID and attachment ID from the route, finds the attachment in the log data, and retrieves the Markdown content from Supabase Storage.

#### Q3. What is used to render Markdown?

The viewer uses `react-markdown` together with `remark-gfm`, while `rehype-raw` provides support for raw HTML used inside the Markdown. This allows headings, links, quotations, tables, and other Markdown structures to be rendered inside Shiori.

#### Q4. How was theme support implemented?

Markdown-specific CSS was connected to the existing Shiori theme system. Rather than defining many fixed colors, the viewer relies on existing CSS variables so Markdown content follows the theme currently selected by the user.

#### Q5. Why did images inside Markdown initially fail to display?

The Markdown contained local relative paths such as `../image.png`. Those paths referred to files that originally existed on the local computer, but a web application cannot directly retrieve arbitrary local files through those paths. The images therefore needed to become Shiori attachments.

#### Q6. How was the image problem solved?

Images selected together with the Markdown file are uploaded to Supabase Storage. The viewer then matches image filenames from the Markdown with the log's `attachments`, creates Signed URLs, and substitutes those URLs for the original local image paths.

#### Q7. How was raw Markdown syntax on the detail page fixed?

`TextBlock` in `LogContentRenderer` previously rendered its content as ordinary text, so Markdown syntax remained visible. It was changed to use `ReactMarkdown`, allowing the regular log content to be rendered as Markdown as well.

#### Q8. How are PDFs handled now?

A dedicated `PdfViewerPage` is used so PDF files can be viewed inside Shiori. It retrieves a Signed URL from Supabase Storage and uses `react-pdf` to render each page instead of depending only on the browser's built-in PDF viewer.

#### Q9. Why can't the PDF use exactly the same responsive layout as Markdown?

Markdown is converted into HTML and can then be reflowed with CSS according to the available screen width. A PDF already contains fixed coordinates and dimensions for its text and images. A viewer can scale the whole page, but it cannot normally rearrange the internal document layout like HTML.

#### Q10. How can the attachment system be extended later?

Existing PDFs can continue to use their original layout while features such as zoom controls, browser opening, downloading, and page navigation are added later. File-type detection and viewer routing should continue to be centralized so Markdown, PDF, images, and future attachment types remain manageable.

> **Tip**
> Markdown and PDF represent documents differently. Instead of forcing them into the same rendering mechanism, it is more maintainable to give each format an appropriate viewer while keeping Shiori's surrounding UI and interaction patterns consistent.

### 2. 질문답변 형식

#### Q1. 처음 해결하려고 했던 문제는 무엇이었나?

Markdown 첨부파일을 열었을 때 데스크톱에서는 브라우저로 볼 수 있었지만 모바일에서는 동일한 방식이나 디자인으로 표시되지 않는 문제가 있었다. 또한 첨부파일을 열려고 했을 때 애플리케이션 라우팅과 충돌하여 Shiori 메인화면으로 돌아가는 경우도 있었다.

#### Q2. Markdown을 여는 방식을 어떻게 변경했나?

Markdown 파일을 브라우저에 직접 맡기는 대신 전용 `MarkdownViewerPage`를 만들었다. URL에서 로그 ID와 첨부파일 ID를 가져오고 해당 로그의 첨부파일을 찾은 다음 Supabase Storage에서 Markdown 내용을 읽어오는 구조로 변경했다.

#### Q3. Markdown 렌더링에는 무엇을 사용했나?

`react-markdown`과 `remark-gfm`을 사용했고 Markdown 안의 HTML을 처리하기 위해 `rehype-raw`도 추가했다. 이를 통해 제목, 링크, 인용문, 표 등 Markdown 구조를 Shiori 내부에서 직접 렌더링할 수 있게 했다.

#### Q4. Shiori 테마는 어떻게 적용했나?

Markdown 전용 CSS를 기존 Shiori 테마 시스템과 연결했다. 색상을 별도로 고정해서 지정하기보다는 기존 CSS 변수를 활용하여 사용자가 선택한 테마에 맞춰 Markdown Viewer의 색상도 함께 변경되도록 구성했다.

#### Q5. Markdown 안의 이미지가 처음에 깨졌던 이유는 무엇인가?

Markdown에는 `../image.png`와 같은 로컬 상대경로가 들어 있었다. 이 경로는 원래 PC에 있던 파일을 가리키지만 웹 애플리케이션에서는 해당 로컬 파일을 직접 읽을 수 없다. 따라서 이미지를 Shiori의 첨부파일로 다시 관리할 필요가 있었다.

#### Q6. 이미지 문제는 어떻게 해결했나?

Markdown과 이미지를 함께 선택하여 이미지를 Supabase Storage에 업로드하도록 했다. 이후 Markdown의 이미지 파일명과 로그의 `attachments`를 비교하여 해당 첨부파일을 찾고 Signed URL을 생성한 뒤 기존 로컬 이미지 경로를 교체하는 방식을 사용했다.

#### Q7. 상세화면에 Markdown 문법이 그대로 표시되던 문제는 어떻게 해결했나?

`LogContentRenderer`의 `TextBlock`이 기존에는 일반 텍스트를 출력하고 있었기 때문에 Markdown 문법이 해석되지 않았다. 이 부분에서도 `ReactMarkdown`을 사용하도록 변경하여 일반 로그 본문도 Markdown으로 렌더링되도록 했다.

#### Q8. PDF는 현재 어떻게 처리하고 있나?

PDF도 Shiori 내부에서 볼 수 있도록 전용 `PdfViewerPage`를 사용한다. Supabase Storage에서 Signed URL을 얻고 `react-pdf`를 사용해 각 페이지를 렌더링하여 브라우저 기본 PDF Viewer에만 의존하지 않도록 구성했다.

#### Q9. PDF를 Markdown과 완전히 같은 반응형 레이아웃으로 만들 수 없는 이유는 무엇인가?

Markdown은 HTML로 변환한 뒤 CSS를 통해 화면 너비에 맞게 글과 이미지를 다시 배치할 수 있다. 반면 PDF는 문서가 만들어질 때 글과 이미지의 좌표와 크기가 이미 고정된다. Viewer에서 전체 페이지를 확대할 수는 있지만 내부 요소만 Markdown처럼 다시 배치하는 것은 일반적으로 불가능하다.

#### Q10. 앞으로 첨부파일 기능을 어떻게 확장할 수 있나?

기존 PDF는 원본 레이아웃을 유지하면서 추후 확대·축소, 브라우저에서 열기, 다운로드, 페이지 이동 등을 추가할 수 있다. 또한 Markdown, PDF, 이미지 등 파일 형식 판별과 Viewer 경로 결정은 계속 공통화하여 첨부파일 관련 코드가 여러 화면으로 분산되지 않도록 정리할 수 있다.

> **팁**
> Markdown과 PDF는 문서 구조 자체가 다르기 때문에 렌더링 방식을 억지로 하나로 통일하기보다 각각에 맞는 Viewer를 사용하면서 Shiori의 UI와 조작 방식만 일관되게 만드는 것이 좋다.
