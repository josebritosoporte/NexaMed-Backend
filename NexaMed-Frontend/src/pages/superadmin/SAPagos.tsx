import { useState, useEffect } from 'react'
import { Check, X, Clock, Image, ExternalLink } from 'lucide-react'
import { superadminApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const BACKEND_BASE = (import.meta.env.VITE_API_URL || 'http://localhost/DaliaMed/api.php').replace('/api.php', '/')

const estadoPagoColors: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

const metodoPagoLabels: Record<string, string> = {
  transferencia: 'Transferencia', paypal: 'PayPal',
  pago_movil: 'Pago Móvil', efectivo: 'Efectivo', otro: 'Otro',
}

export default function SAPagos() {
  const [pagos, setPagos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendiente')
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectNota, setRejectNota] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    superadminApi.getPagos(filtro || undefined)
      .then(res => { if (res.success && res.data) setPagos(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filtro])

  const handleAprobar = async (id: number) => {
    setProcessing(id)
    try {
      await superadminApi.aprobarPago(id)
      load()
    } catch { /* ignore */ }
    finally { setProcessing(null) }
  }

  const handleRechazar = async (id: number) => {
    if (!rejectNota.trim()) return
    setProcessing(id)
    try {
      await superadminApi.rechazarPago(id, rejectNota.trim())
      setRejectId(null)
      setRejectNota('')
      load()
    } catch { /* ignore */ }
    finally { setProcessing(null) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pagos</h1>

      <div className="flex gap-3">
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
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
                    <th className="text-left py-3 px-4">Método</th>
                    <th className="text-left py-3 px-4">Referencia</th>
                    <th className="text-center py-3 px-4">Comp.</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-right py-3 px-4">USD</th>
                    <th className="text-right py-3 px-4">Bs</th>
                    <th className="text-center py-3 px-4">Estado</th>
                    <th className="text-center py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.length === 0 ? (
                    <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No hay pagos</td></tr>
                  ) : pagos.map((pago: any) => (
                    <tr key={pago.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{pago.consultorio_nombre || `#${pago.consultorio_id}`}</td>
                      <td className="py-3 px-4">{metodoPagoLabels[pago.metodo_pago] || pago.metodo_pago}</td>
                      <td className="py-3 px-4 font-mono text-xs">{pago.referencia}</td>
                      <td className="py-3 px-4 text-center">
                        {pago.comprobante_url ? (
                          <a
                            href={`${BACKEND_BASE}${pago.comprobante_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-medical-600 hover:text-medical-800 text-xs font-medium"
                            title="Ver comprobante"
                          >
                            <Image className="h-3.5 w-3.5" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-VE') : '-'}</td>
                      <td className="py-3 px-4 text-right font-medium">${pago.monto}</td>
                      <td className="py-3 px-4 text-right">{pago.monto_bs ? `Bs ${pago.monto_bs}` : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={estadoPagoColors[pago.estado] || 'bg-gray-100'}>
                          {pago.estado === 'pendiente' ? 'Pendiente' : pago.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {pago.estado === 'pendiente' && (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => handleAprobar(pago.id)} disabled={processing === pago.id}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7" onClick={() => setRejectId(pago.id)} disabled={processing === pago.id}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {rejectId === pago.id && (
                          <div className="mt-2 flex gap-1">
                            <Input placeholder="Motivo..." className="h-7 text-xs" value={rejectNota} onChange={e => setRejectNota(e.target.value)} />
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleRechazar(pago.id)} disabled={!rejectNota.trim()}>
                              Rechazar
                            </Button>
                          </div>
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
