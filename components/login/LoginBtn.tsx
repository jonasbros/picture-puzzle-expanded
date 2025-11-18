import { signInWithProvider } from "@/lib/actions/auth";

export const LoginBtn = async () => {
  return (
    <form
      action={async () => {
        "use server";
        await signInWithProvider("google");
      }}
    >
      <button type="submit" className="btn btn-primary">
        Sign in with Google
      </button>
    </form>
  );
};
