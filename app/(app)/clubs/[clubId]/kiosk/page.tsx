'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Html5Qrcode } from 'html5-qrcode'
import { Coffee, Gift, CheckCircle, AlertCircle, X, Camera, ArrowLeft } from 'lucide-react'

interface Member {
  id: string
  name: string
  member_code: string
  current_stamps: number
  total_stamps_earned: number
  rewards_redeemed: number
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
  const router = useRouter()
  const clubId = params.clubId as string
  const [club, setClub] = useState<Club | null>(null)
  const [scannedMember, setScannedMember] = useState<Member | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rewardEarned, setRewardEarned] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadClub()
    return () => {
      stopScanner()
    }
  }, [clubId])

  async function loadClub() {
    const { data, error } = await supabase.from('clubs').select('*').eq('id', clubId).single()
    if (!error && data) setClub(data)
  }

  async function startScanner() {
    try {
      setError('')
      setIsScanning(true)
      
      // Crear scanner después de un pequeño delay para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const scanner = new Html5Qrcode('qr-reader')
      
      await scanner.start(
        { facingMode: 'environment' },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScan(decodedText)
          scanner.stop()
          setIsScanning(false)
        },
        () => {} // Ignorar errores menores
      )
    } catch (err: any) {
      console.error('Error de cámara:', err)
      setIsScanning(false)
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Habilítalo en el navegador.')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró cámara en este dispositivo.')
      } else if (err.name === 'NotSupportedError') {
        setError('La cámara no es compatible con escaneo QR.')
      } else {
        setError('Error al iniciar cámara. Usa el código manual.')
      }
    }
  }

  function stopScanner() {
    setIsScanning(false)
  }

  async function handleScan(code: string) {
    if (!code) return
    setError('')
    setSuccess('')
    setRewardEarned(false)
    await findMember(code.trim().toUpperCase())
  }

  async function findMember(codeOrId: string) {
    setLoading(true)
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
    } else {
      setScannedMember(member)
    }
  }

  async function giveStamp() {
    if (!scannedMember || !club) return

    if (navigator.vibrate) navigator.vibrate(50)

    setLoading(true)
    const newStamps = scannedMember.current_stamps + 1
    const earnedReward = newStamps >= club.stamps_required
    const stampsAfterReward = earnedReward ? 0 : newStamps

    const { error: memberError } = await supabase
      .from('members')
      .update({
        current_stamps: stampsAfterReward,
        total_stamps_earned: scannedMember.total_stamps_earned + 1,
        rewards_redeemed: earnedReward ? scannedMember.rewards_redeemed + 1 : scannedMember.rewards_redeemed,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', scannedMember.id)

    if (memberError) {
      setError('Error al agregar sello')
      setLoading(false)
      return
    }

    await supabase.from('stamps').insert({
      member_id: scannedMember.id,
      club_id: clubId,
      stamps_added: 1,
      reason: earnedReward ? 'Visita (recompensa ganada)' : 'Visita',
    })

    if (earnedReward) {
      await supabase.from('rewards').insert({
        member_id: scannedMember.id,
        club_id: clubId,
        reward_description: club.reward_description,
        stamps_used: club.stamps_required,
        status: 'pending',
      })
      setRewardEarned(true)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    }

    setSuccess(`✅ Sello agregado a ${scannedMember.name}`)
    setScannedMember({ 
      ...scannedMember, 
      current_stamps: stampsAfterReward,
      rewards_redeemed: earnedReward ? scannedMember.rewards_redeemed + 1 : scannedMember.rewards_redeemed
    })
    setLoading(false)

    setTimeout(() => {
      setScannedMember(null)
      setSuccess('')
      setRewardEarned(false)
      setManualCode('')
    }, 4000)
  }

  if (!club) return <div className="p-8 text-center">Cargando club...</div>

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{club.name}</h1>
          <p className="text-xs text-muted-foreground">Modo Kiosco</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Escáner QR */}
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="w-full py-16 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 text-muted-foreground hover:bg-gray-50 hover:border-primary transition-all"
            >
              <Camera className="w-16 h-16" />
              <div className="text-center">
                <p className="font-semibold text-lg">Toca para escanear</p>
                <p className="text-sm mt-1">Usa la cámara trasera del celular</p>
              </div>
            </button>
          ) : (
            <div className="relative">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              <button
                onClick={stopScanner}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          )}

          {/* Búsqueda Manual */}
          <div className="pt-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); findMember(manualCode) }} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO (Ej. JUA-TNE)"
                className="flex-1 rounded-lg border px-4 py-3 text-center font-mono text-lg uppercase"
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </form>
          </div>
        </div>

        {/* Mensajes de éxito */}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Tarjeta del Cliente */}
        {scannedMember && !rewardEarned && (
          <div className="bg-white rounded-2xl shadow-xl border-2 p-6 text-center space-y-6">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: club.primary_color }}
            >
              {scannedMember.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{scannedMember.name}</h2>
              <p className="text-sm text-muted-foreground font-mono mt-1">{scannedMember.member_code}</p>
            </div>
            
            <div className="py-6 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="w-8 h-8 text-primary" />
                <p className="text-5xl font-bold">{scannedMember.current_stamps}</p>
                <p className="text-2xl text-muted-foreground">/ {club.stamps_required}</p>
              </div>
              <p className="text-sm text-muted-foreground">Sellos actuales</p>
            </div>

            <button
              onClick={giveStamp}
              disabled={loading}
              className="w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
              style={{ backgroundColor: club.primary_color }}
            >
              {loading ? 'Procesando...' : '🎯 Dar Sello'}
            </button>
          </div>
        )}

        {/* Recompensa Ganada */}
        {rewardEarned && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-400 rounded-2xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Gift className="w-16 h-16 text-yellow-600 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-900">🎉 ¡Recompensa Ganada!</h3>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-lg font-semibold text-gray-800">{club.reward_description}</p>
            </div>
            <p className="text-sm text-yellow-700">Los sellos se han reiniciado a 0.</p>
            <button
              onClick={() => { setRewardEarned(false); setScannedMember(null); }}
              className="w-full py-4 bg-yellow-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95"
            >
              ¡Entendido!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}