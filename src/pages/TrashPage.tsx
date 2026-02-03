import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  dbMyTrash,
  dbRestoreItem,
  dbHardDelete,
} from "@/features/shiori/repo/trashRepo";
import { useSession } from "@/features/auth/useSession";
import Header from "@/app/Header";

export default function TrashPage() {
  const { isAuthed } = useSession();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!isAuthed) return;
    const data = await dbMyTrash();
    setItems(data ?? []);
  }

  useEffect(() => {
    load();
  }, [isAuthed]);

  async function restore(id: string) {
    setBusy(true);
    await dbRestoreItem(id);
    await load();
    setBusy(false);
  }

  async function hardDelete(id: string) {
    if (!confirm("완전 삭제됩니다. 복구 불가")) return;
    setBusy(true);
    await dbHardDelete(id);
    await load();
    setBusy(false);
  }

  if (!isAuthed) return <div className="p-6">로그인 필요</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">🗑 휴지통</h1>

      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">삭제된 글이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border border-zinc-800 p-4">
              <div className="font-medium">{it.title || "(제목 없음)"}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {new Date(it.created_at).toLocaleString()}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => restore(it.id)}
                  disabled={busy}
                  className="px-3 py-1 rounded border text-xs"
                >
                  복구
                </button>
                <button
                  onClick={() => hardDelete(it.id)}
                  disabled={busy}
                  className="px-3 py-1 rounded border text-xs text-red-400"
                >
                  완전삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => nav(-1)} className="mt-6 text-sm text-zinc-400">
        뒤로
      </button>
    </div>
  );
}
