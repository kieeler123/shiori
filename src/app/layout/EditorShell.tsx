import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  tone?: "default" | "focus";
};

export function EditorShell({
  className,
  title,
  description,
  right,
  tone = "focus",
  children,
  ...props
}: Props) {
  const boxTone =
    tone === "focus"
      ? "border border-[var(--border-2)] bg-[var(--surface-3)] shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
      : "border border-[var(--border-soft)] bg-[var(--bg-elev-1)]/50";

  return (
    <div className={cn("min-h-[calc(100vh-72px)]", className)} {...props}>
      <div className={cn("mt-5 rounded-2xl p-5", boxTone)}>
        {(title || right || description) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? (
                <h1 className="text-lg font-semibold t2 truncate">{title}</h1>
              ) : null}

              {description ? (
                <p className="mt-1 text-sm t5">{description}</p>
              ) : null}
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        )}

        {/* ✅ 여기 한 줄이 “페이지가 나뉜 느낌”을 확 올려줌 */}
        {title || right || description ? (
          <div className="mb-5 border-t border-[var(--border-soft)]" />
        ) : null}

        {children}
      </div>
    </div>
  );
}
