import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  Stethoscope,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime, formatDate } from '@/lib/utils'
import { consultasApi } from '@/services/api'

const consultasData = [
  {
    id: '1',
    paciente: 'María Elena González',
    fecha: '2024-01-15T09:00:00',
    motivo: 'Control de presión arterial',
    diagnostico: 'Hipertensión arterial controlada',
    tipo: 'control',
    estado: 'completada',
    medico: 'Dr. Rodríguez',
  },
  {
    id: '2',
    paciente: 'Carlos Alberto Ruiz',
    fecha: '2024-01-15T09:30:00',
    motivo: 'Revisión de diabetes',
    diagnostico: 'Diabetes tipo 2 estable',
    tipo: 'control',
    estado: 'completada',
    medico: 'Dr. Rodríguez',
  },
  {
    id: '3',
    paciente: 'Ana Patricia Martínez',
    fecha: '2024-01-15T10:00:00',
    motivo: 'Dolor de cabeza persistente',
    diagnostico: 'Migraña sin aura',
    tipo: 'consulta',
    estado: 'en-curso',
    medico: 'Dr. Rodríguez',
  },
  {
    id: '4',
    paciente: 'Luis Fernando Hernández',
    fecha: '2024-01-14T11:00:00',
    motivo: 'Check-up anual',
    diagnostico: 'Salud general buena',
    tipo: 'preventiva',
    estado: 'completada',
    medico: 'Dr. Rodríguez',
  },
  {
    id: '5',
    paciente: 'Sofia Isabella López',
    fecha: '2024-01-14T14:30:00',
    motivo: 'Dificultad para respirar',
    diagnostico: 'Asma leve exacerbada',
    tipo: 'urgencia',
    estado: 'completada',
    medico: 'Dr. Rodríguez',
  },
]

export default function Consultas() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('todas')
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar consultas desde el backend
  useEffect(() => {
    loadConsultas()
  }, [])

  const loadConsultas = async () => {
    try {
      setLoading(true)
      const response = await consultasApi.getAll(1, 100)
      if (response.success && response.data) {
        setConsultas(response.data)
      } else {
        setError('Error al cargar las consultas')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las consultas')
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultas = consultas.filter(consulta => {
    const nombrePaciente = `${consulta.paciente_nombres || ''} ${consulta.paciente_apellidos || ''}`.toLowerCase()
    const matchesSearch = nombrePaciente.includes(searchTerm.toLowerCase()) ||
                         (consulta.subjetivo && consulta.subjetivo.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeTab === 'todas') return matchesSearch
    if (activeTab === 'hoy') {
      const today = new Date().toISOString().split('T')[0]
      return matchesSearch && consulta.fecha && consulta.fecha.startsWith(today)
    }
    // Las pestañas completadas/pendientes no aplican sin campo estado en la BD
    // Se muestran todas las consultas
    return matchesSearch
  })

  const handleVerConsulta = (consulta: any) => {
    navigate(`/pacientes/${consulta.paciente_id}/expediente`)
  }

  const handleImprimirConsulta = (consulta: any) => {
    const ventana = window.open(
      `/imprimir/consulta/${consulta.id}`,
      '_blank',
      'width=800,height=600,noopener,noreferrer'
    )
    if (ventana) ventana.focus()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar consulta por paciente o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/pacientes')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Consulta
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="hoy">Hoy</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
              <span className="ml-2 text-muted-foreground">Cargando consultas...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
              <Button variant="outline" size="sm" className="ml-4" onClick={loadConsultas}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Lista */}
          {!loading && !error && (
          <div className="space-y-3">
            {filteredConsultas.map((consulta) => (
              <Card key={consulta.id} className="card-hover cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="h-6 w-6 text-medical-600" />
                      </div>
                      
                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {consulta.paciente_nombres} {consulta.paciente_apellidos}
                          </h3>
                          <Badge variant="outline">{consulta.paciente_cedula}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(consulta.fecha)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(consulta.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {consulta.subjetivo && (
                          <p className="text-sm mt-2 line-clamp-2">
                            <span className="font-medium">Motivo:</span>{' '}
                            <span className="text-muted-foreground">{consulta.subjetivo}</span>
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Atendido por: {consulta.medico_nombre || 'No asignado'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVerConsulta(consulta)}>
                          Ver expediente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleImprimirConsulta(consulta)}>
                          Imprimir consulta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {!loading && !error && filteredConsultas.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron consultas</h3>
              <p className="text-muted-foreground">
                No hay consultas que coincidan con los filtros seleccionados
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
