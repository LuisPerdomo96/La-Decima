import Link from 'next/link'
import { Coffee, LayoutDashboard, Users, PlusCircle, BarChart3, LogOut } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Coffee className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold">La Décima</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/clubs" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
          <Coffee className="w-5 h-5" />
          Mis Clubes
        </Link>
        <Link href="/clubs/new" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
          <PlusCircle className="w-5 h-5" />
          Crear Club
        </Link>
        <Link href="/members" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
          <Users className="w-5 h-5" />
          Miembros
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
          <BarChart3 className="w-5 h-5" />
          Analíticas
        </Link>
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent w-full">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}