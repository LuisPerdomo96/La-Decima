'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LogoUploaderProps {
  clubId?: string
  currentLogoUrl?: string | null
  onLogoUploaded?: (url: string) => void
}

export function LogoUploader({ clubId, currentLogoUrl, onLogoUploaded }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('La imagen no puede pesar más de 4MB')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      
      // Generar nombre único con timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      
      // Si hay clubId, usar carpeta del club, si no, usar 'temp'
      const folder = clubId || 'temp'
      const filePath = `${folder}/${fileName}`

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: true
        })

      if (uploadError) {
        console.error('Error de subida:', uploadError)
        throw uploadError
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('club-logos')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onLogoUploaded?.(publicUrl)
    } catch (error) {
      console.error('Error subiendo logo:', error)
      alert('Error al subir el logo: ' + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onLogoUploaded?.('')
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Logo del Negocio (opcional)</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Logo"
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Subir</span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">PNG, JPG o SVG. Máximo 4MB.</p>
    </div>
  )
}