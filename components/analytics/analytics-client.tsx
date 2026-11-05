'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

interface Member {
  id: string
  name: string
  email: string
  member_code: string
  current_stamps: number
  joined_at: string
  last_visit_at: string | null
}

interface Stamp {
  id: string
  member_id: string
  created_at: string
}

interface Reward {
  id: string
  member_id: string
  status: string
  earned_at: string
}

interface Club {
  id: string
  name: string
  stamps_required: number
  primary_color: string
}

interface Segments {
  nuevos: number
  fieles: number
  regulares: number
  atrasados: number
  dormidos: number
}

interface AnalyticsClientProps {
  members: Member[]
  stamps: Stamp[]
  rewards: Reward[]
  club: Club
  segments: Segments
}

export function AnalyticsClient({ members, stamps, rewards, club, segments }: AnalyticsClientProps) {
  // Datos para gráfica de visitas por semana (últimas 12 semanas)
  const visitsByWeek = useMemo(() => {
    const weeks: { week: string; visitas: number }[] = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      
      const weekVisits = stamps.filter(s => {
        const stampDate = new Date(s.created_at)
        return stampDate >= weekStart && stampDate <= weekEnd
      }).length

      weeks.push({
        week: format(weekStart, 'dd MMM', { locale: es }),
        visitas: weekVisits,
      })
    }

    return weeks
  }, [stamps])

  // Heatmap: visitas por día de la semana y hora
  const heatmapData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8am a 10pm

    const matrix: { day: string; hour: number; count: number }[] = []

    days.forEach(day => {
      hours.forEach(hour => {
        const count = stamps.filter(s => {
          const date = new Date(s.created_at)
          const dayIndex = (date.getDay() + 6) % 7 // 0=Lun
          return days[dayIndex] === day && date.getHours() === hour
        }).length

        matrix.push({ day, hour, count })
      })
    })

    return matrix
  }, [stamps])

  const maxHeatmapCount = Math.max(...heatmapData.map(h => h.count), 1)

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    const intensity = count / maxHeatmapCount
    if (intensity > 0.75) return 'bg-primary'
    if (intensity > 0.5) return 'bg-primary/70'
    if (intensity > 0.25) return 'bg-primary/40'
    return 'bg-primary/20'
  }

  const segmentData = [
    { name: 'Nuevos', value: segments.nuevos, color: 'bg-blue-500', description: 'Unidos en los últimos 30 días' },
    { name: 'Fieles', value: segments.fieles, color: 'bg-green-500', description: '5+ visitas y siguen viniendo' },
    { name: 'Regulares', value: segments.regulares, color: 'bg-emerald-500', description: 'Visitan en su ritmo' },
    { name: 'Atrasados', value: segments.atrasados, color: 'bg-yellow-500', description: 'Pasaron 1.5x su ritmo' },
    { name: 'Dormidos', value: segments.dormidos, color: 'bg-red-500', description: 'Sin visitas en 90+ días' },
  ]

  return (
    <div className="space-y-6">
      {/* Gráfica de visitas por semana */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Visitas por semana</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitsByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitas" fill={club.primary_color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">¿Cuándo vienen?</h2>
        <p className="text-sm text-muted-foreground mb-4">Visitas por día de la semana y hora</p>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header de horas */}
            <div className="flex mb-2 ml-16">
              {Array.from({ length: 14 }, (_, i) => i + 8).map(hour => (
                <div key={hour} className="flex-1 text-xs text-muted-foreground text-center">
                  {hour}h
                </div>
              ))}
            </div>

            {/* Filas de días */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-16 text-sm font-medium">{day}</div>
                <div className="flex flex-1 gap-0.5">
                  {Array.from({ length: 14 }, (_, i) => i + 8).map(hour => {
                    const cell = heatmapData.find(h => h.day === day && h.hour === hour)
                    const count = cell?.count || 0
                    return (
                      <div
                        key={hour}
                        className={`flex-1 aspect-square rounded-sm ${getHeatmapColor(count)} transition-colors`}
                        title={`${day} ${hour}h: ${count} visitas`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-gray-100 rounded-sm" />
            <div className="w-4 h-4 bg-primary/20 rounded-sm" />
            <div className="w-4 h-4 bg-primary/40 rounded-sm" />
            <div className="w-4 h-4 bg-primary/70 rounded-sm" />
            <div className="w-4 h-4 bg-primary rounded-sm" />
          </div>
          <span>Más</span>
        </div>
      </div>

      {/* Segmentación de clientes */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Segmentación de clientes</h2>
        <p className="text-sm text-muted-foreground mb-6">Cada cliente contra su propio ritmo</p>

        <div className="space-y-4">
          {segmentData.map(segment => {
            const percentage = members.length > 0 
              ? (segment.value / members.length) * 100 
              : 0

            return (
              <div key={segment.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-xs text-muted-foreground">{segment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{segment.value}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${segment.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}