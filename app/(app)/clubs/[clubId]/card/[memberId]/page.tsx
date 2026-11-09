'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Coffee, Gift, Wallet, ArrowLeft, Share2, Download } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  member_code: string
  current_stamps: number
  total_stamps_earned: number
  rewards_redeemed: number
  joined_at: string
  last_visit_at: string | null
}

interface Club {
  id: string
  name: string
  stamps_required: number
  reward_description: string
  primary_color: string
  logo_url: string | null
}

export default function MemberCardPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.clubId as string
  const memberId = params.memberId as string

  const [member, setMember] = useState<Member | null>(null)
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletLoading, setWalletLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [clubId, memberId])

  async function loadData() {
    setLoading(true)
    setError('')

    // Cargar datos del miembro
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .eq('club_id', clubId)
      .single()

    if (memberError || !memberData) {
      setError('Miembro no encontrado')
      setLoading(false)
      return
    }

    setMember(memberData)

    // Cargar datos del club
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (clubError || !clubData) {
      setError('Club no encontrado')
      setLoading(false)
      return
    }

    setClub(clubData)
    setLoading(false)
  }

  const handleAddToGoogleWallet = async () => {
    setWalletLoading(true)
    try {
      const res = await fetch(`/api/wallet/google?memberId=${memberId}&clubId=${clubId}`)
      const data = await res.json()
      
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar el pase')
    } finally {
      setWalletLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${club?.name} - Tarjeta de Lealtad`,
          text: `¡Mira mi tarjeta de ${member?.name} en ${club?.name}!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tarjeta...</p>
        </div>
      </div>
    )
  }

  if (error || !member || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Error al cargar'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  const progress = (member.current_stamps / club.stamps_required) * 100
  const stampsRemaining = Math.max(0, club.stamps_required - member.current_stamps)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Tarjeta Digital</h1>
          <p className="text-xs text-muted-foreground">{club.name}</p>
        </div>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Tarjeta Principal */}
        <div 
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${club.primary_color} 0%, ${club.primary_color}dd 100%)` 
          }}
        >
          <div className="p-6 text-white">
            {/* Logo y Nombre del Club */}
            <div className="flex items-center gap-3 mb-6">
              {club.logo_url ? (
                <img 
                  src={club.logo_url} 
                  alt={club.name}
                  className="w-12 h-12 rounded-lg bg-white/20 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{club.name}</h2>
                <p className="text-sm opacity-90">Club de Lealtad</p>
              </div>
            </div>

            {/* Información del Miembro */}
            <div className="space-y-3">
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wide">Miembro</p>
                <p className="text-lg font-semibold">{member.name}</p>
              </div>
              
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wide">Código</p>
                <p className="text-lg font-mono font-bold">{member.member_code}</p>
              </div>
            </div>

            {/* Código QR Placeholder */}
            <div className="mt-6 bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-sm opacity-90 mb-2">Código de miembro</p>
              <p className="text-2xl font-mono font-bold">{member.member_code}</p>
            </div>
          </div>
        </div>

        {/* Progreso de Sellos */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Progreso</h3>
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{member.current_stamps}</span>
              <span className="text-muted-foreground">/ {club.stamps_required}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: club.primary_color 
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {stampsRemaining > 0 
                ? `Faltan ${stampsRemaining} sellos` 
                : '¡Recompensa disponible!'}
            </span>
            <span className="font-medium" style={{ color: club.primary_color }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Recompensa */}
          {member.current_stamps >= club.stamps_required && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Gift className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">¡Recompensa disponible!</p>
                <p className="text-sm text-green-700">{club.reward_description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total ganados</p>
            <p className="text-2xl font-bold mt-1">{member.total_stamps_earned}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Recompensas</p>
            <p className="text-2xl font-bold mt-1">{member.rewards_redeemed}</p>
          </div>
        </div>

        {/* Botón Google Wallet */}
        <button
          onClick={handleAddToGoogleWallet}
          disabled={walletLoading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg"
        >
          <Wallet className="w-5 h-5" />
          {walletLoading ? 'Generando pase...' : 'Agregar a Google Wallet'}
        </button>

        {/* Información adicional */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h4 className="font-semibold">Información</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{member.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Miembro desde</span>
              <span className="font-medium">
                {new Date(member.joined_at).toLocaleDateString('es-ES')}
              </span>
            </div>
            {member.last_visit_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última visita</span>
                <span className="font-medium">
                  {new Date(member.last_visit_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}