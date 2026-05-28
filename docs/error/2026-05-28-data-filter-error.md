# 日本語

## 今日発生した問題

- 一部の感情記録（オキナワ記録、5月3週目記録など）が、

  -> 管理画面では表示される
  -> 詳細ページでは開ける
  -> ローカル環境では表示される
  -> しかし本番環境のメイン一覧では表示されたり消えたりする

という問題が発生した。

- 特に、

  -> 詳細ページに入って戻ると消える
  -> ブラウザを閉じて再読み込みすると再び表示される

という不安定な状態だった。

## 原因

- 最終的な原因は、

  -> DBやSupabase Viewではなく、

  -> localStorage に保存された古い一覧キャッシュ

だった。

- 特にこの構造が問題だった。

```js
const KEY = "shiori.logs";

localStorage.setItem(KEY, JSON.stringify(items));
```

- 一覧データ全体を shiori.logs 1つに保存していたため、

- 古い一覧
  -> 一部しか読み込まれていない一覧
  -> 詳細ページ移動前の状態

などが localStorage に残り続けていた。

- その結果、

  -> 最新DBデータより古いキャッシュが優先される

  -> 状態になっていた。

## 最初に疑ったもの

- 最初は以下を疑った。

### 1. DB View 条件

```js
shiori_items_v;
```

- の条件に引っかかっている可能性。

- しかし、

  -> is_deleted
  -> is_hidden
  -> deleted_scope
  -> title/content length

には問題がなかった。

### 2. shouldHideFromList()

- 次にフロント側フィルターを疑った。

```js
const repeated = /(.)\1{9,}/;
```

- 感情記録では、

  -> ●
  -> ○
  -> 繰り返し表現
  -> 長文

が自然に入るため、
正常なデータが誤判定される可能性があった。

- そのため、
  ->フィルターを緩和した。

### 3. pagination / sorting

- 特定3件だけ表示が不安定だったため、

  offset pagination
  - display_date 単独ソート

  による順序不安定も疑った。

### 4. usePagedList()

- 次に、

  -> React状態管理や非同期競合（race condition）を疑った。

- 特に：

  詳細ページ移動
  ↓
  戻る
  ↓
  古い状態復元

  が怪しかった。

- 決定的だった確認

以下を実行した。

```js
localStorage.clear();
location.reload();
```

- すると問題の記録が正常表示された。

- この時点で、

  -> localStorage キャッシュ問題

がほぼ確定した。

## 解決方法

### 1. キャッシュ保存停止

- 以前:

```js
onCacheSave: (arr) => saveLogs(arr);
```

- 変更後:

```js
onCacheSave: undefined;
```

### 2. localStorage キャッシュ無効化

- 以前:

```js
export function loadLogs() {
  return parsedCache;
}
```

- 変更後:

```js
export function loadLogs() {
  return [];
}
```

### 3. saveLogs 無効化

```js
export function saveLogs(_items: LogItem[]) {}
```

### 4. 古いキャッシュ削除

- ブラウザで実行:

```js
localStorage.removeItem("shiori.logs");
```

## 学んだこと

- 今回の問題は、

- DBではなく：

  -> キャッシュ
  -> 状態復元
  -> pagination
  -> stale state

が原因だった。

- 特に：

  -> 詳細ページでは見える
  -> 一覧だけ消える

- 場合は、

  -> フロント状態管理
  -> localStorage
  -> browser restore

を優先的に疑うべきだと分かった。

# English

## Problem

- Some emotional logs appeared inconsistently:

  -> Visible in admin page
  -> Visible in detail page
  -> Visible locally
  -> But sometimes missing from the production main list

- Especially:

  -> Visible after refresh
  -> Missing after entering detail page and going back

## Root Cause

- The root cause was not Supabase or the database.

- It was:

  ->stale localStorage cache

- The problematic structure was:

```js
const KEY = "shiori.logs";

localStorage.setItem(KEY, JSON.stringify(items));
```

- The entire log list was stored in a single localStorage key.

## As a result:

- old lists
- partially loaded lists
- outdated pagination states

were restored later and overwrote the newest server state.

Initial Suspicions

### 1. Supabase View

- Initially suspected:

  ->shiori_items_v

But all conditions were valid.

### 2. Frontend Filter

- Then suspected:

```js
const repeated = /(.)\1{9,}/;
```

- Because emotional logs naturally contain:

  -> repeated expressions
  -> bullets
  -> separators
  -> long text

- The filter was relaxed.

### 3. Pagination / Sorting

- Since only a few logs disappeared intermittently,
- unstable sorting was also suspected.

### 4. React State / Race Condition

- Then suspected:

  back navigation
  - cached React state
  - stale async response

  Critical Discovery

- After running:

```js
localStorage.clear();
location.reload();
```

- the missing logs appeared correctly.

- This confirmed the issue was caused by:

- stale localStorage cache

## Solution

### 1. Disable cache saving

- Before:

```js
onCacheSave: (arr) => saveLogs(arr);
```

- After:

```js
onCacheSave: undefined;
```

### 2. Disable cache loading

- Before:

```js
loadLogs() => cached data
```

- After:

```js
loadLogs() => []
```

### 3. Disable cache writing

```js
saveLogs(_items) {}
```

### 4. Remove old cache

```js
localStorage.removeItem("shiori.logs");
```

## Lesson Learned

- This issue was not a database problem.

- It was caused by:

  -> stale cache
  -> pagination
  -> state restoration
  -> browser cache

- When:

  -> detail page works
  -> but list page breaks

frontend state and caching should be investigated first.

# 한국어

## 오늘 발생한 문제

- 일부 감정기록(오키나와 기록, 5월 3주차 기록 등)이:

  -> 관리자 페이지에서는 보임
  -> 상세 페이지에서는 열림
  -> 로컬 환경에서는 정상
  -> 하지만 배포 환경 메인 목록에서는 떴다 안 떴다 함

- 특히:

  -> 상세페이지 들어갔다 나오면 사라짐
  ->브라우저 새로고침하면 다시 뜸

이라는 이상한 증상이 있었다.

## 원인

- 최종 원인은 DB나 Supabase View가 아니라:

- localStorage에 저장된 오래된 목록 캐시(stale cache)

였다.

- 특히 이 구조가 문제였다.

```js
const KEY = "shiori.logs";

localStorage.setItem(KEY, JSON.stringify(items));
```

- 목록 전체를 하나의 localStorage 키에 저장하고 있었기 때문에:

  -> 오래된 목록
  -> 일부만 로딩된 목록
  -> 상세페이지 이동 전 상태

등이 계속 브라우저에 남아 있었다.

- 결국:

  ->최신 DB 상태보다 오래된 캐시가 우선되는 상황

이 발생했다.

## 처음 의심했던 것들

### 1. DB View 문제

- 처음에는:

  -> shiori_items_v

조건에 걸린 줄 알았다.

- 하지만:

  -> is_deleted
  -> is_hidden
  -> deleted_scope
  -> title/content length

등에는 문제가 없었다.

## 2. shouldHideFromList()

- 다음으로 프론트 필터를 의심했다.

```js
const repeated = /(.)\1{9,}/;
```

- 감정기록에서는:

  -> ●
  -> ○
  -> 반복 표현
  -> 긴 글

등이 자연스럽게 들어가기 때문에 정상 데이터도 숨겨질 가능성이 있었다.

- 그래서 필터를 완화했다.

## 3. pagination / sorting 문제

- 특정 3개 글만 불안정하게 사라졌기 때문에:

  offset pagination
  - display_date 단독 정렬

  도 의심했다.

## 4. React 상태 / race condition

- 다음으로:

  상세페이지 이동
  ↓
  뒤로가기
  ↓
  예전 상태 복원

흐름을 의심했다.

- 결정적인 확인

  ->브라우저 콘솔에서:

```js
localStorage.clear();
location.reload();
```

    를 실행하자 문제 글이 정상적으로 나타났다.

- 이 시점에서:

  -> localStorage 캐시 문제

가 거의 확정됐다.

## 해결 방법

### 1. 캐시 저장 비활성화

- 이전:

```js
onCacheSave: (arr) => saveLogs(arr);
```

- 변경:

```js
onCacheSave: undefined;
```

### 2. 캐시 읽기 비활성화

- 이전:

```js
loadLogs() => cached data
```

- 변경:

```js
loadLogs() => []
```

### 3. 캐시 저장 함수 비활성화

```js
saveLogs(_items) {}
```

### 4. 기존 캐시 삭제

- 브라우저 콘솔:

```js
localStorage.removeItem("shiori.logs");
```

## 배운 점

- 이번 문제는 DB 저장 실패가 아니라:

  -> 캐시
  -> pagination
  -> 상태 복원
  -> stale state

문제였다.

- 특히:

  -> 상세페이지는 정상인데
  -> 목록만 이상함

- 일 경우에는:

  -> localStorage
  -> React 상태
  -> 브라우저 복원(bfcache)

을 먼저 의심해야 한다는 걸 배웠다.

## 팁

- CRUD를 공부할 때 저장/조회만 보는 경우가 많지만, 실제 앱에서는 캐시와 상태 복원 문제가 훨씬 자주 발생한다. 이번 디버깅 경험은 단순 CRUD보다 훨씬 실무적인 경험에 가까운 편이다.
