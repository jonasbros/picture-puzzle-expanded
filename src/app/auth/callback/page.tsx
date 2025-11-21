"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      
      // Parse hash fragments from implicit flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error("Set session error:", error);
            router.push("/auth/auth-code-error");
            return;
          }
          
          if (data.session) {
            console.log("Session created:", data.session.user.email);
            // Clear hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push("/");
            return;
          }
        } catch (error) {
          console.error("Auth callback error:", error);
        }
      }
      
      // No tokens found or session creation failed
      router.push("/auth/auth-code-error");
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
}