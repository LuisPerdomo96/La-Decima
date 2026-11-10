'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Trash2, AlertTriangle, ArrowLeft, Loader2, 
  Copy, Check, QrCode, Globe, Printer, Download 
} from 'lucide-react'

export default function ClubSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.clubId as string

  const [club, setClub] = useState<any>(null)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

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

    if (data) setClub(data)
    setLoading(false)
  }

  async function handlePublish() {
    setIsPublishing(true)
    const { error } = await supabase
      .from('clubs')
      .update({ is_published: true })
      .eq('id', clubId)

    if (!error) {
      setClub({ ...club, is_published: true })
      alert('¡Club publicado con éxito!')
    } else {
      alert('Error al publicar: ' + error.message)
    }
    setIsPublishing(false)
  }

  async function handleUnpublish() {
    if (!confirm('¿Deseas poner el club en modo borrador? Los clientes no podrán unirse.')) return
    
    const { error } = await supabase
      .from('clubs')
      .update({ is_published: false })
      .eq('id', clubId)

    if (!error) {
      setClub({ ...club, is_published: false })
    }
  }

  const publicUrl = `https://la-decima.vercel.app/join/${clubId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrintQR = () => {
    window.print()
  }

  async function handleDelete() {
    if (confirmText !== 'ELIMINAR') {
      alert('Debes escribir exactamente "ELIMINAR" para confirmar.')
      return
    }

    if (!window.confirm('⚠️ ¿Estás absolutamente seguro? Esta acción no se puede deshacer.')) {
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

  if (!club) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Club no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Configuración del Club</h1>
          <p className="text-sm text-muted-foreground">{club.name}</p>
        </div>
      </div>

      {/* Estado del Club */}
      {club.is_published ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-green-900">Tu club está publicado</h2>
            <p className="text-sm text-green-700">Los clientes ya pueden unirse escaneando el QR.</p>
          </div>
          <button
            onClick={handleUnpublish}
            className="px-4 py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          >
            Pausar
          </button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <div className="bg-yellow-100 rounded-full p-1">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-yellow-900">Tu club está en borrador</h2>
            <p className="text-sm text-yellow-700">Publica tu club para generar el link y el código QR para tu mostrador.</p>
          </div>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : 'Publicar Club Ahora'}
          </button>
        </div>
      )}

      {/* Link Público y QR */}
      {club.is_published && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Link Público */}
          <div className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Link público</h3>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                URL para compartir
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">¡Link copiado!</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Comparte este link con tus clientes para que se unan al club.
              </p>
            </div>
          </div>

          {/* QR para Imprimir */}
          <div className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Cartel para el mostrador</h3>
            </div>
            
            <div className="bg-white border-2 border-dashed rounded-lg p-6 flex justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Imprime o descarga este cartel y colócalo en tu caja registradora.
            </p>
          </div>
        </div>
      )}

      {/* Zona de Peligro */}
      <div className="border border-red-200 rounded-xl bg-red-50/50 overflow-hidden mt-8">
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

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .border-2.border-dashed.rounded-lg,
          .border-2.border-dashed.rounded-lg * {
            visibility: visible;
          }
          .border-2.border-dashed.rounded-lg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  )
}