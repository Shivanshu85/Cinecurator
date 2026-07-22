"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getLocalSession, clearLocalSession } from "@/lib/authHelper";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const updateAuth = () => {
      const local = getLocalSession();
      if (local) {
        setUser(local);
        setLoading(false);
        return;
      }

      supabase.auth
        .getUser()
        .then(({ data, error }) => {
          if (!error && data?.user) {
            setUser(data.user);
          } else if (!local) {
            setUser(null);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };

    updateAuth();

    // Listen to custom auth events
    window.addEventListener("cinecurator_auth_change", updateAuth);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const local = getLocalSession();
        setUser(local);
      }
    });

    return () => {
      window.removeEventListener("cinecurator_auth_change", updateAuth);
      listener.subscription?.unsubscribe();
    };
  }, []);

  async function signOut() {
    clearLocalSession();
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
  }

  return { user, loading, signOut };
}
