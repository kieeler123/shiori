📌 2026-04-01 エラー処理記録（添付ファイル / リンク参照エラー）
🇯🇵 日本語（エラー処理プロセス）

📌 問題
編集画面で投稿を更新しようとした際、以下のエラーが発生した。

INVALID_ATTACHMENT_REFERENCE
INVALID_LINK_REFERENCE

content内にトークン（[[attach:id]], [[link:id]]）は存在していたが、
保存処理でエラーとなり更新ができなかった。

📌 確認とログの追加

まず、submit時に実際に渡されているデータを確認するためログを追加した。

console.log("submit content", v.content);
console.log("submit attachments", v.attachments);
console.log("submit links", v.links);

📌 原因特定のための確認

ログの結果：

contentにはトークンが存在
attachments / links 配列には該当idが存在しない

さらに、LogEditorのstate初期化を確認したところ：

const [attachments, setAttachments] = useState([]);

となっており、初期値が渡されていないことを確認した。

📌 原因

編集画面で：

contentは既存データを保持しているが
attachments / links は初期化されず空配列のまま

その結果、validateContentBlocks による整合性チェックでエラーが発生していた。

📌 修正

① attachments / links の初期化を修正

const [attachments, setAttachments] = useState(initialAttachments);
const [links, setLinks] = useState(initialLinks);

② submit時にlinksが抜けていたため追加

onSubmit({
  ...
  attachments,
  links,
});

③ LogEditorにkeyを付与し再マウント保証

<LogEditor key={item.id} ... />

📌 結果

添付ファイル / リンク参照エラーが解消
編集保存が正常に動作
データ整合性チェックが正しく機能する状態を維持

💡 Tip
contentトークン方式では：

👉「content」
👉「attachments / links」

この2つは常にセットで同期する必要がある

🇺🇸 English (Error Handling Process)

📌 Problem
While updating a post in the edit page, the following errors occurred:

INVALID_ATTACHMENT_REFERENCE
INVALID_LINK_REFERENCE

The tokens existed in the content, but the update failed.

📌 Investigation & Logging

Added logs to inspect submit payload:

console.log("submit content", v.content);
console.log("submit attachments", v.attachments);
console.log("submit links", v.links);

📌 Root Cause Analysis

Findings:

Tokens existed in content
Corresponding IDs were missing in attachments / links arrays

Also found that state was initialized incorrectly:

const [attachments, setAttachments] = useState([]);

📌 Root Cause

Content retained existing tokens
attachments / links were initialized as empty arrays

→ Validation failed due to mismatch

📌 Fix

Initialize state correctly:
const [attachments, setAttachments] = useState(initialAttachments);
const [links, setLinks] = useState(initialLinks);
Include links in submit payload:
onSubmit({
  ...
  attachments,
  links,
});
Force remount using key:
<LogEditor key={item.id} ... />

📌 Result

Attachment and link reference errors resolved
Edit/save works correctly
Validation logic remains intact

💡 Tip
In token-based systems:

👉 Content and metadata must always stay in sync

🇰🇷 한국어 (에러 처리 과정)

📌 문제
수정 화면에서 글을 업데이트할 때 다음 에러가 발생했다.

INVALID_ATTACHMENT_REFERENCE
INVALID_LINK_REFERENCE

content에는 토큰이 존재하지만 저장이 실패했다.

📌 확인 및 로그 추가

submit 시 전달되는 데이터를 확인하기 위해 로그를 추가했다.

console.log("submit content", v.content);
console.log("submit attachments", v.attachments);
console.log("submit links", v.links);

📌 원인 분석

로그 결과:

content에는 토큰 존재
attachments / links 배열에는 해당 id 없음

또한 state 초기화 확인 결과:

const [attachments, setAttachments] = useState([]);

초기값이 전달되지 않고 있었다.

📌 원인

content는 기존 데이터를 유지하지만
attachments / links는 빈 배열 상태

→ 검증 로직에서 불일치 발생

📌 해결

① attachments / links 초기화 수정

const [attachments, setAttachments] = useState(initialAttachments);
const [links, setLinks] = useState(initialLinks);

② submit 시 links 누락 문제 수정

onSubmit({
  ...
  attachments,
  links,
});

③ LogEditor key 추가

<LogEditor key={item.id} ... />

📌 결과

첨부파일 / 링크 참조 오류 해결
수정 저장 정상 동작
데이터 정합성 유지

💡 팁
토큰 기반 구조에서는

👉 content
👉 attachments / links

이 둘은 항상 같이 움직여야 한다