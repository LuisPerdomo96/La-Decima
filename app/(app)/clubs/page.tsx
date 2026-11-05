import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Coffee, Users, MoreVertical } from 'lucide-react'

export default async function ClubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Clubes</h1>
          <p className="text-muted-foreground">Todos tus programas de lealtad</p>
        </div>
        <Link
          href="/clubs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4" />
          Crear Club
        </Link>
      </div>

      {clubs && clubs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow group"
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
                      : club.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {club.status === 'published' ? 'Publicado' : club.status === 'draft' ? 'Borrador' : 'Archivado'}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                {club.reward_description}
              </p>

              <div className="flex items-center justify-between text-sm pt-3 border-t">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {club.stamps_required} sellos
                </span>
                <span className="text-primary font-medium">
                  Ver detalles →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center">
          <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes clubes aún</h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primer club de lealtad y empieza a fidelizar clientes
          </p>
          <Link
            href="/clubs/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="w-4 h-4" />
            Crear mi primer club
          </Link>
        </div>
      )}
    </div>
  )
}