// lib/supabase/browserClient.js
// Session-aware Supabase client for use in Client Components under
// app/admin/. Unlike lib/supabaseClient.js (anon key, public storefront
// reads only), this client carries the logged-in admin's auth session via
// cookies, so it can perform the authenticated writes allowed by the RLS
// policies in supabase/schema.sql.
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — check .env.local'
  )
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}