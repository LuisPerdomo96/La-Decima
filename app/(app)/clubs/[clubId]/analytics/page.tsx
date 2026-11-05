import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Coffee, TrendingUp, Award } from 'lucide-react'
import { AnalyticsClient } from '@/components/analytics/analytics-client'

export const dynamic = 'force-dynamic'

interface AnalyticsPageProps {
  params: Promise<{
    clubId: string
  }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { clubId } = await params
  const supabase = await createClient()

  // Obtener club
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (clubError || !club) {
    notFound()
  }

  // Obtener miembros
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('club_id', clubId)

  // Obtener sellos (visitas)
  const { data: stamps } = await supabase
    .from('stamps')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: true })

  // Obtener recompensas
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('club_id', clubId)

  // Calcular métricas
  const totalMembers = members?.length || 0
  const totalVisits = stamps?.length || 0
  const totalRewards = rewards?.filter(r => r.status === 'delivered').length || 0

  // Miembros nuevos (30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newMembers30d = members?.filter(m => new Date(m.joined_at) >= thirtyDaysAgo).length || 0

  // Miembros activos (30 días)
  const activeMembers30d = members?.filter(m => {
    if (!m.last_visit_at) return false
    return new Date(m.last_visit_at) >= thirtyDaysAgo
  }).length || 0

  // Tasa de retención
  const retentionRate = totalMembers > 0 
    ? Math.round((activeMembers30d / totalMembers) * 100) 
    : 0

  // Segmentación de clientes
  const segments = {
    nuevos: members?.filter(m => {
      const joined = new Date(m.joined_at)
      return joined >= thirtyDaysAgo
    }).length || 0,
    fieles: members?.filter(m => {
      if (!m.last_visit_at) return false
      const visits = stamps?.filter(s => s.member_id === m.id).length || 0
      return visits >= 5
    }).length || 0,
    regulares: members?.filter(m => {
      if (!m.last_visit_at) return false
      const lastVisit = new Date(m.last_visit_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastVisit >= thirtyDaysAgo
    }).length || 0,
    atrasados: members?.filter(m => {
      if (!m.last_visit_at) return false
      const lastVisit = new Date(m.last_visit_at)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      return lastVisit < sixtyDaysAgo && lastVisit >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }).length || 0,
    dormidos: members?.filter(m => {
      if (!m.last_visit_at) return true
      const lastVisit = new Date(m.last_visit_at)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      return lastVisit < ninetyDaysAgo
    }).length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/clubs/${clubId}`}
          className="rounded-md border p-2 hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Analíticas</h1>
          <p className="text-muted-foreground">{club.name}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalMembers}</p>
          <p className="text-sm text-muted-foreground">Miembros totales</p>
          <p className="text-xs text-green-600 mt-1">+{newMembers30d} este mes</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Coffee className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalVisits}</p>
          <p className="text-sm text-muted-foreground">Visitas totales</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalMembers > 0 ? (totalVisits / totalMembers).toFixed(1) : 0} por miembro
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{retentionRate}%</p>
          <p className="text-sm text-muted-foreground">Retención 30d</p>
          <p className="text-xs text-muted-foreground mt-1">{activeMembers30d} activos</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Award className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{totalRewards}</p>
          <p className="text-sm text-muted-foreground">Recompensas entregadas</p>
        </div>
      </div>

      {/* Gráficas y datos */}
      <AnalyticsClient
        members={members || []}
        stamps={stamps || []}
        rewards={rewards || []}
        club={club}
        segments={segments}
      />
    </div>
  )
}