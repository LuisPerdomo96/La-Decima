'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Coffee, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function JoinClubPage() {
  const params = useParams()
  const clubId = params.clubId as string

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadClub()
  }, [clubId])

  async function loadClub() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (error || !data) {
      setError('Club no encontrado')
    } else {
      setClub(data)
    }
    setLoading(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoining(true)
    setError('')

    // Generar código único
    const memberCode = `${club.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const { data: member, error } = await supabase
      .from('members')
      .insert([
        {
          club_id: clubId,
          name: name,
          email: email,
          member_code: memberCode,
          current_stamps: 0,
          total_stamps_earned: 0,
          rewards_redeemed: 0,
          joined_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      setError('Error al unirse: ' + error.message)
    } else {
      setSuccess(true)
    }
    setJoining(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Club no encontrado</h1>
          <p className="text-muted-foreground">Este club no existe o no está disponible.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">¡Bienvenido a {club.name}!</h1>
          <p className="text-muted-foreground">
            Te has unido exitosamente al club de lealtad.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Tu código de miembro:</p>
            <p className="text-2xl font-mono font-bold text-primary">{name.substring(0, 3).toUpperCase()}-{Math.random().toString(36).substring(2, 6).toUpperCase()}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Presenta este código en tu próxima visita para empezar a acumular sellos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header del Club */}
        <div className="text-center space-y-2">
          <div 
            className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: club.primary_color || '#000' }}
          >
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">{club.name}</h1>
          <p className="text-sm text-muted-foreground">{club.description || 'Club de Lealtad'}</p>
        </div>

        {/* Recompensa */}
        {club.reward_description && (
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-primary">🎁 Recompensa</p>
            <p className="text-lg font-bold text-primary">{club.reward_description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Después de {club.stamps_required} sellos
            </p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={joining}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {joining ? 'Uniéndote...' : 'Unirme al Club'}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Al unirte, aceptas recibir actualizaciones sobre tu progreso y recompensas.
        </p>
      </div>
    </div>
  )
}