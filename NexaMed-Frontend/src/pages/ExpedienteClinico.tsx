import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Heart,
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  Clock,
  Droplet,
  MapPin,
  ChevronRight,
  ChevronDown,
  Plus,
  TestTube,
  Loader2,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, calculateAge } from '@/lib/utils'
import { pacientesApi, consultasApi, ordenesApi } from '@/services/api'

// Datos de ejemplo del paciente
const pacienteEjemplo = {
  id: '1',
  nombre: 'María Elena',
  apellido: 'González Pérez',
  identificacion: 'V-12.345.678',
  fechaNacimiento: '1979-03-15',
  sexo: 'femenino',
  telefono: '+58 412-1234567',
  email: 'maria.gonzalez@email.com',
  direccion: 'Av. Principal 123, Centro',
  ciudad: 'San Fernando de Apure',
  alergias: ['Penicilina', 'Yodo'],
  antecedentes: ['Hipertensión', 'Diabetes gestacional'],
  ultimaVisita: '2024-01-15',
  estadoCivil: 'casado',
  ocupacion: 'Contadora',
  tipoSangre: 'O+',
  contactoEmergencia: {
    nombre: 'Juan González',
    telefono: '+58 414-1111111',
    relacion: 'Cónyuge'
  },
  medicamentosActuales: 'Losartán 50mg cada 24h'
}

// Datos de ejemplo del historial médico
const historialMedico = [
  {
    id: '1',
    tipo: 'consulta',
    fecha: '2024-01-15',
    titulo: 'Consulta General',
    descripcion: 'Control de presión arterial. Paciente estable.',
    medico: 'Dr. Carlos Rodríguez',
    detalles: {
      motivo: 'Control rutinario',
      diagnostico: 'Hipertensión arterial controlada',
      tratamiento: 'Continuar Losartán 50mg',
      proximaCita: '2024-02-15'
    }
  },
  {
    id: '2',
    tipo: 'orden',
    fecha: '2024-01-15',
    titulo: 'Laboratorio - Perfil Lipídico',
    descripcion: 'Exámenes de sangre solicitados',
    medico: 'Dr. Carlos Rodríguez',
    detalles: {
      tipoOrden: 'Laboratorio',
      examenes: ['Colesterol total', 'HDL', 'LDL', 'Triglicéridos', 'Glucosa'],
      estado: 'Pendiente'
    }
  },
  {
    id: '3',
    tipo: 'consulta',
    fecha: '2023-12-10',
    titulo: 'Consulta General',
    descripcion: 'Control trimestral. Ajuste de medicación.',
    medico: 'Dr. Carlos Rodríguez',
    detalles: {
      motivo: 'Control trimestral',
      diagnostico: 'Hipertensión arterial',
      tratamiento: 'Losartán 50mg cada 24h',
      notas: 'Presión arterial: 130/85 mmHg'
    }
  },
  {
    id: '4',
    tipo: 'orden',
    fecha: '2023-12-10',
    titulo: 'Laboratorio - Hematología Completa',
    descripcion: 'Exámenes de rutina',
    medico: 'Dr. Carlos Rodríguez',
    detalles: {
      tipoOrden: 'Laboratorio',
      examenes: ['Hemoglobina', 'Hematocrito', 'Leucocitos', 'Plaquetas'],
      estado: 'Completado',
      resultados: 'Valores dentro de rangos normales'
    }
  },
  {
    id: '5',
    tipo: 'consulta',
    fecha: '2023-09-05',
    titulo: 'Primera Consulta',
    descripcion: 'Evaluación inicial del paciente.',
    medico: 'Dr. Carlos Rodríguez',
    detalles: {
      motivo: 'Dolor de cabeza recurrente',
      diagnostico: 'Hipertensión arterial estadio 1',
      tratamiento: 'Losartán 50mg cada 24h, dieta baja en sodio',
      notas: 'Iniciar tratamiento y control en 3 meses'
    }
  }
]

interface TimelineEventProps {
  evento: any
  isLast: boolean
  onImprimir: (evento: any) => void
}

function TimelineEvent({ evento, isLast, onImprimir }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getIcon = () => {
    switch (evento.tipo) {
      case 'consulta':
        return <Stethoscope className="h-4 w-4" />
      case 'orden':
        return <ClipboardList className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getIconBg = () => {
    switch (evento.tipo) {
      case 'consulta':
        return 'bg-medical-100 text-medical-600'
      case 'orden':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getBadgeVariant = () => {
    switch (evento.tipo) {
      case 'consulta':
        return 'default'
      case 'orden':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
      )}
      
      {/* Icon */}
      <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${getIconBg()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getBadgeVariant()} className="capitalize">
                {evento.tipo}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(evento.fecha)}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{evento.titulo}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {evento.descripcion}
            </p>
            <p className="text-xs text-muted-foreground">
              Dr. {evento.medico?.replace('Dr. ', '')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => onImprimir(evento)}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Ver detalles'}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Event Details */}
        {isExpanded && (
        <Card className="mt-3 bg-muted/30">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {evento.detalles.motivo && (
                <div>
                  <span className="text-muted-foreground">Motivo:</span>
                  <p className="font-medium">{evento.detalles.motivo}</p>
                </div>
              )}
              {evento.detalles.diagnostico && (
                <div>
                  <span className="text-muted-foreground">Diagnóstico:</span>
                  <p className="font-medium">{evento.detalles.diagnostico}</p>
                </div>
              )}
              {evento.detalles.tratamiento && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tratamiento:</span>
                  <p className="font-medium">{evento.detalles.tratamiento}</p>
                </div>
              )}
              {evento.detalles.examenes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Exámenes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {evento.detalles.examenes.map((ex: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {evento.detalles.estado && (
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge 
                    variant={evento.detalles.estado === 'Completado' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {evento.detalles.estado}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}

export default function ExpedienteClinico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<any>(null)
  const [consultas, setConsultas] = useState<any[]>([])
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar paciente y consultas desde el backend
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        // Cargar paciente
        const pacienteResponse = await pacientesApi.getById(parseInt(id))
        if (pacienteResponse.success && pacienteResponse.data) {
          setPaciente(pacienteResponse.data)
        } else {
          setError('Error al cargar el paciente')
          return
        }
        // Cargar consultas del paciente
        const consultasResponse = await consultasApi.getAll(1, 100, { paciente_id: parseInt(id) })
        if (consultasResponse.success && consultasResponse.data) {
          setConsultas(consultasResponse.data)
        }
        // Cargar órdenes del paciente
        const ordenesResponse = await ordenesApi.getAll(1, 100, { paciente_id: parseInt(id) })
        if (ordenesResponse.success && ordenesResponse.data) {
          setOrdenes(ordenesResponse.data)
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el expediente')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  // Transformar consultas y órdenes al formato del timeline y agrupar por año
  const eventosPorAno = [...consultas.map(c => ({ ...c, tipoEvento: 'consulta' })), 
                          ...ordenes.map(o => ({ ...o, tipoEvento: 'orden' }))]
    .reduce((acc: Record<number, any[]>, item: any) => {
      const año = new Date(item.fecha).getFullYear()
      if (!acc[año]) acc[año] = []
      
      if (item.tipoEvento === 'consulta') {
        acc[año].push({
          id: `consulta-${item.id}`,
          fecha: item.fecha,
          tipo: 'consulta',
          titulo: `Consulta - Dr. ${item.medico_nombre || 'No especificado'}`,
          descripcion: item.subjetivo || 'Sin descripción',
          detalles: {
            'Motivo': item.subjetivo || 'No especificado',
            'Diagnóstico': item.analisis || 'No especificado',
            'Plan': item.plan || 'No especificado'
          },
          estado: 'completada'
        })
      } else {
        acc[año].push({
          id: `orden-${item.id}`,
          fecha: item.fecha,
          tipo: 'orden',
          titulo: `${item.tipo === 'laboratorio' ? 'Laboratorio' : item.tipo === 'imagenologia' ? 'Imagenología' : 'Interconsulta'} - ${item.numero_orden}`,
          descripcion: item.notas || `Orden de ${item.tipo}`,
          medico: item.medico_nombre,
          detalles: {
            tipoOrden: item.tipo,
            examenes: item.examenes?.map((e: any) => e.nombre) || [],
            estado: item.estado === 'pendiente' ? 'Pendiente' : item.estado === 'completada' ? 'Completado' : 'Cancelado'
          }
        })
      }
      return acc
    }, {} as Record<number, any[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
        <span className="ml-2 text-muted-foreground">Cargando expediente...</span>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error || 'Paciente no encontrado'}</p>
        <Button onClick={() => navigate('/app/pacientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pacientes
        </Button>
      </div>
    )
  }

  // Función para manejar la impresión de eventos (consultas u órdenes)
  const handleImprimir = (evento: any) => {
    if (evento.tipo === 'consulta') {
      // Extraer el ID real de la consulta (quitar el prefijo 'consulta-')
      const consultaId = evento.id.toString().replace('consulta-', '')
      // Abrir ventana de impresión de consulta con opciones de seguridad
      const ventana = window.open(
        `/imprimir/consulta/${consultaId}`,
        '_blank',
        'width=800,height=600,noopener,noreferrer'
      )
      if (ventana) ventana.focus()
    } else if (evento.tipo === 'orden') {
      // Extraer el ID real de la orden (quitar el prefijo 'orden-')
      const ordenId = evento.id.toString().replace('orden-', '')
      // Abrir ventana de impresión de orden con opciones de seguridad
      const ventana = window.open(
        `/imprimir/orden/${ordenId}`,
        '_blank',
        'width=800,height=600,noopener,noreferrer'
      )
      if (ventana) ventana.focus()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/app/pacientes')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pacientes
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar y datos básicos */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-medical-700">
                  {paciente.nombres?.[0] || ''}{paciente.apellidos?.[0] || ''}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {paciente.nombres} {paciente.apellidos}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span><strong>ID:</strong> {paciente.cedula}</span>
                  <span><strong>Edad:</strong> {calculateAge(paciente.fecha_nacimiento)} años</span>
                  <span className="flex items-center gap-1">
                    <Droplet className="h-4 w-4 text-red-500" />
                    {paciente.tipo_sangre || 'N/A'}
                  </span>
                </div>
                {paciente.alergias && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {paciente.alergias}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 md:ml-auto">
              <Button variant="outline" onClick={() => navigate('/app/pacientes', { state: { editarPacienteId: id } })}>
                <User className="mr-2 h-4 w-4" />
                Editar Datos
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Buscar la última consulta para vincular la orden
                  const ultimaConsulta = consultas.length > 0 ? consultas[0] : null
                  const consultaId = ultimaConsulta ? ultimaConsulta.id : ''
                  navigate(`/app/pacientes/${id}/orden${consultaId ? '?consulta=' + consultaId : ''}`)
                }}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Nueva Orden
              </Button>
              <Button 
                className="bg-medical-500 hover:bg-medical-600"
                onClick={() => navigate(`/app/pacientes/${id}/consulta`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Consulta
              </Button>
            </div>
          </div>

          {/* Info rápida */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{paciente.telefono || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{paciente.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{paciente.ciudad || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Última visita: {paciente.ultima_visita ? formatDate(paciente.ultima_visita) : 'Sin visitas'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - 2 columnas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-medical-500" />
                Historial Clínico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(eventosPorAno)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([año, eventos]) => (
                  <div key={año} className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 text-muted-foreground">
                      {año}
                    </h3>
                    {eventos
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((evento, idx) => (
                        <TimelineEvent
                          key={evento.id}
                          evento={evento}
                          isLast={idx === eventos.length - 1}
                          onImprimir={handleImprimir}
                        />
                      ))}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 columna */}
        <div className="space-y-6">
          {/* Antecedentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-medical-500" />
                Antecedentes Médicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {paciente.antecedentes_medicos ? (
                  <Badge variant="secondary">{paciente.antecedentes_medicos}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin antecedentes registrados</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medicamentos Actuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-medical-500" />
                Medicamentos Actuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{paciente.medicamentos_actuales || 'Sin medicamentos registrados'}</p>
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Contacto de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {paciente.contacto_emergencia_nombre ? (
                <>
                  <p className="font-medium">{paciente.contacto_emergencia_nombre}</p>
                  <p className="text-muted-foreground">{paciente.contacto_emergencia_relacion || 'Sin relación especificada'}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {paciente.contacto_emergencia_telefono || 'Sin teléfono'}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Sin contacto de emergencia registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-medical-500" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-medical-600">
                    {consultas.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Consultas</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-blue-600">
                    0
                  </p>
                  <p className="text-xs text-muted-foreground">Órdenes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
