import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Coffee, Gift, QrCode } from 'lucide-react'

interface CardPageProps {
  params: Promise<{
    slug: string
    memberId: string
  }>
}

export default async function MemberCardPage({ params }: CardPageProps) {
  const { slug, memberId } = await params
  const supabase = await createClient()

  // Obtener datos del miembro
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select(`
      *,
      club:clubs(*)
    `)
    .eq('id', memberId)
    .single()

  if (memberError || !member) {
    notFound()
  }

  const club = member.club
  const progress = (member.current_stamps / club.stamps_required) * 100
  const remaining = club.stamps_required - member.current_stamps

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center pt-4">
          <Coffee className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h1 className="text-2xl font-bold">{club.name}</h1>
          <p className="text-sm text-muted-foreground">Tu tarjeta de lealtad</p>
        </div>

        {/* Tarjeta Digital */}
        <div 
          className="rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: club.primary_color }}
        >
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -ml-12 -mb-12"></div>
          </div>

          <div className="relative z-10">
            {/* Header de la tarjeta */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wide">Miembro</p>
                <p className="text-lg font-bold">{member.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80 uppercase tracking-wide">Código</p>
                <p className="text-lg font-mono font-bold">{member.member_code}</p>
              </div>
            </div>

            {/* Contador de sellos */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs opacity-80 uppercase">Sellos</p>
                  <p className="text-3xl font-bold">
                    {member.current_stamps}
                    <span className="text-lg opacity-60">/{club.stamps_required}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80 uppercase">Faltan</p>
                  <p className="text-xl font-bold">{remaining}</p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Grid de sellos */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: club.stamps_required }).map((_, i) => (
                <div 
                  key={i}
                  className={`aspect-square rounded-full border-2 flex items-center justify-center ${
                    i < member.current_stamps 
                      ? 'bg-white border-white' 
                      : 'border-white/40 bg-white/10'
                  }`}
                >
                  {i < member.current_stamps && (
                    <Coffee className="w-4 h-4" style={{ color: club.primary_color }} />
                  )}
                </div>
              ))}
            </div>

            {/* Recompensa */}
            <div className="border-t border-white/20 pt-4 flex items-center gap-3">
              <Gift className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="text-xs opacity-80 uppercase">Recompensa</p>
                <p className="font-semibold">{club.reward_description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Código QR */}
        <div className="bg-card border rounded-xl p-6 text-center">
          <QrCode className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Muestra este código en caja</h3>
          <p className="text-sm text-muted-foreground mb-4">
            El empleado escaneará tu código para agregar sellos
          </p>
          
          {/* QR Code visual (placeholder) */}
          <div className="inline-block bg-white p-4 rounded-lg border-2 border-dashed border-muted">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-700 rounded flex items-center justify-center">
              <div className="grid grid-cols-5 gap-1 w-24 h-24">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm ${
                      Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            {member.member_code}
          </p>
        </div>

        {/* Instrucciones */}
        <div className="bg-muted/50 border rounded-lg p-4 text-sm space-y-2">
          <p className="font-semibold">¿Cómo usar tu tarjeta?</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>1. Visita {club.name}</li>
            <li>2. Muestra esta tarjeta al empleado</li>
            <li>3. Escanearán tu código y recibirás un sello</li>
            <li>4. Al completar {club.stamps_required} sellos, ¡ganas tu {club.reward_description}!</li>
          </ul>
        </div>

      </div>
    </div>
  )
}