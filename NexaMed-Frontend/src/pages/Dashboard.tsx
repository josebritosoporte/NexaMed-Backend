import { useState, useMemo, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Activity,
  Heart,
  TestTube,
  Scan,
  ArrowRight,
  CheckCircle,
  XCircle,
  Timer,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardApi } from '@/services/api'

// Datos de estadísticas principales
const statsData = [
  { 
    title: 'Pacientes Totales', 
    value: '1,284', 
    change: '+12%', 
    icon: Users, 
    trend: 'up',
    detail: '23 nuevos este mes'
  },
  { 
    title: 'Consultas Hoy', 
    value: '8', 
    change: '+2', 
    icon: Stethoscope, 
    trend: 'up',
    detail: '5 atendidas'
  },
  { 
    title: 'Citas Programadas', 
    value: '24', 
    change: '5 hoy', 
    icon: Calendar, 
    trend: 'neutral',
    detail: 'Esta semana'
  },
  { 
    title: 'Órdenes Médicas', 
    value: '15', 
    change: '-3', 
    icon: FileText, 
    trend: 'down',
    detail: 'Pendientes de revisión'
  },
]

// Datos de actividad mensual para gráfico
const actividadMensual = [
  { mes: 'Ene', consultas: 45, pacientes: 12 },
  { mes: 'Feb', consultas: 52, pacientes: 18 },
  { mes: 'Mar', consultas: 48, pacientes: 15 },
  { mes: 'Abr', consultas: 61, pacientes: 23 },
]

// Datos para gráfico de tipo de consultas
const tipoConsultas = [
  { tipo: 'Consulta General', cantidad: 35, porcentaje: 45, color: '#9B3557' },
  { tipo: 'Control', cantidad: 25, porcentaje: 32, color: '#3b82f6' },
  { tipo: 'Urgencia', cantidad: 12, porcentaje: 15, color: '#ef4444' },
  { tipo: 'Seguimiento', cantidad: 6, porcentaje: 8, color: '#f59e0b' },
]

// Citas de hoy
const citasHoy = [
  { id: 1, paciente: 'María González', hora: '09:00', duracion: '30 min', motivo: 'Consulta general', estado: 'atendida' },
  { id: 2, paciente: 'Carlos Ruiz', hora: '09:30', duracion: '30 min', motivo: 'Control de presión arterial', estado: 'atendida' },
  { id: 3, paciente: 'Ana Martínez', hora: '10:00', duracion: '30 min', motivo: 'Dolor de cabeza', estado: 'en-curso' },
  { id: 4, paciente: 'Luis Hernández', hora: '10:30', duracion: '30 min', motivo: 'Revisión anual', estado: 'programada' },
  { id: 5, paciente: 'Sofia López', hora: '11:00', duracion: '30 min', motivo: 'Análisis de resultados', estado: 'programada' },
  { id: 6, paciente: 'Pedro Sánchez', hora: '11:30', duracion: '30 min', motivo: 'Consulta dermatológica', estado: 'programada' },
]

// Pacientes recientes
const pacientesRecientes = [
  { id: 1, nombre: 'María González', edad: 45, ultimaVisita: '2026-04-14', diagnostico: 'Hipertensión controlada', proximaCita: '2026-04-28' },
  { id: 2, nombre: 'Carlos Ruiz', edad: 62, ultimaVisita: '2026-04-14', diagnostico: 'Diabetes tipo 2', proximaCita: '2026-04-21' },
  { id: 3, nombre: 'Ana Martínez', edad: 28, ultimaVisita: '2026-04-14', diagnostico: 'Migraña', proximaCita: null },
  { id: 4, nombre: 'Luis Hernández', edad: 55, ultimaVisita: '2026-04-13', diagnostico: 'Check-up anual', proximaCita: '2027-04-13' },
]

// Órdenes pendientes (fallback si no hay datos del backend)
const ordenesPendientesFallback = [
  { id: 1, paciente: 'Carlos Ruiz', tipo: 'laboratorio', fecha: '2026-04-13', estado: 'pendiente' },
  { id: 2, paciente: 'Ana Martínez', tipo: 'imagenologia', fecha: '2026-04-12', estado: 'pendiente' },
  { id: 3, paciente: 'María González', tipo: 'laboratorio', fecha: '2026-04-11', estado: 'resultado-listo' },
]

// Función auxiliar para clases
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(3) // Abril
  const [stats, setStats] = useState<any>(null)
  const [citasHoyData, setCitasHoyData] = useState<any[]>([])
  const [actividadReciente, setActividadReciente] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Cargar estadísticas
        const statsResponse = await dashboardApi.getStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
        
        // Cargar citas de hoy
        const citasResponse = await dashboardApi.getCitasHoy()
        if (citasResponse.success && citasResponse.data) {
          setCitasHoyData(Array.isArray(citasResponse.data) ? citasResponse.data : [])
        }
        
        // Cargar actividad reciente
        const actividadResponse = await dashboardApi.getActividad()
        if (actividadResponse.success && actividadResponse.data) {
          setActividadReciente(Array.isArray(actividadResponse.data) ? actividadResponse.data : [])
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  // Calcular máximo para gráfico
  const maxConsultas = Math.max(...actividadMensual.map(m => m.consultas))

  // Obtener saludo según hora
  const getSaludo = () => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buenos días'
    if (hora < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Stats de progreso del día
  const progresoDia = useMemo(() => {
    const atendidas = citasHoyData.filter((c: any) => c.estado === 'completada').length
    const enCurso = citasHoyData.filter((c: any) => c.estado === 'en-curso').length
    const programadas = citasHoyData.filter((c: any) => c.estado === 'pendiente' || c.estado === 'confirmada').length
    const total = citasHoyData.length
    return { atendidas, enCurso, programadas, total, porcentaje: total > 0 ? Math.round((atendidas / total) * 100) : 0 }
  }, [citasHoyData])

  // Datos de estadísticas con valores reales
  const statsDataReal = useMemo(() => {
    if (!stats) return statsData
    
    return [
      { 
        title: 'Pacientes Totales', 
        value: stats.pacientes_total?.toString() || '0', 
        change: `+${stats.pacientes_nuevos_mes || 0}`, 
        icon: Users, 
        trend: 'up',
        detail: 'Nuevos este mes'
      },
      { 
        title: 'Consultas Hoy', 
        value: stats.consultas_hoy?.toString() || '0', 
        change: 'hoy', 
        icon: Stethoscope, 
        trend: 'neutral',
        detail: 'Atendidas'
      },
      { 
        title: 'Citas Programadas', 
        value: stats.citas_hoy?.toString() || '0', 
        change: `${stats.citas_pendientes_hoy || 0} pendientes`, 
        icon: Calendar, 
        trend: 'neutral',
        detail: 'Para hoy'
      },
      { 
        title: 'Órdenes Médicas', 
        value: stats.ordenes_pendientes?.toString() || '0', 
        change: 'pendientes', 
        icon: FileText, 
        trend: 'neutral',
        detail: 'Por revisar'
      },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con saludo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{getSaludo()}, {user?.name?.split(' ')[1] || 'Doctor'}</h1>
          <p className="text-muted-foreground">
            {formatDate(new Date())} • Tienes {progresoDia.programadas} citas pendientes hoy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Ver Agenda
          </Button>
          <Button size="sm" className="bg-medical-500 hover:bg-medical-600">
            <Stethoscope className="mr-2 h-4 w-4" />
            Iniciar Consulta
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsDataReal.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-medical-100 to-medical-50 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-medical-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
                <span className={cn(
                  "text-xs",
                  stat.trend === 'up' && "text-emerald-600",
                  stat.trend === 'down' && "text-rose-600",
                  stat.trend === 'neutral' && "text-muted-foreground"
                )}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">• {stat.detail}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progreso del día */}
      <Card className="bg-gradient-to-r from-medical-50 to-white border-medical-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Progreso del Día</h3>
              <p className="text-sm text-muted-foreground">{progresoDia.atendidas} de {progresoDia.total} consultas completadas</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm">{progresoDia.atendidas} Atendidas</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-sm">{progresoDia.enCurso} En curso</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-amber-500" />
                <span className="text-sm">{progresoDia.programadas} Pendientes</span>
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-medical-500 rounded-full transition-all duration-500"
                  style={{ width: `${progresoDia.porcentaje}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground mt-1">{progresoDia.porcentaje}% completado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos y estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Actividad Mensual */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-medical-500" />
              Actividad Mensual
            </CardTitle>
            <CardDescription>Consultas y nuevos pacientes por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-48">
              {actividadMensual.map((mes, i) => (
                <div key={mes.mes} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1 h-36 justify-end">
                    {/* Barra de consultas */}
                    <div 
                      className="w-full bg-medical-500 rounded-t transition-all duration-500"
                      style={{ height: `${(mes.consultas / maxConsultas) * 100}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{mes.mes}</p>
                    <p className="text-lg font-bold text-medical-600">{mes.consultas}</p>
                    <p className="text-xs text-muted-foreground">+{mes.pacientes} pts.</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-medical-500" />
                <span className="text-sm text-muted-foreground">Consultas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-medical-200" />
                <span className="text-sm text-muted-foreground">Nuevos pacientes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-medical-500" />
              Tipo de Consultas
            </CardTitle>
            <CardDescription>Distribución este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tipoConsultas.map((tipo) => (
                <div key={tipo.tipo} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tipo.tipo}</span>
                    <span className="text-sm text-muted-foreground">{tipo.cantidad}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${tipo.porcentaje}%`, backgroundColor: tipo.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Citas y Actividad */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Citas de Hoy */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-medical-500" />
                  Citas de Hoy
                </CardTitle>
                <CardDescription>{citasHoy.length} citas programadas</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Agenda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {citasHoyData.map((cita: any) => (
                <div
                  key={cita.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    cita.estado === 'completada' && "bg-emerald-50/50 border-emerald-200",
                    cita.estado === 'en-curso' && "bg-blue-50 border-blue-300",
                    (cita.estado === 'pendiente' || cita.estado === 'confirmada') && "bg-white hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex flex-col items-center justify-center w-14 h-14 rounded-lg",
                      cita.estado === 'completada' && "bg-emerald-100",
                      cita.estado === 'en-curso' && "bg-blue-100",
                      (cita.estado === 'pendiente' || cita.estado === 'confirmada') && "bg-medical-50"
                    )}>
                      <Clock className={cn(
                        "h-4 w-4 mb-1",
                        cita.estado === 'completada' && "text-emerald-600",
                        cita.estado === 'en-curso' && "text-blue-600",
                        (cita.estado === 'pendiente' || cita.estado === 'confirmada') && "text-medical-600"
                      )} />
                      <span className={cn(
                        "text-sm font-semibold",
                        cita.estado === 'completada' && "text-emerald-700",
                        cita.estado === 'en-curso' && "text-blue-700",
                        (cita.estado === 'pendiente' || cita.estado === 'confirmada') && "text-medical-700"
                      )}>{cita.hora}</span>
                    </div>
                    <div>
                      <p className="font-medium">{cita.paciente}</p>
                      <p className="text-sm text-muted-foreground">{cita.motivo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{cita.duracion}</span>
                    <Badge 
                      variant="outline"
                      className={cn(
                        cita.estado === 'atendida' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                        cita.estado === 'en-curso' && "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
                        cita.estado === 'programada' && "bg-gray-100 text-gray-600"
                      )}
                    >
                      {cita.estado === 'atendida' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {cita.estado === 'en-curso' && <Activity className="h-3 w-3 mr-1" />}
                      {cita.estado === 'programada' && <Timer className="h-3 w-3 mr-1" />}
                      {cita.estado === 'atendida' ? 'Atendida' : 
                       cita.estado === 'en-curso' ? 'En curso' : 'Programada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-medical-500" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividadReciente.length > 0 ? (
                actividadReciente.map((actividad: any) => (
                  <div key={actividad.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                      {actividad.tipo === 'consulta' ? (
                        <Stethoscope className="h-4 w-4 text-medical-600" />
                      ) : actividad.tipo === 'paciente' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : actividad.tipo === 'orden' ? (
                        <FileText className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{actividad.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(actividad.hora).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pacientes Recientes y Órdenes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pacientes Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-medical-500" />
                  Pacientes Recientes
                </CardTitle>
                <CardDescription>Últimas consultas atendidas</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pacientesRecientes.map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-medical-100 to-medical-50 flex items-center justify-center">
                    <span className="text-sm font-semibold text-medical-700">
                      {paciente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{paciente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{paciente.edad} años • {paciente.diagnostico}</p>
                  </div>
                  {paciente.proximaCita && (
                    <Badge variant="outline" className="text-xs">
                      Próx: {formatDate(paciente.proximaCita)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes Pendientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-medical-500" />
                  Órdenes Médicas
                </CardTitle>
                <CardDescription>Pendientes de revisión</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.ordenes_pendientes > 0 ? [] : ordenesPendientesFallback).map((orden: any) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      orden.tipo === 'laboratorio' ? "bg-amber-100" : "bg-purple-100"
                    )}>
                      {orden.tipo === 'laboratorio' ? (
                        <TestTube className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Scan className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{orden.paciente}</p>
                      <p className="text-xs text-muted-foreground">
                        {orden.tipo === 'laboratorio' ? 'Laboratorio' : 'Imagenología'} • {formatDate(orden.fecha)}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={orden.estado === 'resultado-listo' ? 'default' : 'outline'}
                    className={orden.estado === 'resultado-listo' ? 'bg-emerald-500' : ''}
                  >
                    {orden.estado === 'resultado-listo' ? 'Resultado listo' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
              {stats?.ordenes_pendientes > 0 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  {stats.ordenes_pendientes} órdenes pendientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Notificaciones */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">Recordatorios del día</h4>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• 3 resultados de laboratorio pendientes de revisión</li>
              <li>• 2 pacientes requieren seguimiento esta semana</li>
              <li>• Verificar stock de materiales de curación</li>
            </ul>
          </div>
          <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
            Marcar como leído
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
