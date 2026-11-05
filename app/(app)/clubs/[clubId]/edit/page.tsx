import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditClubForm } from '@/components/club/edit-club-form'

interface EditPageProps {
  params: Promise<{ clubId: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditClubPage({ params }: EditPageProps) {
  const { clubId } = await params
  const supabase = await createClient()

  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()

  if (error || !club) notFound()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/clubs/${clubId}`} className="rounded-md border p-2 hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Club</h1>
          <p className="text-muted-foreground">{club.name}</p>
        </div>
      </div>

      <EditClubForm club={club} />
    </div>
  )
}