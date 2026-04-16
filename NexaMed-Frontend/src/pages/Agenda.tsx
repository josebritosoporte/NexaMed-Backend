import { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MoreVertical,
  Calendar as CalendarIcon,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { citasApi } from '@/services/api'

// Tipos
type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
type VistaCalendario = 'mes' | 'semana'

interface Cita {
  id: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  horaInicio: string
  horaFin: string
  motivo: string
  estado: EstadoCita
  notas?: string
  color: string
}

// Datos de ejemplo
const citasIniciales: Cita[] = [
  {
    id: '1',
    pacienteId: '1',
    pacienteNombre: 'María González',
    fecha: '2026-04-14',
    horaInicio: '09:00',
    horaFin: '09:30',
    motivo: 'Control de presión arterial',
    estado: 'confirmada',
    notas: 'Traer exámenes recientes',
    color: '#0d9488'
  },
  {
    id: '2',
    pacienteId: '2',
    pacienteNombre: 'Juan Pérez',
    fecha: '2026-04-14',
    horaInicio: '10:00',
    horaFin: '10:30',
    motivo: 'Consulta general',
    estado: 'pendiente',
    color: '#f59e0b'
  },
  {
    id: '3',
    pacienteId: '3',
    pacienteNombre: 'Ana Martínez',
    fecha: '2026-04-15',
    horaInicio: '11:00',
    horaFin: '11:30',
    motivo: 'Seguimiento diabetes',
    estado: 'confirmada',
    color: '#0d9488'
  },
  {
    id: '4',
    pacienteId: '4',
    pacienteNombre: 'Carlos López',
    fecha: '2026-04-16',
    horaInicio: '14:00',
    horaFin: '14:30',
    motivo: 'Dolor de espalda',
    estado: 'cancelada',
    notas: 'Paciente canceló por emergencia',
    color: '#ef4444'
  },
  {
    id: '5',
    pacienteId: '5',
    pacienteNombre: 'Laura García',
    fecha: '2026-04-17',
    horaInicio: '09:30',
    horaFin: '10:00',
    motivo: 'Revisión anual',
    estado: 'completada',
    color: '#22c55e'
  },
  {
    id: '6',
    pacienteId: '6',
    pacienteNombre: 'Pedro Sánchez',
    fecha: '2026-04-18',
    horaInicio: '15:00',
    horaFin: '15:30',
    motivo: 'Consulta dermatológica',
    estado: 'pendiente',
    color: '#f59e0b'
  }
]

// Pacientes disponibles
const pacientesDisponibles = [
  { id: '1', nombre: 'María González' },
  { id: '2', nombre: 'Juan Pérez' },
  { id: '3', nombre: 'Ana Martínez' },
  { id: '4', nombre: 'Carlos López' },
  { id: '5', nombre: 'Laura García' },
  { id: '6', nombre: 'Pedro Sánchez' },
  { id: '7', nombre: 'Rosa Rodríguez' },
  { id: '8', nombre: 'Miguel Torres' }
]

// Horarios disponibles
const horarios = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

const coloresPorEstado: Record<EstadoCita, { bg: string; text: string; badge: string }> = {
  pendiente: { bg: '#fef3c7', text: '#92400e', badge: 'bg-amber-100 text-amber-800' },
  confirmada: { bg: '#d1fae5', text: '#065f46', badge: 'bg-emerald-100 text-emerald-800' },
  completada: { bg: '#dbeafe', text: '#1e40af', badge: 'bg-blue-100 text-blue-800' },
  cancelada: { bg: '#fee2e2', text: '#991b1b', badge: 'bg-red-100 text-red-800' }
}

const estadoIconos: Record<EstadoCita, React.ReactNode> = {
  pendiente: <AlertCircle className="h-3 w-3" />,
  confirmada: <Check className="h-3 w-3" />,
  completada: <Check className="h-3 w-3" />,
  cancelada: <X className="h-3 w-3" />
}

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Agenda() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [vista, setVista] = useState<VistaCalendario>('mes')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  
  // Modal de cita
  const [modalAbierto, setModalAbierto] = useState(false)
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('')
  const [fechaCita, setFechaCita] = useState('')
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('09:30')
  const [motivo, setMotivo] = useState('')
  const [notas, setNotas] = useState('')

  // Cargar citas del backend
  useEffect(() => {
    loadCitas()
  }, [fechaActual])

  const loadCitas = async () => {
    try {
      setLoading(true)
      const año = fechaActual.getFullYear()
      const mes = fechaActual.getMonth()
      const primerDia = new Date(año, mes, 1).toISOString().split('T')[0]
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0]
      
      const response = await citasApi.getByDateRange(primerDia, ultimoDia)
      if (response.success && response.data) {
        // Mapear datos del backend al formato del frontend
        const citasFormateadas = response.data.map((cita: any) => ({
          id: cita.id.toString(),
          pacienteId: cita.paciente_id?.toString() || '',
          pacienteNombre: cita.paciente_nombre || `${cita.paciente_nombres} ${cita.paciente_apellidos}`,
          fecha: cita.fecha,
          horaInicio: cita.hora_inicio?.substring(0, 5) || cita.horaInicio,
          horaFin: cita.hora_fin?.substring(0, 5) || cita.horaFin,
          motivo: cita.motivo,
          estado: cita.estado as EstadoCita,
          notas: cita.notas,
          color: cita.color || coloresPorEstado[cita.estado as EstadoCita]?.bg || '#0d9488'
        }))
        setCitas(citasFormateadas)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  // Obtener días del mes actual
  const diasDelMes = useMemo(() => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const diaInicio = primerDia.getDay()

    const dias = []
    
    // Días del mes anterior
    const mesAnterior = new Date(año, mes, 0)
    for (let i = diaInicio - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(año, mes - 1, mesAnterior.getDate() - i),
        esOtroMes: true
      })
    }

    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push({
        fecha: new Date(año, mes, i),
        esOtroMes: false
      })
    }

    // Días del mes siguiente
    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        fecha: new Date(año, mes + 1, i),
        esOtroMes: true
      })
    }

    return dias
  }, [fechaActual])

  // Obtener semana actual
  const semanaActual = useMemo(() => {
    const inicioSemana = new Date(fechaActual)
    inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay())
    
    const dias = []
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana)
      dia.setDate(inicioSemana.getDate() + i)
      dias.push(dia)
    }
    return dias
  }, [fechaActual])

  // Formatear fecha para comparación
  const formatearFecha = (fecha: Date) => {
    return fecha.toISOString().split('T')[0]
  }

  // Obtener citas de un día
  const citasDelDia = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha)
    return citas.filter(c => c.fecha === fechaStr)
  }

  // Navegación
  const irAnterior = () => {
    const nueva = new Date(fechaActual)
    if (vista === 'mes') {
      nueva.setMonth(nueva.getMonth() - 1)
    } else {
      nueva.setDate(nueva.getDate() - 7)
    }
    setFechaActual(nueva)
  }

  const irSiguiente = () => {
    const nueva = new Date(fechaActual)
    if (vista === 'mes') {
      nueva.setMonth(nueva.getMonth() + 1)
    } else {
      nueva.setDate(nueva.getDate() + 7)
    }
    setFechaActual(nueva)
  }

  const irHoy = () => {
    setFechaActual(new Date())
  }

  // Abrir modal para nueva cita
  const abrirNuevaCita = (fecha?: string) => {
    setCitaEditando(null)
    setPacienteSeleccionado('')
    setFechaCita(fecha || formatearFecha(new Date()))
    setHoraInicio('09:00')
    setHoraFin('09:30')
    setMotivo('')
    setNotas('')
    setModalAbierto(true)
  }

  // Abrir modal para editar cita
  const abrirEditarCita = (cita: Cita) => {
    setCitaEditando(cita)
    setPacienteSeleccionado(cita.pacienteId)
    setFechaCita(cita.fecha)
    setHoraInicio(cita.horaInicio)
    setHoraFin(cita.horaFin)
    setMotivo(cita.motivo)
    setNotas(cita.notas || '')
    setModalAbierto(true)
  }

  // Guardar cita
  const guardarCita = async () => {
    if (!pacienteSeleccionado || !fechaCita || !motivo) return

    const paciente = pacientesDisponibles.find(p => p.id === pacienteSeleccionado)
    if (!paciente) return

    try {
      setLoading(true)
      
      const citaData = {
        paciente_id: parseInt(pacienteSeleccionado),
        fecha: fechaCita,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        motivo,
        notas,
        estado: citaEditando ? citaEditando.estado : 'pendiente',
        color: citaEditando ? citaEditando.color : '#f59e0b'
      }

      if (citaEditando) {
        // Editar cita existente
        const response = await citasApi.update(parseInt(citaEditando.id), citaData)
        if (response.success) {
          // Recargar citas para obtener datos actualizados
          await loadCitas()
        } else {
          setError('Error al actualizar la cita')
        }
      } else {
        // Crear nueva cita
        const response = await citasApi.create(citaData)
        if (response.success) {
          // Recargar citas para obtener la nueva cita con ID real
          await loadCitas()
        } else {
          setError('Error al crear la cita')
        }
      }
      
      setModalAbierto(false)
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cita')
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado de cita
  const cambiarEstado = async (citaId: string, nuevoEstado: EstadoCita) => {
    try {
      const response = await citasApi.updateEstado(parseInt(citaId), nuevoEstado)
      if (response.success) {
        // Actualizar estado localmente
        setCitas(citas.map(c => 
          c.id === citaId 
            ? { 
                ...c, 
                estado: nuevoEstado,
                color: nuevoEstado === 'confirmada' ? '#0d9488' :
                       nuevoEstado === 'completada' ? '#22c55e' :
                       nuevoEstado === 'cancelada' ? '#ef4444' : '#f59e0b'
              } 
            : c
        ))
      } else {
        setError('Error al cambiar el estado de la cita')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado de la cita')
    }
  }

  // Eliminar cita
  const eliminarCita = async (citaId: string) => {
    try {
      const response = await citasApi.delete(parseInt(citaId))
      if (response.success) {
        setCitas(citas.filter(c => c.id !== citaId))
      } else {
        setError('Error al eliminar la cita')
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cita')
    }
  }

  // Verificar si es hoy
  const esHoy = (fecha: Date) => {
    const hoy = new Date()
    return formatearFecha(fecha) === formatearFecha(hoy)
  }

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const hoy = formatearFecha(new Date())
    const citasHoy = citas.filter(c => c.fecha === hoy)
    return {
      total: citas.length,
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      confirmadas: citas.filter(c => c.estado === 'confirmada').length,
      hoy: citasHoy.length
    }
  }, [citas])

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
          <Button onClick={loadCitas} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda Médica</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y consultas programadas
          </p>
        </div>
        <Button 
          onClick={() => abrirNuevaCita()}
          className="bg-medical-500 hover:bg-medical-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-medical-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-medical-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.hoy}</p>
                <p className="text-xs text-muted-foreground">Citas hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendientes}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmadas}</p>
                <p className="text-xs text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total citas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendario */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={irAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={irHoy}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={irSiguiente}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold ml-2">
                {vista === 'mes' 
                  ? `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`
                  : `Semana del ${semanaActual[0].getDate()} de ${meses[semanaActual[0].getMonth()]}`
                }
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant={vista === 'mes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVista('mes')}
                className={vista === 'mes' ? 'bg-medical-500 hover:bg-medical-600' : ''}
              >
                Mes
              </Button>
              <Button
                variant={vista === 'semana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVista('semana')}
                className={vista === 'semana' ? 'bg-medical-500 hover:bg-medical-600' : ''}
              >
                Semana
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vista === 'mes' ? (
            /* Vista Mensual */
            <div className="grid grid-cols-7 gap-1">
              {/* Días de la semana */}
              {diasSemana.map(dia => (
                <div key={dia} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {dia}
                </div>
              ))}
              
              {/* Días del mes */}
              {diasDelMes.map((dia, index) => {
                const citasDia = citasDelDia(dia.fecha)
                const fechaStr = formatearFecha(dia.fecha)
                const esHoyFecha = esHoy(dia.fecha)
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-1 border rounded-lg transition-colors cursor-pointer
                      ${dia.esOtroMes ? 'bg-muted/30 text-muted-foreground' : 'bg-white hover:bg-muted/50'}
                      ${esHoyFecha ? 'ring-2 ring-medical-500' : ''}
                      ${fechaSeleccionada === fechaStr ? 'bg-medical-50' : ''}
                    `}
                    onClick={() => setFechaSeleccionada(fechaStr)}
                    onDoubleClick={() => abrirNuevaCita(fechaStr)}
                  >
                    <div className={`text-sm font-medium mb-1 ${esHoyFecha ? 'bg-medical-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}`}>
                      {dia.fecha.getDate()}
                    </div>
                    <div className="space-y-1">
                      {citasDia.slice(0, 3).map(cita => (
                        <div
                          key={cita.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ 
                            backgroundColor: coloresPorEstado[cita.estado].bg,
                            color: coloresPorEstado[cita.estado].text
                          }}
                          onClick={(e) => { e.stopPropagation(); abrirEditarCita(cita) }}
                        >
                          <span className="font-medium">{cita.horaInicio}</span> {cita.pacienteNombre.split(' ')[0]}
                        </div>
                      ))}
                      {citasDia.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground">
                          +{citasDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Vista Semanal */
            <div className="grid grid-cols-8 gap-1">
              {/* Header con horas y días */}
              <div className="text-sm font-medium text-muted-foreground py-2"></div>
              {semanaActual.map((dia, i) => (
                <div 
                  key={i} 
                  className={`text-center py-2 ${esHoy(dia) ? 'bg-medical-50 rounded-lg' : ''}`}
                >
                  <div className="text-sm text-muted-foreground">{diasSemana[i]}</div>
                  <div className={`text-lg font-semibold ${esHoy(dia) ? 'text-medical-600' : ''}`}>
                    {dia.getDate()}
                  </div>
                </div>
              ))}
              
              {/* Horarios */}
              {horarios.map(hora => (
                <>
                  <div key={hora} className="text-xs text-muted-foreground py-3 text-right pr-2">
                    {hora}
                  </div>
                  {semanaActual.map((dia, i) => {
                    const fechaStr = formatearFecha(dia)
                    const citasHora = citas.filter(c => 
                      c.fecha === fechaStr && c.horaInicio === hora
                    )
                    
                    return (
                      <div
                        key={`${hora}-${i}`}
                        className="min-h-[40px] border-t border-l p-1 hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                          setFechaCita(fechaStr)
                          setHoraInicio(hora)
                          abrirNuevaCita(fechaStr)
                        }}
                      >
                        {citasHora.map(cita => (
                          <div
                            key={cita.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ 
                              backgroundColor: coloresPorEstado[cita.estado].bg,
                              color: coloresPorEstado[cita.estado].text
                            }}
                            onClick={(e) => { e.stopPropagation(); abrirEditarCita(cita) }}
                          >
                            {cita.pacienteNombre}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de citas del día seleccionado */}
      {fechaSeleccionada && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-medical-500" />
              Citas del {new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citasDelDia(new Date(fechaSeleccionada + 'T12:00:00')).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay citas programadas</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => abrirNuevaCita(fechaSeleccionada)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar cita
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {citasDelDia(new Date(fechaSeleccionada + 'T12:00:00'))
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                  .map(cita => (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderLeftWidth: '4px', borderLeftColor: cita.color }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{cita.horaInicio}</div>
                          <div className="text-xs text-muted-foreground">{cita.horaFin}</div>
                        </div>
                        <div>
                          <div className="font-medium">{cita.pacienteNombre}</div>
                          <div className="text-sm text-muted-foreground">{cita.motivo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={coloresPorEstado[cita.estado].badge}>
                          {estadoIconos[cita.estado]}
                          <span className="ml-1 capitalize">{cita.estado}</span>
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => abrirEditarCita(cita)}>
                              Editar cita
                            </DropdownMenuItem>
                            {cita.estado === 'pendiente' && (
                              <DropdownMenuItem onClick={() => cambiarEstado(cita.id, 'confirmada')}>
                                <Check className="mr-2 h-4 w-4" />
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                              <DropdownMenuItem onClick={() => cambiarEstado(cita.id, 'completada')}>
                                <Check className="mr-2 h-4 w-4" />
                                Marcar completada
                              </DropdownMenuItem>
                            )}
                            {cita.estado !== 'cancelada' && (
                              <DropdownMenuItem 
                                onClick={() => cambiarEstado(cita.id, 'cancelada')}
                                className="text-red-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar cita
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => eliminarCita(cita.id)}
                              className="text-red-600"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Nueva/Editar Cita */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {citaEditando ? 'Editar Cita' : 'Nueva Cita'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={pacienteSeleccionado} onValueChange={setPacienteSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesDisponibles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={fechaCita}
                onChange={(e) => setFechaCita(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Select value={horaInicio} onValueChange={setHoraInicio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horarios.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <Select value={horaFin} onValueChange={setHoraFin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horarios.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Motivo de consulta</Label>
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo de la consulta"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={guardarCita}
                className="bg-medical-500 hover:bg-medical-600"
                disabled={!pacienteSeleccionado || !fechaCita || !motivo}
              >
                {citaEditando ? 'Guardar cambios' : 'Crear cita'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
