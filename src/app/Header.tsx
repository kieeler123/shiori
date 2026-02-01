import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/useAuth";

export default function Header() {
  const { user } = useAuth();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header">
      <h1>Shiori</h1>

      {user ? (
        <div className="profile">
          <img
            src={user.user_metadata.avatar_url}
            alt="profile"
            className="avatar"
          />
          <span>{user.user_metadata.full_name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </header>
  );
}
