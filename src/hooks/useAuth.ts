import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser, getDisplayName, signOut as authSignOut } from "../utils/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  return {
    user,
    userName: getDisplayName(user),
    loading,
    signOut,
  };
}
