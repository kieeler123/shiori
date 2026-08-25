# シオリ Markdown インポート・内部リンク対応 作業記録

## 2. 質問・回答形式

### Q1. Markdown をインポートしたのに、なぜリンク先を開けなかったのか？

A. Markdown の相対リンクをブラウザが通常の URL
として解釈していたため。React Router に存在しないパスへ移動し、最終的に
catch-all ルートによってメインページへ戻されていた。

### Q2. `source_filename` はなぜ追加したのか？

A. インポート元 Markdown のファイル名を DB に保存し、Markdown 内の `.md`
リンクから対応する別ログを検索できるようにするため。

### Q3. それなら `source_filename` だけで十分ではないのか？

A. 十分ではない。同一ログに `GENERAL.md`, `JLPT.md`, `JLPT-ANSWER.md`
が添付されている場合、それらは別ログではなく添付ファイルである。そのため
`attachment.name` から検索する処理も必要だった。

### Q4. 詳細ページで `Markdown target not found` が出た理由は？

A. 詳細ページの `LogContentRenderer` が `.md` リンクを最初から
`dbFindBySourceFilename()`
で検索していたため。実際の対象は同一ログの添付ファイルだったので見つからなかった。

### Q5. どのように解決したのか？

A. 詳細ページでは現在ログの `attachments`
を最初に検索し、見つかった場合は
`/logs/:logId/attachments/:attachmentId/markdown`
へ移動するようにした。見つからない場合だけ `source_filename`
検索へフォールバックする。

### Q6. `MarkdownViewerPage` では何が違うのか？

A. Viewer 内の `.md` リンクは基本的に同一ログの添付 Markdown
間のリンクとして扱う。リンクのファイル名と `attachment.name`
を比較し、対象の `attachment.id` を取得して Viewer のルートへ移動する。

### Q7. `#anchor` はどう処理したのか？

A. `.md#anchor` をファイル部分とアンカー部分に分離し、対象 Markdown
を開いた後で `document.getElementById()` と `scrollIntoView()`
を使って見出し位置へ移動するようにした。

### Q8. `rehype-slug` は何のために必要だったのか？

A. Markdown の見出しに安定した `id` を生成し、`#anchor` が実際の DOM
要素を参照できるようにするため。

### Q9. 画像処理はどうしたのか？

A. Markdown と HTML
の画像ソースからローカルパスを検出し、同一ログの添付ファイルを検索した。対象ファイルには
Supabase Storage の Signed URL を生成し、Markdown
内のパスを置換する既存方式を維持した。

### Q10. 最終的なリンク解決の優先順位は？

A. 詳細ページでは「現在ログの添付ファイル → `source_filename`
を持つ別ログ」の順。Markdown Viewer
では「現在ログの添付ファイル」を基本とする。この分離によって両方の利用方法を共存させた。

### ヒント

リンク問題をデバッグするときは、`href`、解決したファイル名、
`attachment.id`、最終的な `navigate()` のパスをまとめてコンソールに出力すると、
どの段階で問題が発生したのかを素早く確認できる。

---

## 2. Question-and-Answer Format

### Q1. Why did Markdown links fail after import?

A. Relative Markdown links were being interpreted as normal
browser-relative URLs. The browser navigated to a route that React
Router did not recognize, so the catch-all route eventually redirected
the application to the main page.

### Q2. Why was `source_filename` added?

A. It preserves the original imported Markdown filename in the database,
allowing a `.md` link to resolve to another Shiori log that originated
from that file.

### Q3. Why wasn't `source_filename` enough?

A. `GENERAL.md`, `JLPT.md`, and `JLPT-ANSWER.md` can belong to one log
as separate attachments. In that case they are not separate logs, so
they must be resolved through `attachment.name`.

### Q4. Why did the detail page report `Markdown target not found`?

A. `LogContentRenderer` was immediately calling
`dbFindBySourceFilename()` for the `.md` link. The target was actually
an attachment of the current log, so no corresponding source-filename
log existed.

### Q5. How was that fixed?

A. The detail renderer now searches the current log's attachments first.
When a matching Markdown attachment exists, it navigates to
`/logs/:logId/attachments/:attachmentId/markdown`. Only if no attachment
matches does it fall back to the source-filename resolver.

### Q6. What does `MarkdownViewerPage` do differently?

A. It treats local `.md` links primarily as links between Markdown
attachments in the same log. It compares the filename in the link with
`attachment.name`, gets the target attachment ID, and navigates through
the Markdown viewer route.

### Q7. How are `#anchor` links handled?

A. `.md#anchor` is split into a file path and an anchor. After the
target Markdown is rendered, the viewer uses `document.getElementById()`
and `scrollIntoView()` to move to the intended heading.

### Q8. Why is `rehype-slug` required?

A. It generates IDs for Markdown headings, giving anchor links stable
DOM targets.

### Q9. How are local images handled?

A. Local image paths in Markdown and HTML are matched against
attachments. A Supabase Storage Signed URL is generated for the matching
attachment, and the original path is replaced before rendering.

### Q10. What is the final link-resolution priority?

A. On the detail page: current-log attachment first, then another log
identified by `source_filename`. Inside the Markdown viewer: current-log
Markdown attachments are the primary target.

### Tip

When debugging link resolution, log the original `href`, normalized
filename, matched attachment ID, and final `navigate()` path together.
This quickly reveals which resolution stage failed.

## 2. 질문·답변 형식

### Q1. Markdown을 가져왔는데 링크가 정상적으로 열리지 않았던 이유는?

A. 상대 `.md` 링크를 브라우저가 일반 상대 URL로 해석했기 때문이다.
존재하지 않는 React Router 경로로 이동한 뒤 catch-all 라우트에 걸려
메인페이지로 돌아가는 현상이 발생했다.

### Q2. `source_filename`은 왜 추가했나?

A. 가져온 Markdown의 원본 파일명을 DB에 보존하고, 문서 안의 `.md` 링크를
통해 같은 파일명에서 만들어진 다른 시오리 로그를 찾기 위해 추가했다.

### Q3. 그렇다면 `source_filename`만 사용하면 되지 않나?

A. 아니다. `GENERAL.md`, `JLPT.md`, `JLPT-ANSWER.md`가 하나의 로그에
첨부된 구조에서는 각각 별도의 로그가 아니다. 따라서 이 경우에는
`attachment.name`으로 찾아야 한다.

### Q4. 상세페이지에서 `Markdown target not found`가 발생한 이유는?

A. `LogContentRenderer`가 `.md` 링크를 클릭하자마자
`dbFindBySourceFilename()`으로 다른 로그를 찾고 있었기 때문이다. 실제
대상은 현재 로그의 첨부파일이어서 source filename 검색으로는 찾을 수
없었다.

### Q5. 이 문제는 어떻게 해결했나?

A. 상세페이지에서는 먼저 현재 로그의 `attachments`에서 동일한 파일명을
찾도록 했다. 찾으면
`/logs/:logId/attachments/:attachmentId/markdown`으로 이동하고, 없을
때만 `source_filename` 기반 로그 검색을 수행하도록 했다.

### Q6. `MarkdownViewerPage`의 역할은 무엇인가?

A. 같은 로그 안의 Markdown 첨부파일끼리 이동하는 역할이다. 상대 링크의
파일명과 `attachment.name`을 비교하고 대상 `attachment.id`를 얻어
Markdown Viewer 경로로 이동한다.

### Q7. `.md#anchor` 링크는 어떻게 처리했나?

A. 링크를 Markdown 파일 경로와 anchor로 분리한다. 대상 파일을 렌더링한
뒤 `document.getElementById()`와 `scrollIntoView()`를 이용해 원하는
heading으로 이동한다.

### Q8. `rehype-slug`는 왜 필요한가?

A. Markdown heading에 DOM `id`를 자동으로 만들어 `#anchor`가 실제
heading 요소를 가리킬 수 있도록 하기 위해 사용했다.

### Q9. Markdown의 상대 이미지 경로는 어떻게 처리했나?

A. Markdown 및 HTML 이미지 경로에서 로컬 파일을 찾고 현재 로그의
첨부파일과 연결했다. 이후 Supabase Storage Signed URL을 생성해 원래
경로를 치환하는 방식을 유지했다.

### Q10. 최종 링크 검색 우선순위는 어떻게 되었나?

A. 상세페이지에서는 현재 로그의 첨부파일을 먼저 검색하고, 없으면
`source_filename`으로 다른 로그를 검색한다. Markdown Viewer에서는 현재
로그의 Markdown 첨부파일 검색을 기본으로 한다.

### 팁

링크 문제를 디버깅할 때는 원본 `href`, 정규화한 파일명, 검색된
`attachment.id`, 최종 `navigate()` 경로를 한 번에 콘솔에 출력하면 어느
단계에서 실패했는지 빠르게 확인할 수 있다.
