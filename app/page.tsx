import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-sm font-semibold tracking-widest text-red-600 uppercase">
              La Décima
            </h1>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              El club de lealtad para tu negocio.
            </h2>
            <p className="text-xl text-muted-foreground">
              Convierte cada visita en una razón para volver.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Comenzar gratis
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}