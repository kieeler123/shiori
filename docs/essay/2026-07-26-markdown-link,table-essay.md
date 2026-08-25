## 3. エッセイ形式

今日の作業の中心は、シオリに取り込んだ Markdown
を単に「表示できる文章」ではなく、元の文書構造を保ったまま移動できるコンテンツとして扱うことだった。最初は
Markdown
の表、画像、リンクを詳細ページで正しく読めるようにすることから始まった。しかし実装を進めると、Markdown
のリンクには二つの異なる意味があることが分かった。

一つ目は、Markdown
をシオリの本文としてインポートした場合である。この場合、元ファイル名を
`source_filename` として保存しておけば、文書内の `.md`
リンクから対応する別のシオリログを検索できる。そのため `dbCreate`,
`dbUpdate`, 詳細取得用 SELECT、DB View に `source_filename`
を通す構造を追加し、`dbFindBySourceFilename()` でファイル名からログ ID
を解決できるようにした。

二つ目は、一つのログに複数の Markdown が添付されている場合である。今回の
`GENERAL`, `JLPT`, `JLPT-ANSWER`
の関係はこちらに該当した。これらは三つの別ログではなく、同一ログに属する三つの添付ファイルである。そのため
`source_filename`
を検索してもリンク先は見つからない。ここが詳細ページではリンクを見つけられないのに、Markdown
Viewer 内では見つけられるという症状の原因だった。

そこでリンク解決の責任を整理した。詳細ページの `LogContentRenderer` では
`.md` リンクがクリックされたとき、まず現在ログの `attachments`
から同名ファイルを探す。見つかれば `attachment.id` を使って Markdown
Viewer へ移動する。添付ファイルに存在しない場合だけ `source_filename`
を使って別ログを検索する。これにより既存の仕組みを削除せず、二種類の
Markdown 利用方法を両立できた。

`MarkdownViewerPage` ではさらに、同一ログ内の Markdown
添付ファイル間の移動を担当させた。相対リンクからファイル名を抽出し、`attachment.name`
と比較して対象を特定する。`GENERAL.md` から `JLPT.md`、そこから
`JLPT-ANSWER.md`、さらに元の文書へ戻るといった移動が React Router
の正式な Viewer URL を通して行えるようになった。

また、リンクが `.md#anchor` の形を持つ場合も考慮した。`rehype-slug` で
Markdown 見出しに ID
を生成し、リンクをファイル名とアンカーに分離する。対象ファイルの読み込みが完了した後、`scrollIntoView()`
で該当見出しへ移動することで、文書間リンクだけでなく文書内の特定セクションまで再現できるようになった。

画像については、Markdown
の相対画像パスを同一ログの添付ファイルから検索し、Supabase Storage の
Signed URL に変換する方式を維持した。これにより Markdown
原稿がローカル相対パスを使っていても、シオリ上ではアップロード済み画像を表示できる。

最終的に、シオリの Markdown 処理は「本文としてインポートされた
Markdown」と「ログに添付された
Markdown」を区別しながら、両方を一つの閲覧体験としてつなぐ構造になった。今回重要だったのは単に
링크 클릭 오류를 수정한 것이 아니라, 링크가 무엇을 가리키는지에 따라
resolver의 책임을 나눈 것이다. 이 구조를 유지하면 앞으로 Markdown 문서
세트가 늘어나더라도 기존 기능을 크게 바꾸지 않고 확장할 수 있다.

### ヒント

今後 Markdown
関連機能を追加するときは、「このリンクは別ログを指すのか、同じログの添付ファイルを指すのか」を最初に決めると設計が崩れにくい。

---

## 3. Essay Format

Today's work focused on turning imported Markdown in Shiori from merely
readable text into connected documents that preserve their original
navigation structure. The work began with tables, images, and links on
the detail page, but the implementation revealed that a Markdown link
can represent two fundamentally different relationships.

The first relationship appears when Markdown is imported directly as
Shiori log content. In this case, storing the original filename as
`source_filename` makes it possible to resolve a `.md` link to another
imported Shiori log. Supporting this required carrying `source_filename`
through creation, updates, detail queries, and the database view, and
adding `dbFindBySourceFilename()` to translate a filename into a log ID.

The second relationship appears when several Markdown files belong to
one log as attachments. The `GENERAL`, `JLPT`, and `JLPT-ANSWER`
documents followed this model. They were not three separate logs; they
were three attachment records under one log. As a result, looking only
at `source_filename` could never reliably find those targets. This
explained why links could work inside the Markdown viewer while the same
link failed on the detail page.

The solution was to separate link-resolution responsibilities. When
`LogContentRenderer` receives a local `.md` link on the detail page, it
first searches the current log's `attachments` for a matching filename.
If a match exists, the renderer uses the attachment ID to open the
Markdown viewer. If no attachment matches, it falls back to the existing
`source_filename` resolver and searches for another Shiori log. This
preserves the earlier implementation instead of discarding it and gives
each resolver a clear purpose.

`MarkdownViewerPage` then handles navigation among Markdown attachments
belonging to the same log. It extracts the filename from a relative
link, normalizes it, compares it with `attachment.name`, and obtains the
corresponding attachment ID. This allows navigation from `GENERAL.md` to
`JLPT.md`, from the JLPT document to `JLPT-ANSWER.md`, and back again
through valid React Router viewer paths instead of arbitrary
browser-relative paths.

Anchor navigation was added as another layer. For links such as
`.md#anchor`, the viewer separates the target filename from the anchor.
`rehype-slug` generates IDs for rendered Markdown headings, and after
the destination document finishes rendering, `scrollIntoView()` moves
the page to the intended section. The same mechanism also supports
anchors that remain within the current Markdown document.

The existing image-resolution approach was preserved. Relative image
paths are matched against attachments belonging to the log, Supabase
Storage generates Signed URLs, and the Markdown source is rewritten
before rendering. This allows imported documents to keep local-style
image references while Shiori serves the actual uploaded assets
securely.

The final design therefore distinguishes Markdown imported as log
content from Markdown stored as an attachment, while presenting both
through a coherent navigation experience. The important result was not
merely fixing a broken link. The resolver responsibilities are now
separated according to what a link actually represents. With this
structure, additional Markdown document sets can be introduced later
without rebuilding the navigation system from scratch.

### Tip

For future Markdown features, decide first whether a local link
represents another Shiori log or another attachment inside the current
log. Keeping that distinction explicit will prevent the two resolution
paths from becoming tangled.

---

## 3. 에세이 형식

오늘 작업의 핵심은 시오리에 가져온 Markdown을 단순히 읽을 수 있는
텍스트로 표시하는 수준을 넘어, 원래 문서가 가지고 있던 연결 구조까지
유지하는 것이었다. 처음에는 상세페이지에서 Markdown 표와 이미지, 링크를
정상적으로 표시하는 작업에서 시작했지만 구현을 진행하면서 Markdown의
`.md` 링크가 서로 다른 두 종류의 대상을 가리킬 수 있다는 점이
중요해졌다.

첫 번째 경우는 Markdown 자체를 시오리 로그의 본문으로 가져오는 방식이다.
이 경우 원본 파일명을 `source_filename`으로 저장하면 문서 안의 `.md`
링크를 이용해 해당 파일에서 만들어진 다른 시오리 로그를 찾을 수 있다.
이를 위해 `dbCreate`, `dbUpdate`, 상세 조회 SELECT, DB View에
`source_filename`이 전달되도록 구조를 추가했고,
`dbFindBySourceFilename()`을 통해 파일명에서 로그 ID를 찾을 수 있도록
했다.

두 번째 경우는 하나의 로그에 여러 Markdown 파일이 첨부되는 방식이다.
이번에 사용한 `GENERAL`, `JLPT`, `JLPT-ANSWER` 문서가 바로 이 구조였다.
세 문서는 서로 다른 로그가 아니라 하나의 로그가 가진 세 개의
첨부파일이기 때문에 `source_filename`만 검색해서는 링크 대상을 찾을 수
없었다. 첨부파일 Viewer에서는 링크가 정상적으로 작동하지만
상세페이지에서는 `Markdown target not found`가 발생했던 이유도 바로 이
차이였다.

이를 해결하기 위해 링크 resolver의 책임을 명확하게 분리했다.
상세페이지의 `LogContentRenderer`에서 `.md` 링크가 클릭되면 우선 현재
로그의 `attachments`에서 동일한 파일명을 가진 첨부파일을 검색한다.
대상이 존재하면 `attachment.id`를 사용해 Markdown Viewer로 이동한다.
첨부파일에 대상이 없을 때만 기존의 `source_filename` resolver를 사용해
다른 시오리 로그를 검색한다. 덕분에 이전에 만든 기능을 삭제하지 않으면서
두 가지 Markdown 사용 방식을 동시에 지원할 수 있게 되었다.

`MarkdownViewerPage`는 같은 로그에 포함된 Markdown 첨부파일 사이의
이동을 담당하도록 구성했다. 상대 링크에서 파일명을 추출하고 정규화한 뒤
`attachment.name`과 비교해 대상 첨부파일을 찾는다. 이를 통해
`GENERAL.md`에서 `JLPT.md`로 이동하고, 다시 `JLPT-ANSWER.md`로
이동하거나 원래 문서로 돌아오는 흐름이 일반 상대 URL이 아니라 React
Router의 정상적인 Markdown Viewer 경로를 통해 이루어지게 되었다.

Anchor 이동도 함께 처리했다. `.md#anchor` 형태의 링크는 대상 파일과
anchor를 분리하고, `rehype-slug`가 렌더링된 Markdown heading에 ID를
생성하도록 했다. 목적지 Markdown이 로딩된 후 `scrollIntoView()`를 실행해
원하는 heading으로 이동함으로써 단순한 파일 간 이동뿐 아니라 특정
문단이나 설명 위치까지 연결할 수 있게 되었다. 현재 문서 내부에서
사용하는 `#anchor` 역시 같은 원리로 처리했다.

이미지 처리는 기존 구조를 유지했다. Markdown의 상대 이미지 경로를 현재
로그의 첨부파일에서 찾고, Supabase Storage에서 Signed URL을 발급한 뒤
렌더링 전에 Markdown의 이미지 경로를 교체한다. 따라서 원본 Markdown이
로컬 파일 기준의 상대경로를 사용하더라도 시오리에서는 업로드된 이미지를
정상적으로 표시할 수 있다.

최종적으로 시오리의 Markdown 기능은 본문으로 가져온 Markdown과
첨부파일로 보관된 Markdown을 구분하면서도 사용자 입장에서는 자연스럽게
연결된 문서처럼 사용할 수 있는 구조가 되었다. 이번 작업에서 중요한 것은
단순히 링크 오류 하나를 수정한 것이 아니라, 링크가 무엇을 가리키는지에
따라 resolver의 책임을 분리한 점이다. 이 구조를 유지한다면 앞으로 더
많은 Markdown 문서 세트가 추가되더라도 기존 기능을 크게 변경하지 않고
확장할 수 있다.

### 팁

앞으로 Markdown 관련 기능을 추가할 때는 먼저 해당 링크가 다른 시오리
로그를 가리키는지, 아니면 현재 로그의 첨부파일을 가리키는지를 구분하는
것이 좋다. 이 기준을 유지하면 두 resolver가 다시 뒤섞이는 문제를 예방할
수 있다.
