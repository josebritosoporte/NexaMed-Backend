import { useState, useEffect } from 'react'
import { DollarSign, Plus, TrendingUp } from 'lucide-react'
import { superadminApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SATasa() {
  const [tasaActual, setTasaActual] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevaTasa, setNuevaTasa] = useState('')
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      superadminApi.getTasa(),
      superadminApi.getTasasHistorial(30)
    ]).then(([tasaRes, histRes]) => {
      if (tasaRes.success) setTasaActual(tasaRes.data)
      if (histRes.success && histRes.data) setHistorial(histRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRegistrar = async () => {
    const valor = parseFloat(nuevaTasa)
    if (isNaN(valor) || valor <= 0) {
      setMsg({ type: 'error', text: 'Ingresa una tasa válida' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      const res = await superadminApi.registrarTasa(valor, nuevaFecha)
      if (res.success) {
        setMsg({ type: 'success', text: 'Tasa registrada correctamente' })
        setNuevaTasa('')
        load()
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error al registrar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Tasa de cambio USD/Bs</h1>

      {/* Tasa actual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Tasa actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasaActual ? (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-green-600">Bs {tasaActual.tasa_bs}</span>
              <span className="text-muted-foreground">por 1 USD</span>
              <span className="text-sm text-muted-foreground ml-auto">
                Fecha: {new Date(tasaActual.fecha).toLocaleDateString('es-VE')}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground">No hay tasa registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Registrar nueva tasa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar nueva tasa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {msg && (
            <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {msg.text}
            </div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>Tasa Bs/USD</Label>
              <Input type="number" step="0.01" placeholder="Ej: 86.50" value={nuevaTasa} onChange={e => setNuevaTasa(e.target.value)} />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} />
            </div>
            <Button onClick={handleRegistrar} disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historial (últimos 30 registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historial.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Sin registros</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Fecha</th>
                    <th className="text-right py-2 px-3">Tasa Bs</th>
                    <th className="text-left py-2 px-3">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-3">{new Date(t.fecha).toLocaleDateString('es-VE')}</td>
                      <td className="py-2 px-3 text-right font-medium">Bs {t.tasa_bs}</td>
                      <td className="py-2 px-3 text-muted-foreground">{t.superadmin_nombre || '-'}</td>
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
