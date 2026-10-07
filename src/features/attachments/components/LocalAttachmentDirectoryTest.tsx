import { useEffect, useState } from "react";

import { recoverPendingLocalAttachments } from "@/features/attachments/local/localAttachmentRecovery";

import { dbIsAttachmentReferenced } from "@/features/shiori/repo/shioriRepo";

import {
  disconnectAttachmentRootDirectory,
  getAttachmentRootPermission,
  loadAttachmentRootDirectory,
  requestAttachmentRootPermission,
  selectAttachmentRootDirectory,
  type LocalDirectoryPermission,
} from "@/features/attachments/local/localDirectory";

import {
  deleteLocalAttachment,
  readLocalAttachment,
  saveLocalAttachment,
} from "@/features/attachments/local/localAttachmentStore";

import type { AttachmentItem } from "@/features/shiori/type";

type DirectoryState = {
  loading: boolean;
  name: string | null;
  permission: LocalDirectoryPermission | null;
  error: string | null;
};

export default function LocalAttachmentDirectoryTest() {
  const [testFile, setTestFile] = useState<File | null>(null);

  const [savedAttachment, setSavedAttachment] = useState<AttachmentItem | null>(
    null,
  );

  const [testResult, setTestResult] = useState<string>("");

  const [testing, setTesting] = useState(false);

  async function handleRecoverPendingAttachments() {
    try {
      const result = await recoverPendingLocalAttachments(
        dbIsAttachmentReferenced,
      );

      console.log("[LocalAttachmentRecovery] result", result);

      alert(
        [
          "Local attachment recovery 완료",
          `정상 참조: ${result.committed}`,
          `고아 삭제: ${result.deleted}`,
          `최근 파일 건너뜀: ${result.skippedRecent}`,
          `실패: ${result.failed}`,
        ].join("\n"),
      );
    } catch (error) {
      console.error("[LocalAttachmentRecovery] failed", error);
    }
  }

  async function handleSaveTestFile() {
    if (!testFile) {
      setTestResult("먼저 테스트 파일을 선택해주세요.");
      return;
    }

    setTesting(true);
    setTestResult("");

    try {
      const attachment = await saveLocalAttachment(testFile);

      setSavedAttachment(attachment);

      setTestResult(
        [
          "Local 저장 성공",
          `이름: ${attachment.name}`,
          `경로: ${attachment.path}`,
          `크기: ${attachment.size} bytes`,
          `저장 방식: ${attachment.storageType}`,
        ].join("\n"),
      );

      console.log("[LocalAttachmentTest] saved:", attachment);
    } catch (error) {
      console.error("[LocalAttachmentTest] save failed:", error);

      setTestResult(
        error instanceof Error ? `저장 실패: ${error.message}` : "저장 실패",
      );
    } finally {
      setTesting(false);
    }
  }

  async function handleReadTestFile() {
    if (!savedAttachment) {
      setTestResult("먼저 테스트 파일을 Local에 저장해주세요.");
      return;
    }

    setTesting(true);
    setTestResult("");

    try {
      const file = await readLocalAttachment(savedAttachment);

      const text = await file.text();

      setTestResult(
        [
          "Local 읽기 성공",
          `원본 이름: ${savedAttachment.name}`,
          `저장 파일명: ${file.name}`,
          `크기: ${file.size} bytes`,
          `MIME: ${file.type || "(없음)"}`,
          "",
          "----- 파일 내용 -----",
          text,
        ].join("\n"),
      );

      console.log("[LocalAttachmentTest] read:", file);
    } catch (error) {
      console.error("[LocalAttachmentTest] read failed:", error);

      setTestResult(
        error instanceof Error ? `읽기 실패: ${error.message}` : "읽기 실패",
      );
    } finally {
      setTesting(false);
    }
  }

  async function handleDeleteTestFile() {
    if (!savedAttachment) {
      setTestResult("삭제할 Local 테스트 첨부파일이 없습니다.");
      return;
    }

    setTesting(true);
    setTestResult("");

    try {
      const deletedPath = savedAttachment.path;

      await deleteLocalAttachment(savedAttachment);

      setSavedAttachment(null);

      setTestResult(
        ["Local 삭제 성공", `삭제된 경로: ${deletedPath}`].join("\n"),
      );

      console.log("[LocalAttachmentTest] deleted:", deletedPath);
    } catch (error) {
      console.error("[LocalAttachmentTest] delete failed:", error);

      setTestResult(
        error instanceof Error ? `삭제 실패: ${error.message}` : "삭제 실패",
      );
    } finally {
      setTesting(false);
    }
  }

  const [state, setState] = useState<DirectoryState>({
    loading: true,
    name: null,
    permission: null,
    error: null,
  });

  async function refreshState() {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const handle = await loadAttachmentRootDirectory();

      if (!handle) {
        setState({
          loading: false,
          name: null,
          permission: null,
          error: null,
        });

        return;
      }

      const permission = await getAttachmentRootPermission(handle);

      setState({
        loading: false,
        name: handle.name,
        permission,
        error: null,
      });
    } catch (error) {
      console.error("[LocalAttachment] directory state check failed:", error);

      setState({
        loading: false,
        name: null,
        permission: null,
        error:
          error instanceof Error
            ? error.message
            : "로컬 폴더 상태를 확인하지 못했습니다.",
      });
    }
  }

  useEffect(() => {
    void refreshState();
  }, []);

  async function handleSelect() {
    try {
      const handle = await selectAttachmentRootDirectory();

      const permission = await getAttachmentRootPermission(handle);

      setState({
        loading: false,
        name: handle.name,
        permission,
        error: null,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("[LocalAttachment] directory selection failed:", error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "로컬 폴더를 선택하지 못했습니다.",
      }));
    }
  }

  async function handleRequestPermission() {
    try {
      const handle = await loadAttachmentRootDirectory();

      if (!handle) {
        setState((prev) => ({
          ...prev,
          error: "먼저 로컬 폴더를 선택해주세요.",
        }));

        return;
      }

      const granted = await requestAttachmentRootPermission(handle);

      const permission = await getAttachmentRootPermission(handle);

      setState({
        loading: false,
        name: handle.name,
        permission,
        error: granted ? null : "로컬 폴더 접근 권한이 허용되지 않았습니다.",
      });
    } catch (error) {
      console.error("[LocalAttachment] permission request failed:", error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "폴더 접근 권한을 요청하지 못했습니다.",
      }));
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectAttachmentRootDirectory();

      setState({
        loading: false,
        name: null,
        permission: null,
        error: null,
      });
    } catch (error) {
      console.error("[LocalAttachment] directory disconnect failed:", error);

      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "로컬 폴더 연결을 해제하지 못했습니다.",
      }));
    }
  }

  function getPermissionLabel() {
    if (!state.name) {
      return "연결 안 됨";
    }

    if (state.permission === "granted") {
      return "읽기/쓰기 가능";
    }

    if (state.permission === "prompt") {
      return "권한 재확인 필요";
    }

    if (state.permission === "denied") {
      return "권한 거부됨";
    }

    return "확인되지 않음";
  }

  return (
    <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text-1)]">
          로컬 첨부파일 저장소 테스트
        </h2>

        <p className="mt-1 text-sm text-[var(--text-4)]">
          Shiori가 첨부파일을 저장할 로컬 폴더 연결 상태를 확인합니다.
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-[var(--text-5)]">선택된 폴더:</span>{" "}
          <span className="font-medium text-[var(--text-2)]">
            {state.name ?? "없음"}
          </span>
        </div>

        <div>
          <span className="text-[var(--text-5)]">접근 상태:</span>{" "}
          <span className="font-medium text-[var(--text-2)]">
            {state.loading ? "확인 중..." : getPermissionLabel()}
          </span>
        </div>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-xl border border-[var(--danger)] p-3 text-sm text-[var(--danger)]">
          {state.error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void handleSelect()}>
          폴더 선택
        </button>

        <button type="button" onClick={() => void refreshState()}>
          상태 새로고침
        </button>

        {state.name && state.permission !== "granted" ? (
          <button type="button" onClick={() => void handleRequestPermission()}>
            접근 권한 요청
          </button>
        ) : null}

        {state.name ? (
          <button type="button" onClick={() => void handleDisconnect()}>
            연결 해제
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[var(--border-soft)] pt-5">
        <h3 className="text-sm font-semibold text-[var(--text-2)]">
          Local 파일 I/O 테스트
        </h3>

        <p className="mt-1 text-xs text-[var(--text-5)]">
          테스트 파일을 실제 Local attachment 폴더에 저장하고 다시 읽거나
          삭제합니다.
        </p>

        <div className="mt-4">
          <input
            type="file"
            disabled={testing}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;

              setTestFile(file);
              setSavedAttachment(null);
              setTestResult("");
            }}
          />
        </div>

        {testFile ? (
          <div className="mt-3 text-xs text-[var(--text-4)]">
            선택 파일: {testFile.name} · {testFile.size} bytes
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={testing || !testFile}
            onClick={() => void handleSaveTestFile()}
          >
            Local 저장
          </button>

          <button
            type="button"
            disabled={testing || !savedAttachment}
            onClick={() => void handleReadTestFile()}
          >
            Local 읽기
          </button>

          <button
            type="button"
            disabled={testing || !savedAttachment}
            onClick={() => void handleDeleteTestFile()}
          >
            Local 삭제
          </button>
        </div>

        {savedAttachment ? (
          <div className="mt-4 rounded-xl border border-[var(--border-soft)] p-3 text-xs">
            <div>ID: {savedAttachment.id}</div>

            <div className="mt-1 break-all">Path: {savedAttachment.path}</div>

            <div className="mt-1">Storage: {savedAttachment.storageType}</div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void handleRecoverPendingAttachments();
          }}
        >
          고아 첨부파일 검사
        </button>

        {testResult ? (
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elev-2)] p-3 text-xs text-[var(--text-3)]">
            {testResult}
          </pre>
        ) : null}
      </div>
    </section>
  );
}
