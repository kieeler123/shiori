# Shiori 開発記録 — Markdown / PDF 添付ファイルビューアー

## 日本語

### 3. エッセイ形式

今日はShioriの添付ファイル機能を中心に、MarkdownとPDFをアプリ内部で閲覧する仕組みを整備した。当初の目的は比較的単純で、添付したMarkdownファイルをブラウザ環境に依存せず安定して読めるようにすることだった。しかし実際に実装を進めると、Markdownの表示だけでなく、ルーティング、添付ファイルデータ、Supabase Storage、画像パス、テーマ、詳細画面のレンダリング、さらにPDF Viewerまで複数の仕組みが関連していることが分かった。

最初の大きな変更は、Markdownをブラウザに直接開かせる方式から、Shiori専用の `MarkdownViewerPage` で表示する方式への移行だった。これにより、デスクトップとモバイルでMarkdownの表示方法が異なる問題を避けられるようになった。`react-markdown`、`remark-gfm`、`rehype-raw` を利用することでMarkdownと一部のHTML表現をアプリ内部で処理し、さらに既存のShioriテーマ変数を利用したCSSを適用することで、現在のテーマに合わせた文書表示も可能になった。

次に問題となったのがMarkdown内の画像だった。元のMarkdownには `../image.png` のようなローカル相対パスが含まれていたが、Webアプリからユーザーのローカルファイルを直接参照することはできない。そのため、Markdownと一緒に選択された画像をSupabase Storageへアップロードし、ログの添付ファイルとして管理する方式へ変更した。ViewerではMarkdown内の画像パスからファイル名を取得し、対応する `AttachmentItem` を検索してSigned URLへ変換することで画像を表示できるようにした。

詳細画面についても改善を行った。以前は本文が単純なテキストとして表示されていたため、見出しや太字などのMarkdown記法がそのまま文字列として見えていた。`LogContentRenderer` のテキスト部分にもMarkdownレンダリングを導入することで、詳細画面とMarkdown Viewerの表示方式を近づけることができた。また、MarkdownやPDFをどのViewerで開くかという判定を各コンポーネントに重複して書かないよう、`getAttachmentViewerPath()` に処理をまとめる方向へ整理した。

PDFについてもShiori内部で表示するため、`react-pdf` を利用した専用Viewerを整備した。PDFページ自体は画面幅に合わせて拡大できるようになったが、PDF内部の文章や画像の配置はファイル作成時に固定されているため、Markdownのようなレスポンシブな再配置はできないことも確認した。この点についてはPDFという形式の性質として受け入れ、既存PDFは原本レイアウトを維持して閲覧する用途にすることにした。

結果として、当初予定していたMarkdown閲覧機能より広い範囲を変更することになった。しかし、Markdown Viewer、画像解決、テーマ対応、PDF Viewer、添付ファイルのルーティングという今後必要になる基盤をまとめて整理できた。現時点では機能をさらに増やすより、一度ここまでを安定した区切りとして残すのがよい。今後必要になった段階で、PDFの拡大・縮小、ブラウザで開く機能、ダウンロード、画像Viewerなどを追加していけば、添付ファイル機能を段階的に発展させることができる。

> **ポイント**
> 今回の作業で重要だったのは、MarkdownとPDFを無理に同じ方式で処理するのではなく、ファイル形式ごとの特性を維持しながらShiori内部の共通UIと添付ファイル管理に統合したことである。

---

# Shiori Development Log — Markdown / PDF Attachment Viewers

## English

### 3. Essay Format

Today's work focused on improving Shiori's attachment system, particularly the ability to view Markdown and PDF documents inside the application. The original objective was relatively simple: make attached Markdown files readable in a consistent way without depending on browser-specific behavior. As implementation progressed, however, it became clear that Markdown viewing was connected to several other systems, including routing, attachment data, Supabase Storage, image paths, themes, detail-page rendering, and PDF viewing.

The first major change was moving away from opening Markdown files directly in the browser and introducing a dedicated `MarkdownViewerPage`. This reduced differences between desktop and mobile browsers because Shiori itself became responsible for rendering the document. Using `react-markdown`, `remark-gfm`, and `rehype-raw` made it possible to process Markdown and supported HTML content inside the application. The viewer was also connected to Shiori's existing theme variables, allowing Markdown documents to follow the currently selected application theme.

Images inside Markdown introduced another important problem. The source Markdown contained local relative paths such as `../image.png`, but a web application cannot directly access files that previously existed on the user's local computer. The solution was to upload images selected with the Markdown document to Supabase Storage and manage them as Shiori attachments. During viewing, the application extracts the filename from each Markdown image reference, finds the corresponding `AttachmentItem`, creates a Signed URL, and substitutes that URL for the original local path.

The log detail page was improved as well. Previously, portions of the content were displayed as ordinary text, which caused Markdown syntax such as headings and bold markers to remain visible. Markdown rendering was added to the text portions of `LogContentRenderer`, bringing the detail view closer to the dedicated Markdown Viewer. Attachment routing was also moved toward a common structure through `getAttachmentViewerPath()`, reducing the need for multiple components to independently decide how Markdown and PDF files should be opened.

PDF support was then incorporated into the same internal viewing approach. A dedicated `PdfViewerPage` retrieves PDF files through Supabase Signed URLs and renders them with `react-pdf`. The surrounding viewer can follow Shiori's layout and theme, and the rendered page size can respond to the available container width. However, an existing PDF cannot reflow its internal content in the same way as Markdown because the positions of text and images are already fixed when the PDF is created. This limitation was accepted as a characteristic of the format rather than something the viewer should attempt to redesign.

As a result, the work expanded beyond the original Markdown-reading task, but it also established useful foundations for future development. Shiori now has the beginnings of dedicated Markdown and PDF viewers, attachment-based image resolution, theme-aware document rendering, and centralized viewer routing. Rather than continuing to add more features immediately, this is a useful point to stabilize the current implementation. Features such as PDF zooming, opening files in the browser, downloading attachments, and a dedicated image viewer can be added later when they become necessary.

> **Tip**
> The most important architectural result is not making Markdown and PDF behave identically. It is keeping their format-specific behavior while integrating both into a consistent Shiori attachment and viewer system.

---

# Shiori 개발 기록 — Markdown / PDF 첨부파일 뷰어

## 한국어

### 3. 에세이 형식

오늘은 Shiori의 첨부파일 기능을 중심으로 Markdown과 PDF를 애플리케이션 내부에서 열어볼 수 있는 구조를 정리했다. 처음 목표는 비교적 단순했다. 첨부한 Markdown 파일을 브라우저 환경에 관계없이 안정적으로 읽을 수 있도록 만드는 것이었다. 하지만 구현을 진행하면서 Markdown 표시 기능 하나가 라우팅, 첨부파일 데이터, Supabase Storage, 이미지 경로, 테마, 상세화면 렌더링, PDF Viewer 등 여러 기능과 연결되어 있다는 것을 확인하게 되었다.

가장 먼저 Markdown 파일을 브라우저에서 직접 여는 방식에서 벗어나 전용 `MarkdownViewerPage`를 사용하는 방식으로 변경했다. 이렇게 하면 데스크톱과 모바일 브라우저가 Markdown을 서로 다르게 처리하는 문제를 줄일 수 있다. `react-markdown`, `remark-gfm`, `rehype-raw`를 사용해 Markdown과 지원되는 HTML 내용을 Shiori 내부에서 처리하고, 기존 테마의 CSS 변수를 활용하여 현재 선택된 Shiori 테마에 맞게 문서 색상도 함께 변경되도록 구성했다.

다음으로 해결해야 했던 문제는 Markdown 내부 이미지였다. 원본 Markdown에는 `../image.png`와 같은 로컬 상대경로가 포함되어 있었지만 웹 애플리케이션에서는 사용자의 PC에 존재했던 파일을 해당 경로로 직접 가져올 수 없다. 그래서 Markdown과 함께 선택한 이미지를 Supabase Storage에 업로드하고 Shiori의 첨부파일로 관리하도록 변경했다. Viewer에서는 Markdown의 이미지 경로에서 파일명을 추출하고 해당 이름을 가진 `AttachmentItem`을 찾은 뒤 Signed URL을 생성하여 원래 로컬 경로를 교체하도록 했다.

로그 상세화면도 함께 개선했다. 이전에는 본문의 일부가 일반 텍스트로 출력되고 있었기 때문에 제목이나 굵은 글씨 같은 Markdown 문법이 그대로 보이는 문제가 있었다. `LogContentRenderer`의 텍스트 부분에도 Markdown 렌더링을 적용하여 상세화면과 전용 Markdown Viewer의 표시 방식을 더 가깝게 만들었다. 또한 Markdown과 PDF 중 어떤 Viewer를 사용할지 여러 컴포넌트가 각자 판단하지 않도록 `getAttachmentViewerPath()`를 만들면서 첨부파일 Viewer 경로 결정도 공통 구조로 정리하기 시작했다.

PDF 역시 Shiori 내부에서 볼 수 있도록 `react-pdf` 기반의 전용 Viewer를 구성했다. Supabase Storage의 Signed URL을 사용해 PDF를 가져오고 각 페이지를 렌더링하며, Viewer 주변에는 Shiori의 배경, 테두리, 툴바, 뒤로가기와 페이지 수 같은 UI를 적용했다. PDF 페이지 자체의 표시 크기는 화면 폭에 맞게 조정할 수 있었지만 기존 PDF 내부의 글과 이미지 위치는 생성 시점에 고정되어 있기 때문에 Markdown처럼 화면 크기에 따라 내용 자체를 다시 배치할 수는 없다는 점도 확인했다. 이 부분은 PDF 형식의 특성으로 받아들이고 기존 PDF는 원본 레이아웃을 유지하여 보여주는 용도로 사용하기로 했다.

결과적으로 처음 계획했던 Markdown 읽기 기능보다 훨씬 넓은 범위를 수정하게 되었지만, 앞으로 필요한 기반도 함께 만들어졌다. Markdown Viewer, 이미지 경로 해결, 테마 적용, PDF Viewer, 첨부파일 Viewer 라우팅을 한 번에 정리할 수 있었고, 이후에는 이 구조를 기반으로 기능을 단계적으로 확장할 수 있다. 지금은 기능을 계속 추가하기보다 여기까지를 하나의 안정적인 작업 단위로 마무리하는 것이 적절하다. 추후 필요할 때 PDF 확대·축소, 브라우저에서 열기, 다운로드, 이미지 전용 Viewer 같은 기능을 추가하면 Shiori의 첨부파일 시스템을 자연스럽게 발전시킬 수 있다.

> **팁**
> 이번 작업의 핵심은 Markdown과 PDF를 완전히 같은 방식으로 만드는 것이 아니라, 각 파일 형식의 특성은 유지하면서 Shiori의 공통 첨부파일 관리와 Viewer 체계 안으로 통합한 것이다.
