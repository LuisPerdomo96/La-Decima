'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Html5Qrcode } from 'html5-qrcode'
import { Coffee, Gift, CheckCircle, AlertCircle, Search, X } from 'lucide-react'

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
  const clubId = params.clubId as string
  const [club, setClub] = useState<Club | null>(null)
  const [scannedMember, setScannedMember] = useState<Member | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rewardEarned, setRewardEarned] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadClub()
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [clubId])

  async function loadClub() {
    const { data, error } = await supabase.from('clubs').select('*').eq('id', clubId).single()
    if (!error && data) setClub(data)
  }

  async function startScanner() {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader")
    }
    
    try {
      await scannerRef.current.start(
        { facingMode: "environment" }, // Fuerza la cámara trasera en móvil
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText)
          stopScanner()
        },
        () => {} // Ignorar errores de escaneo continuo
      )
      setIsScanning(true)
    } catch (err) {
      setError('No se pudo acceder a la cámara. Usa el código manual.')
    }
  }

  function stopScanner() {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().catch(() => {})
      setIsScanning(false)
    }
  }

  async function handleScan(code: string) {
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

    // Feedback táctil para móviles
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
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]) // Vibración de éxito
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
    <div className="max-w-md mx-auto p-4 space-y-6 min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{club.name}</h1>
        <p className="text-sm text-muted-foreground">Modo Kiosco (Móvil)</p>
      </div>

      {/* Escáner */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="w-full py-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-muted-foreground hover:bg-gray-50"
          >
            <CameraIcon className="w-8 h-8" />
            <span className="font-medium">Toca para escanear QR del cliente</span>
          </button>
        ) : (
          <div className="relative">
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
            <button
              onClick={stopScanner}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Búsqueda Manual */}
        <div className="pt-2 border-t">
          <form onSubmit={(e) => { e.preventDefault(); findMember(manualCode) }} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO (Ej. JUA-TNE)"
              className="flex-1 rounded-md border px-3 py-3 text-center font-mono text-lg uppercase"
            />
            <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-4 rounded-md font-medium">
              {loading ? '...' : 'Buscar'}
            </button>
          </form>
        </div>
      </div>

      {/* Mensajes */}
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</div>}

      {/* Resultado del Escaneo */}
      {scannedMember && !rewardEarned && (
        <div className="bg-white rounded-xl shadow-lg border p-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: club.primary_color }}>
            {scannedMember.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{scannedMember.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{scannedMember.member_code}</p>
          </div>
          
          <div className="py-4">
            <p className="text-4xl font-bold">{scannedMember.current_stamps} <span className="text-lg text-muted-foreground">/ {club.stamps_required}</span></p>
            <p className="text-sm text-muted-foreground">Sellos actuales</p>
          </div>

          <button
            onClick={giveStamp}
            disabled={loading}
            className="w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ backgroundColor: club.primary_color }}
          >
            {loading ? 'Procesando...' : 'Dar Sello'}
          </button>
        </div>
      )}

      {/* Modal de Recompensa */}
      {rewardEarned && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 text-center space-y-4 animate-in zoom-in duration-300">
          <Gift className="w-12 h-12 mx-auto text-yellow-600" />
          <h3 className="text-xl font-bold text-yellow-900">¡Recompensa Ganada!</h3>
          <p className="text-yellow-800 font-medium">{club.reward_description}</p>
          <p className="text-sm text-yellow-700">Los sellos se han reiniciado a 0.</p>
          <button
            onClick={() => { setRewardEarned(false); setScannedMember(null); }}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg font-bold"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  )
}

function CameraIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  )
}