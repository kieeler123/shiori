import type { AttachmentItem } from "@/features/shiori/type";

export type PendingLocalAttachmentRecord = {
  attachment: AttachmentItem;
  createdAt: number;
};

const DB_NAME = "shiori-local-storage";
const DB_VERSION = 2;

const HANDLE_STORE_NAME = "handles";
const PENDING_ATTACHMENT_STORE_NAME = "pending-attachments";

const ROOT_HANDLE_KEY = "attachment-root";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(HANDLE_STORE_NAME)) {
        db.createObjectStore(HANDLE_STORE_NAME);
      }

      if (!db.objectStoreNames.contains(PENDING_ATTACHMENT_STORE_NAME)) {
        db.createObjectStore(PENDING_ATTACHMENT_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveAttachmentRootHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(HANDLE_STORE_NAME, "readwrite");

      const store = transaction.objectStore(HANDLE_STORE_NAME);

      const request = store.put(handle, ROOT_HANDLE_KEY);

      request.onsuccess = () => resolve();

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function getAttachmentRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLE_STORE_NAME, "readonly");

      const store = transaction.objectStore(HANDLE_STORE_NAME);

      const request = store.get(ROOT_HANDLE_KEY);

      request.onsuccess = () => {
        resolve(
          (request.result as FileSystemDirectoryHandle | undefined) ?? null,
        );
      };

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function clearAttachmentRootHandle(): Promise<void> {
  const db = await openDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(HANDLE_STORE_NAME, "readwrite");

      const store = transaction.objectStore(HANDLE_STORE_NAME);

      const request = store.delete(ROOT_HANDLE_KEY);

      request.onsuccess = () => resolve();

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function savePendingAttachment(
  attachment: AttachmentItem,
): Promise<void> {
  const db = await openDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        PENDING_ATTACHMENT_STORE_NAME,
        "readwrite",
      );

      const store = transaction.objectStore(PENDING_ATTACHMENT_STORE_NAME);

      const record: PendingLocalAttachmentRecord = {
        attachment,
        createdAt: Date.now(),
      };

      store.put(record, attachment.id);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(
          transaction.error ??
            new Error("Pending attachment 저장에 실패했습니다."),
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ??
            new Error("Pending attachment 저장 transaction이 중단되었습니다."),
        );
      };
    });
  } finally {
    db.close();
  }
}

export async function removePendingAttachment(
  attachmentId: string,
): Promise<void> {
  const db = await openDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        PENDING_ATTACHMENT_STORE_NAME,
        "readwrite",
      );

      const store = transaction.objectStore(PENDING_ATTACHMENT_STORE_NAME);

      const request = store.delete(attachmentId);

      request.onsuccess = () => resolve();

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function getPendingAttachments(): Promise<
  PendingLocalAttachmentRecord[]
> {
  const db = await openDb();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        PENDING_ATTACHMENT_STORE_NAME,
        "readonly",
      );

      const store = transaction.objectStore(PENDING_ATTACHMENT_STORE_NAME);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as PendingLocalAttachmentRecord[]);
      };

      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
