import { LoadingText } from "@/shared/ui/feedback/LoadingText";

type Props = {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  busyMore: boolean;
  hasMore: boolean;
  hasAny: boolean; // 리스트에 1개라도 있나
  empty?: React.ReactNode; // 빈 상태 메시지 (원하는 UI로)
  loadingLabel?: string;
  endLabel?: string;
};

export function InfiniteListFooter({
  sentinelRef,
  busyMore,
  hasMore,
  hasAny,
  empty,
  loadingLabel = "더 불러오는 중…",
  endLabel = "끝",
}: Props) {
  return (
    <>
      {/* ✅ 무한스크롤 sentinel (필수) */}
      <div ref={sentinelRef} />

      {/* ✅ 추가 로딩 */}
      {busyMore ? (
        <div className="py-4">
          <LoadingText align="center" size="sm" label={loadingLabel} />
        </div>
      ) : null}

      {/* ✅ 끝 표시 */}
      {!hasMore && hasAny ? (
        <div className="py-6">
          <LoadingText align="center" size="sm" label={endLabel} />
        </div>
      ) : null}

      {/* ✅ 빈 상태 */}
      {!hasAny && empty ? <div className="py-6">{empty}</div> : null}
    </>
  );
}
