// lib/supabaseClient.js
// Uses the public anon key — safe in client bundles, access is governed by
// the RLS policies in supabase/schema.sql (public SELECT, no public writes).
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — check .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Next.js patches global fetch and caches responses by default, even
    // in dev — without this, Server Components can keep serving stale
    // (e.g. pre-migration empty) query results until a full rebuild.
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
})