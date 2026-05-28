# function

```js
export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;
  if (titleLower.includes("test")) return true;
  if (contentLower.includes("test")) return true;
  if (title.includes("테스트")) return true;
  if (content.includes("테스트")) return true;

  const brokenRepeated = /(.)\1{19,}/;
  if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;

  return false;
}
```

# 日本語

## 関数の役割

- shouldHideFromList() は、ログ一覧に表示するべきではないデータを判定する関数。
- タイトルや本文が短すぎるもの、テスト用データ、明らかに壊れたデータを一覧から除外するために使う。

## 一行ずつ分析

### 1.

```js
export function shouldHideFromList(log: {
```

- 外部から使える関数として定義する。

### 2.

```js
  title?: string;
  content?: string;
  tags?: string[];
}) {
```

- log はタイトル、本文、タグを持つ可能性がある。
- ? があるので、値が存在しない場合も想定している。

### 3.

```js
const title = (log.title ?? "").trim();
```

- タイトルがなければ空文字にし、前後の空白を削除する。

### 4.

```js
const content = (log.content ?? "").trim();
```

- 本文も同じように、存在しなければ空文字にして空白を削除する。

### 5.

```js
const tags = log.tags ?? [];
```

- タグがなければ空配列として扱う。

### 6.

```js
const titleLower = title.toLowerCase();
```

- 英語の test 判定をしやすくするため、タイトルを小文字化する。

### 7.

```js
const contentLower = content.toLowerCase();
```

- 本文も小文字化する。

### 8.

```js
if (title.length < 2) return true;
```

- タイトルが短すぎる場合は一覧から隠す。

### 9.

```js
if (content.length < 30) return true;
```

- 本文が短すぎる場合も隠す。

### 10.

```js
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;
```

- タグに test があればテスト用データとして隠す。

### 11.

```js
if (titleLower.includes("test")) return true;
```

- タイトルに test が含まれて 있으면 隠す。

### 12.

```js
if (contentLower.includes("test")) return true;
```

- 本文に test が含まれて 있으면 隠す。

### 13.

```js
if (title.includes("테스트")) return true;
```

- タイトルに韓国語の 테스트 が 있으면 隠す。

### 14.

```js
if (content.includes("테스트")) return true;
```

- 本文に 테스트 が 있으면 隠す。

### 15.

```js
const brokenRepeated = /(.)\1{19,}/;
```

- 同じ文字が20回以上連続するパターンを探す正規表現。
- 例: aaaaaaaaaaaaaaaaaaaa

### 16.

```js
if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;
```

- タイトルまたは本文に明らかな壊れた繰り返しがあれば隠す。

### 17.

```js
return false;
```

- どの条件にも引っかからなければ、一覧に表示する。

## 今回起きた問題

- 以前のコードでは、同じ文字が10回以上連続すると非表示にしていた。

```js
const repeated = /(.)\1{9,}/;
```

- 感情記録では ●, ○, 区切り、反復表現が自然に出るため、正常な記録が一覧から消える可能性があった。

## デバッグ方法

- DBにデータが存在するか確認する。
- shiori_items_v に出るか確認する。
- 管理画面では見えるか確認する。
- 詳細ページでは見えるか確認する。
- メイン一覧だけ消えるなら、フロントの filterItem を見る。
- shouldHideFromList() を一時的に無効化する。
- 表示されれば、その関数が原因。

## Tip

- 一覧フィルターは強くしすぎると、正常な長文記録を消す危険がある。最初は最小条件だけにするのが安全。

# English

## Function Summary

- shouldHideFromList() decides whether a log item should be hidden from the public list.
- It filters out items with too-short titles, too-short content, test data, or clearly broken repeated text.

## Line-by-line Analysis

### 1.

```js
export function shouldHideFromList(log: {
```

- Defines an exported function.

### 2.

```js
  title?: string;
  content?: string;
  tags?: string[];
}) {
```

- The function accepts a log object.
- Each field is optional.

### 3.

```js
const title = (log.title ?? "").trim();
```

- Uses an empty string if title is missing, then trims whitespace.

### 4.

```js
const content = (log.content ?? "").trim();
```

- Does the same for content.

### 5.

```js
const tags = log.tags ?? [];
```

- Uses an empty array if tags are missing.

### 6.

```js
const titleLower = title.toLowerCase();
```

- Converts the title to lowercase for case-insensitive test detection.

### 7.

```js
const contentLower = content.toLowerCase();
```

- Converts the content to lowercase.

### 8.

```js
if (title.length < 2) return true;
```

- Hides logs with titles that are too short.

### 9.

```js
if (content.length < 30) return true;
```

- Hides logs with content that is too short.

### 10.

```js
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;
```

- Hides logs tagged as test.

### 11.

```js
if (titleLower.includes("test")) return true;
```

- Hides logs whose title contains test.

### 12.

```js
if (contentLower.includes("test")) return true;
```

- Hides logs whose content contains test.

### 13.

```js
if (title.includes("테스트")) return true;
```

- Hides logs whose title contains Korean 테스트.

### 14.

```js
if (content.includes("테스트")) return true;
```

- Hides logs whose content contains Korean 테스트.

### 15.

```js
const brokenRepeated = /(.)\1{19,}/;
```

- Detects the same character repeated 20 or more times in a row.

### 16.

```js
if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;
```

- Hides clearly broken repeated text.

### 17.

```js
return false;
```

- If none of the conditions match, the log is shown.

## Problem

- The previous version used:

```js
const repeated = /(.)\1{9,}/;
```

- This hides text when the same character appears 10 or more times in a row.
- For emotional records, bullets and repeated expressions can be valid, so this rule caused false positives.

## Debugging Steps

- Confirm the row exists in the database.
- Confirm it appears in shiori_items_v.
- Check whether it appears in the admin page.
- Check whether the detail page works.
- If only the main list hides it, inspect frontend filters.
- Temporarily disable shouldHideFromList().
- If the item appears, the filter is the cause.

## Tip

- For public list filtering, avoid aggressive rules. False positives are usually worse than letting a few harmless records through.

# 한국어

## 함수 요약

- shouldHideFromList()는 로그를 메인 목록에서 숨길지 판단하는 함수다.
- 제목이 너무 짧거나, 내용이 너무 짧거나, 테스트용 글이거나, 명백히 깨진 반복 문자열이 있는 경우 목록에서 제외한다.

## 한 줄씩 분석

### 1.

```js
export function shouldHideFromList(log: {
```

    - 다른 파일에서 가져다 쓸 수 있는 함수로 선언한다.

### 2.

```js
  title?: string;
  content?: string;
  tags?: string[];
}) {
```

- log 객체는 title, content, tags를 가질 수 있다.
- ?는 값이 없을 수도 있다는 뜻이다.

### 3.

```js
const title = (log.title ?? "").trim();
```

- 제목이 없으면 빈 문자열로 처리하고, 앞뒤 공백을 제거한다.

### 4.

```js
const content = (log.content ?? "").trim();
```

- 내용도 없으면 빈 문자열로 처리하고, 앞뒤 공백을 제거한다.

### 5.

```js
const tags = log.tags ?? [];
```

- 태그가 없으면 빈 배열로 처리한다.

### 6.

```js
const titleLower = title.toLowerCase();
```

- test를 대소문자 구분 없이 찾기 위해 제목을 소문자로 바꾼다.

### 7.

```js
const contentLower = content.toLowerCase();
```

- 내용도 소문자로 바꾼다.

### 8.

```js
if (title.length < 2) return true;
```

- 제목이 너무 짧으면 목록에서 숨긴다.

### 9.

```js
if (content.length < 30) return true;
```

- 내용이 너무 짧으면 목록에서 숨긴다.

### 10.

```js
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;
```

- 태그 중 test가 있으면 테스트 글로 판단해서 숨긴다.

### 11.

```js
if (titleLower.includes("test")) return true;
```

- 제목에 test가 포함되면 숨긴다.

### 12.

```js
if (contentLower.includes("test")) return true;
```

- 내용에 test가 포함되면 숨긴다.

### 13.

```js
if (title.includes("테스트")) return true;
```

- 제목에 테스트가 포함되면 숨긴다.

### 14.

```js
if (content.includes("테스트")) return true;
```

- 내용에 테스트가 포함되면 숨긴다.

### 15.

```js
const brokenRepeated = /(.)\1{19,}/;
```

- 같은 문자가 20번 이상 연속되는지 찾는 정규식이다.

### 16.

```js
if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;
```

- 제목이나 내용에 명백히 깨진 반복 문자열이 있으면 숨긴다.

### 17.

```js
return false;
```

- 위 조건에 걸리지 않으면 목록에 표시한다.

## 이번에 생긴 문제

- 이전 코드에서는 같은 문자가 10번 이상 연속되면 숨겼다.

```js
const repeated = /(.)\1{9,}/;
```

- 그런데 감정기록에는 ●, ○, 구분선, 반복 표현이 자연스럽게 들어갈 수 있다.
- 그래서 정상적인 감정기록이 메인 목록에서 숨겨지는 문제가 생겼다.

## 디버깅 과정

- Supabase 관리자 페이지에서 데이터가 있는지 확인했다.
- shiori_items_v 조건에 걸리는지 SQL로 확인했다.
- is_deleted, is_hidden, deleted_scope, 제목/내용 길이 조건에는 걸리지 않았다.
- 상세 페이지는 열리는데 메인 목록에서만 안 뜨는 것을 확인했다.
- 메인 목록 코드에서 filterItem: (it) => !shouldHideFromList(it)를 확인했다.
- shouldHideFromList()의 반복 문자 필터를 의심했다.
- 반복 문자 필터를 제거하거나 완화하자 글이 정상적으로 표시됐다.

## 정리

- 이번 문제는 DB 저장 실패가 아니라, 프론트 목록 필터의 오탐 문제였다.
- 감정기록처럼 반복 표현이 중요한 데이터는 너무 강한 자동 필터로 걸러내면 안 된다.

## 팁

- 바닐라 CRUD를 공부하는 단계에서도 이런 분석은 의미 있다. CRUD는 결국 저장, 조회, 필터링, 렌더링, 디버깅까지 이어지는 흐름이라서 실제 프로젝트 문제를 분석해두면 기초가 훨씬 단단해진다.
