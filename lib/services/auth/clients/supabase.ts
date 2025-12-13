"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { SignInAnonymouslyCredentials } from "@supabase/supabase-js";

export async function signInWithProvider(
  provider: "google" | "github"
): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_REDIRECT_URI,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInAnonymously(
  options: SignInAnonymouslyCredentials = {}
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInAnonymously(options);
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}

export async function isLoggedIn(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
