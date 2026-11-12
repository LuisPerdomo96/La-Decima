'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Coffee, Wallet, Loader2, AlertCircle } from 'lucide-react'

export default function PublicMemberCardPage() {
  const params = useParams()
  const memberId = params.memberId as string

  const [member, setMember] = useState<any>(null)
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [walletLoading, setWalletLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [memberId])

  async function loadData() {
    setLoading(true)
    
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (memberError || !memberData) {
      setError('Miembro no encontrado')
      setLoading(false)
      return
    }

    setMember(memberData)

    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', memberData.club_id)
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
      const res = await fetch(`/api/wallet/google?memberId=${memberId}&clubId=${club.id}`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !member || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No encontrado</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  const progress = (member.current_stamps / club.stamps_required) * 100

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-center">{club.name}</h1>
        <p className="text-xs text-muted-foreground text-center">Tarjeta de Lealtad</p>
      </div>

      <div className="p-4 space-y-4">
        <div 
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${club.primary_color || '#000'} 0%, ${club.primary_color || '#000'}dd 100%)` 
          }}
        >
          <div className="p-6 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{club.name}</h2>
                <p className="text-sm opacity-90">Club de Lealtad</p>
              </div>
            </div>

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
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Progreso</h3>
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{member.current_stamps}</span>
              <span className="text-muted-foreground">/ {club.stamps_required}</span>
            </div>
          </div>

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
              {club.stamps_required - member.current_stamps > 0 
                ? `Faltan ${club.stamps_required - member.current_stamps} sellos` 
                : '¡Recompensa disponible!'}
            </span>
            <span className="font-medium" style={{ color: club.primary_color }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToGoogleWallet}
          disabled={walletLoading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg"
        >
          <Wallet className="w-5 h-5" />
          {walletLoading ? 'Generando pase...' : 'Agregar a Google Wallet'}
        </button>

        <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
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
        </div>
      </div>
    </div>
  )
}