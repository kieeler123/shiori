import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { Button } from "@/shared/ui/primitives/Button";
import { PageContainer } from "@/app/layout/PageContainer";
import { previewText } from "../../utils/previewOneLine";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import {
  dbLogsTrashHardDelete,
  dbLogsTrashListMine,
  dbLogsTrashRestore,
} from "../../repo/trashRepo";

export default function TrashPage() {
  const { isAuthed } = useSession();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!isAuthed) return;
    const data = await dbLogsTrashListMine();
    setItems(data ?? []);
  }

  useEffect(() => {
    load();
  }, [isAuthed]);

  async function restore(id: string) {
    setBusy(true);
    await dbLogsTrashRestore(id);
    await load();
    setBusy(false);
  }

  async function hardDelete(id: string) {
    if (!confirm("완전 삭제됩니다. 복구 불가")) return;
    setBusy(true);
    await dbLogsTrashHardDelete(id);
    await load();
    setBusy(false);
  }

  if (!isAuthed) return <div className="p-6">로그인 필요</div>;

  return (
    <PageContainer>
      <h1 className="mb-6 text-xl font-semibold">🗑 휴지통</h1>

      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">삭제된 글이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <SurfaceCard
              key={it.id}
              className="space-y-2 text-left rounded-2xl p-4"
            >
              <div className="font-medium">{it.title || "(제목 없음)"}</div>

              {/* ✅ 1줄 미리보기(원하면 content 매핑해서 넣어) */}
              {it.content ? (
                <div className="mt-1 truncate text-xs text-zinc-400">
                  {previewText(it.content, 110)}
                </div>
              ) : null}

              <div className="text-xs text-zinc-500 mt-1">
                {new Date(it.created_at).toLocaleString()}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="soft"
                  onClick={() => restore(it.id)}
                  disabled={busy}
                >
                  복구
                </Button>
                <Button
                  variant="danger"
                  onClick={() => hardDelete(it.id)}
                  disabled={busy}
                  className="px-3 py-1 rounded border text-xs text-red-400"
                >
                  완전삭제
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}

      <Button variant="nav" onClick={() => nav(-1)} className="mt-6">
        뒤로
      </Button>
    </PageContainer>
  );
}
