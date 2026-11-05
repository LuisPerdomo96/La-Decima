import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Search, Coffee, Download, ArrowLeft } from 'lucide-react'
import { MembersClient } from '@/components/members/members-client'

export const dynamic = 'force-dynamic'
interface MembersPageProps {
  params: Promise<{
    clubId: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
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

  // Obtener miembros con sus datos
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: false })

  if (membersError) {
    console.error('Error fetching members:', membersError)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/clubs/${clubId}`}
            className="rounded-md border p-2 hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Miembros</h1>
            <p className="text-muted-foreground">{club.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total miembros</p>
          <p className="text-2xl font-bold">{members?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Nuevos (30 días)</p>
          <p className="text-2xl font-bold">
            {members?.filter(m => {
              const joined = new Date(m.joined_at)
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return joined >= thirtyDaysAgo
            }).length || 0}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Activos (30 días)</p>
          <p className="text-2xl font-bold">
            {members?.filter(m => {
              if (!m.last_visit_at) return false
              const lastVisit = new Date(m.last_visit_at)
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return lastVisit >= thirtyDaysAgo
            }).length || 0}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Sellos promedio</p>
          <p className="text-2xl font-bold">
            {members && members.length > 0
              ? Math.round(members.reduce((acc, m) => acc + m.current_stamps, 0) / members.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Lista de miembros */}
      <MembersClient members={members || []} club={club} />
    </div>
  )
}