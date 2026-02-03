import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // URL에 붙은 access_token 처리
      await supabase.auth.getSession();
      navigate("/", { replace: true });
    };

    run();
  }, [navigate]);

  return <div className="p-6">로그인 처리 중...</div>;
}
