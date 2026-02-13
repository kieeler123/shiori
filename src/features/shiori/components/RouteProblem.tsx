import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/primitives/Button";

export default function RouteProblem(props: {
  title?: string;
  message: string;
  hint?: string;
}) {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-app t2 grid place-items-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elev-1)] p-6">
        <h2 className="text-lg font-semibold t2">
          {props.title ?? "잘못된 경로"}
        </h2>

        <p className="mt-2 text-sm t3">{props.message}</p>

        {props.hint && (
          <p className="mt-2 text-xs t5 whitespace-pre-line">{props.hint}</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={() => nav("/logs")}>
            목록으로
          </Button>

          <Button variant="outline" onClick={() => nav("/logs/new")}>
            새 글 작성
          </Button>
        </div>
      </div>
    </div>
  );
}
