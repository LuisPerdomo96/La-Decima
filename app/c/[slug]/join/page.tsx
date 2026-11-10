'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Coffee, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function JoinClubFormPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadClub()
  }, [slug])

  async function loadClub() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      setError('Club no encontrado o no está disponible.')
    } else {
      setClub(data)
    }
    setLoading(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoining(true)
    setError('')

    // Generar código único: Primeras 3 letras del club + 4 caracteres aleatorios
    const prefix = club.name.replace(/\s+/g, '').substring(0, 3).toUpperCase()
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const memberCode = `${prefix}-${randomStr}`

    const { data: member, error: insertError } = await supabase
      .from('members')
      .insert([
        {
          club_id: club.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          member_code: memberCode,
          current_stamps: 0,
          total_stamps_earned: 0,
          rewards_redeemed: 0,
          joined_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (insertError) {
      // Si el email ya existe, mostrar error amigable
      if (insertError.code === '23505') {
        setError('Este correo ya está registrado en este club.')
      } else {
        setError('Error al unirse: ' + insertError.message)
      }
    } else {
      setGeneratedCode(memberCode)
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
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Club no disponible</h1>
          <p className="text-muted-foreground mb-6">{error || 'Este club no existe o no está publicado.'}</p>
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenido a {club.name}!</h1>
            <p className="text-muted-foreground mt-2">
              Te has unido exitosamente al club de lealtad.
            </p>
          </div>
          
          <div className="bg-gray-50 border-2 border-dashed border-primary/30 rounded-xl p-6 space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Tu código de miembro</p>
            <p className="text-3xl font-mono font-bold text-primary tracking-wider">{generatedCode}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Muestra este código o esta pantalla en tu próxima visita para empezar a acumular sellos.
            </p>
            <Link 
              href={`/join/${club.id}`} 
              className="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Ver mi Tarjeta Digital
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header del Club */}
        <div className="text-center space-y-2">
          <div 
            className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: club.primary_color || '#000' }}
          >
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Únete a {club.name}</h1>
          <p className="text-sm text-muted-foreground">{club.description || 'Club de Lealtad'}</p>
        </div>

        {/* Recompensa destacada */}
        {club.reward_description && (
          <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
            <p className="text-sm font-medium text-primary">🎁 Recompensa</p>
            <p className="text-lg font-bold text-primary mt-1">{club.reward_description}</p>
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
              className="w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={joining}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uniéndote...
              </>
            ) : (
              'Unirme al Club'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Al unirte, aceptas recibir actualizaciones sobre tu progreso y recompensas.
        </p>
      </div>
    </div>
  )
}