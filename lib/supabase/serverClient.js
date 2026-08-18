// lib/supabase/serverClient.js
// Session-aware Supabase client for use in Server Components and Route
// Handlers under app/admin/. Reads the admin's auth session from request
// cookies (set by middleware.js after login) so server-rendered admin pages
// can check `auth.getUser()` before rendering.
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — check .env.local'
  )
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore since middleware.js already refreshes the session on
          // every request.
        }
      },
    },
  })
}