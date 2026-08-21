import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { dbGet } from "@/features/shiori/repo/shioriRepo";
import { supabase } from "@/lib/supabaseClient";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PAGE_SIDE_GAP = 8;

export default function PdfViewerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { logId, attachmentId } = useParams<{
    logId: string;
    attachmentId: string;
  }>();

  const [fileUrl, setFileUrl] = useState("");
  const [numPages, setNumPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState(320);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      if (!logId || !attachmentId) {
        setLoading(false);
        setLoadError("로그 또는 첨부파일 ID가 없습니다.");
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);

        const log = await dbGet(logId);

        if (!log) {
          throw new Error("로그를 찾을 수 없습니다.");
        }

        const attachment =
          log.attachments?.find((item) => item.id === attachmentId) ?? null;

        if (!attachment) {
          throw new Error("PDF 첨부파일을 찾을 수 없습니다.");
        }

        const fileName = attachment.name.toLowerCase();

        const isPdf =
          attachment.mimeType === "application/pdf" ||
          fileName.endsWith(".pdf");

        if (!isPdf) {
          throw new Error("PDF 파일이 아닙니다.");
        }

        const { data, error } = await supabase.storage
          .from(attachment.bucket)
          .createSignedUrl(attachment.path, 60 * 30);

        if (error) {
          throw error;
        }

        if (!data?.signedUrl) {
          throw new Error("PDF URL을 생성하지 못했습니다.");
        }

        if (cancelled) {
          return;
        }

        setFileUrl(data.signedUrl);
      } catch (error) {
        console.error("PDF viewer load failed:", error);

        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "PDF를 불러오는 중 오류가 발생했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [logId, attachmentId]);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) {
      return;
    }

    const updateWidth = () => {
      const el = containerRef.current;
      if (!el) return;

      const availableWidth = el.clientWidth - PAGE_SIDE_GAP;

      setPageWidth(Math.max(320, availableWidth));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-app)] px-3 py-4 text-[var(--text-2)]">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
            <div className="text-sm text-[var(--text-4)]">
              {t("pdfViewer.loading")}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !fileUrl) {
    return (
      <main className="min-h-screen bg-[var(--bg-app)] px-3 py-4 text-[var(--text-2)]">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-4">
            <div className="text-sm text-[var(--btn-danger-fg)]">
              {loadError ?? t("pdfViewer.loadFailed")}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-app)] px-2 py-4 text-[var(--text-2)] sm:px-3">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* 상단 툴바 */}
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] px-3 py-2">
          <button
            type="button"
            onClick={() => navigate(`/logs/${logId}`)}
            className="shrink-0 rounded-xl border border-[var(--border-soft)] px-3 py-2 text-sm text-[var(--text-3)]"
          >
            뒤로가기
          </button>

          <div className="min-w-0 truncate text-sm text-[var(--text-4)]">
            {numPages > 0
              ? t("pdfViewer.totalPages").replace("{count}", String(numPages))
              : t("pdfViewer.loading")}
          </div>
        </div>

        {/* PDF 영역 */}
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-2 shadow-lg sm:p-3">
          <div ref={containerRef} className="w-full overflow-x-auto">
            <Document
              file={fileUrl}
              loading={
                <div className="p-4 text-sm text-[var(--text-4)]">
                  {t("pdfViewer.loading")}
                </div>
              }
              error={
                <div className="p-4 text-sm text-[var(--btn-danger-fg)]">
                  {t("pdfViewer.loadFailed")}
                </div>
              }
              onLoadError={(error) => {
                console.error("PDF load error:", error);
                console.log("fileUrl:", fileUrl);
              }}
              onSourceError={(error) => {
                console.error("PDF source error:", error);
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
            >
              <div className="space-y-4">
                {Array.from({ length: numPages }, (_, index) => (
                  <div
                    key={index + 1}
                    className="
                    mx-auto
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--border-soft)]
                    bg-[var(--surface-3)]
                  "
                  >
                    <Page
                      pageNumber={index + 1}
                      width={pageWidth}
                      className="mx-auto"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <div className="p-4 text-sm text-[var(--text-4)]">
                          {t("pdfViewer.pageLoading").replace(
                            "{page}",
                            String(index + 1),
                          )}
                        </div>
                      }
                      onLoadError={(error) => {
                        console.error("PDF page load error:", error);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Document>
          </div>
        </div>
      </div>
    </main>
  );
}
