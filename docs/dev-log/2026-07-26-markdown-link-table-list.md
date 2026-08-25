## 1. リスト形式

### 目的

- Markdown
  ファイルをシオリへ取り込み、本文・表・リンク・画像を正しく表示できるようにする。
- 同一ログに添付された複数の Markdown
  ファイル間で相対リンクによる移動を可能にする。
- Markdown を本文として取り込んだ場合と、添付 Markdown
  として閲覧する場合の両方に対応する。

### 今日行った作業

- `MarkdownImportButton` の Markdown インポート処理を確認した。
- Markdown ファイルと関連画像を同時選択し、`importMarkdownAssets`
  で画像をアップロードする流れを整理した。
- `LogEditor` で Markdown インポート結果を `content`
  に反映する構造を確認した。
- 元 Markdown のファイル名を保存するため `source_filename`
  を追加した。
- `dbCreate` / `dbUpdate` に `source_filename` の保存処理を追加した。
- `SELECT_DETAIL` に `source_filename` を追加した。
- `shiori_items_v` に `source_filename` を含める方向で DB View
  を調整した。
- `dbFindBySourceFilename()`
  を追加し、ファイル名から別ログを検索できるようにした。
- `LogContentRenderer` の Markdown 表示に `react-markdown`,
  `remark-gfm`, `rehype-raw`, `rehype-slug` を利用した。
- Markdown の表を GFM として表示できるようにした。
- Markdown 本文内の `.md` リンクを通常のブラウザ相対 URL
  として処理しないようにした。
- 詳細ページでは、リンク先ファイルをまず現在ログの `attachments`
  から検索するように整理した。
- 添付ファイルに対象がない場合は `source_filename`
  による別ログ検索へフォールバックする設計にした。
- `MarkdownViewerPage` では同一ログの `attachments`
  を保持し、ファイル名からリンク先 Markdown を検索するようにした。
- `GENERAL.md → JLPT.md → JLPT-ANSWER.md` のような添付 Markdown
  間の移動を実現した。
- `.md#anchor` の形式を解析し、別 Markdown
  を開いた後に対象見出しへスクロールできるようにした。
- 現在の Markdown 内だけを移動する `#anchor` リンクにも対応した。
- `rehype-slug` を利用して Markdown 見出しに ID を付与した。
- 로컬 이미지 경로는 첨부파일을 찾아 Supabase Signed URL로 치환하는
  기존 처리를 유지했다.
- 외부 HTTP/HTTPS 링크는 새 탭에서 열도록 분리했다.
- 링크 클릭 시 `target not found`가 발생한 원인이 상세페이지와
  Markdown Viewer의 링크 해석 방식 차이임을 확인했다.
- 최종적으로 상세페이지와 첨부 Markdown Viewer 모두 정상적으로 링크
  이동하도록 역할을 분리했다.

### 最終構造

```text
LogDetailPage
  ↓
LogContentRenderer
  ↓ .md リンク
現在ログの attachments を先に検索
  ├─ 見つかる → MarkdownViewerPage
  └─ 見つからない → source_filename で別 Log を検索

MarkdownViewerPage
  ↓ .md リンク
同一 Log の attachments をファイル名で検索
  ↓
別の Markdown 添付ファイルへ移動
  ↓
#anchor があれば対象見出しへスクロール
```

### ヒント

`source_filename` と `attachment.name`
は競合する機能ではない。前者は「Markdown
本文として取り込まれた別ログ」を探すため、後者は「同じログに属する
Markdown 添付ファイル」を探すために使い分ける。

---

# Shiori Markdown Import & Internal-Link Implementation Log

## 1. List Format

### Goals

- Import Markdown into Shiori while preserving readable content,
  tables, links, and images.
- Allow relative links to navigate between multiple Markdown files
  attached to the same log.
- Support both Markdown imported as log content and Markdown opened as
  an attachment.

### Work Completed Today

- Reviewed the Markdown import flow in `MarkdownImportButton`.
- Confirmed that a Markdown file and its related images can be
  selected together and processed by `importMarkdownAssets`.
- Verified that `LogEditor` places the imported Markdown into
  `content`.
- Added `source_filename` to preserve the original Markdown filename.
- Added `source_filename` handling to `dbCreate` and `dbUpdate`.
- Added `source_filename` to `SELECT_DETAIL`.
- Adjusted the `shiori_items_v` design so the view can expose
  `source_filename`.
- Added `dbFindBySourceFilename()` to resolve another log by its
  imported source filename.
- Used `react-markdown`, `remark-gfm`, `rehype-raw`, and `rehype-slug`
  for Markdown rendering.
- Enabled GFM table rendering.
- Prevented local `.md` links from being treated as ordinary
  browser-relative URLs.
- Changed detail-page link resolution to search the current log's
  `attachments` first.
- Added a fallback to `source_filename` lookup when no matching
  attachment exists.
- Updated `MarkdownViewerPage` to retain all attachments belonging to
  the current log.
- Resolved linked Markdown attachments by comparing the link filename
  with `attachment.name`.
- Enabled navigation such as `GENERAL.md → JLPT.md → JLPT-ANSWER.md`.
- Added support for `.md#anchor` links.
- Added support for `#anchor` links inside the currently displayed
  Markdown.
- Used `rehype-slug` to generate IDs for Markdown headings.
- Preserved local-image resolution through Supabase Signed URLs.
- Kept external HTTP/HTTPS links separate and opened them normally.
- Identified that `Markdown target not found` came from different
  link-resolution rules in the detail page and attachment viewer.
- Finished by separating the responsibilities of the detail renderer
  and Markdown attachment viewer.

### Final Architecture

```text
LogDetailPage
  ↓
LogContentRenderer
  ↓ .md link
Search current log attachments first
  ├─ Found → MarkdownViewerPage
  └─ Not found → search another Log by source_filename

MarkdownViewerPage
  ↓ .md link
Find filename in the same Log's attachments
  ↓
Open the linked Markdown attachment
  ↓
If an #anchor exists, scroll to that heading
```

### Tip

Keep `source_filename` and `attachment.name` as separate resolution
mechanisms. The former identifies another imported log; the latter
identifies a Markdown attachment belonging to the current log.

# 시오리 Markdown 가져오기 및 내부 링크 구현 작업 기록

## 1. 리스트 형식

### 목표

- Markdown 파일을 시오리에 가져오면서 본문, 표, 링크, 이미지를
  정상적으로 표시한다.
- 하나의 로그에 첨부된 여러 Markdown 파일이 상대 링크를 통해 서로
  이동할 수 있게 한다.
- Markdown을 로그 본문으로 가져온 경우와 첨부 Markdown으로 열람하는
  경우를 모두 지원한다.

### 오늘 진행한 작업

- `MarkdownImportButton`의 Markdown 가져오기 흐름을 확인했다.
- Markdown 파일과 관련 이미지를 함께 선택하고
  `importMarkdownAssets`에서 업로드하는 구조를 정리했다.
- `LogEditor`에서 가져온 Markdown을 `content`에 반영하는 구조를
  확인했다.
- 원본 Markdown 파일명을 보존하기 위해 `source_filename`을 추가했다.
- `dbCreate`와 `dbUpdate`에 `source_filename` 저장 처리를 추가했다.
- `SELECT_DETAIL`에 `source_filename`을 추가했다.
- `shiori_items_v`에서도 `source_filename`을 조회할 수 있도록 View
  구조를 조정했다.
- `dbFindBySourceFilename()`을 추가해 원본 파일명으로 다른 로그를 찾을
  수 있게 했다.
- Markdown 렌더링에 `react-markdown`, `remark-gfm`, `rehype-raw`,
  `rehype-slug`를 적용했다.
- GFM Markdown 표가 상세 화면에서 정상적으로 렌더링되도록 했다.
- `.md` 상대 링크가 일반 브라우저 상대 URL로 처리되지 않도록 링크
  처리를 분리했다.
- 상세페이지에서는 현재 로그의 `attachments`를 먼저 검색하도록 링크
  해석 순서를 변경했다.
- 첨부파일에서 대상을 찾지 못했을 때 `source_filename` 기반 다른 로그
  검색으로 fallback하도록 했다.
- `MarkdownViewerPage`가 현재 로그의 전체 첨부파일 목록을 유지하도록
  했다.
- 링크 파일명과 `attachment.name`을 비교하여 다른 Markdown 첨부파일을
  찾도록 구현했다.
- `GENERAL.md → JLPT.md → JLPT-ANSWER.md`와 같은 Markdown 첨부파일 간
  이동을 구현했다.
- `.md#anchor` 링크를 지원하도록 파일명과 anchor를 분리했다.
- 현재 Markdown 문서 안의 `#anchor` 링크도 처리하도록 했다.
- `rehype-slug`를 사용해 Markdown heading에 anchor용 ID를 생성했다.
- Markdown의 로컬 이미지 경로를 첨부파일과 연결하고 Supabase Signed
  URL로 바꾸는 기존 기능을 유지했다.
- HTTP/HTTPS 외부 링크는 내부 Markdown 링크와 분리해 정상적인 외부
  링크로 처리했다.
- 상세페이지에서 발생하던 `Markdown target not found`의 원인이
  상세페이지와 Viewer의 링크 해석 방식 차이임을 확인했다.
- 최종적으로 상세페이지와 Markdown Viewer의 resolver 역할을 분리해
  전체 링크 흐름을 정상화했다.

### 최종 구조

```text
LogDetailPage
  ↓
LogContentRenderer
  ↓ .md 링크
현재 Log의 attachments 우선 검색
  ├─ 있음 → MarkdownViewerPage
  └─ 없음 → source_filename으로 다른 Log 검색

MarkdownViewerPage
  ↓ .md 링크
같은 Log의 attachments에서 파일명 검색
  ↓
다른 Markdown 첨부파일 열기
  ↓
#anchor가 있으면 해당 heading으로 이동
```

### 팁

`source_filename`과 `attachment.name`은 같은 기능이 아니다. 전자는
Markdown 본문으로 가져온 다른 로그를 찾을 때 사용하고, 후자는 현재 로그
안에 있는 Markdown 첨부파일을 찾을 때 사용하면 된다.
