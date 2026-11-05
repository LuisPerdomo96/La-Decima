import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Buscar el club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, slug, stamps_required, reward_description')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club no encontrado o no publicado' },
        { status: 404 }
      )
    }

    // Obtener datos del request
    const body = await request.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y correo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un miembro con ese email en este club
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('club_id', club.id)
      .eq('email', email)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'Ya estás registrado en este club' },
        { status: 400 }
      )
    }

    // Generar código único de miembro
    const prefix = slug.substring(0, 3).toUpperCase()
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase()
    const memberCode = `${prefix}-${randomCode}`

    // Crear el miembro
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        club_id: club.id,
        name,
        email,
        member_code: memberCode,
        current_stamps: 0,
        total_stamps_earned: 0,
        rewards_redeemed: 0,
        wallet_type: 'web',
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error creating member:', memberError)
      return NextResponse.json(
        { error: 'Error al crear el miembro' },
        { status: 500 }
      )
    }

    // Devolver URL de la tarjeta
    const cardUrl = `/c/${slug}/card/${member.id}`

    return NextResponse.json({
      success: true,
      memberId: member.id,
      memberCode: member.member_code,
      cardUrl: cardUrl,
    })
  } catch (error) {
    console.error('Error in join club:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}