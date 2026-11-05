import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // El usuario está autenticado, redirigir al dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si hay error o no hay código, volver al login
  return NextResponse.redirect(`${origin}/login`)
}