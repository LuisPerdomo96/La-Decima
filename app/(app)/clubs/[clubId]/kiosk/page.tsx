'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRScanner } from '@/components/kiosk/qr-scanner'
import { Coffee, Gift, CheckCircle, AlertCircle, Search } from 'lucide-react'

interface Member {
  id: string
  name: string
  member_code: string
  current_stamps: number
  total_stamps_earned: number
  rewards_redeemed: number // ← AGREGADO
  email: string
}

interface Club {
  id: string
  name: string
  stamps_required: number
  reward_description: string
  primary_color: string
}

export default function KioskPage() {
  const params = useParams()
  const clubId = params.clubId as string
  const [club, setClub] = useState<Club | null>(null)
  const [scannedMember, setScannedMember] = useState<Member | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rewardEarned, setRewardEarned] = useState(false)

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

    if (error) {
      setError('Error al cargar el club')
    } else {
      setClub(data)
    }
  }

  async function handleScan(decodedText: string) {
    setError('')
    setSuccess('')
    setRewardEarned(false)
    
    // El QR puede contener el member_code o el member_id
    // Vamos a buscar por ambos
    await findMember(decodedText)
  }

  async function findMember(codeOrId: string) {
    setLoading(true)
    setError('')

    // Buscar por member_code o por id
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('club_id', clubId)
      .or(`member_code.eq.${codeOrId},id.eq.${codeOrId}`)
      .single()

    setLoading(false)

    if (error || !member) {
      setError('Cliente no encontrado. Verifica el código.')
      setScannedMember(null)
      return
    }

    setScannedMember(member)
  }

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await findMember(manualCode.trim().toUpperCase())
  }

async function giveStamp() {
  if (!scannedMember || !club) return

  setLoading(true)
  setError('')
  setSuccess('')
  setRewardEarned(false)

  const newStamps = scannedMember.current_stamps + 1
  const earnedReward = newStamps >= club.stamps_required

  // Si ganó la recompensa, resetear a 0 (o mantener excedente)
  const stampsAfterReward = earnedReward ? 0 : newStamps

  // Actualizar miembro
  const { error: memberError } = await supabase
    .from('members')
    .update({
      current_stamps: stampsAfterReward,  // ← RESET AQUÍ
      total_stamps_earned: scannedMember.total_stamps_earned + 1,
      rewards_redeemed: earnedReward 
        ? scannedMember.rewards_redeemed + 1 
        : scannedMember.rewards_redeemed,
      last_visit_at: new Date().toISOString(),
    })
    .eq('id', scannedMember.id)

  if (memberError) {
    setError('Error al agregar sello')
    setLoading(false)
    return
  }

  // Registrar el sello
  await supabase
    .from('stamps')
    .insert({
      member_id: scannedMember.id,
      club_id: clubId,
      stamps_added: 1,
      reason: earnedReward ? 'Visita (recompensa ganada)' : 'Visita',
    })

  // Si ganó recompensa, crear registro
  if (earnedReward) {
    await supabase
      .from('rewards')
      .insert({
        member_id: scannedMember.id,
        club_id: clubId,
        reward_description: club.reward_description,
        stamps_used: club.stamps_required,
        status: 'pending',
      })

    setRewardEarned(true)
  }

  setSuccess(`✅ Sello agregado a ${scannedMember.name}${earnedReward ? ' 🎉 ¡Recompensa ganada!' : ''}`)
  setScannedMember({ 
    ...scannedMember, 
    current_stamps: stampsAfterReward,
    rewards_redeemed: earnedReward ? scannedMember.rewards_redeemed + 1 : scannedMember.rewards_redeemed
  })
  setLoading(false)

  setTimeout(() => {
    setScannedMember(null)
    setSuccess('')
    setManualCode('')
  }, 4000)
}

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Cargando club...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modo Kiosco</h1>
          <p className="text-muted-foreground">{club.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Sellos necesarios</p>
          <p className="text-2xl font-bold">{club.stamps_required}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Escáner */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <QRScanner onScan={handleScan} onError={setError} />

          {/* Búsqueda manual */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              O ingresa el código manualmente
            </h3>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej. JUA-TNE"
                className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm uppercase"
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        {/* Columna derecha: Info del cliente */}
        <div className="bg-card border rounded-xl p-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {rewardEarned && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6 mb-4 text-center">
              <Gift className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
              <h3 className="text-xl font-bold text-yellow-900 mb-1">
                ¡{scannedMember?.name} ganó su recompensa!
              </h3>
              <p className="text-yellow-800 mb-4">{club.reward_description}</p>
              <button
                onClick={() => setRewardEarned(false)}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white"
              >
                Marcar como entregada
              </button>
            </div>
          )}

          {scannedMember ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: club.primary_color }}
                >
                  {scannedMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{scannedMember.name}</h2>
                  <p className="text-sm text-muted-foreground">{scannedMember.member_code}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Sellos actuales</p>
                    <p className="text-4xl font-bold">
                      {scannedMember.current_stamps}
                      <span className="text-lg text-muted-foreground">/{club.stamps_required}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Faltan</p>
                    <p className="text-2xl font-bold">
                      {club.stamps_required - scannedMember.current_stamps}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(scannedMember.current_stamps / club.stamps_required) * 100}%`,
                      backgroundColor: club.primary_color,
                    }}
                  />
                </div>

                {/* Grid de sellos */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {Array.from({ length: club.stamps_required }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-full border-2 flex items-center justify-center ${
                        i < scannedMember.current_stamps
                          ? 'border-primary bg-primary/10'
                          : 'border-muted bg-muted/20'
                      }`}
                    >
                      {i < scannedMember.current_stamps && (
                        <Coffee className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={giveStamp}
                  disabled={loading}
                  className="w-full rounded-lg py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ backgroundColor: club.primary_color }}
                >
                  {loading ? 'Procesando...' : 'Dar sello'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Coffee className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Esperando cliente</h3>
              <p className="text-muted-foreground">
                Escanea el código QR o ingresa el código manualmente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}