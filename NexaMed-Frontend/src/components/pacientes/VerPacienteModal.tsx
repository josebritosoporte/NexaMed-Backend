import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertCircle,
  Heart,
  Pill,
  UserCircle,
  FileText,
  Clock,
  Droplet,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, calculateAge } from '@/lib/utils'

interface PacienteDetalle {
  id: string
  nombres: string
  apellidos: string
  cedula: string
  fecha_nacimiento: string
  sexo: string
  telefono: string
  email?: string
  direccion?: string
  ciudad?: string
  alergias?: string
  antecedentes_medicos?: string
  ultima_visita?: string
  // Campos adicionales
  estado_civil?: string
  ocupacion?: string
  tipo_sangre?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
  contacto_emergencia_relacion?: string
  medicamentos_actuales?: string
}

interface VerPacienteModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: PacienteDetalle | null
  onNuevaConsulta?: () => void
  onEditar?: () => void
}

export function VerPacienteModal({ isOpen, onClose, paciente, onNuevaConsulta, onEditar }: VerPacienteModalProps) {
  if (!paciente) return null

  const getSexoLabel = (sexo: string) => {
    switch (sexo) {
      case 'masculino': return 'Masculino'
      case 'femenino': return 'Femenino'
      default: return sexo
    }
  }

  const getEstadoCivilLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'soltero': 'Soltero/a',
      'casado': 'Casado/a',
      'divorciado': 'Divorciado/a',
      'viudo': 'Viudo/a',
      'union_libre': 'Unión Libre'
    }
    return labels[estado] || estado
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-medical-500" />
            Expediente del Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header del Paciente */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-20 w-20 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-medical-700">
                {paciente.nombres?.[0] || ''}{paciente.apellidos?.[0] || ''}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {paciente.nombres} {paciente.apellidos}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span><strong>Cédula:</strong> {paciente.cedula}</span>
                <span><strong>Edad:</strong> {calculateAge(paciente.fecha_nacimiento)} años</span>
                <span><strong>Sexo:</strong> {getSexoLabel(paciente.sexo)}</span>
                {paciente.tipo_sangre && (
                  <span className="flex items-center gap-1">
                    <Droplet className="h-4 w-4 text-red-500" />
                    <strong>Tipo Sangre:</strong> {paciente.tipo_sangre}
                  </span>
                )}
              </div>
              {paciente.alergias && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {paciente.alergias}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p className="flex items-center gap-1 justify-end">
                <Clock className="h-4 w-4" />
                Última visita
              </p>
              <p className="font-medium text-foreground">{paciente.ultima_visita ? formatDate(paciente.ultima_visita) : 'Sin visitas'}</p>
            </div>
          </div>

          {/* Información en Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <User className="h-5 w-5 text-medical-500" />
                Datos Personales
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                    <p className="font-medium">{formatDate(paciente.fecha_nacimiento)}</p>
                  </div>
                </div>
                {paciente.estado_civil && (
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Civil</p>
                      <p className="font-medium">{getEstadoCivilLabel(paciente.estado_civil)}</p>
                    </div>
                  </div>
                )}
                {paciente.ocupacion && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ocupación</p>
                      <p className="font-medium">{paciente.ocupacion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <Phone className="h-5 w-5 text-medical-500" />
                Contacto
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{paciente.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{paciente.email || 'No registrado'}</p>
                  </div>
                </div>
                {(paciente.direccion || paciente.ciudad) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">
                        {paciente.direccion}
                        {paciente.ciudad && <>, {paciente.ciudad}</>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto de Emergencia */}
            {(paciente.contacto_emergencia_nombre || paciente.contacto_emergencia_telefono) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <UserCircle className="h-5 w-5 text-medical-500" />
                  Contacto de Emergencia
                </h3>
                <div className="space-y-3">
                  {paciente.contacto_emergencia_nombre && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-medium">{paciente.contacto_emergencia_nombre}</p>
                      </div>
                    </div>
                  )}
                  {paciente.contacto_emergencia_telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{paciente.contacto_emergencia_telefono}</p>
                      </div>
                    </div>
                  )}
                  {paciente.contacto_emergencia_relacion && (
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Relación</p>
                        <p className="font-medium capitalize">{paciente.contacto_emergencia_relacion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información Médica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Información Médica
              </h3>
              <div className="space-y-4">
                {/* Alergias */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Alergias
                  </p>
                  {paciente.alergias ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="destructive">{paciente.alergias}</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin alergias registradas</p>
                  )}
                </div>

                {/* Antecedentes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    Antecedentes Médicos
                  </p>
                  {paciente.antecedentes_medicos ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{paciente.antecedentes_medicos}</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin antecedentes registrados</p>
                  )}
                </div>

                {/* Medicamentos */}
                {paciente.medicamentos_actuales && paciente.medicamentos_actuales.trim() !== '' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Pill className="h-4 w-4" />
                      Medicamentos Actuales
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {paciente.medicamentos_actuales.split(',').map((med: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {med.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {onEditar && (
              <Button variant="outline" onClick={onEditar}>
                Editar Paciente
              </Button>
            )}
            {onNuevaConsulta && (
              <Button className="bg-medical-500 hover:bg-medical-600" onClick={onNuevaConsulta}>
                <FileText className="mr-2 h-4 w-4" />
                Nueva Consulta
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
