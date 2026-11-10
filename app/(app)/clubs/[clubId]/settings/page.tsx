'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'

export default function ClubSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.clubId as string

  const [clubName, setClubName] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadClub()
  }, [clubId])

  async function loadClub() {
    const { data, error } = await supabase
      .from('clubs')
      .select('name')
      .eq('id', clubId)
      .single()

    if (data) setClubName(data.name)
    setLoading(false)
  }

  async function handleDelete() {
    if (confirmText !== 'ELIMINAR') {
      alert('Debes escribir exactamente "ELIMINAR" para confirmar.')
      return
    }

    if (!window.confirm('⚠️ ¿Estás absolutamente seguro? Esta acción no se puede deshacer y borrará todos los miembros, sellos y recompensas de este club.')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Club eliminado correctamente')
        router.push('/clubs')
      } else {
        const data = await res.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el club')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground">{clubName}</p>
        </div>
      </div>

      {/* Zona de Peligro */}
      <div className="border border-red-200 rounded-xl bg-red-50/50 overflow-hidden">
        <div className="p-4 border-b border-red-200 bg-red-100/50 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="font-semibold text-red-900">Zona de Peligro</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Eliminar este club</h3>
            <p className="text-sm text-gray-600 mt-1">
              Una vez que elimines este club, no podrás recuperarlo. Se borrarán permanentemente todos los miembros, el historial de sellos y las recompensas asociadas.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Escribe <span className="font-bold text-red-600">ELIMINAR</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== 'ELIMINAR'}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar Club Permanentemente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}