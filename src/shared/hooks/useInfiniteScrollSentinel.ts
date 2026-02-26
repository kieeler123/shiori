import { useEffect } from "react";

type Options = {
  enabled: boolean;
  onLoadMore: () => void;
  rootMargin?: string; // 예: "240px"
  threshold?: number; // 예: 0.01
};

export function useInfiniteScrollSentinel(
  ref: React.RefObject<Element | null>,
  { enabled, onLoadMore, rootMargin = "240px", threshold = 0.01 }: Options,
) {
  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: null, rootMargin, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, onLoadMore, rootMargin, threshold]);
}
