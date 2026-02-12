## type에도있고 db목록에도있는데 리스트가 안불러와지는경우
```tsx
useEffect(() => {
    if (rows.length) console.log("keys:", Object.keys(rows[0] as any), rows[0]);
  }, [rows]);
```

## 디자인안먹힐때 확인방법
```tsx
document.documentElement.getAttribute("data-theme")
```