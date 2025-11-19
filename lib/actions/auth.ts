"use server";

import authClient from "../services/auth/client";

const AUTH_CLIENT = "supabase";

async function getClient() {
  return await authClient(AUTH_CLIENT);
}

export async function signInWithProvider(provider: "google") {
  const client = await getClient();
  await client.signInWithProvider(provider);
}

export async function signOut() {
  const client = await getClient();
  await client.signOut();
}

export async function isLoggedIn() {
  const client = await getClient();
  return await client.isLoggedIn();
}

export async function getUser() {
  const client = await getClient();
  return await client.getUser();
}
