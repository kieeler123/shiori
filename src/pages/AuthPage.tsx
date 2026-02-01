import AuthBar from "@/features/auth/AuthBar";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Shiori는 로그인한 사용자만 작성/수정/삭제가 가능합니다.
        </p>
        <div className="mt-6">
          <AuthBar />
        </div>
      </div>
    </div>
  );
}
