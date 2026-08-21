- デバッグログ / Debugging Log / 디버깅 로그

# 日本語

## `Updated row not found in view`：正常な長文が一覧から消える問題

### 問題

- 日本語の文章分析を Markdown で保存・更新すると、データ自体は `shiori_items` に存在するのにメイン画面へ表示されないことがあった。
- 更新時には `Updated row not found in view` というエラーメッセージが発生した。
- 当初は、5文以上の分析や長い Markdown に対する最大文字数制限が原因だと考えていた。

### 状況

- 複数の日本語文をまとめて分析した長い Markdown を Shiori に保存していた時に発生した。
- 短い内容を先に保存すると成功することがあり、その後、編集画面で長い本文へ書き換える運用をしていた。
- 期待していた動作は、十分な文脈を含む長文でも保存され、メイン一覧と詳細画面の両方に正常に表示されることだった。

### 調査

#### 確認①：DB View の文字数条件

```sql
and char_length(trim(title)) >= 2
and char_length(trim(content)) >= 30
```

- `shiori_items_v` にはタイトル2文字以上、本文30文字以上という最小文字数条件はあったが、最大文字数条件は存在しなかった。
- そのため、5文以上や数千文字という「長さ」そのものが View から除外される原因ではないと判断した。

#### 確認②：更新後の再取得処理

```ts
const row = await dbGet(id);

if (!row) throw new Error("Updated row not found in view");
```

- `dbUpdate()` は `shiori_items` の更新後、`dbGet()` で `shiori_items_v` を再取得していた。
- つまり UPDATE 自体が成功していても、View の条件に合わなければ `row` が `null` となり、このエラーが発生する構造だった。

#### 確認③：View の `test / 테스트` フィルター

```sql
and title !~~* '%test%'::text
and content !~~* '%test%'::text
and title !~~* '%테스트%'::text
and content !~~* '%테스트%'::text
```

- テスト用のゴミデータを隠す目的で、タイトルまたは本文に `test` / `테스트` が含まれる記事を View から除外していた。
- しかし文章分析では「テスト」「test」が通常の語彙として登場するため、正常な本文まで View から消えていた。
- この条件を削除すると、対象データは `shiori_items_v` に表示されるようになった。

#### 確認④：フロントエンドの一覧フィルター

```ts
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

if (titleLower.includes("test")) return true;
if (contentLower.includes("test")) return true;
if (title.includes("테스트")) return true;
if (content.includes("테스트")) return true;
```

- DB View を修正した後もメイン画面に表示されなかったため、`shouldHideFromList()` を確認した。
- フロントエンドにも同じ `test / 테스트` 文字列フィルターが残っており、DB と View に存在する正常な記事を一覧表示直前に再び除外していた。
- これが「DB にはあるのにメイン画面にはない」状態の直接原因だった。

### 原因

```ts
if (contentLower.includes("test")) return true;
if (content.includes("테스트")) return true;
```

- 原因は最大文字数制限ではなく、本文中の特定文字列を使ってテストデータかどうかを推測していたことだった。
- 長文ほど `test` や `테스트` のような一般語が含まれる可能性が高くなるため、体感上は「長い文章ほど失敗する」ように見えていた。
- さらに同じポリシーが DB View とフロントエンドの両方に重複していたため、片方だけ直しても問題が残った。

### 修正

```ts
export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // 明示的に test タグが付いた記事だけを隠す
  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

  // 同じ文字が20回以上連続する、明らかに壊れたデータだけを隠す
  const brokenRepeated = /(.)\1{19,}/;
  if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;

  return false;
}
```

- DB View から本文・タイトルの `test / 테스트` 部分一致条件を削除した。
- フロントエンドの `shouldHideFromList()` からも `includes("test")` と `includes("테스트")` を削除した。
- テスト用記事は本文の内容ではなく、明示的な `test` タグで判定する方針に変更した。
- 長文に対する最大文字数制限は追加せず、文脈を必要とする文章分析をそのまま扱えるようにした。

### 学んだこと

- DB にデータが存在することと、View やフロントエンドの一覧に表示されることは別問題なので、保存 → View → Repository → Filter → UI の順に追跡する必要がある。
- テストデータを本文の単語で推測すると正常な文章を誤検出する。`test` タグや `is_test` のような明示的なメタデータで管理する方が安全である。
- 同じフィルタールールを DB とフロントエンドに重複させると、一方だけ修正して問題が残るため、各層の責務を明確にする必要がある。

### 一行まとめ

- 長文が一覧から消える → 最大文字数ではなく `test / 테스트` の部分一致フィルターが正常な本文を除外 → DB View とフロントの文字列フィルターを削除し、明示的な `test` タグで管理

---

# English

## `Updated row not found in view`: Valid long-form content disappearing from the list

### Problem

- When Japanese sentence-analysis Markdown was saved or updated, the row existed in `shiori_items` but sometimes did not appear on the main page.
- During updates, the application showed the error `Updated row not found in view`.
- The initial assumption was that analyses containing five or more sentences, or long Markdown documents, were exceeding a maximum content-length limit.

### Situation

- The issue appeared while saving long Markdown documents that analyzed several Japanese sentences together.
- Short content often saved successfully, so the temporary workflow was to save a short version first and then replace it with the full analysis from the edit screen.
- The expected behavior was for long analyses with enough contextual sentences to save normally and remain visible on both the main list and detail page.

### Investigation

#### Check #1: DB View length conditions

```sql
and char_length(trim(title)) >= 2
and char_length(trim(content)) >= 30
```

- `shiori_items_v` required a title of at least two characters and content of at least 30 characters, but it had no maximum content-length condition.
- Therefore, having five or more sentences or several thousand characters was not itself a reason for the View to exclude a row.

#### Check #2: Fetching the row after an update

```ts
const row = await dbGet(id);

if (!row) throw new Error("Updated row not found in view");
```

- After `dbUpdate()` updated `shiori_items`, it called `dbGet()`, which read the row again through `shiori_items_v`.
- This meant the UPDATE could succeed while the subsequent View query returned `null`, causing the error whenever the updated row no longer satisfied the View filters.

#### Check #3: `test / 테스트` filters in the View

```sql
and title !~~* '%test%'::text
and content !~~* '%test%'::text
and title !~~* '%테스트%'::text
and content !~~* '%테스트%'::text
```

- These conditions were originally added to hide disposable test data whenever the title or content contained `test` or `테스트`.
- In real sentence-analysis documents, however, those words can be legitimate content, so valid rows were being removed from the View.
- After these conditions were removed, the affected rows became visible in `shiori_items_v`.

#### Check #4: Front-end list filtering

```ts
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

if (titleLower.includes("test")) return true;
if (contentLower.includes("test")) return true;
if (title.includes("테스트")) return true;
if (content.includes("테스트")) return true;
```

- The main page still failed to show the rows after the View was fixed, so `shouldHideFromList()` was inspected.
- The front end contained the same `test / 테스트` substring rules and removed otherwise valid rows immediately before rendering the list.
- This was the direct reason the data could exist in both the base table and View while still being absent from the main page.

### Cause

```ts
if (contentLower.includes("test")) return true;
if (content.includes("테스트")) return true;
```

- The real cause was not a maximum length limit. The application was inferring whether a row was test data from words appearing anywhere inside its content.
- Longer documents naturally have a greater chance of containing ordinary words such as `test` or `테스트`, which made the issue look like a long-content failure.
- The same policy was also duplicated in the DB View and front-end filter, so fixing only one layer did not completely resolve the behavior.

### Fix

```ts
export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // Hide only entries explicitly marked with the test tag
  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

  // Hide clearly broken data only when one character repeats 20+ times
  const brokenRepeated = /(.)\1{19,}/;
  if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;

  return false;
}
```

- Removed the `test / 테스트` substring conditions for title and content from the DB View.
- Removed the corresponding `includes("test")` and `includes("테스트")` checks from `shouldHideFromList()`.
- Changed the policy so disposable test entries are identified explicitly with a `test` tag rather than inferred from normal document text.
- No maximum content-length restriction was added, allowing long contextual sentence analyses to remain valid.

### Lessons Learned

- A row existing in the database does not guarantee that it will appear through a View or in the UI; debugging should trace the complete path from save → View → Repository → Filter → UI.
- Detecting test data from words inside user content creates false positives. Explicit metadata such as a `test` tag or `is_test` field is safer.
- Duplicating the same filtering policy across the DB and front end makes debugging harder because changing one layer may leave the other layer filtering the data.

### One-line Summary

- Long analyses disappeared → the cause was not content length but `test / 테스트` substring filters → removed content-based filters from the DB View and front end and kept explicit `test` tagging

---

# 한국어

## `Updated row not found in view`: 정상적인 긴 분석 글이 목록에서 사라지는 문제

### 문제

- 일본어 문장 분석 Markdown을 저장하거나 수정하면 데이터는 `shiori_items`에 존재하지만 메인 화면에 표시되지 않는 경우가 발생했다.
- 수정 과정에서는 `Updated row not found in view`라는 에러 메시지가 나타났다.
- 처음에는 5문장 이상의 분석이나 긴 Markdown이 최대 글자 수 제한에 걸려 발생하는 문제라고 판단했다.

### 상황

- 여러 일본어 문장을 한 번에 분석한 긴 Markdown을 Shiori에 저장하는 과정에서 문제가 발생했다.
- 짧은 내용을 먼저 저장하면 성공하는 경우가 있어, 먼저 짧게 작성한 뒤 수정 화면에서 전체 분석문으로 교체하는 방식으로 사용하고 있었다.
- 기대한 동작은 문맥 파악에 필요한 여러 문장을 포함한 긴 분석도 정상 저장되고 메인 목록과 상세 화면에서 모두 표시되는 것이었다.

### 디버깅 순서

1. `Updated row not found in view` 에러가 발생하는 코드 위치를 확인했다.
2. `shiori_items` 원본 테이블과 `shiori_items_v` View에 데이터가 존재하는지 비교했다.
3. DB View의 최소·최대 길이 조건을 확인했다.
4. `dbUpdate()` 이후 `dbGet()`이 어떤 테이블을 조회하는지 추적했다.
5. View의 `test / 테스트` 문자열 필터를 제거하고 다시 확인했다.
6. View에는 나타나지만 메인 화면에 없는 상태를 확인한 뒤 프론트의 `shouldHideFromList()`를 조사했다.
7. DB와 프론트 양쪽에 중복된 문자열 기반 테스트 데이터 필터가 실제 원인임을 확인했다.

### 조사 과정

#### 확인 ①: DB View 길이 조건

```sql
and char_length(trim(title)) >= 2
and char_length(trim(content)) >= 30
```

- `shiori_items_v`에는 제목 최소 2자, 본문 최소 30자 조건만 존재했고 본문의 최대 길이 제한은 없었다.
- 따라서 5문장 이상이거나 수천 자라는 이유만으로 View에서 제외되는 구조는 아니었다.

#### 확인 ②: 업데이트 후 View 재조회

```ts
const row = await dbGet(id);

if (!row) throw new Error("Updated row not found in view");
```

- `dbUpdate()`는 `shiori_items` 업데이트 성공 후 `dbGet()`을 호출했고, `dbGet()`은 원본 테이블이 아니라 `shiori_items_v`를 조회했다.
- 따라서 UPDATE가 성공했더라도 수정된 내용이 View 조건에 걸리면 `row`가 `null`이 되어 해당 에러가 발생할 수 있었다.

#### 확인 ③: View의 `test / 테스트` 필터

```sql
and title !~~* '%test%'::text
and content !~~* '%test%'::text
and title !~~* '%테스트%'::text
and content !~~* '%테스트%'::text
```

- 막 쓰는 글이나 테스트용 데이터를 숨기기 위해 제목이나 본문에 `test / 테스트`가 포함되면 View에서 제외하도록 만들어져 있었다.
- 그러나 실제 문장 분석에서도 `테스트`나 `test`는 정상적인 표현으로 등장할 수 있어 정상 데이터까지 View에서 사라졌다.
- 해당 조건을 제거한 뒤에는 문제가 된 데이터가 `shiori_items_v`에 정상적으로 표시되는 것을 확인했다.

#### 확인 ④: 프론트엔드 목록 필터

```ts
if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

if (titleLower.includes("test")) return true;
if (contentLower.includes("test")) return true;
if (title.includes("테스트")) return true;
if (content.includes("테스트")) return true;
```

- View를 수정한 뒤에도 메인 화면에는 글이 나타나지 않아 `shouldHideFromList()`를 추가로 확인했다.
- 프론트에도 동일한 `test / 테스트` 문자열 필터가 남아 있어 DB와 View에 정상적으로 존재하는 글을 렌더링 직전에 다시 제거하고 있었다.
- 이것이 최종적으로 `DB에는 있는데 메인 화면에는 없는` 현상을 만든 직접적인 원인이었다.

### 원인

```ts
if (contentLower.includes("test")) return true;
if (content.includes("테스트")) return true;
```

- 실제 원인은 최대 글자 수 제한이 아니라 본문에 포함된 특정 문자열만으로 테스트 데이터 여부를 추측한 필터였다.
- 긴 문서일수록 `test`, `테스트`처럼 정상적으로 사용할 수 있는 단어가 포함될 확률이 높아져 체감상 긴 글에서 에러가 발생하는 것처럼 보였다.
- 같은 정책이 DB View와 프론트엔드 양쪽에 중복되어 있었기 때문에 한쪽만 수정해서는 문제가 완전히 해결되지 않았다.

### 해결

```ts
export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // 명시적으로 test 태그가 붙은 글만 숨김
  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

  // 같은 문자가 20회 이상 연속되는 명백히 깨진 데이터만 숨김
  const brokenRepeated = /(.)\1{19,}/;
  if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;

  return false;
}
```

- DB View에서 제목과 본문의 `test / 테스트` 부분 일치 조건을 제거했다.
- 프론트의 `shouldHideFromList()`에서도 `includes("test")`, `includes("테스트")` 조건을 제거했다.
- 테스트용 글은 본문 내용을 추측해서 판별하지 않고 명시적인 `test` 태그로 구분하도록 변경했다.
- 문맥 분석에 필요한 긴 콘텐츠를 그대로 사용할 수 있도록 최대 글자 수 제한은 추가하지 않았다.

### 배운 점

- DB에 데이터가 있다는 사실과 View 및 UI에서 표시된다는 사실은 별개이므로 저장 → View → Repository → Filter → UI 전체 흐름을 단계별로 확인해야 한다.
- 사용자 본문의 단어를 기준으로 테스트 데이터를 판별하면 정상 콘텐츠를 오탐할 수 있으므로 `test` 태그나 `is_test` 같은 명시적인 메타데이터가 더 안전하다.
- 동일한 필터 정책을 DB와 프론트에 중복 구현하면 한쪽만 수정했을 때 문제가 남을 수 있으므로 각 계층의 책임을 명확하게 나누는 것이 좋다.

### 한 줄 요약

- 긴 분석 글이 목록에서 사라짐 → 최대 길이가 아니라 `test / 테스트` 부분 일치 필터가 정상 본문을 제거 → DB View와 프론트의 문자열 필터를 제거하고 명시적인 `test` 태그 방식으로 변경
