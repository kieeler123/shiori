import { useState } from "react";
import { useSession } from "@/features/auth/useSession";
import {
  exportMyLogs,
  importLegacyLogsUpsert,
} from "@/features/shiori/tools/importExport";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default function ImportExportPage() {
  const { ready, isAuthed } = useSession();
  const [msg, setMsg] = useState("");

  const onImportFile = async (file: File | null) => {
    if (!file) return;

    setMsg("importing...");
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await importLegacyLogsUpsert(json, {
        defaultTags: ["import"],
        categoryToTag: true,
        chunkSize: 100,
        sourceId: "jp-dev-study-log-next",
      });

      setMsg(
        `done: total=${res.total} upserted=${res.upserted} skipped=${res.skipped} errors=${res.errors.length}`,
      );
      if (res.errors.length) console.warn("import errors:", res.errors);
    } catch (e: any) {
      console.error(e);
      setMsg(`error: ${e?.message ?? String(e)}`);
    }
  };

  const onExport = async (from: "view" | "base") => {
    setMsg("exporting...");
    try {
      const data = await exportMyLogs({
        from,
        includeDeleted: true,
        limit: 5000,
      });

      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      downloadJson(`shiori-export-${from}-${y}${m}${day}.json`, data);
      setMsg(`exported: ${data.count}`);
    } catch (e: any) {
      console.error(e);
      setMsg(`error: ${e?.message ?? String(e)}`);
    }
  };

  if (!ready) return <div className="p-6 text-sm">세션 확인중...</div>;
  if (!isAuthed) return <div className="p-6 text-sm">로그인 필요</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Dev Import/Export</h1>

      <section className="space-y-2">
        <div className="text-sm font-medium">Import (legacy JSON)</div>
        <input
          type="file"
          accept="application/json"
          onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
        />
        <div className="text-xs opacity-70">
          배열 형태 or {"{ logs: [...] }"} 형태 둘 다 지원
        </div>
        <div className="text-xs opacity-70">
          ✅ 원본 date는 source_date로 저장되고, created_at은 import 시점(DB
          기본값) 유지
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-medium">Export</div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded border"
            onClick={() => onExport("view")}
          >
            Export view (정제된 목록)
          </button>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => onExport("base")}
          >
            Export base (원본)
          </button>
        </div>
      </section>

      {msg ? <pre className="text-xs bg-black/5 p-3 rounded">{msg}</pre> : null}
    </div>
  );
}
