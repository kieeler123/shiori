import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerPage() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  const fileUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url") ?? "";

    if (!url) return "";

    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }

    return url;
  }, []);

  Array.from({ length: numPages }, (_, i) => (
    <Page key={i + 1} pageNumber={i + 1} />
  ));

  return (
    <main className="min-h-screen bg-neutral-100 p-3">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-3 shadow">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            className="rounded border px-3 py-2 disabled:opacity-40"
          >
            이전
          </button>

          <span className="text-sm">
            {pageNumber} / {numPages || "-"}
          </span>

          <button
            type="button"
            disabled={numPages > 0 && pageNumber >= numPages}
            onClick={() =>
              setPageNumber((prev) =>
                numPages ? Math.min(numPages, prev + 1) : prev,
              )
            }
            className="rounded border px-3 py-2 disabled:opacity-40"
          >
            다음
          </button>
        </div>

        <div className="overflow-x-auto">
          <Document
            file={fileUrl}
            loading={<div>PDF 불러오는 중...</div>}
            error={<div>PDF를 불러오지 못했습니다.</div>}
            onLoadError={(error) => {
              console.error("PDF load error:", error);
              console.log("fileUrl:", fileUrl);
            }}
            onSourceError={(error) => {
              console.error("PDF source error:", error);
            }}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth - 40, 860)}
              onLoadError={(error) => {
                console.error("PDF page load error:", error);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </main>
  );
}
