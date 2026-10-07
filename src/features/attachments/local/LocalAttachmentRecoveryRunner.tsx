import { useEffect } from "react";

import { recoverPendingLocalAttachmentsDeduped } from "@/features/attachments/local/localAttachmentRecovery";

import { dbIsAttachmentReferenced } from "@/features/shiori/repo/shioriRepo";

export default function LocalAttachmentRecoveryRunner() {
  useEffect(() => {
    void recoverPendingLocalAttachmentsDeduped(dbIsAttachmentReferenced)
      .then((result) => {
        console.log("[LocalAttachmentRecovery] completed", result);
      })
      .catch((error) => {
        console.error("[LocalAttachmentRecovery] failed", error);
      });
  }, []);

  return null;
}
