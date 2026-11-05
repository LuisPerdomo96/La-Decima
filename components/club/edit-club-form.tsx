'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateClub } from '@/actions/club-actions'
import { Coffee, Pizza, IceCream, Cookie, Cake, Star } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { LogoUploader } from '@/components/ui/logo-uploader'

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  primary_color: z.string(),
  stamp_icon: z.string(),
stamps_required: z.number().min(1).max(20),
  reward_description: z.string().min(2, 'Describe la recompensa'),
})

type FormData = z.infer<typeof formSchema>

const iconOptions = [
  { id: 'coffee', icon: Coffee, label: 'Café' },
  { id: 'pizza', icon: Pizza, label: 'Pizza' },
  { id: 'ice_cream', icon: IceCream, label: 'Helado' },
  { id: 'cookie', icon: Cookie, label: 'Galleta' },
  { id: 'cake', icon: Cake, label: 'Pastel' },
  { id: 'star', icon: Star, label: 'Estrella' },
]

interface EditClubFormProps {
  club: {
    id: string
    name: string
    description: string | null
    logo_url: string | null
    primary_color: string
    stamp_icon: string
    stamps_required: number
    reward_description: string
  }
}

export function EditClubForm({ club }: EditClubFormProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: club.name,
      description: club.description || '',
      logo_url: club.logo_url || '',
      primary_color: club.primary_color,
      stamp_icon: club.stamp_icon,
      stamps_required: club.stamps_required,
      reward_description: club.reward_description,
    }
  })

  const watchColor = watch('primary_color')

  const onSubmit = async (data: FormData) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string)
      }
    })
    
    const result = await updateClub(club.id, formData)
    if (result?.error) {
      alert(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  // ✅ AGREGADO: Manejador de errores de validación
  const onInvalid = (errors: any) => {
    console.error('Errores de validación:', errors)
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      alert('Error: ' + firstError.message)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ Cambios guardados correctamente
        </div>
      )}

      {/* ✅ MODIFICADO: Se agregó onInvalid al handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 bg-card border rounded-lg p-6">
        
        {/* Logo */}
        <LogoUploader 
          clubId={club.id}
          currentLogoUrl={club.logo_url}
          onLogoUploaded={(url) => {
            const event = { target: { name: 'logo_url', value: url } }
            register('logo_url').onChange(event)
          }}
        />

        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre del Negocio</label>
          <input
            {...register('name')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descripción (opcional)</label>
          <textarea
            {...register('description')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={2}
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Color Principal</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-12 h-12 rounded-md border border-input cursor-pointer"
              style={{ backgroundColor: watchColor }}
            />
            <input
              {...register('primary_color')}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase font-mono"
            />
          </div>
          {showColorPicker && (
            <div className="border rounded-lg p-3 bg-background">
              <HexColorPicker 
                color={watchColor} 
                onChange={(color) => {
                  const event = { target: { name: 'primary_color', value: color } }
                  register('primary_color').onChange(event)
                }} 
              />
            </div>
          )}
        </div>

        {/* Icono */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Icono del Sello</label>
          <div className="grid grid-cols-3 gap-2">
            {iconOptions.map((opt) => (
              <label key={opt.id} className="cursor-pointer">
                <input type="radio" {...register('stamp_icon')} value={opt.id} className="peer sr-only" />
                <div className="flex flex-col items-center gap-1 rounded-md border p-3 peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:bg-accent">
                  <opt.icon className="w-5 h-5" />
                  <span className="text-xs">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sellos */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sellos para recompensa</label>
          {/* ✅ MODIFICADO: Se agregó valueAsNumber: true */}
          <input
            type="number"
            {...register('stamps_required', { valueAsNumber: true })}
            min="1"
            max="20"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.stamps_required && <p className="text-xs text-red-500">{errors.stamps_required.message}</p>}
        </div>

        {/* Recompensa */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descripción de la Recompensa</label>
          <input
            {...register('reward_description')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.reward_description && <p className="text-xs text-red-500">{errors.reward_description.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}