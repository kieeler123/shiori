import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** 배경 강도 조절용(원하면) */
  intensity?: "soft" | "normal";
};

export function AppBackground({
  className,
  intensity = "normal",
  ...props
}: Props) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--bg-app)] text-[var(--text-main)]">
      <div
        className={cn(
          "mx-auto max-w-3xl px-6 py-6",
          // ✅ 전역 배경은 여기서만! (페이지에서 bg 주지 않기)
          intensity === "soft"
            ? "bg-[image:var(--bg-app)] bg-fixed"
            : "bg-[image:var(--bg-app)] bg-fixed",
          "text-[var(--text-main)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}
