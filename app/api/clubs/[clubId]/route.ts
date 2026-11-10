import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: { clubId: string } }
) {
  try {
    const supabase = await createClient()
    const clubId = params.clubId

    // 1. Borrar datos dependientes primero (para evitar errores de clave foránea)
    await supabase.from('rewards').delete().eq('club_id', clubId)
    await supabase.from('stamps').delete().eq('club_id', clubId)
    await supabase.from('members').delete().eq('club_id', clubId)
    
    // 2. Borrar el club
    const { error } = await supabase.from('clubs').delete().eq('id', clubId)

    if (error) {
      console.error('Error al eliminar club:', error)
      return NextResponse.json({ error: 'Error al eliminar el club' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}