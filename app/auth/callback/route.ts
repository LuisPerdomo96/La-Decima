import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('🔍 [Auth Callback] URL completa:', request.url)
  console.log('🔍 [Auth Callback] Origin detectado:', origin)
  console.log('🔍 [Auth Callback] Código:', code ? '✅ Presente' : '❌ Ausente')

  if (code) {
    const supabase = await createClient()
    console.log('🔄 [Auth Callback] Intercambiando código por sesión...')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ [Auth Callback] Error en exchangeCodeForSession:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
    
    console.log('✅ [Auth Callback] Sesión creada exitosamente para:', data?.user?.email)
    
    // Redirigir al dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  console.log('⚠️ [Auth Callback] No se encontró código, redirigiendo a login')
  return NextResponse.redirect(`${origin}/login`)
}