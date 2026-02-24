// src/shared/ui/patterns/DropdownPortal.tsx
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

type Placement = "bottom-end" | "bottom-start" | "top-end" | "top-start";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getViewport() {
  // iOS/모바일 주소창 변화 대응 (가능하면 visualViewport)
  const vv = window.visualViewport;
  return {
    w: vv?.width ?? window.innerWidth,
    h: vv?.height ?? window.innerHeight,
    offsetLeft: vv?.offsetLeft ?? 0,
    offsetTop: vv?.offsetTop ?? 0,
  };
}

export function DropdownPortal({
  open,
  anchorRect,
  width,
  maxHeight = 320,
  gap = 8,
  placement = "bottom-end",
  children,
  onReposition,
}: {
  open: boolean;
  anchorRect: DOMRect | null;
  width: number;
  maxHeight?: number;
  gap?: number;
  placement?: Placement;
  children: React.ReactNode;
  onReposition?: (pos: {
    top: number;
    left: number;
    maxHeight: number;
  }) => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, mh: maxHeight });

  const depsKey = useMemo(() => {
    if (!anchorRect) return "none";
    return [
      anchorRect.left,
      anchorRect.top,
      anchorRect.width,
      anchorRect.height,
      width,
      maxHeight,
      gap,
      placement,
    ].join("|");
  }, [anchorRect, width, maxHeight, gap, placement]);

  useLayoutEffect(() => {
    if (!open || !anchorRect) return;

    const vp = getViewport();
    const pad = 8;

    // 기본: bottom-end
    const wantTop = placement.startsWith("top");
    const wantEnd = placement.endsWith("end");

    // candidate positions
    const left0 = wantEnd ? anchorRect.right - width : anchorRect.left;

    // clamp X
    const left = clamp(
      left0,
      vp.offsetLeft + pad,
      vp.offsetLeft + vp.w - width - pad,
    );

    // Y: 아래로 펼쳤을 때 남은 공간 / 위로 펼쳤을 때 남은 공간 비교해서 자동 뒤집기
    const spaceBelow = vp.offsetTop + vp.h - (anchorRect.bottom + gap) - pad;
    const spaceAbove = anchorRect.top - gap - (vp.offsetTop + pad);

    const shouldFlipToTop =
      !wantTop &&
      spaceBelow < Math.min(maxHeight, 220) &&
      spaceAbove > spaceBelow;

    const actualTop = shouldFlipToTop
      ? anchorRect.top - gap
      : anchorRect.bottom + gap;

    const available = shouldFlipToTop ? spaceAbove : spaceBelow;
    const mh = clamp(Math.floor(available), 160, maxHeight);

    const top = shouldFlipToTop
      ? clamp(
          actualTop - mh,
          vp.offsetTop + pad,
          vp.offsetTop + vp.h - mh - pad,
        )
      : clamp(actualTop, vp.offsetTop + pad, vp.offsetTop + vp.h - mh - pad);

    const next = { top, left, mh };
    setPos(next);
    onReposition?.({ top, left, maxHeight: mh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, depsKey]);

  // 스크롤/리사이즈 시 재배치
  useEffect(() => {
    if (!open) return;

    function onChange() {
      // anchorRect는 부모에서 다시 넘겨주는 방식이 제일 정확하지만,
      // 여기선 useLayoutEffect가 depsKey에 의해 다시 계산되게끔 트리거만 줌.
      // (부모에서 rect를 최신화해주는 게 베스트)
      setPos((p) => ({ ...p }));
    }

    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    window.visualViewport?.addEventListener("resize", onChange);
    window.visualViewport?.addEventListener("scroll", onChange);

    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      window.visualViewport?.removeEventListener("resize", onChange);
      window.visualViewport?.removeEventListener("scroll", onChange);
    };
  }, [open]);

  if (!open) return null;

  // fixed + body portal => 헤더 overflow/transform 영향에서 탈출
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width,
        maxHeight: pos.mh,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
