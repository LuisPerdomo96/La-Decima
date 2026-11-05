'use client'

interface FormattedDateProps {
  dateString: string
}

export function FormattedDate({ dateString }: FormattedDateProps) {
  const date = new Date(dateString)
  
  return (
    <span>
      {date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </span>
  )
}