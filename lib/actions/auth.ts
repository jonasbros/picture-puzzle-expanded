"use server";

import * as supabaseAuth from "../services/supabase/auth";

export async function signInWithProvider(provider: "google" | "github") {
  await supabaseAuth.signInWithProvider(provider);
}

export async function signOut() {
  await supabaseAuth.signOut();
}
