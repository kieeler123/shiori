import { useAccountActions } from "../hooks/useAccountActions";

export default function DangerZone() {
  const { loading, error, softDeleteAccount } = useAccountActions();

  async function onDelete() {
    const ok1 = window.confirm("정말 탈퇴하시겠습니까?");
    if (!ok1) return;

    const ok2 = window.confirm(
      "삭제 유예기간이 지나면 복구가 어려울 수 있습니다. 계속할까요?",
    );
    if (!ok2) return;

    const ok = await softDeleteAccount();
    if (ok) alert("탈퇴 처리 완료 (로그아웃됨)");
  }

  return (
    <section
      style={{ border: "1px solid #f2c0c0", borderRadius: 12, padding: 12 }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
        Danger Zone
      </h2>
      <p style={{ fontSize: 13, marginBottom: 10 }}>
        탈퇴 시 계정은 비활성화되며, 일정 기간 후 완전 삭제될 수 있습니다.
      </p>

      <button
        onClick={onDelete}
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #f2c0c0",
        }}
      >
        회원 탈퇴
      </button>

      {error && <p style={{ marginTop: 8, fontSize: 12 }}>{error}</p>}
    </section>
  );
}
