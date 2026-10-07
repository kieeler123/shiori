export function revokeAttachmentUrl(url: string | null | undefined): void {
  if (!url?.startsWith("blob:")) {
    return;
  }

  URL.revokeObjectURL(url);
}
