import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  Coffee,
} from 'lucide-react'

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Clubes', href: '/clubs', icon: Coffee },
    { name: 'Crear Club', href: '/clubs/new', icon: PlusCircle },
    { name: 'Miembros', href: '/members', icon: Users },
    { name: 'Analíticas', href: '/analytics', icon: BarChart3 },
  ]

  // Obtener nombre y avatar de forma segura
  const userName = user.user_metadata?.full_name || 'Usuario'
  const userAvatar = user.user_metadata?.avatar_url
  const userEmail = user.email || ''
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">La Décima</span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Perfil del usuario */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {userInitial}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}