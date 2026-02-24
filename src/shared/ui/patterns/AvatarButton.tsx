import { cn } from "../utils/cn";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  onClick?: () => void;
};

export function AvatarButton({ src, alt = "user", onClick }: AvatarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-xl border border-[var(--border-soft)]",
        "bg-[var(--bg-elev-1)] overflow-hidden",
        "inline-flex items-center justify-center",
        "hover:bg-[var(--bg-elev-2)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
      )}
      aria-label="내 계정"
      title="내 계정"
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs t5">👤</span>
      )}
    </button>
  );
}
