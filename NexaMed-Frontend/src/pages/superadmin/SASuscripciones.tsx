import { useState, useEffect } from 'react'
import { Search, Edit2, Save, X } from 'lucide-react'
import { superadminApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const estadoColors: Record<string, string> = {
  trial: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  grace_period: 'bg-amber-100 text-amber-800',
  expired: 'bg-red-100 text-red-800',
  suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const estadoLabels: Record<string, string> = {
  trial: 'Trial', active: 'Activa', grace_period: 'Gracia', expired: 'Expirada', suspended: 'Suspendida', cancelled: 'Cancelada',
}

export default function SASuscripciones() {
  const [suscripciones, setSuscripciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    superadminApi.getSuscripciones(filtro || undefined, search || undefined)
      .then(res => { if (res.success && res.data) setSuscripciones(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filtro, search])

  const handleEdit = (sub: any) => {
    setEditingId(sub.id)
    setEditData({ estado: sub.estado, fecha_fin: sub.fecha_fin?.split(' ')[0] || '' })
  }

  const handleSave = async (id: number) => {
    setSaving(true)
    try {
      await superadminApi.modificarSuscripcion(id, editData)
      setEditingId(null)
      load()
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Suscripciones</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar consultorio..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="">Todos</option>
          <option value="trial">Trial</option>
          <option value="active">Activa</option>
          <option value="grace_period">Gracia</option>
          <option value="expired">Expirada</option>
          <option value="suspended">Suspendida</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4">Consultorio</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Período</th>
                    <th className="text-center py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Vencimiento</th>
                    <th className="text-center py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {suscripciones.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay suscripciones</td></tr>
                  ) : suscripciones.map((sub: any) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <p className="font-medium">{sub.consultorio_nombre || `Consultorio #${sub.consultorio_id}`}</p>
                      </td>
                      <td className="py-3 px-4">{sub.plan_nombre || '-'}</td>
                      <td className="py-3 px-4 capitalize">{sub.periodo || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        {editingId === sub.id ? (
                          <select className="h-8 rounded border text-xs px-2" value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                            {Object.entries(estadoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        ) : (
                          <Badge className={estadoColors[sub.estado] || 'bg-gray-100'}>{estadoLabels[sub.estado] || sub.estado}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === sub.id ? (
                          <Input type="date" className="h-8 w-40 text-xs" value={editData.fecha_fin} onChange={e => setEditData({ ...editData, fecha_fin: e.target.value })} />
                        ) : (
                          sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString('es-VE') : '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {editingId === sub.id ? (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" className="h-7" onClick={() => handleSave(sub.id)} disabled={saving}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => handleEdit(sub)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
