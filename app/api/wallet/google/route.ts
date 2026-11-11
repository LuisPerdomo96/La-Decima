import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateGoogleWalletJWT, getGoogleWalletSaveUrl } from '@/lib/google-wallet'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const clubId = searchParams.get('clubId')

    if (!memberId || !clubId) {
      return NextResponse.json(
        { error: 'Faltan parámetros memberId y clubId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*, clubs(*)')
      .eq('id', memberId)
      .eq('club_id', clubId)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    const club = member.clubs

    console.log('Generando JWT para:', {
      memberId,
      clubId,
      clubName: club.name,
      issuerId: process.env.GOOGLE_WALLET_ISSUER_ID,
      classId: process.env.GOOGLE_WALLET_CLASS_ID,
      serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
    })

    const jwt = generateGoogleWalletJWT({
      memberId: member.id,
      memberName: member.name,
      memberCode: member.member_code,
      clubName: club.name,
      currentStamps: member.current_stamps,
      stampsRequired: club.stamps_required,
      rewardDescription: club.reward_description,
      primaryColor: club.primary_color,
    })

    console.log('JWT generado (primeros 100 chars):', jwt.substring(0, 100))

    const saveUrl = getGoogleWalletSaveUrl(jwt)

    console.log('URL de guardado:', saveUrl)

    return NextResponse.json({ url: saveUrl })
  } catch (error) {
    console.error('Error generando Google Wallet:', error)
    return NextResponse.json(
      { error: 'Error al generar el pase: ' + (error as Error).message },
      { status: 500 }
    )
  }
}