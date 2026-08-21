# Shiori Debugging Log — Markdown / PDF Attachment Viewer

# 日本語

## Markdown / PDF 添付ファイルを開くとメイン画面へ戻る・画像が表示されない問題

### 問題

- Markdown添付ファイルを開くと `/api/attachments/view?...` に移動した後、Shioriのメイン画面 `/` に戻る問題が発生した。
- Markdown Viewerを作成した後も、Markdown内のローカル画像が壊れた画像として表示された。
- 詳細画面と編集画面で添付ファイルを開く処理が異なり、同じMarkdownやPDFでも動作が一致しなかった。
- PDFはShiori内部で開けるようになったが、PDFページの表示幅が小さく、Viewer内の余白が大きく見える問題も発生した。
- TypeScriptの明確なランタイムエラーではなく、ルーティング・Storage・レンダリング処理が組み合わさった動作上の問題だった。

> **ポイント**
> エラーメッセージが出ない問題では、画面に表示された結果だけを見るのではなく「どのURLへ移動したか」「どのデータを取得したか」「どのRendererを通ったか」を分けて確認する必要がある。

### 状況

- Shioriに `.md`, `.pdf`, `.png` などのファイルを添付し、アプリ内部で閲覧できる機能を実装していた。
- Markdownはデスクトップではブラウザである程度表示できたが、モバイルでは同じデザインが適用されなかった。
- Markdown内には次のようなローカル相対パスが含まれていた。

```html
<img src="../20260820_225156.png" alt="scene1" width="49%">
```

- 期待していた動作は、MarkdownとPDFをShiori内部の専用Viewerで開き、Markdown内の画像も同じログに添付された画像ファイルから取得して表示することだった。
- また、編集画面と詳細画面のどちらから開いても同じViewerを利用することを期待していた。

> **ポイント**
> ローカルMarkdownの `../image.png` とWebアプリ上の `../image.png` は同じ文字列でも意味が異なる。Web側では現在のURLを基準に相対パスとして解釈される。

### 調査

#### 確認① — Markdownを開いた時のURLを確認

```ts
window.open(
  `/api/attachments/view?url=${encodeURIComponent(item.publicUrl)}`,
  "_blank",
);
```

- Markdownを開くと一度 `/api/attachments/view?...` に移動した後、最終的に `/` に戻っていた。
- `App.tsx` には未定義ルートを `/` に戻す処理が存在していた。

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

- Viteの開発環境では `/api/attachments/view` が期待したServerless APIとして処理されず、SPA側に渡っている可能性が高いと判断した。

> **ポイント**
> URLが一度目的のパスへ移動してから `/` に戻る場合、処理関数より先にRouterのfallback設定を確認すると原因を絞り込みやすい。

#### 確認② — Markdown内部の画像パスを確認

```html
<img src="../20260820_225156.png" alt="scene1">
```

- `ReactMarkdown` と `rehype-raw` によって `<img>` タグ自体はレンダリングされていた。
- しかし画像には壊れた画像アイコンと `alt` テキストだけが表示された。
- これはHTMLレンダリングの問題ではなく、`src` に指定された相対パスがWeb上で存在しないURLへ解決されていることを意味していた。

> **ポイント**
> 壊れた画像アイコンと `alt` テキストが表示される場合、HTMLタグ自体は正常に作られている可能性が高く、次に確認すべきは `src` のHTTPレスポンスである。

#### 確認③ — 添付ファイルの保存構造を確認

```ts
.insert({
  user_id: user.id,
  title: v.title,
  content: v.content,
  tags: v.tags,
  table_data: input.table_data ?? null,
  attachments: input.attachments ?? [],
  links: input.links ?? [],
})
```

- 添付ファイルは別の `attachments` テーブルではなく、ログRowの `attachments` JSON配列として保存されていた。
- そのためViewerでは `attachmentId` だけではなく、`logId` からログを取得して `attachments` 内を検索する必要があることが分かった。

```ts
const attachment =
  log.attachments?.find(
    (item) => item.id === attachmentId,
  ) ?? null;
```

> **ポイント**
> Viewer URLの設計はDB構造に合わせる必要がある。添付ファイルがログ内部のJSONとして保存される場合、`logId + attachmentId` の組み合わせが自然である。

#### 確認④ — 詳細画面と編集画面の処理差を確認

```ts
const isMarkdown = ...
const isPdf = ...
```

- `LogContentRenderer` と `AttachmentEditor` の両方でファイル形式の判定とViewerの開き方を個別に実装していた。
- そのため詳細画面では新Viewerへ移動する一方、編集画面では古い `/api/attachments/view` を利用する状態が残っていた。
- 同じ添付ファイルでも画面によって動作が異なる原因になっていた。

> **ポイント**
> ファイル形式判定やViewerルートの生成はUIコンポーネントごとに持たせず、共通関数へ集約した方が不整合を防ぎやすい。

### 原因

```text
問題1:
Markdownを /api/attachments/view で開く
↓
ローカルVite環境でAPIとして処理されない
↓
SPA Routerへ渡る
↓
未定義ルート
↓
* Route
↓
/
```

```text
問題2:
Markdown内
../image.png
↓
Webブラウザが現在URL基準で解決
↓
対象ファイルがWebルートに存在しない
↓
画像404 / broken image
```

```text
問題3:
AttachmentEditorとLogContentRendererが
それぞれ別のファイルOpen処理を持つ
↓
編集画面と詳細画面で挙動が異なる
```

- 主な原因は単一のコードミスではなく、APIルート、React Router、Storage上の添付ファイル、Markdownのローカルパス、複数のOpen処理が分散していたことだった。

> **ポイント**
> 複数の原因が重なったエラーでは、最初からすべてを修正しようとせず「ルーティング」「データ」「レンダリング」のように層を分けて確認すると理解しやすい。

### 修正

#### Markdown Viewerを追加

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/markdown"
  element={<MarkdownViewerPage />}
/>
```

- Markdownをブラウザへ直接渡すのではなく、Shiori内部の専用Viewerで表示するように変更した。

#### PDF Viewerも同じルート構造へ統一

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/pdf"
  element={<PdfViewerPage />}
/>
```

- PDFも `logId + attachmentId` を利用して対象ファイルを取得する方式へ変更した。

#### Viewerルート判定を共通化

```ts
export function getAttachmentViewerPath(
  item: AttachmentItem,
  logId?: string,
) {
  if (!logId) return null;

  const fileName = item.name.toLowerCase();

  const isMarkdown =
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    item.mimeType.startsWith("text/markdown");

  const isPdf =
    fileName.endsWith(".pdf") ||
    item.mimeType === "application/pdf";

  if (isMarkdown) {
    return `/logs/${logId}/attachments/${item.id}/markdown`;
  }

  if (isPdf) {
    return `/logs/${logId}/attachments/${item.id}/pdf`;
  }

  return null;
}
```

- 詳細画面と編集画面で同じViewer判定を利用できるようにした。

#### Markdown画像を添付ファイルへ解決

```ts
const attachment =
  findAttachmentBySourcePath(
    sourcePath,
    log.attachments ?? [],
  );

const signedUrl =
  await createAttachmentUrl(attachment);

resolvedMarkdown =
  resolvedMarkdown
    .split(sourcePath)
    .join(signedUrl);
```

- Markdown内の `../image.png` からファイル名を取得し、同じログの添付画像を検索してSigned URLへ変換した。

#### PDF表示幅を改善

```ts
const availableWidth =
  el.clientWidth - PAGE_SIDE_GAP;

setPageWidth(
  Math.max(320, availableWidth),
);
```

- `ResizeObserver` でViewerの横幅を測定し、`react-pdf` のページ幅を画面サイズへ合わせるようにした。
- PDF内部のレイアウト自体は固定されているため、Viewerではページ全体の拡大・縮小のみを担当する方針にした。

> **ポイント**
> 修正後は「MarkdownはMarkdownViewer」「PDFはPdfViewer」「Viewerルート判定は共通関数」という責任分担が明確になった。

### 学んだこと

- ブラウザで扱う相対パスとローカルファイルシステムの相対パスは同じではない。
- React RouterのfallbackはAPIルートの失敗をメイン画面への遷移として見せる場合がある。
- エラーメッセージがない場合でもURL、Network、DBデータ、Rendererを順番に確認すると原因を特定できる。
- 添付ファイルの表示方法は画面ごとに実装せず、Viewerルート判定を共通化した方が安全である。
- MarkdownはHTML/CSSとして再配置できるが、既存PDF内部のレイアウトはViewerから変更できない。
- Viewerの役割とファイルの内容を生成する処理の役割は分けて考える必要がある。

> **ポイント**
> 今回のデバッグでは「そのコードが正しいか」だけでなく、「そのコードまで本当に処理が到達しているか」を確認することが特に重要だった。

### 一行まとめ

- Markdown/PDF添付を開くとルーティング・画像パス・Viewer処理が不一致だった → 専用Viewerと添付ファイル解決処理が分散していた → `logId + attachmentId` ベースのViewerと共通ルート判定へ統一して解決した。

---

# English

## Markdown / PDF attachments returned to the main page or failed to display images

### Problem

- Opening a Markdown attachment navigated to `/api/attachments/view?...` and then returned to the Shiori main page `/`.
- Even after creating a Markdown Viewer, local images inside Markdown were still rendered as broken images.
- Attachment opening behavior differed between the detail page and the edit page, so the same Markdown or PDF file behaved differently depending on where it was opened.
- PDFs could be opened inside Shiori, but rendered pages initially appeared too small compared with the available viewer width.
- There was no single runtime exception explaining the entire problem; routing, Storage, and rendering behavior were interacting with each other.

> **Tip**
> When no clear error message exists, separate the problem into navigation, data retrieval, and rendering instead of judging only from what appears on screen.

### Situation

- The attachment system was being extended so `.md`, `.pdf`, `.png`, and related files could be viewed inside Shiori.
- Markdown was somewhat readable through desktop browsers, but mobile browsers did not apply the same presentation.
- Markdown documents contained local relative paths such as:

```html
<img src="../20260820_225156.png" alt="scene1" width="49%">
```

- The expected behavior was for Markdown and PDF files to open through dedicated Shiori viewers, while Markdown images would be resolved from image attachments stored with the same log.
- The edit page and detail page were also expected to use the same viewer behavior.

> **Tip**
> A local path such as `../image.png` and a browser URL path with the same text are not equivalent. In a web application, the path is resolved relative to the current URL.

### Investigation

#### Check #1 — Inspect the URL used when opening Markdown

```ts
window.open(
  `/api/attachments/view?url=${encodeURIComponent(item.publicUrl)}`,
  "_blank",
);
```

- Opening Markdown first navigated to `/api/attachments/view?...` and then ended at `/`.
- `App.tsx` contained a fallback route that redirected undefined paths to the main page.

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

- The likely cause was that the local Vite environment was not processing `/api/attachments/view` as the expected serverless API route and instead passed the request into the SPA router.

> **Tip**
> When a URL briefly reaches the expected route and then returns to `/`, inspect the router fallback before assuming the attachment handler itself failed.

#### Check #2 — Inspect image paths inside the Markdown

```html
<img src="../20260820_225156.png" alt="scene1">
```

- `ReactMarkdown` with `rehype-raw` successfully created the `<img>` element.
- However, only a broken image icon and the `alt` text were displayed.
- This indicated that HTML rendering itself was working, while the `src` was resolving to a URL that did not exist in the web application.

> **Tip**
> If a broken image icon and alt text appear, the tag usually exists correctly. The next check should be the actual network request made for the image source.

#### Check #3 — Inspect the attachment storage model

```ts
.insert({
  user_id: user.id,
  title: v.title,
  content: v.content,
  tags: v.tags,
  table_data: input.table_data ?? null,
  attachments: input.attachments ?? [],
  links: input.links ?? [],
})
```

- Attachments were stored as a JSON array on the log row rather than in a separate attachments table.
- The viewer therefore needed to load the log using `logId` and then find the specific attachment inside `attachments`.

```ts
const attachment =
  log.attachments?.find(
    (item) => item.id === attachmentId,
  ) ?? null;
```

> **Tip**
> Viewer route design should reflect the database model. When attachments belong to a log JSON field, `logId + attachmentId` is a natural lookup key.

#### Check #4 — Compare detail and edit page opening logic

```ts
const isMarkdown = ...
const isPdf = ...
```

- Both `LogContentRenderer` and `AttachmentEditor` contained their own file-type checks and open behavior.
- The detail page had already moved to the new viewer routes, while the edit page still contained the older `/api/attachments/view` logic.
- This explained why the same attachment behaved differently depending on the screen.

> **Tip**
> File-type detection and viewer route generation should be centralized rather than repeated inside multiple UI components.

### Cause

```text
Issue 1:
Open Markdown through /api/attachments/view
↓
Local Vite environment does not process it as expected API
↓
Request reaches SPA router
↓
Unknown route
↓
* fallback route
↓
/
```

```text
Issue 2:
Markdown contains
../image.png
↓
Browser resolves it relative to current web URL
↓
No matching web resource exists
↓
404 / broken image
```

```text
Issue 3:
AttachmentEditor and LogContentRenderer
use separate file-opening logic
↓
Edit and detail pages behave differently
```

- The root cause was not one isolated syntax error. It was a combination of API routing, React Router fallback behavior, Storage attachment lookup, local Markdown paths, and duplicated viewer-opening logic.

> **Tip**
> For multi-layer bugs, separate routing, data, and rendering concerns before changing code. This makes it easier to identify which layer actually fails.

### Fix

#### Add a dedicated Markdown Viewer route

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/markdown"
  element={<MarkdownViewerPage />}
/>
```

- Markdown files are now rendered inside Shiori instead of being passed directly to the browser.

#### Use the same route model for PDFs

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/pdf"
  element={<PdfViewerPage />}
/>
```

- PDF files also use `logId + attachmentId` to locate the attachment.

#### Centralize viewer route selection

```ts
export function getAttachmentViewerPath(
  item: AttachmentItem,
  logId?: string,
) {
  if (!logId) return null;

  const fileName = item.name.toLowerCase();

  const isMarkdown =
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    item.mimeType.startsWith("text/markdown");

  const isPdf =
    fileName.endsWith(".pdf") ||
    item.mimeType === "application/pdf";

  if (isMarkdown) {
    return `/logs/${logId}/attachments/${item.id}/markdown`;
  }

  if (isPdf) {
    return `/logs/${logId}/attachments/${item.id}/pdf`;
  }

  return null;
}
```

- Both detail and edit screens can now use the same viewer-path decision.

#### Resolve Markdown images through attachments

```ts
const attachment =
  findAttachmentBySourcePath(
    sourcePath,
    log.attachments ?? [],
  );

const signedUrl =
  await createAttachmentUrl(attachment);

resolvedMarkdown =
  resolvedMarkdown
    .split(sourcePath)
    .join(signedUrl);
```

- Relative image paths such as `../image.png` are matched against image attachments belonging to the same log and replaced with Signed URLs.

#### Improve PDF page sizing

```ts
const availableWidth =
  el.clientWidth - PAGE_SIDE_GAP;

setPageWidth(
  Math.max(320, availableWidth),
);
```

- `ResizeObserver` measures the viewer width and passes an appropriate width to `react-pdf`.
- The internal layout of an existing PDF remains fixed, so the viewer only controls page scaling rather than document reflow.

> **Tip**
> After the fix, responsibilities became clearer: Markdown uses MarkdownViewer, PDF uses PdfViewer, and viewer route selection is handled by a shared function.

### Lessons Learned

- Browser-relative paths are not the same as local filesystem-relative paths.
- A React Router fallback can make a failed API path look like a redirect to the home page.
- Even without a visible exception, checking the URL, network requests, database data, and renderer in order can reveal the failure point.
- Attachment viewer behavior should be centralized instead of being duplicated across screens.
- Markdown can reflow through HTML and CSS, while an existing PDF retains its fixed internal layout.
- Viewing an existing document and generating a new document are separate responsibilities.

> **Tip**
> A key debugging question was not only whether the handler code was correct, but whether the request ever reached that code at all.

### One-line Summary

- Markdown/PDF attachments had inconsistent routing and broken local image references → attachment viewing logic and asset resolution were distributed across multiple paths → dedicated `logId + attachmentId` viewers and shared viewer routing resolved the problem.

---

# 한국어

## Markdown / PDF 첨부파일을 열면 메인화면으로 돌아가거나 이미지가 깨지는 문제

### 문제

- Markdown 첨부파일을 열면 `/api/attachments/view?...` 경로로 이동한 뒤 Shiori 메인화면 `/`로 돌아가는 문제가 발생했다.
- Markdown 전용 Viewer를 만든 이후에도 Markdown 내부 로컬 이미지가 깨진 이미지로 표시되었다.
- 상세화면과 편집화면의 첨부파일 열기 방식이 서로 달라 동일한 Markdown이나 PDF 파일도 화면에 따라 다르게 동작했다.
- PDF는 Shiori 내부에서 열 수 있게 되었지만 처음에는 사용 가능한 Viewer 폭에 비해 PDF 페이지가 너무 작게 렌더링되는 문제도 있었다.
- 하나의 명확한 런타임 에러가 발생한 것이 아니라 라우팅, Storage, 렌더링 구조가 서로 겹치면서 발생한 동작 문제였다.

> **팁**
> 명확한 에러 메시지가 없는 문제는 화면 결과만 보지 말고 URL 이동, 데이터 조회, Renderer 실행을 각각 분리해서 확인하는 것이 좋다.

### 상황

- Shiori에서 `.md`, `.pdf`, `.png` 등의 첨부파일을 애플리케이션 내부에서 읽을 수 있도록 기능을 구현하고 있었다.
- Markdown은 데스크톱 브라우저에서는 어느 정도 열렸지만 모바일에서는 같은 디자인이 적용되지 않았다.
- Markdown 내부에는 다음과 같은 로컬 상대경로가 포함되어 있었다.

```html
<img src="../20260820_225156.png" alt="scene1" width="49%">
```

- 기대한 동작은 Markdown과 PDF가 Shiori 전용 Viewer에서 열리고, Markdown 안의 이미지도 같은 로그에 첨부된 이미지 파일을 찾아 표시하는 것이었다.
- 또한 편집화면과 상세화면 어느 곳에서 열더라도 동일한 Viewer 동작을 사용하는 것을 기대했다.

> **팁**
> 로컬 Markdown의 `../image.png`와 웹 애플리케이션의 `../image.png`는 같은 문자열이어도 의미가 다르다. 웹에서는 현재 URL을 기준으로 상대경로가 해석된다.

### 디버깅 순서

1. Markdown을 열었을 때 실제 URL 이동 경로 확인
2. React Router fallback 동작 확인
3. Markdown 내부 이미지의 실제 `src` 확인
4. 로그에 저장된 `attachments` 데이터 구조 확인
5. 상세화면과 편집화면의 첨부파일 열기 코드 비교
6. Viewer 전용 라우트와 Signed URL 생성 과정 확인
7. 공통 Viewer 경로 함수로 중복 로직 제거
8. 수정 후 Markdown / PDF / 이미지 각각 재검증

> **팁**
> 여러 계층이 관련된 문제는 라우팅 → 데이터 → 렌더링 순서로 좁혀가면 같은 코드를 반복해서 수정하는 일을 줄일 수 있다.

### 조사 과정

#### 확인 ① — Markdown을 열 때 실제 URL 확인

```ts
window.open(
  `/api/attachments/view?url=${encodeURIComponent(item.publicUrl)}`,
  "_blank",
);
```

- Markdown을 열면 먼저 `/api/attachments/view?...`로 이동했지만 최종적으로 `/`가 표시되었다.
- `App.tsx`에는 정의되지 않은 모든 경로를 메인화면으로 보내는 fallback Route가 존재했다.

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

- 로컬 Vite 환경에서 `/api/attachments/view`가 의도한 Serverless API로 실행되지 않고 SPA Router로 넘어가는 것으로 판단했다.

> **팁**
> 원하는 경로가 잠깐 보였다가 `/`로 돌아간다면 함수 내부 오류보다 먼저 Router의 fallback 설정을 확인하는 것이 빠르다.

#### 확인 ② — Markdown 내부 이미지 경로 확인

```html
<img src="../20260820_225156.png" alt="scene1">
```

- `ReactMarkdown`과 `rehype-raw`를 통해 `<img>` 태그 자체는 정상적으로 생성되었다.
- 하지만 이미지 대신 깨진 이미지 아이콘과 `alt` 텍스트가 표시되었다.
- 따라서 HTML 렌더링 문제가 아니라 `src`가 웹에서 존재하지 않는 경로로 해석되고 있다는 것을 확인했다.

> **팁**
> 깨진 이미지 아이콘과 alt 텍스트가 보인다면 `<img>` 생성은 성공했을 가능성이 높다. 다음에는 Network에서 해당 `src` 요청의 상태코드를 확인하면 된다.

#### 확인 ③ — 첨부파일 저장 구조 확인

```ts
.insert({
  user_id: user.id,
  title: v.title,
  content: v.content,
  tags: v.tags,
  table_data: input.table_data ?? null,
  attachments: input.attachments ?? [],
  links: input.links ?? [],
})
```

- 첨부파일은 별도의 `attachments` 테이블이 아니라 로그 Row의 `attachments` JSON 배열에 저장되고 있었다.
- 따라서 Viewer에서는 `attachmentId`만 조회할 수 없고 `logId`로 로그를 가져온 뒤 배열 내부에서 해당 첨부파일을 찾아야 했다.

```ts
const attachment =
  log.attachments?.find(
    (item) => item.id === attachmentId,
  ) ?? null;
```

> **팁**
> Viewer URL 구조는 실제 DB 저장 모델에 맞추는 것이 좋다. 로그 내부 JSON 배열에 첨부파일이 들어간다면 `logId + attachmentId` 구조가 자연스럽다.

#### 확인 ④ — 상세화면과 편집화면 코드 비교

```ts
const isMarkdown = ...
const isPdf = ...
```

- `LogContentRenderer`와 `AttachmentEditor`에서 각각 파일 형식을 판단하고 파일을 여는 코드를 가지고 있었다.
- 상세화면은 새 Viewer 경로를 사용하도록 수정되었지만 편집화면에는 기존 `/api/attachments/view` 코드가 남아 있었다.
- 이 때문에 동일한 첨부파일도 상세화면과 편집화면에서 서로 다른 동작을 보였다.

> **팁**
> 파일 형식 판별과 Viewer URL 생성을 여러 컴포넌트에 복사하면 한쪽만 수정되는 문제가 쉽게 생긴다. 공통 함수로 빼는 것이 안전하다.

### 원인

```text
문제 1:
Markdown을 /api/attachments/view로 열기
↓
로컬 Vite에서 API로 정상 처리되지 않음
↓
SPA Router로 전달
↓
정의되지 않은 Route
↓
* fallback
↓
/
```

```text
문제 2:
Markdown 내부
../image.png
↓
브라우저가 현재 웹 URL 기준으로 경로 해석
↓
실제 웹 리소스가 존재하지 않음
↓
404 / 깨진 이미지
```

```text
문제 3:
AttachmentEditor와 LogContentRenderer가
각자 다른 파일 열기 로직을 보유
↓
편집화면과 상세화면 동작 불일치
```

- 원인은 단일 문법 오류가 아니라 API 경로, React Router fallback, Storage 첨부파일 구조, Markdown 로컬 경로, 중복된 Viewer 열기 로직이 함께 얽혀 있었던 것이었다.

> **팁**
> 원인이 여러 개인 에러에서는 모든 코드를 한 번에 바꾸기보다 라우팅, 데이터, 렌더링 계층을 분리해서 확인하는 것이 좋다.

### 해결

#### Markdown 전용 Viewer Route 추가

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/markdown"
  element={<MarkdownViewerPage />}
/>
```

- Markdown 파일을 브라우저에 직접 전달하지 않고 Shiori 내부 전용 Viewer에서 렌더링하도록 변경했다.

#### PDF도 같은 Route 구조로 통일

```tsx
<Route
  path="/logs/:logId/attachments/:attachmentId/pdf"
  element={<PdfViewerPage />}
/>
```

- PDF도 `logId + attachmentId`를 이용해 해당 첨부파일을 찾도록 변경했다.

#### Viewer 경로 판별 공통화

```ts
export function getAttachmentViewerPath(
  item: AttachmentItem,
  logId?: string,
) {
  if (!logId) return null;

  const fileName = item.name.toLowerCase();

  const isMarkdown =
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    item.mimeType.startsWith("text/markdown");

  const isPdf =
    fileName.endsWith(".pdf") ||
    item.mimeType === "application/pdf";

  if (isMarkdown) {
    return `/logs/${logId}/attachments/${item.id}/markdown`;
  }

  if (isPdf) {
    return `/logs/${logId}/attachments/${item.id}/pdf`;
  }

  return null;
}
```

- 상세화면과 편집화면이 동일한 Viewer 경로 판별을 사용할 수 있게 했다.

#### Markdown 이미지 경로를 첨부파일로 해결

```ts
const attachment =
  findAttachmentBySourcePath(
    sourcePath,
    log.attachments ?? [],
  );

const signedUrl =
  await createAttachmentUrl(attachment);

resolvedMarkdown =
  resolvedMarkdown
    .split(sourcePath)
    .join(signedUrl);
```

- Markdown의 `../image.png`에서 파일명을 추출하고 같은 로그에 저장된 이미지 첨부파일을 찾아 Signed URL로 교체했다.

#### PDF 페이지 표시 폭 개선

```ts
const availableWidth =
  el.clientWidth - PAGE_SIDE_GAP;

setPageWidth(
  Math.max(320, availableWidth),
);
```

- `ResizeObserver`로 실제 Viewer 폭을 확인하고 `react-pdf`의 페이지 크기를 화면에 맞도록 조정했다.
- 기존 PDF 내부 레이아웃은 이미 고정되어 있으므로 Viewer에서는 문서 재배치가 아니라 페이지 전체 크기 조절만 담당하도록 정리했다.

> **팁**
> 수정 후에는 Markdown은 MarkdownViewer, PDF는 PdfViewer, Viewer 경로 판별은 공통 함수라는 역할 분리가 명확해졌다.

### 배운 점

- 브라우저의 상대경로와 로컬 파일시스템의 상대경로는 동일하지 않다.
- React Router fallback 때문에 API 경로 실패가 메인화면 이동처럼 보일 수 있다.
- 에러 메시지가 없어도 URL, Network, DB 데이터, Renderer를 순서대로 확인하면 문제 지점을 찾을 수 있다.
- 첨부파일 Viewer 동작은 화면마다 따로 구현하지 말고 공통화하는 것이 안전하다.
- Markdown은 HTML/CSS 기반으로 재배치할 수 있지만 기존 PDF의 내부 레이아웃은 Viewer가 변경할 수 없다.
- 기존 파일을 보는 Viewer와 새 파일을 생성하는 기능은 서로 다른 책임으로 나누어 생각해야 한다.

> **팁**
> 이번 디버깅에서 가장 중요한 확인 중 하나는 코드가 맞는지를 보는 것뿐 아니라 실제 요청이 그 코드까지 도달했는지를 확인하는 것이었다.

### 한 줄 요약

- Markdown/PDF 첨부파일의 라우팅과 이미지 경로, Viewer 동작이 서로 달랐다 → API fallback과 로컬 상대경로, 중복 Open 로직이 원인이었다 → `logId + attachmentId` 기반 전용 Viewer와 공통 Viewer 경로 처리로 통일해 해결했다.
