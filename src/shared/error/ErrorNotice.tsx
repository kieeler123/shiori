type Props = {
  title?: string;
  message?: string;
};

export default function ErrorNotice({
  title = "문제가 발생했습니다",
  message = "잠시 후 다시 시도해주세요.",
}: Props) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "var(--bg-elev-1)",
        borderColor: "var(--border-soft)",
      }}
    >
      <div className="text-sm font-semibold text-[var(--text-1)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--text-4)]">{message}</div>
    </div>
  );
}
