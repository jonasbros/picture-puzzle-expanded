"use client";

export const LoginBtn = () => {
  const handleGoogleSignIn = () => {
    // Direct redirect to Supabase auth URL bypasses PKCE issues
    window.location.href = `http://localhost:54321/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      window.location.origin + "/auth/callback"
    )}`;
  };

  return (
    <button onClick={handleGoogleSignIn} className="btn btn-primary">
      Sign in with Google
    </button>
  );
};
