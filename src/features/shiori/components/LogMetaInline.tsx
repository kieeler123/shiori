type LogMetaInlineProps = {
  createdLabel: string;
  viewCount?: number;
  commentCount?: number;
};

export function LogMetaInline({
  createdLabel,
  viewCount = 0,
  commentCount,
}: LogMetaInlineProps) {
  return (
    <div className="flex items-center gap-3 text-xs t5 shrink-0">
      {/* 날짜 */}
      <span>{createdLabel}</span>

      {/* 조회수 */}
      <span className="flex items-center gap-1">
        <span aria-hidden>👀</span>
        <span>{viewCount}</span>
      </span>

      {/* 댓글수 (옵션) */}
      {typeof commentCount === "number" ? (
        <span className="flex items-center gap-1">
          <span aria-hidden>💬</span>
          <span>{commentCount}</span>
        </span>
      ) : null}
    </div>
  );
}
