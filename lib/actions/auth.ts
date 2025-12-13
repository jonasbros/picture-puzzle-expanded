'use server';

import { User } from '@supabase/supabase-js';
import authClient from '../services/auth/client';
import { SignInAnonymouslyCredentials } from '@supabase/supabase-js';

const AUTH_CLIENT = 'supabase';

async function getClient() {
  return await authClient(AUTH_CLIENT);
}

export async function signInWithProvider(provider: 'google') {
  const client = await getClient();
  await client.signInWithProvider(provider);
}

export async function signInAnonymously(
  options: SignInAnonymouslyCredentials = {}
) {
  const client = await getClient();
  return await client.signInAnonymously(options);
}

export async function signOut() {
  const client = await getClient();
  await client.signOut();
}

export async function isLoggedIn(): Promise<boolean> {
  const client = await getClient();
  return await client.isLoggedIn();
}

export async function getUser(): Promise<User | null> {
  const client = await getClient();
  return await client.getUser();
}
