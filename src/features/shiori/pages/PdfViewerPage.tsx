import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useI18n } from "@/shared/i18n/LocaleProvider";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerPage() {
  const { t } = useI18n();
  const [numPages, setNumPages] = useState<number>(0);

  const fileUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url") ?? "";

    if (!url) return "";
    if (url.startsWith("/")) return `${window.location.origin}${url}`;

    return url;
  }, []);

  const pageWidth = Math.min(
    typeof window !== "undefined" ? window.innerWidth - 32 : 860,
    860,
  );

  if (!fileUrl) {
    return (
      <main className="min-h-screen bg-app p-4 text-[var(--text-2)]">
        {t("pdfViewer.missingUrl")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app p-3 text-[var(--text-2)]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-3 shadow-lg">
        <div className="mb-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-4)]">
          {numPages > 0
            ? t("pdfViewer.totalPages").replace("{count}", String(numPages))
            : t("pdfViewer.loading")}
        </div>

        <div className="overflow-x-auto">
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
                  className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)]"
                >
                  <Page
                    pageNumber={index + 1}
                    width={pageWidth}
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
    </main>
  );
}
