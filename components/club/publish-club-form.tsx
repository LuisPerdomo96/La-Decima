'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishClub } from '@/actions/club-actions'

interface PublishClubFormProps {
  clubId: string
}

export function PublishClubForm({ clubId }: PublishClubFormProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()

  const handlePublish = async () => {
    if (!confirm('¿Estás seguro de publicar este club? Los clientes podrán unirse.')) {
      return
    }

    setIsPublishing(true)
    const result = await publishClub(clubId)
    
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh() // Recargar la página para mostrar el nuevo estado
    }
    setIsPublishing(false)
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isPublishing ? 'Publicando...' : 'Publicar Club Ahora'}
    </button>
  )
}