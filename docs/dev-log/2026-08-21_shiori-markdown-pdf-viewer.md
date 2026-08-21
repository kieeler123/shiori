# Shiori 開発記録 — Markdown / PDF 添付ファイルビューアー

## 日本語

### 1. リスト形式

- Markdownファイルを添付ファイルとしてアップロードし、Shiori内部で表示できるようにした。
- Markdownファイルをブラウザで直接開く方式では、デスクトップとモバイルで表示結果が異なる問題があった。
- この問題を解決するため、Markdown専用の `MarkdownViewerPage` を追加した。
- React Routerに `/logs/:logId/attachments/:attachmentId/markdown` ルートを追加し、MarkdownファイルをShiori内部で開く構造に変更した。
- `dbGet()` がログの `attachments` と `links` を取得できるように、詳細取得用のSELECT項目を確認・修正した。
- Markdown表示には `react-markdown`、`remark-gfm`、`rehype-raw` を利用し、一般的なMarkdownだけでなくHTMLタグを含む文書にも対応した。
- Markdown専用CSSをShioriのテーマ構造に組み込み、現在選択されているテーマに合わせて文字色、背景色、リンク色などが変化するようにした。
- Markdown内のローカル画像パスを、そのままブラウザから参照する方式では画像が表示できない問題を確認した。
- Markdownファイルと画像ファイルを同時にインポートし、画像をSupabase Storageの添付ファイルとして保存する処理を追加した。
- Markdown内の画像パスとアップロード済みの `AttachmentItem` を対応させ、Signed URLへ変換して表示する処理を実装した。
- `../image.png` のような相対パスでもファイル名を利用して添付画像を検索できるようにした。
- Markdown内の `<img>` タグも処理できるようにし、複数画像を文書内で表示できるようにした。
- 画像サイズは固定ピクセルではなく、画面サイズに合わせて変化するレスポンシブ表示を基本方針とした。
- デスクトップでは画像を1行に2枚程度配置でき、狭い画面では自然に1列表示へ移行できる構造を検討した。
- `LogContentRenderer` の通常テキスト部分もMarkdownとしてレンダリングするように変更し、詳細画面でMarkdown記法がそのまま文字列として表示される問題を改善した。
- MarkdownとPDFを開く処理が複数コンポーネントに分散しないよう、`getAttachmentViewerPath()` を作成してビューアールート判定を共通化した。
- PDFについてもブラウザ標準ビューアーではなく、Shiori内部の `PdfViewerPage` から表示できるルートを追加した。
- PDFファイルはSupabase StorageからSigned URLを生成し、`react-pdf` の `Document` と `Page` を利用して表示する構造にした。
- PDF ViewerにはShioriの背景色、境界線、ツールバー、戻るボタン、総ページ数表示などを適用した。
- `ResizeObserver` を利用してPDF表示領域の横幅を取得し、画面サイズに応じてPDFページの表示サイズが変わるようにした。
- PDFページの外側についてはShioriの画面幅に合わせて広げることができた。
- 一方、PDF内部の文章や画像の配置はPDF作成時に固定されているため、Markdownのように画面幅に合わせて再配置できないことを確認した。
- 既存PDFについては原本レイアウトを維持するビューアーとして扱い、将来的に拡大・縮小、ブラウザで開く、ダウンロードなどの機能を追加する方針とした。
- 今回はMarkdownをShiori内部で安定して閲覧できることを主目的として、Markdown/PDF Viewerの基本構造が完成した段階で作業を区切ることにした。

> **ポイント**
> 今回の作業では単にMarkdownを表示するだけでなく、添付ファイル、Storage、ルーティング、テーマ、画像解決、PDF Viewerまで関連する仕組みを整理した。今後はファイル形式ごとの処理を各画面に直接書くのではなく、共通の添付ファイル処理へ集約していくと保守しやすい。

# Shiori Development Log — Markdown / PDF Attachment Viewers

## English

### 1. List Format

- Added support for uploading Markdown files as attachments and viewing them inside Shiori.
- Identified inconsistent behavior when Markdown files were opened directly by browsers, especially between desktop and mobile environments.
- Added a dedicated `MarkdownViewerPage` to avoid depending on the browser's native Markdown handling.
- Added the `/logs/:logId/attachments/:attachmentId/markdown` route so Markdown attachments can be opened through Shiori.
- Reviewed and updated the detail query so `dbGet()` can retrieve attachment and link information required by the viewers.
- Used `react-markdown`, `remark-gfm`, and `rehype-raw` to render Markdown and documents containing supported raw HTML.
- Integrated Markdown styling with Shiori's existing theme system so colors change according to the currently selected theme.
- Identified that local image paths inside Markdown could not be loaded directly by the browser.
- Added an import process that uploads Markdown-related images to Supabase Storage as Shiori attachments.
- Connected image references inside Markdown with uploaded `AttachmentItem` objects and replaced them with Signed URLs when displaying the document.
- Added filename-based matching so relative paths such as `../image.png` can still be associated with uploaded attachments.
- Added support for processing HTML `<img>` elements contained inside Markdown documents.
- Chose responsive image sizing instead of fixed pixel sizes so images can adapt to different screen widths.
- Considered a layout where desktop screens can display approximately two images per row while smaller screens naturally fall back to one column.
- Updated the text portions of `LogContentRenderer` to render Markdown instead of displaying Markdown syntax as plain text on the log detail page.
- Created `getAttachmentViewerPath()` to centralize the logic that determines which internal viewer should open an attachment.
- Added an internal PDF route so PDF attachments can also be displayed inside Shiori instead of relying entirely on the browser's default PDF viewer.
- Generated Signed URLs for PDF attachments stored in Supabase and rendered them with `Document` and `Page` from `react-pdf`.
- Applied Shiori UI elements to the PDF Viewer, including the application background, borders, toolbar, back button, and total page count.
- Used `ResizeObserver` to measure the available PDF container width and resize rendered PDF pages according to the screen size.
- Expanded the PDF page container so the PDF itself can make better use of the available Shiori layout width.
- Confirmed that the internal layout of an existing PDF cannot reflow like Markdown because text and image positions are already fixed in the PDF.
- Decided to treat existing PDFs as original-layout documents and leave features such as zooming, opening in the browser, and downloading for later development.
- Stopped the current work after establishing the core Markdown/PDF Viewer structure, since the primary goal of reliably reading Markdown inside Shiori had been achieved.

> **Tip**
> This work went beyond simply displaying Markdown. It also established foundations for attachment handling, Storage integration, routing, themes, image resolution, and PDF viewing. Future file-type logic should remain centralized instead of being duplicated across individual components.

---

# Shiori 개발 기록 — Markdown / PDF 첨부파일 뷰어

## 한국어

### 1. 리스트 형식

- Markdown 파일을 첨부파일로 업로드하고 Shiori 내부에서 볼 수 있도록 기능을 구성했다.
- Markdown 파일을 브라우저에서 직접 여는 방식은 데스크톱과 모바일에서 표시 결과가 달라질 수 있다는 문제를 확인했다.
- 브라우저의 Markdown 처리 방식에 의존하지 않도록 전용 `MarkdownViewerPage`를 추가했다.
- `/logs/:logId/attachments/:attachmentId/markdown` 라우트를 추가하여 Markdown 첨부파일을 Shiori 내부에서 열도록 변경했다.
- `dbGet()`에서 Viewer에 필요한 `attachments`와 `links` 정보를 가져올 수 있도록 상세 조회 SELECT 항목을 확인하고 수정했다.
- Markdown 렌더링에 `react-markdown`, `remark-gfm`, `rehype-raw`를 사용하여 일반 Markdown과 지원되는 HTML 표현을 처리하도록 했다.
- Markdown 전용 CSS를 기존 Shiori 테마 시스템과 연결하여 현재 선택된 테마에 따라 글자색, 배경색, 링크색 등이 변경되도록 했다.
- Markdown 내부의 로컬 이미지 경로를 브라우저가 직접 읽을 수 없어 이미지가 깨지는 문제를 확인했다.
- Markdown 파일과 관련 이미지를 함께 가져와 이미지를 Supabase Storage의 첨부파일로 저장하는 Import 처리를 추가했다.
- Markdown 내부 이미지 참조와 업로드된 `AttachmentItem`을 연결하고 Signed URL로 변환하여 이미지를 표시하도록 구현했다.
- `../image.png`와 같은 상대경로도 파일명을 기준으로 업로드된 첨부파일과 연결할 수 있도록 처리했다.
- Markdown 안에서 사용하는 HTML `<img>` 태그도 찾아서 이미지 경로를 처리할 수 있도록 했다.
- 이미지 크기는 고정 픽셀보다 화면 크기에 따라 변하는 반응형 표시 방식을 기본 방향으로 정했다.
- 데스크톱에서는 한 줄에 이미지 약 두 개를 배치하고 좁은 화면에서는 자연스럽게 한 열로 변경할 수 있는 구조를 검토했다.
- `LogContentRenderer`의 일반 텍스트 부분도 Markdown으로 렌더링하도록 바꾸어 상세화면에서 Markdown 문법이 그대로 노출되는 문제를 개선했다.
- 여러 컴포넌트에서 Markdown/PDF Viewer 경로를 각각 판단하지 않도록 `getAttachmentViewerPath()`를 만들어 Viewer 경로 결정을 공통화했다.
- PDF 역시 브라우저 기본 Viewer에만 의존하지 않고 Shiori 내부의 `PdfViewerPage`에서 볼 수 있도록 전용 경로를 추가했다.
- Supabase Storage의 PDF 첨부파일에 Signed URL을 생성하고 `react-pdf`의 `Document`, `Page`를 사용해 표시하도록 구성했다.
- PDF Viewer에 Shiori 배경, 테두리, 툴바, 뒤로가기 버튼, 전체 페이지 수 표시 등 기존 UI 요소를 적용했다.
- `ResizeObserver`로 PDF 표시 영역의 실제 너비를 측정하여 화면 크기에 따라 PDF 페이지 크기가 변하도록 구성했다.
- PDF 페이지의 바깥 영역은 Shiori Viewer의 사용 가능한 폭을 더 많이 활용하도록 조정했다.
- 하지만 기존 PDF 내부의 글과 이미지 위치는 PDF 생성 시 이미 고정되어 있어 Markdown처럼 화면 너비에 맞춰 재배치할 수 없다는 점을 확인했다.
- 기존 PDF는 원본 레이아웃을 유지하는 Viewer로 사용하고 확대·축소, 브라우저에서 열기, 다운로드 등의 기능은 추후 추가하기로 했다.
- 이번 작업에서는 Markdown을 Shiori 내부에서 안정적으로 읽는 것을 우선 목표로 하고 Markdown/PDF Viewer의 기본 구조가 완성된 시점에서 작업을 정리하기로 했다.

> **팁**
> 이번 작업은 단순한 Markdown 표시를 넘어 첨부파일, Storage, 라우팅, 테마, 이미지 경로 해결, PDF Viewer의 기반까지 연결했다. 앞으로는 파일 형식별 판별 로직을 여러 컴포넌트에 반복해서 작성하기보다 공통 첨부파일 처리 계층으로 모으는 편이 유지보수에 유리하다.
