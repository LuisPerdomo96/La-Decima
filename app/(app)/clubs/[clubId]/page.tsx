import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Coffee, 
  Users, 
  QrCode, 
  Settings, 
  BarChart3, 
  ExternalLink
} from 'lucide-react'
import { CopyButton } from '@/components/ui/copy-button'
import { FormattedDate } from '@/components/ui/formatted-date'

export const dynamic = 'force-dynamic'

interface ClubDetailPageProps {
  params: Promise<{
    clubId: string
  }>
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { clubId } = await params
  const supabase = await createClient()

  // Obtener datos del club
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (error || !club) {
    notFound()
  }

  // Contar miembros
  const { count: membersCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)

  // Contar sellos totales
  const { count: stampsCount } = await supabase
    .from('stamps')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)

  // Contar recompensas entregadas
  const { count: rewardsCount } = await supabase
    .from('rewards')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)
    .eq('status', 'delivered')

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://la-decima.vercel.app/'}/c/${club.slug}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-muted-foreground">
            {club.status === 'published' ? '🟢 Publicado' : club.status === 'draft' ? '🟡 Borrador' : '⚫ Archivado'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clubs/${club.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Settings className="w-4 h-4" />
            Editar
          </Link>
          <Link
            href={`/clubs/${club.id}/kiosk`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <QrCode className="w-4 h-4" />
            Abrir Kiosco
          </Link>
          <Link
            href={`/clubs/${club.id}/settings`}
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{membersCount || 0}</p>
          <p className="text-sm text-muted-foreground">Miembros</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Coffee className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stampsCount || 0}</p>
          <p className="text-sm text-muted-foreground">Sellos dados</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Coffee className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{club.stamps_required}</p>
          <p className="text-sm text-muted-foreground">Sellos por recompensa</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <Coffee className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{rewardsCount || 0}</p>
          <p className="text-sm text-muted-foreground">Recompensas entregadas</p>
        </div>
      </div>

      {/* Info del club */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Configuración</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color principal</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: club.primary_color }}
                />
                <span className="font-mono text-sm">{club.primary_color}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Icono del sello</span>
              <span className="capitalize">{club.stamp_icon.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recompensa</span>
              <span className="font-medium">{club.reward_description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado</span>
              <FormattedDate dateString={club.created_at} />
            </div>
          </div>
        </div>

        {/* Link público */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Link público</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">URL del club</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono"
                />
                <CopyButton text={publicUrl} />
              </div>
            </div>
            <Link
              href={`/c/${club.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver página pública
            </Link>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Acciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href={`/clubs/${club.id}/kiosk`}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <QrCode className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold">Modo Kiosco</p>
              <p className="text-sm text-muted-foreground">Escanear y dar sellos</p>
            </div>
          </Link>
          <Link
            href={`/clubs/${club.id}/members`}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold">Ver miembros</p>
              <p className="text-sm text-muted-foreground">Lista de clientes</p>
            </div>
          </Link>
          <Link
            href={`/clubs/${club.id}/analytics`}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold">Analíticas</p>
              <p className="text-sm text-muted-foreground">Ver estadísticas</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}