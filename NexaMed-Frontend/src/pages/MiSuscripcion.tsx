import { useState, useEffect } from 'react'
import { Check, CreditCard, Clock, AlertTriangle, Send, FileText, ChevronDown, ChevronUp, Upload, Image, X } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { suscripcionesApi, type PlanInfo } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const estadoLabels: Record<string, { label: string; color: string }> = {
  trial: { label: 'Prueba gratuita', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Activa', color: 'bg-green-100 text-green-800' },
  grace_period: { label: 'Período de gracia', color: 'bg-amber-100 text-amber-800' },
  expired: { label: 'Expirada', color: 'bg-red-100 text-red-800' },
  suspended: { label: 'Suspendida', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
}

const periodoLabels: Record<string, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

const metodoPagoLabels: Record<string, string> = {
  transferencia: 'Transferencia bancaria',
  paypal: 'PayPal',
  pago_movil: 'Pago Móvil',
  efectivo: 'Efectivo',
  otro: 'Otro',
}

export default function MiSuscripcion() {
  const { subscription, planes, tasaBs, tasaFecha, refresh, isReadOnly } = useSubscription()
  const [pagos, setPagos] = useState<any[]>([])
  const [loadingPagos, setLoadingPagos] = useState(false)
  const [showPagoForm, setShowPagoForm] = useState(false)
  const [showPlanes, setShowPlanes] = useState(false)
  const [enviandoPago, setEnviandoPago] = useState(false)
  const [pagoMsg, setPagoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [selectedPlan, setSelectedPlan] = useState<number>(0)
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('mensual')
  const [metodoPago, setMetodoPago] = useState<string>('transferencia')
  const [referencia, setReferencia] = useState('')
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0])
  const [comprobanteNota, setComprobanteNota] = useState('')
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)

  useEffect(() => {
    loadPagos()
  }, [])

  useEffect(() => {
    if (subscription && planes.length > 0) {
      const currentPlan = planes.find(p => p.slug === subscription.plan_slug)
      if (currentPlan) {
        setSelectedPlan(currentPlan.id)
        setSelectedPeriodo(subscription.periodo || 'mensual')
      }
    }
  }, [subscription, planes])

  const loadPagos = async () => {
    setLoadingPagos(true)
    try {
      const res = await suscripcionesApi.getMisPagos()
      if (res.success && res.data) setPagos(res.data)
    } catch {
      // ignore
    } finally {
      setLoadingPagos(false)
    }
  }

  const getPrecioSeleccionado = () => {
    const plan = planes.find(p => p.id === selectedPlan)
    if (!plan) return null
    return plan.precios.find(pr => pr.periodo === selectedPeriodo)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setPagoMsg({ type: 'error', text: 'Solo se permiten archivos de imagen (JPG, PNG, etc.)' })
        return
      }
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setPagoMsg({ type: 'error', text: 'La imagen no debe superar los 5MB' })
        return
      }
      setComprobanteFile(file)
      setComprobantePreview(URL.createObjectURL(file))
    }
  }

  const removeFile = () => {
    setComprobanteFile(null)
    if (comprobantePreview) URL.revokeObjectURL(comprobantePreview)
    setComprobantePreview(null)
  }

  const handleEnviarPago = async () => {
    if (!referencia.trim()) {
      setPagoMsg({ type: 'error', text: 'Ingresa la referencia del pago' })
      return
    }
    setEnviandoPago(true)
    setPagoMsg(null)
    try {
      const res = await suscripcionesApi.enviarPago({
        plan_id: selectedPlan,
        periodo: selectedPeriodo,
        metodo_pago: metodoPago,
        referencia: referencia.trim(),
        fecha_pago: fechaPago,
        comprobante_nota: comprobanteNota.trim() || undefined,
        comprobante_file: comprobanteFile || undefined,
      })
      if (res.success) {
        setPagoMsg({ type: 'success', text: 'Pago enviado correctamente. Será verificado por el administrador.' })
        setShowPagoForm(false)
        setReferencia('')
        setComprobanteNota('')
        removeFile()
        loadPagos()
        refresh()
      }
    } catch (error: any) {
      setPagoMsg({ type: 'error', text: error.message || 'Error al enviar el pago' })
    } finally {
      setEnviandoPago(false)
    }
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    )
  }

  const estado = estadoLabels[subscription.estado] || { label: subscription.estado, color: 'bg-gray-100 text-gray-800' }
  const precioActual = getPrecioSeleccionado()

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Mensaje de feedback */}
      {pagoMsg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${pagoMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {pagoMsg.text}
        </div>
      )}

      {/* Estado actual de suscripción */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-medical-600" />
              Mi Suscripción
            </CardTitle>
            <Badge className={estado.color}>{estado.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Plan actual</p>
              <p className="text-lg font-semibold">{subscription.plan_nombre}</p>
              <p className="text-sm text-muted-foreground capitalize">{periodoLabels[subscription.periodo] || subscription.periodo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vencimiento</p>
              <p className="text-lg font-semibold">
                {new Date(subscription.fecha_fin).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {subscription.dias_restantes} día{subscription.dias_restantes !== 1 ? 's' : ''} restante{subscription.dias_restantes !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Límites</p>
              <p className="text-sm">Usuarios: <span className="font-medium">{subscription.max_usuarios === -1 ? 'Ilimitados' : subscription.max_usuarios}</span></p>
              <p className="text-sm">Pacientes: <span className="font-medium">{subscription.max_pacientes === -1 ? 'Ilimitados' : subscription.max_pacientes}</span></p>
            </div>
          </div>

          {isReadOnly && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Tu cuenta está en modo solo lectura. Renueva tu suscripción para recuperar el acceso completo.</span>
            </div>
          )}

          {subscription.estado === 'trial' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800 text-sm">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Estás en período de prueba con el plan Profesional. Selecciona un plan para continuar usando DaliaMed.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planes disponibles */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowPlanes(!showPlanes)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Planes disponibles</CardTitle>
            {showPlanes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {showPlanes && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planes.map(plan => {
                const isCurrent = plan.slug === subscription.plan_slug
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border-2 p-4 transition-all ${isCurrent ? 'border-medical-500 bg-medical-50' : 'border-border hover:border-medical-300'}`}
                  >
                    <h3 className="font-bold text-lg">{plan.nombre}</h3>
                    {isCurrent && <Badge className="bg-medical-100 text-medical-700 text-xs mb-2">Plan actual</Badge>}
                    <p className="text-sm text-muted-foreground mb-3">{plan.descripcion}</p>
                    <div className="space-y-1 text-sm mb-3">
                      <p>Usuarios: <span className="font-medium">{plan.max_usuarios === -1 ? 'Ilimitados' : plan.max_usuarios}</span></p>
                      <p>Pacientes: <span className="font-medium">{plan.max_pacientes === -1 ? 'Ilimitados' : plan.max_pacientes}</span></p>
                    </div>
                    <div className="space-y-1">
                      {plan.precios.map(precio => (
                        <div key={precio.id} className="flex justify-between text-sm">
                          <span className="capitalize">{periodoLabels[precio.periodo]}</span>
                          <span className="font-semibold">
                            ${precio.precio}
                            {tasaBs && <span className="text-xs text-muted-foreground ml-1">/ Bs {(precio.precio * tasaBs).toFixed(2)}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {tasaBs && tasaFecha && (
              <p className="text-xs text-muted-foreground mt-3">
                Tasa BCV: 1 USD = {tasaBs} Bs (actualizada: {new Date(tasaFecha).toLocaleDateString('es-VE')})
              </p>
            )}
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="pagar">
        <TabsList>
          <TabsTrigger value="pagar">Enviar pago</TabsTrigger>
          <TabsTrigger value="historial">Historial de pagos</TabsTrigger>
        </TabsList>

        {/* Formulario de pago */}
        <TabsContent value="pagar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Reportar pago
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Envía los datos de tu pago para que sea verificado por el administrador.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Plan</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedPlan}
                    onChange={e => setSelectedPlan(Number(e.target.value))}
                  >
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Período</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedPeriodo}
                    onChange={e => setSelectedPeriodo(e.target.value)}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              {precioActual && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Monto a pagar: <span className="text-lg font-bold text-medical-600">${precioActual.precio} USD</span>
                    {tasaBs && (
                      <span className="ml-2 text-muted-foreground">
                        = Bs {(precioActual.precio * tasaBs).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Método de pago</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value)}
                  >
                    {Object.entries(metodoPagoLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Fecha del pago</Label>
                  <Input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Referencia / Número de comprobante *</Label>
                <Input
                  placeholder="Ej: 00012345678"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                />
              </div>

              <div>
                <Label>Nota adicional (opcional)</Label>
                <Input
                  placeholder="Información adicional sobre el pago"
                  value={comprobanteNota}
                  onChange={e => setComprobanteNota(e.target.value)}
                />
              </div>

              <div>
                <Label>Comprobante de pago (opcional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Sube una captura de pantalla o foto del comprobante. Máximo 5MB. Formatos: JPG, PNG.
                </p>
                {!comprobanteFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-medical-400 hover:bg-medical-50/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Haz clic para seleccionar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={comprobantePreview || ''}
                      alt="Comprobante"
                      className="h-28 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">{comprobanteFile.name}</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full md:w-auto"
                onClick={handleEnviarPago}
                disabled={enviandoPago || !referencia.trim()}
              >
                {enviandoPago ? 'Enviando...' : 'Enviar pago para verificación'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial de pagos */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPagos ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-600" />
                </div>
              ) : pagos.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No hay pagos registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Fecha</th>
                        <th className="text-left py-2 px-2">Método</th>
                        <th className="text-left py-2 px-2">Referencia</th>
                        <th className="text-right py-2 px-2">Monto USD</th>
                        <th className="text-right py-2 px-2">Monto Bs</th>
                        <th className="text-center py-2 px-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((pago: any) => (
                        <tr key={pago.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">{new Date(pago.fecha_pago).toLocaleDateString('es-VE')}</td>
                          <td className="py-2 px-2">{metodoPagoLabels[pago.metodo_pago] || pago.metodo_pago}</td>
                          <td className="py-2 px-2 font-mono text-xs">{pago.referencia}</td>
                          <td className="py-2 px-2 text-right font-medium">${pago.monto}</td>
                          <td className="py-2 px-2 text-right">{pago.monto_bs ? `Bs ${pago.monto_bs}` : '-'}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge className={
                              pago.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                              pago.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {pago.estado === 'aprobado' ? 'Aprobado' :
                               pago.estado === 'pendiente' ? 'Pendiente' : 'Rechazado'}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
