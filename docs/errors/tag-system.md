# 📅 2026-01-28  
# 🐞 Tag System — 問題解決ログ / Error Resolution Log / 태그 시스템 문제 해결 기록

---

## 🇯🇵 日本語

### ❗ 問題① 入力してもテキストが表示されない

**症状**
- textarea に入力しても文字が消える
- コンソールにログが繰り返し表示

**原因**  
`useEffect` が毎レンダーごとに props を state に同期  
→ ユーザー入力が上書きされた

**解決**
props同期を「編集対象が変わった時だけ」に制御

---

### ❗ 問題② 編集時にタグが入力欄に表示されない

**原因**  
`initialTags` が `tagsText` に同期されていなかった

**解決**
```ts
useEffect(() => {
  setTagsText(initialTags.join(" "));
}, [initialTags]);
```

❗ 問題③ タグ重複 & 制限なし

解決
```ts
const merged = [...new Set([...inputTags, ...contentTags])].slice(0, TAG_LIMIT);
```

❗ 問題④ カーソル位置ずれ
```ts
requestAnimationFrame(() => {
  textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
});
```

------------------------------------------------------------------------------------

🇺🇸 English
❗ Issue 1 — Input text disappears

Cause
useEffect continuously syncing props → state
User input was overwritten

Fix
Sync only when editing target changes

❗ Issue 2 — Tags not showing during edit

Fix
```ts
setTagsText(initialTags.join(" "));
```

❗ Issue 3 — Duplicate & unlimited tags
```ts
const merged = [...new Set([...inputTags, ...contentTags])].slice(0, TAG_LIMIT);
```

❗ Issue 4 — Cursor position shifts

Use requestAnimationFrame to adjust cursor after render.

---------------------------------------------------------------------------------------------

🇰🇷 한국어
❗ 문제 1 — 입력해도 글자가 사라짐

원인
useEffect가 props → state를 계속 동기화
→ 사용자 입력이 덮어쓰기됨

해결
편집 대상이 바뀔 때만 동기화

❗ 문제 2 — 수정 시 태그가 입력창에 안 뜸
```ts
setTagsText(initialTags.join(" "));
```

❗ 문제 3 — 태그 중복 & 무제한
```ts
const merged = [...new Set([...inputTags, ...contentTags])].slice(0, TAG_LIMIT);
```

❗ 문제 4 — 커서 위치 어긋남

렌더 후 커서 재설정 필요