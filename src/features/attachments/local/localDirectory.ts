import {
  clearAttachmentRootHandle,
  getAttachmentRootHandle,
  saveAttachmentRootHandle,
} from "./localDirectoryDb";

export type LocalDirectoryPermission = "granted" | "denied" | "prompt";

export async function selectAttachmentRootDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!("showDirectoryPicker" in window)) {
    throw new Error("이 브라우저는 로컬 폴더 선택 기능을 지원하지 않습니다.");
  }

  const handle = await window.showDirectoryPicker({
    mode: "readwrite",
  });

  await saveAttachmentRootHandle(handle);

  return handle;
}

export async function loadAttachmentRootDirectory(): Promise<FileSystemDirectoryHandle | null> {
  return getAttachmentRootHandle();
}

export async function disconnectAttachmentRootDirectory(): Promise<void> {
  await clearAttachmentRootHandle();
}

export async function getAttachmentRootPermission(
  handle: FileSystemDirectoryHandle,
): Promise<LocalDirectoryPermission> {
  return handle.queryPermission({
    mode: "readwrite",
  });
}

export async function requestAttachmentRootPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const currentPermission = await handle.queryPermission({
    mode: "readwrite",
  });

  if (currentPermission === "granted") {
    return true;
  }

  const permission = await handle.requestPermission({
    mode: "readwrite",
  });

  return permission === "granted";
}

export async function getUsableAttachmentRootDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await loadAttachmentRootDirectory();

  console.log("[localDirectory] handle", handle);

  if (!handle) {
    console.log("[localDirectory] no saved handle");
    return null;
  }

  try {
    const permission = await handle.queryPermission({
      mode: "readwrite",
    });

    console.log("[localDirectory] permission", permission);

    if (permission !== "granted") {
      return null;
    }

    return handle;
  } catch (error) {
    console.error("[localDirectory] queryPermission failed", error);

    throw error;
  }

  return handle;
}
