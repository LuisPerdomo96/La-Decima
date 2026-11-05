'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Coffee } from 'lucide-react'

export default function JoinClubPage() {
  const params = useParams()
  const slug = params.slug as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    try {
      const response = await fetch(`/api/clubs/${slug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

        const data = await response.json()

        if (!response.ok) {
        throw new Error(data.error || 'Error al unirse al club')
        }

        // Redirigir a la tarjeta del miembro
        window.location.href = data.cardUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Únete al club</h1>
          <p className="text-muted-foreground">
            Completa el formulario y obtén tu tarjeta digital
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Tu nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ej. María González"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Tu correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="maria@ejemplo.com"
            />
          </div>

          <div className="bg-muted/50 border rounded-lg p-4 text-sm">
            <p className="mb-2">
              <strong>¿Qué obtienes?</strong>
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>✓ Tarjeta digital en tu celular</li>
              <li>✓ Acumula sellos en cada visita</li>
              <li>✓ Recompensas exclusivas</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando tu tarjeta...' : 'Unirme gratis'}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Al unirte, aceptas recibir notificaciones sobre tu tarjeta de lealtad
          </p>
        </form>
      </div>
    </div>
  )
}