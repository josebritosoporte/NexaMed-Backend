import { useState, useEffect } from 'react'
import { Building2, Plus, X } from 'lucide-react'
import { superadminApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SAConsultorios() {
  const [consultorios, setConsultorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form
  const [formData, setFormData] = useState({
    consultorio_nombre: '',
    admin_nombre: '',
    admin_email: '',
    admin_password: '',
    plan_slug: 'profesional',
    periodo: 'mensual',
  })

  const load = () => {
    setLoading(true)
    superadminApi.getConsultorios()
      .then(res => { if (res.success && res.data) setConsultorios(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCrear = async () => {
    if (!formData.consultorio_nombre || !formData.admin_nombre || !formData.admin_email || !formData.admin_password) {
      setMsg({ type: 'error', text: 'Completa todos los campos obligatorios' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      const res = await superadminApi.crearConsultorio(formData)
      if (res.success) {
        setMsg({ type: 'success', text: 'Consultorio creado exitosamente con suscripción activa.' })
        setShowForm(false)
        setFormData({ consultorio_nombre: '', admin_nombre: '', admin_email: '', admin_password: '', plan_slug: 'profesional', periodo: 'mensual' })
        load()
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error al crear consultorio' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consultorios</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4 mr-1" />Cancelar</> : <><Plus className="h-4 w-4 mr-1" />Nuevo consultorio</>}
        </Button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Crear consultorio + usuario admin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre del consultorio *</Label>
                <Input value={formData.consultorio_nombre} onChange={e => setFormData({ ...formData, consultorio_nombre: e.target.value })} placeholder="Ej: Consultorio Dr. García" />
              </div>
              <div>
                <Label>Nombre del admin *</Label>
                <Input value={formData.admin_nombre} onChange={e => setFormData({ ...formData, admin_nombre: e.target.value })} placeholder="Dr. Juan García" />
              </div>
              <div>
                <Label>Email del admin *</Label>
                <Input type="email" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} placeholder="doctor@email.com" />
              </div>
              <div>
                <Label>Contraseña *</Label>
                <Input type="password" value={formData.admin_password} onChange={e => setFormData({ ...formData, admin_password: e.target.value })} placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <Label>Plan</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.plan_slug} onChange={e => setFormData({ ...formData, plan_slug: e.target.value })}>
                  <option value="esencial">Esencial</option>
                  <option value="profesional">Profesional</option>
                  <option value="consultorio">Consultorio</option>
                </select>
              </div>
              <div>
                <Label>Período</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.periodo} onChange={e => setFormData({ ...formData, periodo: e.target.value })}>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>
            <Button onClick={handleCrear} disabled={saving}>
              {saving ? 'Creando...' : 'Crear consultorio'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Creado</th>
                    <th className="text-center py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consultorios.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No hay consultorios</td></tr>
                  ) : consultorios.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4">#{c.id}</td>
                      <td className="py-3 px-4 font-medium">{c.nombre}</td>
                      <td className="py-3 px-4">{c.created_at ? new Date(c.created_at).toLocaleDateString('es-VE') : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={c.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
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
