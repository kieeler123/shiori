import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerPage() {
  const [numPages, setNumPages] = useState<number>(0);

  const fileUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url") ?? "";

    if (!url) return "";

    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }

    return url;
  }, []);

  const pageWidth = Math.min(
    typeof window !== "undefined" ? window.innerWidth - 32 : 860,
    860,
  );

  if (!fileUrl) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        PDF 주소가 없습니다.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-3 text-foreground">
      <div className="mx-auto max-w-4xl rounded-xl border bg-card p-3 shadow-sm">
        <div className="mb-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          {numPages > 0 ? `총 ${numPages}페이지` : "PDF 불러오는 중..."}
        </div>

        <div className="overflow-x-auto">
          <Document
            file={fileUrl}
            loading={<div className="p-4 text-sm">PDF 불러오는 중...</div>}
            error={
              <div className="p-4 text-sm text-destructive">
                PDF를 불러오지 못했습니다.
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
                  className="overflow-hidden rounded-lg border bg-background"
                >
                  <Page
                    pageNumber={index + 1}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="p-4 text-sm">
                        {index + 1}페이지 불러오는 중...
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
