import type { AttachmentItem } from "@/features/shiori/type";

import {
  clearLocalAttachmentPending,
  listPendingLocalAttachments,
} from "./localAttachmentJournal";

import { deleteLocalAttachment } from "./localAttachmentStore";

const RECOVERY_GRACE_PERIOD_MS = 60 * 60 * 1000;

type AttachmentReferenceChecker = (
  attachment: AttachmentItem,
) => Promise<boolean>;

export type LocalAttachmentRecoveryResult = {
  committed: number;
  deleted: number;
  skippedRecent: number;
  failed: number;
};

export async function recoverPendingLocalAttachments(
  isReferenced: AttachmentReferenceChecker,
): Promise<LocalAttachmentRecoveryResult> {
  const pendingRecords = await listPendingLocalAttachments();

  const result: LocalAttachmentRecoveryResult = {
    committed: 0,
    deleted: 0,
    skippedRecent: 0,
    failed: 0,
  };

  for (const record of pendingRecords) {
    const attachment = record.attachment;

    const age = Date.now() - record.createdAt;

    if (age < RECOVERY_GRACE_PERIOD_MS) {
      result.skippedRecent += 1;
      continue;
    }

    try {
      const referenced = await isReferenced(attachment);

      if (referenced) {
        await clearLocalAttachmentPending(attachment.id);

        result.committed += 1;
        continue;
      }

      await deleteLocalAttachment(attachment);

      await clearLocalAttachmentPending(attachment.id);

      result.deleted += 1;
    } catch (error) {
      result.failed += 1;

      console.error("[localAttachmentRecovery] recovery failed:", {
        attachmentId: attachment.id,
        attachmentName: attachment.name,
        error,
      });
    }
  }

  return result;
}

let recoveryPromise: Promise<LocalAttachmentRecoveryResult> | null = null;

export function recoverPendingLocalAttachmentsOnce(
  isReferenced: AttachmentReferenceChecker,
): Promise<LocalAttachmentRecoveryResult> {
  if (recoveryPromise) {
    return recoveryPromise;
  }

  recoveryPromise = recoverPendingLocalAttachments(isReferenced).finally(() => {
    recoveryPromise = null;
  });

  return recoveryPromise;
}

let activeRecovery: Promise<LocalAttachmentRecoveryResult> | null = null;

export function recoverPendingLocalAttachmentsDeduped(
  isReferenced: AttachmentReferenceChecker,
): Promise<LocalAttachmentRecoveryResult> {
  if (activeRecovery) {
    return activeRecovery;
  }

  activeRecovery = recoverPendingLocalAttachments(isReferenced).finally(() => {
    activeRecovery = null;
  });

  return activeRecovery;
}
