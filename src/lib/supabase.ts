import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (typeof window !== 'undefined') {
  console.log('[supabase] URL:', url || 'MISSING')
  console.log('[supabase] KEY:', key ? `${key.slice(0, 8)}...` : 'MISSING')
  console.log('[supabase] Using URL:', url || '(empty)')
}

export const supabase = createClient(url || '', key || '')
