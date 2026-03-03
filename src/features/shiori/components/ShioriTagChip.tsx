// 예: src/features/shiori/components/ShioriTagChip.tsx
import { useNavigate } from "react-router-dom";

export function ShioriTagChip({ tag }: { tag: string }) {
  const nav = useNavigate();

  function onClickTag() {
    // 로그 화면이 아니라면 로그로 이동하면서 tag 적용
    const base = "/logs";
    nav(`${base}?tag=${encodeURIComponent(tag)}`, { replace: false });
  }

  return <button onClick={onClickTag} /* ... */>#{tag}</button>;
}
