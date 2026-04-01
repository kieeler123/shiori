import type { AttachmentItem } from "../../type";

export function validateAttachments(
  content: string,
  attachments: AttachmentItem[],
) {
  const regex = /\[\[attach:([^\]]+)\]\]/g;
  const ids = new Set(attachments.map((a) => a.id));

  for (const match of content.matchAll(regex)) {
    const tokenId = match[1];
    if (!ids.has(tokenId)) {
      throw new Error(`Invalid attachment reference: ${tokenId}`);
    }
  }
}
