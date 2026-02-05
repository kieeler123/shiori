import { useNavigate } from "react-router-dom";

export default function RouteProblem(props: {
  title?: string;
  message: string;
  hint?: string;
}) {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold">
          {props.title ?? "잘못된 경로"}
        </h2>

        <p className="mt-2 text-sm text-zinc-300">{props.message}</p>

        {props.hint && (
          <p className="mt-2 text-xs text-zinc-500 whitespace-pre-line">
            {props.hint}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            className="rounded-xl px-3 py-2 text-sm bg-zinc-100 text-zinc-900 hover:bg-white"
            onClick={() => nav("/logs")}
          >
            목록으로
          </button>
          <button
            className="rounded-xl px-3 py-2 text-sm border border-zinc-700/60 hover:bg-zinc-900/60"
            onClick={() => nav("/logs/new")}
          >
            새 글 작성
          </button>
        </div>
      </div>
    </div>
  );
}
