"use client";

import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/database.types";

export async function getBrowserAccountSession() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.session.user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  return {
    session: data.session,
    role: profile?.role ?? null,
  } satisfies {
    session: NonNullable<typeof data.session>;
    role: Database["public"]["Enums"]["user_role"] | null;
  };
}

export async function getCustomerAccessToken() {
  const account = await getBrowserAccountSession();
  return account?.role === "pelanggan" ? account.session.access_token : null;
}
