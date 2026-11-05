'use client'

import { useState } from 'react'
import { Search, Coffee, MoreVertical } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  member_code: string
  current_stamps: number
  total_stamps_earned: number
  rewards_redeemed: number
  joined_at: string
  last_visit_at: string | null
  wallet_type: string | null
}

interface Club {
  id: string
  name: string
  stamps_required: number
  primary_color: string
}

interface MembersClientProps {
  members: Member[]
  club: Club
}

export function MembersClient({ members, club }: MembersClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'complete'>('all')

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.member_code.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'active') {
      if (!member.last_visit_at) return false
      const lastVisit = new Date(member.last_visit_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastVisit >= thirtyDaysAgo
    }

    if (filter === 'inactive') {
      if (!member.last_visit_at) return true
      const lastVisit = new Date(member.last_visit_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastVisit < thirtyDaysAgo
    }

    if (filter === 'complete') {
      return member.current_stamps >= club.stamps_required
    }

    return true
  })

  const getStatusBadge = (member: Member) => {
    if (member.current_stamps >= club.stamps_required) {
      return { label: 'Recompensa lista', color: 'bg-green-100 text-green-700' }
    }
    if (!member.last_visit_at) {
      return { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' }
    }
    const lastVisit = new Date(member.last_visit_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (lastVisit >= thirtyDaysAgo) {
      return { label: 'Activo', color: 'bg-green-100 text-green-700' }
    }
    return { label: 'Inactivo', color: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="bg-card border rounded-xl">
      {/* Filtros */}
      <div className="p-4 border-b flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'complete'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {f === 'all' && 'Todos'}
              {f === 'active' && 'Activos'}
              {f === 'inactive' && 'Inactivos'}
              {f === 'complete' && 'Recompensa lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Miembro</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Código</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Sellos</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Última visita</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Unido</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Coffee className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No se encontraron miembros</p>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const status = getStatusBadge(member)
                return (
                  <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: club.primary_color }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {member.member_code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {member.current_stamps}/{club.stamps_required}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {member.last_visit_at
                        ? new Date(member.last_visit_at).toLocaleDateString('es-ES')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-sm text-muted-foreground">
        Mostrando {filteredMembers.length} de {members.length} miembros
      </div>
    </div>
  )
}