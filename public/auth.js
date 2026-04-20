import { loadPublicConfig } from "./config.js";

let supabaseClientPromise;

async function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = (async () => {
      const { supabaseUrl, supabaseAnonKey } = await loadPublicConfig();

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Configure SUPABASE_URL e SUPABASE_ANON_KEY.");
      }

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    })();
  }

  return supabaseClientPromise;
}

export async function getSession() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function signInWithEmail(email) {
  const client = await getSupabaseClient();
  const { appUrl } = await loadPublicConfig();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: appUrl || window.location.origin
    }
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function signOut() {
  const client = await getSupabaseClient();
  await client.auth.signOut();
}
