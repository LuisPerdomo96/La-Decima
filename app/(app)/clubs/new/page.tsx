import { ClubForm } from '@/components/club/club-form'

export default function NewClubPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Club</h1>
          <p className="text-muted-foreground">Diseña tu tarjeta de lealtad digital</p>
        </div>
      </div>
      
      <ClubForm />
    </div>
  )
}