import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/clubs', '/members', '/analytics']
  
  // Rutas públicas
  const publicRoutes = ['/', '/login', '/auth', '/c/']

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Si es ruta protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !isPublicRoute) {
    const hasSession = response.cookies.get('sb-access-token')
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}