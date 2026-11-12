import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateGoogleWalletJWT } from '@/lib/google-wallet'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const clubId = searchParams.get('clubId')

    if (!memberId || !clubId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: member, error } = await supabase
      .from('members')
      .select('*, clubs(*)')
      .eq('id', memberId)
      .eq('club_id', clubId)
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    const club = member.clubs

    // Generamos el JWT y obtenemos el payload SIN firmar
    const { unsignedPayload, token } = generateGoogleWalletJWT({
      memberId: member.id,
      memberName: member.name,
      memberCode: member.member_code,
      clubName: club.name,
      currentStamps: member.current_stamps,
      stampsRequired: club.stamps_required,
      rewardDescription: club.reward_description,
      primaryColor: club.primary_color,
    })

    // Devolvemos AMBAS cosas: el JSON para que me lo pegues, y la URL para que pruebes
    return NextResponse.json({
      mensaje: 'COPIA EL "unsignedPayload" DE ABAJO Y PÉGASELO AL ASISTENTE',
      unsignedPayload: unsignedPayload,
      url: `https://pay.google.com/gp/v/save/${encodeURIComponent(token)}`
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}