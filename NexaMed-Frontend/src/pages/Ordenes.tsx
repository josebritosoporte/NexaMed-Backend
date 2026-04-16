import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  FileText,
  Download,
  MoreHorizontal,
  FlaskConical,
  Scan,
  Stethoscope,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Printer,
  X
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
import { formatDate } from '@/lib/utils'
import { ordenesApi } from '@/services/api'

const ordenesData = [
  {
    id: 'ORD-001',
    paciente: 'María Elena González',
    tipo: 'laboratorio',
    fecha: '2024-01-15',
    diagnostico: 'Hipertensión arterial - Control',
    examenes: ['Hemograma completo', 'Perfil lipídico', 'Glucosa en ayunas', 'Creatinina'],
    estado: 'completada',
    resultadoUrl: '#',
  },
  {
    id: 'ORD-002',
    paciente: 'Carlos Alberto Ruiz',
    tipo: 'imagenologia',
    fecha: '2024-01-15',
    diagnostico: 'Diabetes tipo 2 - Evaluación',
    examenes: ['Radiografía de tórax', 'Ecografía abdominal'],
    estado: 'pendiente',
    resultadoUrl: null,
  },
  {
    id: 'ORD-003',
    paciente: 'Ana Patricia Martínez',
    tipo: 'laboratorio',
    fecha: '2024-01-14',
    diagnostico: 'Migraña - Descarte',
    examenes: ['Hemograma', 'TSH', 'T4 libre'],
    estado: 'completada',
    resultadoUrl: '#',
  },
  {
    id: 'ORD-004',
    paciente: 'Luis Fernando Hernández',
    tipo: 'interconsulta',
    fecha: '2024-01-13',
    diagnostico: 'Cardiología - Evaluación preoperatoria',
    examenes: ['Evaluación cardiológica completa'],
    estado: 'completada',
    resultadoUrl: '#',
  },
  {
    id: 'ORD-005',
    paciente: 'Sofia Isabella López',
    tipo: 'imagenologia',
    fecha: '2024-01-12',
    diagnostico: 'Asma - Control pulmonar',
    examenes: ['Espirometría', 'Radiografía de senos paranasales'],
    estado: 'cancelada',
    resultadoUrl: null,
  },
]

export default function Ordenes() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('todas')
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  
  // Estado para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'completar' | 'cancelar' | null>(null)
  const [selectedOrden, setSelectedOrden] = useState<any>(null)
  
  // Estado para modal de estadísticas
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [statsFilter, setStatsFilter] = useState<'pendientes' | 'completadas' | 'mes' | null>(null)
  const [statsTitle, setStatsTitle] = useState('')

  // Cargar órdenes desde el backend
  useEffect(() => {
    loadOrdenes()
  }, [])

  const loadOrdenes = async () => {
    try {
      setLoading(true)
      const response = await ordenesApi.getAll(1, 100)
      if (response.success && response.data) {
        setOrdenes(response.data)
      } else {
        setError('Error al cargar las órdenes')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdenes = ordenes.filter(orden => {
    const nombrePaciente = `${orden.paciente_nombres || ''} ${orden.paciente_apellidos || ''}`.toLowerCase()
    const matchesSearch = nombrePaciente.includes(searchTerm.toLowerCase()) ||
                         (orden.numero_orden && orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeTab === 'todas') return matchesSearch
    return matchesSearch && orden.estado === activeTab
  })

  const handleImprimirOrden = (orden: any) => {
    const ventana = window.open(
      `/imprimir/orden/${orden.id}`,
      '_blank',
      'width=800,height=600,noopener,noreferrer'
    )
    if (ventana) ventana.focus()
  }

  // Abrir modal de confirmación
  const openConfirmModal = (orden: any, action: 'completar' | 'cancelar') => {
    setSelectedOrden(orden)
    setConfirmAction(action)
    setIsConfirmModalOpen(true)
  }

  // Manejar clic en tarjeta de estadísticas
  const handleStatsClick = (filter: 'pendientes' | 'completadas' | 'mes', title: string) => {
    setStatsFilter(filter)
    setStatsTitle(title)
    setIsStatsModalOpen(true)
  }

  // Obtener órdenes filtradas según la estadística seleccionada
  const getFilteredOrdenesForStats = () => {
    switch (statsFilter) {
      case 'pendientes':
        return ordenes.filter(o => o.estado === 'pendiente')
      case 'completadas':
        return ordenes.filter(o => o.estado === 'completada')
      case 'mes':
        return ordenes.filter(o => {
          if (!o.created_at) return false
          const fecha = new Date(o.created_at)
          const ahora = new Date()
          return fecha.getMonth() === ahora.getMonth() && 
                 fecha.getFullYear() === ahora.getFullYear()
        })
      default:
        return []
    }
  }

  // Marcar orden como completada
  const handleMarcarCompletada = async () => {
    if (!selectedOrden) return
    
    try {
      setUpdating(true)
      const response = await ordenesApi.update(selectedOrden.id, {
        estado: 'completada'
      })
      
      if (response.success) {
        // Actualizar la orden en la lista local
        setOrdenes(ordenes.map(o => 
          o.id === selectedOrden.id ? { ...o, estado: 'completada' } : o
        ))
        setIsConfirmModalOpen(false)
        setSelectedOrden(null)
        setConfirmAction(null)
      } else {
        setError('Error al actualizar la orden')
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la orden')
    } finally {
      setUpdating(false)
    }
  }

  // Cancelar orden
  const handleCancelarOrden = async () => {
    if (!selectedOrden) return
    
    try {
      setUpdating(true)
      const response = await ordenesApi.update(selectedOrden.id, {
        estado: 'cancelada'
      })
      
      if (response.success) {
        // Actualizar la orden en la lista local
        setOrdenes(ordenes.map(o => 
          o.id === selectedOrden.id ? { ...o, estado: 'cancelada' } : o
        ))
        setIsConfirmModalOpen(false)
        setSelectedOrden(null)
        setConfirmAction(null)
      } else {
        setError('Error al cancelar la orden')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la orden')
    } finally {
      setUpdating(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'laboratorio':
        return <FlaskConical className="h-5 w-5" />
      case 'imagenologia':
        return <Scan className="h-5 w-5" />
      case 'interconsulta':
        return <Stethoscope className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      laboratorio: 'Laboratorio',
      imagenologia: 'Imagenología',
      interconsulta: 'Interconsulta',
    }
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>
  }

  const getEstadoBadge = (estado: string) => {
    const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning', icon: any }> = {
      completada: { variant: 'success', icon: CheckCircle2 },
      pendiente: { variant: 'warning', icon: Clock },
      cancelada: { variant: 'destructive', icon: XCircle },
    }
    const config = configs[estado] || { variant: 'default', icon: Clock }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orden por paciente o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/pacientes')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                <p className="text-2xl font-bold">{ordenes.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-medical-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-medical-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatsClick('pendientes', `Órdenes Pendientes (${ordenes.filter(o => o.estado === 'pendiente').length})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter(o => o.estado === 'pendiente').length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatsClick('completadas', `Órdenes Completadas (${ordenes.filter(o => o.estado === 'completada').length})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter(o => o.estado === 'completada').length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatsClick('mes', `Órdenes de Este Mes (${ordenes.filter(o => {
            if (!o.created_at) return false
            const fecha = new Date(o.created_at)
            const ahora = new Date()
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
          }).length})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este mes</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter(o => {
                    if (!o.created_at) return false
                    const fecha = new Date(o.created_at)
                    const ahora = new Date()
                    return fecha.getMonth() === ahora.getMonth() && 
                           fecha.getFullYear() === ahora.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
          <TabsTrigger value="completada">Completadas</TabsTrigger>
          <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
              <span className="ml-2 text-muted-foreground">Cargando órdenes...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
              <Button variant="outline" size="sm" className="ml-4" onClick={loadOrdenes}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Lista */}
          {!loading && !error && (
          <div className="space-y-3">
            {filteredOrdenes.map((orden) => (
              <Card key={orden.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                        {getTipoIcon(orden.tipo)}
                      </div>
                      
                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-muted-foreground">{orden.numero_orden || `#${orden.id}`}</span>
                          {getTipoBadge(orden.tipo)}
                          {getEstadoBadge(orden.estado)}
                        </div>
                        
                        <h3 className="font-semibold">
                          {orden.paciente_nombres} {orden.paciente_apellidos}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Cédula:</span> {orden.paciente_cedula}
                        </p>
                        
                        {orden.informacion_clinica && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <span className="font-medium">Info clínica:</span> {orden.informacion_clinica}
                          </p>
                        )}
                        
                        {orden.examenes && orden.examenes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {orden.examenes.slice(0, 3).map((examen: any, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {examen.nombre || examen}
                              </Badge>
                            ))}
                            {orden.examenes.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{orden.examenes.length - 3} más
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Fecha: {formatDate(orden.fecha)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleImprimirOrden(orden)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleImprimirOrden(orden)}>
                            Ver / Imprimir
                          </DropdownMenuItem>
                          {orden.estado === 'pendiente' && (
                            <DropdownMenuItem onClick={() => openConfirmModal(orden, 'completar')}>
                              Marcar completada
                            </DropdownMenuItem>
                          )}
                          {(orden.estado === 'pendiente' || orden.estado === 'completada') && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openConfirmModal(orden, 'cancelar')}
                            >
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {!loading && !error && filteredOrdenes.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron órdenes</h3>
              <p className="text-muted-foreground">
                No hay órdenes que coincidan con los filtros seleccionados
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Confirmación */}
      {isConfirmModalOpen && selectedOrden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md m-4 p-6">
            <h2 className="text-lg font-semibold mb-2">
              {confirmAction === 'completar' ? 'Completar Orden' : 'Cancelar Orden'}
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {confirmAction === 'completar' 
                ? `¿Estás seguro de marcar como completada la orden ${selectedOrden.numero_orden || `#${selectedOrden.id}`} para ${selectedOrden.paciente_nombres} ${selectedOrden.paciente_apellidos}?`
                : `¿Estás seguro de cancelar la orden ${selectedOrden.numero_orden || `#${selectedOrden.id}`} para ${selectedOrden.paciente_nombres} ${selectedOrden.paciente_apellidos}? Esta acción no se puede deshacer.`
              }
            </p>

            {confirmAction === 'cancelar' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                <p className="text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Al cancelar, la orden ya no podrá ser procesada.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmModalOpen(false)
                  setSelectedOrden(null)
                  setConfirmAction(null)
                }}
                disabled={updating}
              >
                No, volver
              </Button>
              <Button 
                variant={confirmAction === 'completar' ? 'default' : 'destructive'}
                onClick={confirmAction === 'completar' ? handleMarcarCompletada : handleCancelarOrden}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  confirmAction === 'completar' ? 'Sí, completar' : 'Sí, cancelar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col m-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{statsTitle}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsStatsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lista de órdenes */}
            <div className="flex-1 overflow-y-auto p-4">
              {getFilteredOrdenesForStats().length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay órdenes en esta categoría</p>
              ) : (
                <div className="space-y-2">
                  {getFilteredOrdenesForStats().map((orden) => (
                    <Card 
                      key={orden.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                              {getTipoIcon(orden.tipo)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {orden.paciente_nombres} {orden.paciente_apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {orden.numero_orden || `#${orden.id}`} • {orden.paciente_cedula}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getEstadoBadge(orden.estado)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(orden.fecha)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total: {getFilteredOrdenesForStats().length} órdenes
              </p>
              <Button variant="outline" onClick={() => setIsStatsModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
