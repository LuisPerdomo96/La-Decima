'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClub } from '@/actions/club-actions'
import { LivePreview } from './live-preview'
import { LogoUploader } from '@/components/ui/logo-uploader'
import { Coffee, Pizza, IceCream, Cookie, Cake, Star } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

// Schema SIN z.coerce - usaremos valueAsNumber en el input
const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  primary_color: z.string().min(1, 'Selecciona un color'),
  stamp_icon: z.string().min(1, 'Selecciona un icono'),
  stamps_required: z.number().min(1, 'Mínimo 1 sello').max(20, 'Máximo 20 sellos'),
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

export function ClubForm() {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      logo_url: '',
      primary_color: '#7A3B1E',
      stamp_icon: 'coffee',
      stamps_required: 10,
      reward_description: '',
    }
  })

  const watchName = watch('name')
  const watchColor = watch('primary_color')
  const watchIcon = watch('stamp_icon')
  const watchStamps = watch('stamps_required')
  const watchReward = watch('reward_description')

  const onSubmit = async (data: FormData) => {
    console.log('✅ Datos válidos a enviar:', data)
    
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value))
      }
    })
    
    const result = await createClub(formData)
    if (result?.error) {
      alert('Error: ' + result.error)
    }
  }

  const onInvalid = (errors: any) => {
    console.error('❌ Errores de validación:', errors)
    const firstErrorKey = Object.keys(errors)[0]
    const firstError = errors[firstErrorKey]
    if (firstError?.message) {
      alert(`Falta completar o corregir: ${firstError.message}`)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Crea tu club</h2>
          <p className="text-muted-foreground text-sm">Configura tu programa de lealtad</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 bg-card border rounded-lg p-6">
          
          <LogoUploader 
            onLogoUploaded={(url) => {
              setValue('logo_url', url, { shouldValidate: true })
            }} 
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del Negocio</label>
            <input
              {...register('name')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej. Panadería Sol"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <textarea
              {...register('description')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              placeholder="Ej. El mejor café de la ciudad"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color Principal</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: watchColor }}
                aria-label="Seleccionar color"
              />
              <input
                {...register('primary_color')}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase font-mono"
                placeholder="#7A3B1E"
              />
            </div>
            
            {showColorPicker && (
              <div className="border rounded-lg p-3 bg-background mt-2">
                <HexColorPicker 
                  color={watchColor} 
                  onChange={(color) => {
                    setValue('primary_color', color, { shouldValidate: true })
                  }} 
                />
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>Color seleccionado:</span>
                  <span className="font-mono font-bold" style={{ color: watchColor }}>{watchColor}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icono del Sello</label>
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map((opt) => (
                <label key={opt.id} className="cursor-pointer">
                  <input 
                    type="radio" 
                    {...register('stamp_icon')} 
                    value={opt.id} 
                    className="peer sr-only" 
                  />
                  <div className="flex flex-col items-center gap-1 rounded-md border p-3 peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:bg-accent">
                    <opt.icon className="w-5 h-5" />
                    <span className="text-xs">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.stamp_icon && <p className="text-xs text-red-500">{errors.stamp_icon.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sellos para recompensa</label>
            <input
              type="number"
              {...register('stamps_required', { valueAsNumber: true })}
              min="1"
              max="20"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {errors.stamps_required && <p className="text-xs text-red-500">{errors.stamps_required.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción de la Recompensa</label>
            <input
              {...register('reward_description')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej. Una concha gratis"
            />
            {errors.reward_description && <p className="text-xs text-red-500">{errors.reward_description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando...' : 'Guardar y Publicar'}
          </button>
        </form>
      </div>

      <div className="hidden lg:block">
        <LivePreview
          name={watchName}
          primaryColor={watchColor}
          stampIcon={watchIcon}
          stampsRequired={watchStamps}
          rewardDescription={watchReward}
        />
      </div>
    </div>
  )
}