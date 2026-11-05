'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Busca el clubSchema y reemplázalo por este:
const clubSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  logo_url: z.string().optional(), // ← AGREGADO
  primary_color: z.string().default('#7A3B1E'),
  stamp_icon: z.string().default('coffee'),
  stamps_required: z.coerce.number().min(1).max(20).default(10),
  reward_description: z.string().min(2, 'Describe la recompensa'),
})
export async function createClub(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // 1. Verificar usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error de autenticación:', userError)
      return { error: 'No autorizado. Inicia sesión nuevamente.' }
    }

    console.log('✅ Usuario autenticado:', user.id, user.email)

    // 2. Verificar que el profile exista
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile no encontrado, creándolo...')
      
      // Crear el profile manualmente
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Usuario',
          avatar_url: user.user_metadata?.avatar_url || null,
        })

      if (insertProfileError) {
        console.error('❌ Error creando profile:', insertProfileError)
        return { error: 'Error creando perfil: ' + insertProfileError.message }
      }
      
      console.log('✅ Profile creado exitosamente')
    }

    // 3. Validar datos del formulario
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || '',
      primary_color: formData.get('primary_color'),
      stamp_icon: formData.get('stamp_icon'),
      stamps_required: formData.get('stamps_required'),
      reward_description: formData.get('reward_description'),
    }

    const validatedFields = clubSchema.safeParse(rawData)
    
    if (!validatedFields.success) {
      console.error('❌ Validación fallida:', validatedFields.error.flatten())
      return { 
        error: 'Datos inválidos', 
        details: validatedFields.error.flatten().fieldErrors 
      }
    }

    const { name, description, primary_color, stamp_icon, stamps_required, reward_description } = validatedFields.data

    // 4. Generar slug único
    const baseSlug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${baseSlug}-${randomSuffix}`

    console.log('📝 Datos del club:', { name, slug, owner_id: user.id })

    // 5. Insertar en la base de datos
    const { data, error } = await supabase
      .from('clubs')
      .insert({
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        primary_color,
        stamp_icon,
        stamps_required,
        reward_description,
        reward_type: 'free_item',
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error de Supabase:', error)
      console.error('Detalle:', error.details)
      console.error('Hint:', error.hint)
      return { error: `Error de base de datos: ${error.message}` }
    }

    console.log('✅ Club creado exitosamente:', data)

    // 6. Redirigir al club creado
    redirect(`/clubs/${data.id}`)
    
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    console.error('❌ Error inesperado:', error)
    return { error: 'Error inesperado: ' + (error as Error).message }
  }
}
export async function publishClub(clubId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'No autorizado' }
    }

    const { error } = await supabase
      .from('clubs')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', clubId)
      .eq('owner_id', user.id)

    if (error) {
      console.error('Error publishing club:', error)
      return { error: 'Error al publicar el club' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Error inesperado' }
  }
}
export async function updateClub(clubId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'No autorizado' }
    }

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || '',
      logo_url: formData.get('logo_url') || null,
      primary_color: formData.get('primary_color'),
      stamp_icon: formData.get('stamp_icon'),
      stamps_required: formData.get('stamps_required'),
      reward_description: formData.get('reward_description'),
    }

    const validatedFields = clubSchema.safeParse(rawData)
    if (!validatedFields.success) {
      return { error: 'Datos inválidos', details: validatedFields.error.flatten().fieldErrors }
    }

    const { name, description, logo_url, primary_color, stamp_icon, stamps_required, reward_description } = validatedFields.data

    const { error } = await supabase
      .from('clubs')
      .update({
        name,
        description: description || null,
        logo_url,
        primary_color,
        stamp_icon,
        stamps_required,
        reward_description,
      })
      .eq('id', clubId)
      .eq('owner_id', user.id)

    if (error) {
      console.error('Error updating club:', error)
      return { error: 'Error al actualizar el club' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Error inesperado' }
  }
}