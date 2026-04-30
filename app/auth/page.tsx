"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
        router.refresh();
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-black tracking-tighter text-[#e50914] mb-2">
            CineCurator
          </h1>
          <p className="text-on-surface-variant opacity-70 text-sm">
            Sign in to discover your perfect movies
          </p>
        </div>

        {/* Auth UI */}
        <div className="bg-surface-container rounded-2xl border border-white/10 p-8 shadow-2xl">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#e50914",
                    brandAccent: "#ff0b1a",
                    brandButtonText: "white",
                    defaultButtonBackground: "#201f1f",
                    defaultButtonBackgroundHover: "#2a2a2a",
                    defaultButtonBorder: "rgba(255,255,255,0.1)",
                    defaultButtonText: "#e5e2e1",
                    dividerBackground: "rgba(255,255,255,0.08)",
                    inputBackground: "rgba(0,0,0,0.4)",
                    inputBorder: "rgba(255,255,255,0.15)",
                    inputBorderHover: "#e50914",
                    inputBorderFocus: "#e50914",
                    inputText: "#e5e2e1",
                    inputLabelText: "#e9bcb6",
                    inputPlaceholder: "rgba(229,226,225,0.4)",
                    messageText: "#e9bcb6",
                    anchorTextColor: "#ffb4aa",
                    anchorTextHoverColor: "#e50914",
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Plus Jakarta Sans', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                    labelFontFamily: `'Inter', sans-serif`,
                  },
                  radii: {
                    borderRadiusButton: "0.5rem",
                    buttonBorderRadius: "0.5rem",
                    inputBorderRadius: "0.5rem",
                  },
                },
              },
              style: {
                container: { background: "transparent" },
                label: { color: "#e9bcb6", fontSize: "12px", letterSpacing: "0.05em" },
                button: {
                  fontWeight: "700",
                  padding: "12px 20px",
                },
                input: {
                  padding: "12px 16px",
                },
              },
            }}
            providers={["google"]}
            redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
}
