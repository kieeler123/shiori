import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Suggestion } from "../types";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  suggestions: Suggestion[];
  commitSearch: (q: string) => void;
  pickSuggestion: (s: Suggestion) => void;
  onClear?: () => void;
  onRequestNavigateFirst?: () => void;
};

function groupLabel(type: Suggestion["type"]) {
  switch (type) {
    case "recent":
      return "최근 검색어";
    case "tag":
      return "태그";
    case "title":
      return "제목";
    case "keyword":
      return "내용 키워드";
    default:
      return "추천";
  }
}

export default function SearchBar({
  query,
  setQuery,
  suggestions,
  commitSearch,
  pickSuggestion,
  onClear,
  onRequestNavigateFirst,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);

  // ✅ 키보드 선택용 "활성 인덱스"
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const sections = useMemo(() => {
    const map = new Map<Suggestion["type"], Suggestion[]>();
    for (const s of suggestions) {
      const arr = map.get(s.type) ?? [];
      arr.push(s);
      map.set(s.type, arr);
    }
    const order: Suggestion["type"][] = ["recent", "tag", "title", "keyword"];
    return order
      .filter((t) => (map.get(t)?.length ?? 0) > 0)
      .map((t) => ({ type: t, items: map.get(t)! }));
  }, [suggestions]);

  // ✅ 섹션을 "평탄화(flat)" 해서 키보드 이동 대상으로 만든다
  const flat = useMemo(() => {
    const out: { secType: Suggestion["type"]; s: Suggestion }[] = [];
    for (const sec of sections) {
      for (const s of sec.items) out.push({ secType: sec.type, s });
    }
    return out;
  }, [sections]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // ✅ query 또는 suggestions가 바뀌면 활성 인덱스 리셋(크롬 느낌)
  useEffect(() => {
    if (!open) return;
    if (flat.length === 0) {
      setActiveIndex(-1);
      return;
    }
    // 기본은 첫 항목
    setActiveIndex(0);
  }, [query, open, flat.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const k = e.key.toLowerCase();

      const isCmdK = isMac && e.metaKey && k === "k";
      const isCtrlK = !isMac && e.ctrlKey && k === "k";
      const isSlash = k === "/" && !e.ctrlKey && !e.metaKey && !e.altKey;

      // 입력 중이면 / 단축키 방해하지 않기
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as any).isContentEditable);

      if (typing && !isCmdK && !isCtrlK) return;

      if (isCmdK || isCtrlK || isSlash) {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    commitSearch(query);
    setOpen(false);
    onRequestNavigateFirst?.();

    // ✅ 드롭다운 열려 있고 active가 있으면 "선택"이 우선
    if (open && activeIndex >= 0 && activeIndex < flat.length) {
      onPick(flat[activeIndex].s);
      return;
    }

    const q = query.trim();
    if (q) commitSearch(q);
    setOpen(false);
  }

  function onPick(s: Suggestion) {
    pickSuggestion(s);
    setOpen(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
    onRequestNavigateFirst?.();
  }

  function moveActive(delta: number) {
    if (!open) setOpen(true);
    if (flat.length === 0) return;

    setActiveIndex((cur) => {
      const start = cur < 0 ? 0 : cur;
      const next = (start + delta + flat.length) % flat.length;
      return next;
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(+1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    // Enter는 form submit으로 들어가니까 onSubmit에서 처리됨
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="검색: 제목 / 내용 / 태그"
          className="
            flex-1 rounded-2xl border border-zinc-800/70
            bg-zinc-900/60 px-4 py-3
            text-sm text-zinc-100 placeholder:text-zinc-500
            outline-none
            focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20
            transition
          "
        />

        {hasQuery ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="
              cursor-pointer
              px-4 py-2
              rounded-xl
              border border-zinc-700/70
              bg-zinc-900/60
              text-sm text-zinc-300
              transition
              hover:bg-zinc-800 hover:text-white
              active:scale-[0.97]
              focus:outline-none focus:ring-2 focus:ring-zinc-700/60
            "
          >
            지우기
          </button>
        ) : null}

        <button
          type="submit"
          className="
            cursor-pointer
            px-4 py-2
            rounded-xl
            border border-zinc-700/70
            bg-zinc-900/60
            text-sm text-zinc-300
            transition
            hover:bg-zinc-800 hover:text-white
            active:scale-[0.97]
            focus:outline-none focus:ring-2 focus:ring-zinc-700/60
          "
        >
          검색
        </button>

        {onClear ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
              setActiveIndex(-1);
            }}
            className="
              cursor-pointer
              px-4 py-2
              rounded-xl
              border border-zinc-700/70
              bg-zinc-900/60
              text-sm text-zinc-300
              transition
              hover:bg-zinc-800 hover:text-white
              active:scale-[0.97]
              focus:outline-none focus:ring-2 focus:ring-zinc-700/60
            "
          >
            필터 초기화
          </button>
        ) : null}
      </form>

      {open && sections.length > 0 ? (
        <div
          className="
            absolute left-0 right-0 z-50 mt-2
            rounded-2xl border border-zinc-800/70
            bg-zinc-950/90 backdrop-blur
            shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            p-2
            hover:bg-zinc-800 hover:text-white
            focus:outline-none focus:ring-2 focus:ring-zinc-700/60
          "
        >
          {sections.map((sec) => (
            <div key={sec.type} className="p-1">
              <div className="px-2 py-2 text-xs text-zinc-500">
                {groupLabel(sec.type)}
              </div>

              <div className="grid gap-1">
                {sec.items.map((s, idx) => {
                  // ✅ flat 인덱스를 계산해서 activeIndex와 비교
                  // (sec 이전 섹션들의 길이 합 + idx)
                  const flatIndex = (() => {
                    let offset = 0;
                    for (const x of sections) {
                      if (x.type === sec.type) break;
                      offset += x.items.length;
                    }
                    return offset + idx;
                  })();

                  const isActive = flatIndex === activeIndex;

                  return (
                    <button
                      key={`${sec.type}-${idx}-${s.value}`}
                      type="button"
                      onClick={() => onPick(s)}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      className={[
                        "cursor-pointer",
                        "w-full text-left rounded-xl px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-zinc-900/80 text-zinc-100 ring-1 ring-indigo-400/20"
                          : "text-zinc-300 hover:bg-zinc-900/70 hover:text-zinc-100",
                      ].join(" ")}
                    >
                      {sec.type === "tag" ? `#${s.value}` : s.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
