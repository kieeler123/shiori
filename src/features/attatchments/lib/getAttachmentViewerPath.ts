import type { AttachmentItem } from "@/features/shiori/type";

export function getAttachmentViewerPath(item: AttachmentItem, logId?: string) {
  if (!logId) {
    return null;
  }

  const fileName = item.name.toLowerCase();

  const isMarkdown =
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    item.mimeType.startsWith("text/markdown");

  const isPdf =
    fileName.endsWith(".pdf") || item.mimeType === "application/pdf";

  if (isMarkdown) {
    return `/logs/${logId}/attachments/${item.id}/markdown`;
  }

  if (isPdf) {
    return `/logs/${logId}/attachments/${item.id}/pdf`;
  }

  return null;
}
