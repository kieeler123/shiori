import type { AttachmentItem, LinkPreviewItem } from "../../type";

const ATTACH_REGEX = /\[\[attach:([^\]]+)\]\]/g;
const LINK_REGEX = /\[\[link:([^\]]+)\]\]/g;

export function validateContentBlocks(input: {
  content: string;
  attachments?: AttachmentItem[] | null;
  links?: LinkPreviewItem[] | null;
}) {
  const attachmentIds = new Set((input.attachments ?? []).map((a) => a.id));
  const linkIds = new Set((input.links ?? []).map((l) => l.id));

  for (const match of input.content.matchAll(ATTACH_REGEX)) {
    const tokenId = match[1];
    if (!attachmentIds.has(tokenId)) {
      throw new Error(`INVALID_ATTACHMENT_REFERENCE:${tokenId}`);
    }
  }

  for (const match of input.content.matchAll(LINK_REGEX)) {
    const tokenId = match[1];
    if (!linkIds.has(tokenId)) {
      throw new Error(`INVALID_LINK_REFERENCE:${tokenId}`);
    }
  }
}
