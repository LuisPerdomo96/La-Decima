import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode, Printer, Globe, CheckCircle, AlertTriangle } from 'lucide-react'
import { PublishClubForm } from '@/components/club/publish-club-form'
import { CopyButton } from '@/components/ui/copy-button'
import { PrintButton } from '@/components/ui/print-button'
import { DownloadPdfButton } from '@/components/ui/download-pdf-button'

interface SettingsPageProps {
  params: Promise<{
    clubId: string
  }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { clubId } = await params
  const supabase = await createClient()

  // Obtener club
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (error || !club) {
    notFound()
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/c/${club.slug}`

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/clubs/${clubId}`}
          className="rounded-md border p-2 hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Configuración del Club</h1>
          <p className="text-muted-foreground">{club.name}</p>
        </div>
      </div>

      {/* Estado actual */}
      <div className={`rounded-lg border p-6 flex items-center gap-4 ${
        club.status === 'published' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        {club.status === 'published' ? (
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {club.status === 'published' ? 'Tu club está publicado' : 'Tu club está en borrador'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {club.status === 'published' 
              ? 'Los clientes ya pueden unirse escaneando el QR.' 
              : 'Publica tu club para generar el link y el código QR para tu mostrador.'}
          </p>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1: Publicar / Link */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Link público</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">URL para compartir</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono"
              />
              <CopyButton text={publicUrl} />
            </div>
          </div>

          {club.status !== 'published' && (
            <PublishClubForm clubId={club.id} />
          )}
        </div>

        {/* Columna 2: Cartel QR */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Cartel para el mostrador</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Imprime o descarga este cartel y colócalo en tu caja registradora.
          </p>

          <div className="print-area border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/30">
            {/* QR Code del club */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                 alt="QR del Club"
                 className="w-48 h-48"
               />
            </div>
            <p className="font-bold text-lg mb-1">{club.name}</p>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Escanea para unirte al club<br/>y ganar {club.reward_description}
            </p>
            
            {/* Botones de acción */}
            <div className="flex gap-2">
              <PrintButton />
              <DownloadPdfButton 
                clubName={club.name}
                rewardDescription={club.reward_description}
                publicUrl={publicUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}