import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Primero, dejamos que Supabase actualice/refresh la sesión si es necesario
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // 2. Definir rutas públicas (CUALQUIERA puede verlas sin login)
  const publicRoutes = [
    '/', 
    '/login', 
    '/auth', 
    '/c/',      // Landing page por slug
    '/join',    // Página de unirse por ID
    '/api/webhooks' // Webhooks (si los usas)
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 3. Si NO es una ruta pública, entonces es protegida. Verificamos autenticación.
  if (!isPublicRoute) {
    // Buscamos CUALQUIER cookie de autenticación de Supabase 
    // (empieza con 'sb-' y contiene 'auth-token', sin importar el nombre del proyecto)
    const hasAuthCookie = response.cookies.getAll().some(
      cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
    )

    if (!hasAuthCookie) {
      // No hay sesión válida, redirigir al login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname) // Para volver después del login
      return NextResponse.redirect(loginUrl)
    }
  }

  // 4. Si es pública o tiene sesión válida, dejamos pasar la petición
  return response
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y de imagen del middleware para mejorar rendimiento
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}