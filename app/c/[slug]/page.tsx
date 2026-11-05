import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Coffee, Users, Award } from 'lucide-react'

interface ClubPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar el club por slug
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !club) {
    notFound()
  }

  // Contar miembros del club
  const { count: membersCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">La Décima</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Logo del negocio */}
        {club.logo_url ? (
          <div className="flex justify-center mb-8">
            <img 
              src={club.logo_url} 
              alt={club.name}
              className="w-32 h-32 rounded-2xl object-cover shadow-lg"
            />
          </div>
        ) : (
          <div 
            className="w-32 h-32 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: club.primary_color }}
          >
            <Coffee className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Información del club */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: club.primary_color }}>
            {club.name}
          </h1>
          {club.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {club.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 text-center border">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{membersCount || 0}</div>
            <div className="text-xs text-muted-foreground">Miembros</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center border">
            <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{club.stamps_required}</div>
            <div className="text-xs text-muted-foreground">Sellos</div>
          </div>
          <div className="bg-card rounded-lg p-4 text-center border">
            <Coffee className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">1</div>
            <div className="text-xs text-muted-foreground">Recompensa</div>
          </div>
        </div>

        {/* Recompensa */}
        <div className="bg-card border-2 rounded-xl p-8 mb-8 text-center" 
             style={{ borderColor: club.primary_color }}>
          <Award className="w-12 h-12 mx-auto mb-4" style={{ color: club.primary_color }} />
          <h2 className="text-2xl font-bold mb-2">Tu recompensa</h2>
          <p className="text-xl" style={{ color: club.primary_color }}>
            {club.reward_description}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Junta {club.stamps_required} sellos y canjea tu premio
          </p>
        </div>

        {/* Botón de Unirse */}
        <Link
          href={`/c/${club.slug}/join`}
          className="block w-full rounded-lg py-4 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: club.primary_color }}
        >
          Unirme al club
        </Link>

        {/* Cómo funciona */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-bold text-center mb-6">¿Cómo funciona?</h3>
          
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                 style={{ backgroundColor: club.primary_color }}>
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Únete gratis</h4>
              <p className="text-sm text-muted-foreground">
                Regístrate con tu nombre y correo. Es rápido y sin costo.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                 style={{ backgroundColor: club.primary_color }}>
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Visita y gana sellos</h4>
              <p className="text-sm text-muted-foreground">
                Cada vez que compres, muestra tu tarjeta digital y recibe un sello.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                 style={{ backgroundColor: club.primary_color }}>
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Canjea tu recompensa</h4>
              <p className="text-sm text-muted-foreground">
                Al completar {club.stamps_required} sellos, ¡tu {club.reward_description} es tuya!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}