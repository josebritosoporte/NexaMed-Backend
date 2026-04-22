import { useState, useEffect } from 'react'
import { Check, X, Crown, Star, Building2, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { planesApi, type PlanInfo } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const periodoLabels: Record<string, { label: string; desc: string }> = {
  mensual: { label: 'Mensual', desc: '1 mes' },
  trimestral: { label: 'Trimestral', desc: '3 meses' },
  semestral: { label: 'Semestral', desc: '6 meses' },
  anual: { label: 'Anual', desc: '12 meses' },
}

const planIcons: Record<string, any> = {
  esencial: Star,
  profesional: Crown,
  consultorio: Building2,
}

const planColors: Record<string, { border: string; bg: string; badge: string; btn: string }> = {
  esencial: {
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-700',
    btn: 'bg-slate-700 hover:bg-slate-800',
  },
  profesional: {
    border: 'border-medical-500 ring-2 ring-medical-100',
    bg: 'bg-medical-50',
    badge: 'bg-medical-100 text-medical-700',
    btn: 'bg-medical-600 hover:bg-medical-700',
  },
  consultorio: {
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
  },
}

// Características detalladas por plan
const planFeatures: Record<string, { label: string; esencial: string | boolean; profesional: string | boolean; consultorio: string | boolean }[]> = {
  general: [
    { label: 'Usuarios', esencial: '2', profesional: '5', consultorio: 'Ilimitados' },
    { label: 'Pacientes', esencial: '100', profesional: '500', consultorio: 'Ilimitados' },
    { label: 'Almacenamiento', esencial: '1 GB', profesional: '5 GB', consultorio: '20 GB' },
    { label: 'Historia clínica digital', esencial: true, profesional: true, consultorio: true },
    { label: 'Agenda de citas', esencial: true, profesional: true, consultorio: true },
    { label: 'Órdenes médicas', esencial: true, profesional: true, consultorio: true },
    { label: 'Dashboard / Escritorio', esencial: true, profesional: true, consultorio: true },
    { label: 'Asistente médico (rol)', esencial: false, profesional: true, consultorio: true },
    { label: 'Archivos adjuntos', esencial: false, profesional: true, consultorio: true },
    { label: 'Marca personalizada', esencial: 'DaliaMed', profesional: 'Logo propio', consultorio: 'Marca completa' },
    { label: 'Exportación de datos', esencial: 'PDF', profesional: 'PDF, Excel', consultorio: 'PDF, Excel, CSV' },
    { label: 'Agenda compartida', esencial: false, profesional: false, consultorio: true },
    { label: 'Permisos por rol', esencial: 'Básico', profesional: 'Avanzado', consultorio: 'Completo' },
    { label: 'Reportes avanzados', esencial: false, profesional: false, consultorio: true },
    { label: 'Plantillas personalizadas', esencial: false, profesional: false, consultorio: true },
    { label: 'Respaldo automático', esencial: false, profesional: false, consultorio: true },
  ],
}

export default function Planes() {
  const navigate = useNavigate()
  const { subscription, tasaBs, tasaFecha } = useSubscription()
  const [planes, setPlanes] = useState<PlanInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('mensual')

  useEffect(() => {
    planesApi.getAll().then(res => {
      if (res.success && res.data) {
        setPlanes(res.data.planes || [])
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Elige tu plan</h1>
        <p className="text-muted-foreground text-lg">
          Todos los planes incluyen 14 días de prueba gratuita con el plan Profesional
        </p>
      </div>

      {/* Period selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-muted p-1 gap-1">
          {Object.entries(periodoLabels).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedPeriodo(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriodo === key
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {val.label}
              {key === 'anual' && (
                <span className="ml-1 text-xs text-green-600 font-semibold">-67%</span>
              )}
              {key === 'semestral' && (
                <span className="ml-1 text-xs text-green-600 font-semibold">-50%</span>
              )}
              {key === 'trimestral' && (
                <span className="ml-1 text-xs text-green-600 font-semibold">-25%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map(plan => {
          const colors = planColors[plan.slug] || planColors.esencial
          const Icon = planIcons[plan.slug] || Star
          const precio = plan.precios.find(p => p.periodo === selectedPeriodo)
          const precioMensual = plan.precios.find(p => p.periodo === 'mensual')
          const isCurrent = subscription?.plan_slug === plan.slug
          const isPopular = plan.slug === 'profesional'

          // Calcular precio mensual equivalente
          const diasPeriodo = precio?.dias || 30
          const precioMensualEquiv = precio ? (precio.precio / (diasPeriodo / 30)).toFixed(2) : '0'

          return (
            <Card key={plan.id} className={`relative overflow-hidden border-2 ${colors.border} transition-all hover:shadow-lg`}>
              {isPopular && (
                <div className="absolute top-0 right-0 bg-medical-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Más popular
                </div>
              )}

              <CardHeader className={`${colors.bg} pb-4`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors.badge}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                    {isCurrent && <Badge className="bg-green-100 text-green-700 text-xs">Tu plan actual</Badge>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.descripcion}</p>
              </CardHeader>

              <CardContent className="pt-4 space-y-5">
                {/* Precio */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${precio?.precio || 0}</span>
                    <span className="text-muted-foreground text-sm">USD</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {periodoLabels[selectedPeriodo]?.desc || selectedPeriodo}
                    {selectedPeriodo !== 'mensual' && precioMensual && (
                      <span className="ml-1">
                        (${precioMensualEquiv}/mes)
                      </span>
                    )}
                  </p>
                  {tasaBs && precio && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = Bs {(precio.precio * tasaBs).toFixed(2)}
                    </p>
                  )}
                  {selectedPeriodo !== 'mensual' && precioMensual && precio && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Ahorras ${((precioMensual.precio * (precio.dias / 30)) - precio.precio).toFixed(0)} USD vs mensual
                    </p>
                  )}
                </div>

                {/* Límites principales */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Usuarios</span>
                    <span className="font-semibold">{plan.max_usuarios === -1 ? 'Ilimitados' : plan.max_usuarios}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pacientes</span>
                    <span className="font-semibold">{plan.max_pacientes === -1 ? 'Ilimitados' : plan.max_pacientes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Almacenamiento</span>
                    <span className="font-semibold">{plan.max_storage_gb} GB</span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  className={`w-full ${colors.btn} text-white`}
                  onClick={() => navigate('/app/suscripcion')}
                >
                  {isCurrent ? 'Plan actual' : 'Seleccionar plan'}
                  {!isCurrent && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tasa de cambio */}
      {tasaBs && tasaFecha && (
        <p className="text-center text-sm text-muted-foreground">
          Tasa de referencia BCV: 1 USD = Bs {tasaBs} (actualizada: {new Date(tasaFecha).toLocaleDateString('es-VE')})
        </p>
      )}

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">Comparativa detallada de planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 w-1/4">Característica</th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <Star className="h-4 w-4 text-slate-500" />
                      <span className="font-bold">Esencial</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 bg-medical-50">
                    <div className="flex flex-col items-center gap-1">
                      <Crown className="h-4 w-4 text-medical-600" />
                      <span className="font-bold text-medical-700">Profesional</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className="h-4 w-4 text-violet-500" />
                      <span className="font-bold">Consultorio</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.general.map((feature, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <td className="py-2.5 px-4 font-medium">{feature.label}</td>
                    {(['esencial', 'profesional', 'consultorio'] as const).map(slug => {
                      const val = feature[slug]
                      return (
                        <td key={slug} className={`py-2.5 px-4 text-center ${slug === 'profesional' ? 'bg-medical-50/50' : ''}`}>
                          {val === true ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : val === false ? (
                            <X className="h-4 w-4 text-slate-300 mx-auto" />
                          ) : (
                            <span className="text-sm">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trial info */}
      <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1">14 días de prueba gratuita</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Todos los nuevos consultorios comienzan con una prueba gratuita de 14 días con el plan Profesional completo. 
          No se requiere tarjeta de crédito. Al finalizar, elige el plan que mejor se adapte a tu práctica.
        </p>
      </div>

      {/* Payment methods */}
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold">Métodos de pago aceptados</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['Transferencia bancaria', 'PayPal', 'Pago Móvil', 'Efectivo'].map(method => (
            <Badge key={method} variant="outline" className="px-3 py-1.5 text-sm">
              {method}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Los pagos son verificados manualmente por nuestro equipo. Tu suscripción se activa una vez aprobado el pago.
        </p>
      </div>
    </div>
  )
}
