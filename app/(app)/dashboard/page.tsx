import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Coffee, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  primary_color: string
  stamp_icon: string
  stamps_required: number
  reward_description: string
  reward_type: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  owner_id: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener clubes del usuario
  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clubs:', error)
  }

  const typedClubs = (clubs as Club[]) || []
  const publishedClubs = typedClubs.filter(c => c.status === 'published')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bienvenido, {user.user_metadata?.full_name || 'Usuario'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus clubes de lealtad
          </p>
        </div>
        <Link
          href="/clubs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4" />
          Crear Club
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clubes activos</p>
              <p className="text-2xl font-bold text-foreground">
                {publishedClubs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros totales</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visitas este mes</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clubes */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Tus Clubes
        </h2>
        
        {typedClubs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {typedClubs.map((club) => (
              <div
                key={club.id}
                className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: club.primary_color + '20' }}
                  >
                    <Coffee className="w-6 h-6" style={{ color: club.primary_color }} />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      club.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {club.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1">{club.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{club.reward_description}</p>

                {/* Botones de acción rápida */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Coffee className="w-4 h-4 text-primary" />
                    <span className="text-xs">Detalle</span>
                  </Link>
                  <Link
                    href={`/clubs/${club.id}/kiosk`}
                    className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-xs">Kiosco</span>
                  </Link>
                  <Link
                    href={`/clubs/${club.id}/analytics`}
                    className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs">Stats</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center">
            <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tienes clubes aún
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer club de lealtad y empieza a fidelizar clientes
            </p>
            <Link
              href="/clubs/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <PlusCircle className="w-4 h-4" />
              Crear mi primer club
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}