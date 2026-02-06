// src/features/account/components/PasswordSection.tsx
import { useState } from "react";
import { useAccountActions } from "../hooks/useAccountActions";

export default function PasswordSection() {
  const { loading, error, updatePassword } = useAccountActions();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  async function onSave() {
    if (pw.length < 8) return alert("비밀번호는 8자 이상 권장.");
    if (pw !== pw2) return alert("비밀번호 확인이 일치하지 않아.");
    const ok = await updatePassword(pw);
    if (ok) {
      alert("비밀번호 변경 완료");
      setPw("");
      setPw2("");
    }
  }

  return (
    <section
      style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>보안</h2>

      <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
        새 비밀번호
      </label>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ height: 10 }} />

      <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
        새 비밀번호 확인
      </label>
      <input
        type="password"
        value={pw2}
        onChange={(e) => setPw2(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ height: 10 }} />
      <button
        onClick={onSave}
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      >
        변경
      </button>

      {error && <p style={{ marginTop: 8, fontSize: 12 }}>{error}</p>}
    </section>
  );
}
