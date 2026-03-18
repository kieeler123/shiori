# [Error] Related Logs Empty on Sort Change

## 🧩 1. Summary
- When switching sort to "views", no data was displayed

---

## 🇯🇵 日本語

### ■ 症状
人気順に切り替えるとデータが表示されない

### ■ 仮説
- sortが反映されていない
- DB取得が失敗している
- フィルタで除外されている

### ■ 検証ログ
```ts
console.log("sort changed", sort);
console.log("raw rows", rows);
console.log("visible rows", visibleRows);
```

raw rows → 5件

visible rows → 0件

■ 原因

フロントの shouldHideFromList により全データが除外されていた

■ 解決

related logs専用の軽いフィルタを使用する

🇺🇸 English
■ Symptom

No data displayed when sorting by views

■ Hypothesis

sort not applied

DB fetch failed

filtered out

■ Logs

raw rows → 5

visible rows → 0

■ Root Cause

Frontend filter removed all items

■ Fix

Use lighter filter for related logs

🇰🇷 한국어
■ 증상

인기순으로 변경 시 데이터 없음

■ 가설

정렬 미적용

DB 문제

필터 문제

■ 로그

raw rows → 5개

visible rows → 0개

■ 원인

프론트 필터에서 전부 제거됨

■ 해결

related logs 전용 필터 적용