import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, calculateAge } from '@/lib/utils'
import { CrearPacienteModal, type PacienteFormData } from '@/components/pacientes/CrearPacienteModal'
import { VerPacienteModal } from '@/components/pacientes/VerPacienteModal'
import { EditarPacienteModal, type PacienteEditData } from '@/components/pacientes/EditarPacienteModal'
import { ConfirmarEliminarModal } from '@/components/pacientes/ConfirmarEliminarModal'
import { pacientesApi } from '@/services/api'

// Datos de ejemplo
const pacientesData = [
  {
    id: '1',
    nombre: 'María Elena',
    apellido: 'González Pérez',
    identificacion: 'V-12.345.678',
    fechaNacimiento: '1979-03-15',
    sexo: 'femenino',
    telefono: '+58 412-1234567',
    email: 'maria.gonzalez@email.com',
    alergias: ['Penicilina', 'Yodo'],
    antecedentes: ['Hipertensión', 'Diabetes gestacional'],
    ultimaVisita: '2024-01-15',
    estadoCivil: 'casado',
    ocupacion: 'Contadora',
    tipoSangre: 'O+',
    direccion: 'Av. Principal 123, Centro',
    ciudad: 'San Fernando de Apure',
    contactoEmergenciaNombre: 'Juan González',
    contactoEmergenciaTelefono: '+58 414-1111111',
    contactoEmergenciaRelacion: 'conyuge',
    medicamentosActuales: 'Losartán 50mg cada 24h',
  },
  {
    id: '2',
    nombre: 'Carlos Alberto',
    apellido: 'Ruiz Mendoza',
    identificacion: 'V-15.234.567',
    fechaNacimiento: '1962-08-22',
    sexo: 'masculino',
    telefono: '+58 414-7654321',
    email: 'carlos.ruiz@email.com',
    alergias: ['Sulfas'],
    antecedentes: ['Diabetes tipo 2', 'Dislipidemia'],
    ultimaVisita: '2024-01-14',
    estadoCivil: 'soltero',
    ocupacion: 'Abogado',
    tipoSangre: 'A+',
    direccion: 'Calle Secundaria 456',
    ciudad: 'San Fernando de Apure',
    contactoEmergenciaNombre: 'Ana Ruiz',
    contactoEmergenciaTelefono: '+58 416-2222222',
    contactoEmergenciaRelacion: 'hermano',
    medicamentosActuales: 'Metformina 850mg, Atorvastatina 20mg',
  },
  {
    id: '3',
    nombre: 'Ana Patricia',
    apellido: 'Martínez Silva',
    identificacion: 'V-18.987.654',
    fechaNacimiento: '1996-11-30',
    sexo: 'femenino',
    telefono: '+58 416-9876543',
    email: 'ana.martinez@email.com',
    alergias: [],
    antecedentes: ['Migraña'],
    ultimaVisita: '2024-01-14',
    estadoCivil: 'soltero',
    ocupacion: 'Diseñadora',
    tipoSangre: 'B+',
    direccion: 'Sector Norte 789',
    ciudad: 'San Fernando de Apure',
    contactoEmergenciaNombre: 'Patricia Silva',
    contactoEmergenciaTelefono: '+58 424-3333333',
    contactoEmergenciaRelacion: 'madre',
    medicamentosActuales: '',
  },
  {
    id: '4',
    nombre: 'Luis Fernando',
    apellido: 'Hernández Castro',
    identificacion: 'V-10.456.789',
    fechaNacimiento: '1969-05-08',
    sexo: 'masculino',
    telefono: '+58 412-4567890',
    email: 'luis.hernandez@email.com',
    alergias: ['Aspirina'],
    antecedentes: ['Colesterol alto'],
    ultimaVisita: '2024-01-13',
    estadoCivil: 'casado',
    ocupacion: 'Ingeniero',
    tipoSangre: 'AB+',
    direccion: 'Valle 321',
    ciudad: 'Guayaquil',
    contactoEmergenciaNombre: 'Carmen Castro',
    contactoEmergenciaTelefono: '+58 412-4444444',
    contactoEmergenciaRelacion: 'conyuge',
    medicamentosActuales: 'Simvastatina 20mg',
  },
  {
    id: '5',
    nombre: 'Sofia Isabella',
    apellido: 'López Ramírez',
    identificacion: 'V-20.123.456',
    fechaNacimiento: '1988-12-03',
    sexo: 'femenino',
    telefono: '+58 414-3216547',
    email: 'sofia.lopez@email.com',
    alergias: ['Látex'],
    antecedentes: ['Asma'],
    ultimaVisita: '2024-01-12',
    estadoCivil: 'union_libre',
    ocupacion: 'Profesora',
    tipoSangre: 'O-',
    direccion: 'Centro Histórico 555',
    ciudad: 'Cuenca',
    contactoEmergenciaNombre: 'Isabel Ramírez',
    contactoEmergenciaTelefono: '+58 426-5555555',
    contactoEmergenciaRelacion: 'madre',
    medicamentosActuales: 'Salbutamol inhalador PRN',
  },
]

export interface Paciente {
  id: number
  nombres: string
  apellidos: string
  cedula: string
  fecha_nacimiento: string
  sexo: string
  telefono: string
  email?: string
  alergias?: string
  antecedentes_medicos?: string
  ultima_visita?: string
  estado_civil?: string
  ocupacion?: string
  tipo_sangre?: string
  direccion?: string
  ciudad?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
  contacto_emergencia_relacion?: string
  medicamentos_actuales?: string
  created_at?: string
}

export default function Pacientes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVerModalOpen, setIsVerModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  
  // Estado para modal de estadísticas
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [statsFilter, setStatsFilter] = useState<'alergias' | 'sinVisita' | 'nuevos' | null>(null)
  const [statsTitle, setStatsTitle] = useState('')

  // Cargar pacientes del backend
  useEffect(() => {
    loadPacientes()
  }, [])

  // Detectar si venimos del expediente con intención de editar
  useEffect(() => {
    const state = location.state as { editarPacienteId?: string } | null
    if (state?.editarPacienteId) {
      // Cargar el paciente y abrir modal de edición
      const cargarYEditar = async () => {
        try {
          const response = await pacientesApi.getById(parseInt(state.editarPacienteId!))
          if (response.success && response.data) {
            setSelectedPaciente(response.data)
            setIsEditarModalOpen(true)
            // Limpiar el estado para no reabrir al refrescar
            navigate(location.pathname, { replace: true })
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar paciente para editar')
        }
      }
      cargarYEditar()
    }
  }, [location.state, location.pathname, navigate])

  const loadPacientes = async () => {
    try {
      setLoading(true)
      const response = await pacientesApi.getAll(1, 100, searchTerm)
      if (response.success && response.data) {
        setPacientes(response.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar pacientes')
    } finally {
      setLoading(false)
    }
  }

  // Buscar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPacientes()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const filteredPacientes = pacientes

  // Calcular estadísticas
  const stats = {
    total: pacientes.length,
    conAlergias: pacientes.filter(p => p.alergias && p.alergias.length > 0).length,
    sinVisita6m: pacientes.filter(p => {
      if (!p.ultima_visita) return true
      const ultimaVisita = new Date(p.ultima_visita)
      const seisMesesAtras = new Date()
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
      return ultimaVisita < seisMesesAtras
    }).length,
    nuevosEsteMes: pacientes.filter(p => {
      if (!p.created_at) return false
      const fechaCreacion = new Date(p.created_at)
      const ahora = new Date()
      return fechaCreacion.getMonth() === ahora.getMonth() && 
             fechaCreacion.getFullYear() === ahora.getFullYear()
    }).length
  }

  // Manejar clic en tarjeta de estadísticas
  const handleStatsClick = (filter: 'alergias' | 'sinVisita' | 'nuevos', title: string) => {
    setStatsFilter(filter)
    setStatsTitle(title)
    setIsStatsModalOpen(true)
  }

  // Obtener pacientes filtrados según la estadística seleccionada
  const getFilteredPacientesForStats = () => {
    switch (statsFilter) {
      case 'alergias':
        return pacientes.filter(p => p.alergias && p.alergias.length > 0)
      case 'sinVisita':
        return pacientes.filter(p => {
          if (!p.ultima_visita) return true
          const ultimaVisita = new Date(p.ultima_visita)
          const seisMesesAtras = new Date()
          seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
          return ultimaVisita < seisMesesAtras
        })
      case 'nuevos':
        return pacientes.filter(p => {
          if (!p.created_at) return false
          const fechaCreacion = new Date(p.created_at)
          const ahora = new Date()
          return fechaCreacion.getMonth() === ahora.getMonth() && 
                 fechaCreacion.getFullYear() === ahora.getFullYear()
        })
      default:
        return []
    }
  }

  const handleVerPaciente = (paciente: Paciente) => {
    navigate(`/app/pacientes/${paciente.id}/expediente`)
  }

  const handleVerDetalle = async (paciente: Paciente) => {
    try {
      const response = await pacientesApi.getById(paciente.id)
      if (response.success && response.data) {
        setSelectedPaciente(response.data)
        setIsVerModalOpen(true)
      } else {
        setError('Error al cargar datos del paciente')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar paciente')
    }
  }

  const handleEditarPaciente = async (paciente: Paciente) => {
    try {
      const response = await pacientesApi.getById(paciente.id)
      if (response.success && response.data) {
        setSelectedPaciente(response.data)
        setIsEditarModalOpen(true)
      } else {
        setError('Error al cargar datos del paciente')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar paciente')
    }
  }

  const handleEliminarPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setIsEliminarModalOpen(true)
  }

  const confirmarEliminar = async () => {
    if (!selectedPaciente) return
    
    setIsDeleting(true)
    try {
      await pacientesApi.delete(selectedPaciente.id as any)
      setPacientes(pacientes.filter(p => p.id !== selectedPaciente.id))
      setIsEliminarModalOpen(false)
      setSelectedPaciente(null)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar paciente')
    } finally {
      setIsDeleting(false)
    }
  }

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
          <Button onClick={loadPacientes} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar paciente por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-medical-100 flex items-center justify-center">
                <span className="text-lg font-bold text-medical-600">{stats.total}</span>
              </div>
              <div>
                <p className="text-sm font-medium">Total Pacientes</p>
                <p className="text-xs text-muted-foreground">Registrados activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => handleStatsClick('alergias', `Pacientes con Alergias (${stats.conAlergias})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Con Alergias</p>
                <p className="text-xs text-muted-foreground">{stats.conAlergias} pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatsClick('sinVisita', `Pacientes sin Visita +6m (${stats.sinVisita6m})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Sin visita +6m</p>
                <p className="text-xs text-muted-foreground">{stats.sinVisita6m} pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatsClick('nuevos', `Nuevos Pacientes este Mes (${stats.nuevosEsteMes})`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Nuevos este mes</p>
                <p className="text-xs text-muted-foreground">{stats.nuevosEsteMes} pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pacientes List */}
      <div className="space-y-3">
        {filteredPacientes.map((paciente) => (
          <Card key={paciente.id} className="card-hover cursor-pointer" onClick={() => handleVerPaciente(paciente)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-medical-700">
                      {paciente.nombres?.[0]}{paciente.apellidos?.[0]}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {paciente.nombres} {paciente.apellidos}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">ID:</span> {paciente.cedula}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Edad:</span> {calculateAge(paciente.fecha_nacimiento)} años
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {paciente.telefono}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {paciente.email}
                      </span>
                    </div>
                    
                    {/* Alergias y Antecedentes */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {paciente.alergias && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Alergias: {paciente.alergias}
                        </Badge>
                      )}
                      {paciente.antecedentes_medicos && (
                        <Badge variant="secondary" className="text-xs">
                          {paciente.antecedentes_medicos}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Última visita: {paciente.ultima_visita ? formatDate(paciente.ultima_visita) : 'N/A'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleVerPaciente(paciente) }}>
                        Ver expediente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleVerDetalle(paciente) }}>
                        Ver detalle rápido
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/pacientes/${paciente.id}/consulta`) }}>
                        Nueva consulta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/pacientes/${paciente.id}/orden`) }}>
                        Nueva orden médica
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditarPaciente(paciente) }}>
                        Editar paciente
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={(e) => { e.stopPropagation(); handleEliminarPaciente(paciente) }}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPacientes.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No se encontraron pacientes</h3>
          <p className="text-muted-foreground">
            Intenta con otros términos de búsqueda o crea un nuevo paciente
          </p>
        </div>
      )}

      <CrearPacienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data: PacienteFormData) => {
          try {
            const pacienteData = {
              nombres: data.nombres,
              apellidos: data.apellidos,
              cedula: data.cedula,
              fecha_nacimiento: data.fechaNacimiento,
              sexo: data.sexo,
              estado_civil: data.estadoCivil,
              ocupacion: data.ocupacion,
              telefono: data.telefono,
              email: data.email,
              direccion: data.direccion,
              ciudad: data.ciudad,
              contacto_emergencia_nombre: data.contactoEmergenciaNombre,
              contacto_emergencia_telefono: data.contactoEmergenciaTelefono,
              contacto_emergencia_relacion: data.contactoEmergenciaRelacion,
              alergias: data.alergias,
              antecedentes_medicos: data.antecedentesMedicos,
              medicamentos_actuales: data.medicamentosActuales,
              tipo_sangre: data.tipoSangre,
            }
            await pacientesApi.create(pacienteData)
            await loadPacientes() // Recargar lista
            setIsModalOpen(false)
          } catch (err: any) {
            setError(err.message || 'Error al crear paciente')
          }
        }}
      />

      <VerPacienteModal
        isOpen={isVerModalOpen}
        onClose={() => setIsVerModalOpen(false)}
        paciente={selectedPaciente as any}
        onNuevaConsulta={() => {
          setIsVerModalOpen(false)
          if (selectedPaciente) {
            navigate(`/app/pacientes/${selectedPaciente.id}/consulta`)
          }
        }}
        onEditar={() => {
          setIsVerModalOpen(false)
          if (selectedPaciente) {
            handleEditarPaciente(selectedPaciente)
          }
        }}
      />

      <EditarPacienteModal
        isOpen={isEditarModalOpen}
        onClose={() => setIsEditarModalOpen(false)}
        paciente={selectedPaciente as any}
        onSave={async (data: PacienteEditData) => {
          try {
            const pacienteData = {
              nombres: data.nombres,
              apellidos: data.apellidos,
              cedula: data.cedula,
              fecha_nacimiento: data.fechaNacimiento,
              sexo: data.sexo,
              estado_civil: data.estadoCivil,
              ocupacion: data.ocupacion,
              telefono: data.telefono,
              email: data.email,
              direccion: data.direccion,
              ciudad: data.ciudad,
              contacto_emergencia_nombre: data.contactoEmergenciaNombre,
              contacto_emergencia_telefono: data.contactoEmergenciaTelefono,
              contacto_emergencia_relacion: data.contactoEmergenciaRelacion,
              alergias: data.alergias,
              antecedentes_medicos: data.antecedentesMedicos,
              medicamentos_actuales: data.medicamentosActuales,
              tipo_sangre: data.tipoSangre,
            }
            await pacientesApi.update(data.id as any, pacienteData)
            await loadPacientes() // Recargar lista
            setIsEditarModalOpen(false)
          } catch (err: any) {
            setError(err.message || 'Error al actualizar paciente')
          }
        }}
      />

      <ConfirmarEliminarModal
        isOpen={isEliminarModalOpen}
        onClose={() => setIsEliminarModalOpen(false)}
        onConfirm={confirmarEliminar}
        pacienteNombre={selectedPaciente ? `${selectedPaciente.nombres} ${selectedPaciente.apellidos}` : ''}
        isLoading={isDeleting}
      />

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
            
            {/* Lista de pacientes */}
            <div className="flex-1 overflow-y-auto p-4">
              {getFilteredPacientesForStats().length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay pacientes en esta categoría</p>
              ) : (
                <div className="space-y-2">
                  {getFilteredPacientesForStats().map((paciente) => (
                    <Card 
                      key={paciente.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setIsStatsModalOpen(false)
                        handleVerPaciente(paciente)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-medical-600" />
                            </div>
                            <div>
                              <p className="font-medium">{paciente.nombres} {paciente.apellidos}</p>
                              <p className="text-sm text-muted-foreground">{paciente.cedula}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {statsFilter === 'alergias' && paciente.alergias && (
                              <span className="text-amber-600">{paciente.alergias}</span>
                            )}
                            {statsFilter === 'sinVisita' && paciente.ultima_visita && (
                              <span>Última visita: {formatDate(paciente.ultima_visita)}</span>
                            )}
                            {statsFilter === 'nuevos' && paciente.created_at && (
                              <span>Registrado: {formatDate(paciente.created_at)}</span>
                            )}
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
                Total: {getFilteredPacientesForStats().length} pacientes
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
