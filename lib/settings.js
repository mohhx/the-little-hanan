// lib/settings.js
// Public read of the key/value settings table — currently just the bank
// transfer details + WhatsApp number shown at checkout. Same anon-client
// pattern as lib/products.js. Admin writes are NOT here; the admin
// Settings page reads/updates inline via lib/supabase/serverClient.js and
// lib/supabase/browserClient.js, matching the products admin pages.
import { supabase } from './supabaseClient'

// Sensible fallback if the table is unreachable — keeps checkout from
// showing blank/undefined bank details, at the cost of an obviously-fake
// placeholder rather than a broken page.
const FALLBACK_SETTINGS = {
  bank_name: '',
  account_number: '',
  account_name: '',
  whatsapp_number: '',
}

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('key, value')

  if (error) {
    console.error('getSettings failed:', error.message)
    return { ...FALLBACK_SETTINGS }
  }

  const settings = { ...FALLBACK_SETTINGS }
  for (const row of data) {
    settings[row.key] = row.value
  }
  return settings
}