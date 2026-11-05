import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3, Coffee, Users, TrendingUp } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Calcular totales
  let totalMembers = 0
  let totalVisits = 0
  let totalRewards = 0

  for (const club of clubs || []) {
    const { count: m } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id)
    const { count: s } = await supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id)
    const { count: r } = await supabase
      .from('rewards')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id)
      .eq('status', 'delivered')

    totalMembers += m || 0
    totalVisits += s || 0
    totalRewards += r || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analíticas Generales</h1>
        <p className="text-muted-foreground">Resumen de todos tus clubes</p>
      </div>

      {/* KPIs Globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalMembers}</p>
          <p className="text-sm text-muted-foreground">Miembros totales</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Coffee className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalVisits}</p>
          <p className="text-sm text-muted-foreground">Visitas totales</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{clubs?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Clubes activos</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <BarChart3 className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalRewards}</p>
          <p className="text-sm text-muted-foreground">Recompensas entregadas</p>
        </div>
      </div>

      {/* Lista de clubes con acceso rápido */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Analíticas por club</h2>
        {clubs && clubs.length > 0 ? (
          <div className="space-y-2">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}/analytics`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: club.primary_color + '20' }}
                  >
                    <Coffee className="w-5 h-5" style={{ color: club.primary_color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{club.name}</p>
                    <p className="text-sm text-muted-foreground">{club.status}</p>
                  </div>
                </div>
                <span className="text-primary font-medium">Ver analíticas →</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No tienes clubes para analizar
          </p>
        )}
      </div>
    </div>
  )
}