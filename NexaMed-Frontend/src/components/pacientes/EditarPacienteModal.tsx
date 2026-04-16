import { useState, useEffect } from 'react'
import { User, Phone, Mail, MapPin, AlertCircle, Heart, Pill, UserCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface EditarPacienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (paciente: PacienteEditData) => void
  paciente: {
    id: string
    nombres: string
    apellidos: string
    cedula: string
    fecha_nacimiento: string
    sexo: string
    telefono: string
    email?: string
    alergias?: string
    antecedentes_medicos?: string
    // Campos opcionales
    estado_civil?: string
    ocupacion?: string
    tipo_sangre?: string
    direccion?: string
    ciudad?: string
    contacto_emergencia_nombre?: string
    contacto_emergencia_telefono?: string
    contacto_emergencia_relacion?: string
    medicamentos_actuales?: string
  } | null
}

export interface PacienteEditData {
  id: string
  nombres: string
  apellidos: string
  cedula: string
  fechaNacimiento: string
  sexo: string
  estadoCivil: string
  ocupacion: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  contactoEmergenciaNombre: string
  contactoEmergenciaTelefono: string
  contactoEmergenciaRelacion: string
  alergias: string
  antecedentesMedicos: string
  medicamentosActuales: string
  tipoSangre: string
}

const initialFormData: PacienteEditData = {
  id: '',
  nombres: '',
  apellidos: '',
  cedula: '',
  fechaNacimiento: '',
  sexo: '',
  estadoCivil: '',
  ocupacion: '',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
  contactoEmergenciaNombre: '',
  contactoEmergenciaTelefono: '',
  contactoEmergenciaRelacion: '',
  alergias: '',
  antecedentesMedicos: '',
  medicamentosActuales: '',
  tipoSangre: '',
}

export function EditarPacienteModal({ isOpen, onClose, onSave, paciente }: EditarPacienteModalProps) {
  const [formData, setFormData] = useState<PacienteEditData>(initialFormData)
  const [activeTab, setActiveTab] = useState('personal')
  const [errors, setErrors] = useState<Partial<Record<keyof PacienteEditData, string>>>({})

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (paciente && isOpen) {
      setFormData({
        id: paciente.id,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        cedula: paciente.cedula,
        fechaNacimiento: paciente.fecha_nacimiento,
        sexo: paciente.sexo,
        estadoCivil: paciente.estado_civil || '',
        ocupacion: paciente.ocupacion || '',
        telefono: paciente.telefono,
        email: paciente.email || '',
        direccion: paciente.direccion || '',
        ciudad: paciente.ciudad || '',
        contactoEmergenciaNombre: paciente.contacto_emergencia_nombre || '',
        contactoEmergenciaTelefono: paciente.contacto_emergencia_telefono || '',
        contactoEmergenciaRelacion: paciente.contacto_emergencia_relacion || '',
        alergias: paciente.alergias || '',
        antecedentesMedicos: paciente.antecedentes_medicos || '',
        medicamentosActuales: paciente.medicamentos_actuales || '',
        tipoSangre: paciente.tipo_sangre || '',
      })
      setActiveTab('personal')
    }
  }, [paciente, isOpen])

  const handleChange = (field: keyof PacienteEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PacienteEditData, string>> = {}
    
    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es requerido'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es requerido'
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida'
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    if (!formData.sexo) newErrors.sexo = 'El sexo es requerido'
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-medical-500" />
            Editar Paciente
          </DialogTitle>
          <DialogDescription>
            Modifique la información del paciente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="contacto">Contacto</TabsTrigger>
              <TabsTrigger value="emergencia">Emergencia</TabsTrigger>
              <TabsTrigger value="medica">Información Médica</TabsTrigger>
            </TabsList>

            {/* Tab: Datos Personales */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombres">
                    Nombres <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    placeholder="Ej: Juan Carlos"
                    className={errors.nombres ? 'border-destructive' : ''}
                  />
                  {errors.nombres && (
                    <p className="text-sm text-destructive">{errors.nombres}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-apellidos">
                    Apellidos <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    placeholder="Ej: Rodríguez Pérez"
                    className={errors.apellidos ? 'border-destructive' : ''}
                  />
                  {errors.apellidos && (
                    <p className="text-sm text-destructive">{errors.apellidos}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-cedula">
                    Cédula / Documento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-cedula"
                    value={formData.cedula}
                    onChange={(e) => handleChange('cedula', e.target.value)}
                    placeholder="Ej: 1234567890"
                    className={errors.cedula ? 'border-destructive' : ''}
                  />
                  {errors.cedula && (
                    <p className="text-sm text-destructive">{errors.cedula}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fechaNacimiento">
                    Fecha de Nacimiento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.fechaNacimiento ? 'border-destructive' : ''}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-sm text-destructive">{errors.fechaNacimiento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-sexo">
                    Sexo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => handleChange('sexo', value)}
                  >
                    <SelectTrigger className={errors.sexo ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sexo && (
                    <p className="text-sm text-destructive">{errors.sexo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-estadoCivil">Estado Civil</Label>
                  <Select
                    value={formData.estadoCivil}
                    onValueChange={(value) => handleChange('estadoCivil', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero/a</SelectItem>
                      <SelectItem value="casado">Casado/a</SelectItem>
                      <SelectItem value="divorciado">Divorciado/a</SelectItem>
                      <SelectItem value="viudo">Viudo/a</SelectItem>
                      <SelectItem value="union_libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ocupacion">Ocupación</Label>
                  <Input
                    id="edit-ocupacion"
                    value={formData.ocupacion}
                    onChange={(e) => handleChange('ocupacion', e.target.value)}
                    placeholder="Ej: Ingeniero"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tipoSangre">Tipo de Sangre</Label>
                  <Select
                    value={formData.tipoSangre}
                    onValueChange={(value) => handleChange('tipoSangre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Contacto */}
            <TabsContent value="contacto" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="Ej: 0991234567"
                    className={errors.telefono ? 'border-destructive' : ''}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-destructive">{errors.telefono}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Ej: paciente@email.com"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-direccion">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Dirección
                  </Label>
                  <Textarea
                    id="edit-direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Ej: Av. Principal 123 y Calle Secundaria"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ciudad">Ciudad</Label>
                  <Input
                    id="edit-ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                    placeholder="Ej: Quito"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Contacto de Emergencia */}
            <TabsContent value="emergencia" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contactoEmergenciaNombre">
                    <UserCircle className="inline h-4 w-4 mr-1" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="edit-contactoEmergenciaNombre"
                    value={formData.contactoEmergenciaNombre}
                    onChange={(e) => handleChange('contactoEmergenciaNombre', e.target.value)}
                    placeholder="Ej: María Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-contactoEmergenciaTelefono">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Teléfono
                  </Label>
                  <Input
                    id="edit-contactoEmergenciaTelefono"
                    value={formData.contactoEmergenciaTelefono}
                    onChange={(e) => handleChange('contactoEmergenciaTelefono', e.target.value)}
                    placeholder="Ej: 0987654321"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-contactoEmergenciaRelacion">Relación</Label>
                  <Select
                    value={formData.contactoEmergenciaRelacion}
                    onValueChange={(value) => handleChange('contactoEmergenciaRelacion', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padre">Padre</SelectItem>
                      <SelectItem value="madre">Madre</SelectItem>
                      <SelectItem value="hermano">Hermano/a</SelectItem>
                      <SelectItem value="conyuge">Cónyuge</SelectItem>
                      <SelectItem value="hijo">Hijo/a</SelectItem>
                      <SelectItem value="amigo">Amigo/a</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Información Médica */}
            <TabsContent value="medica" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-alergias">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Alergias (separadas por coma)
                  </Label>
                  <Textarea
                    id="edit-alergias"
                    value={formData.alergias}
                    onChange={(e) => handleChange('alergias', e.target.value)}
                    placeholder="Ej: Penicilina, ibuprofeno, mariscos..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-antecedentesMedicos">
                    <Heart className="inline h-4 w-4 mr-1" />
                    Antecedentes Médicos (separados por coma)
                  </Label>
                  <Textarea
                    id="edit-antecedentesMedicos"
                    value={formData.antecedentesMedicos}
                    onChange={(e) => handleChange('antecedentesMedicos', e.target.value)}
                    placeholder="Ej: Hipertensión, diabetes, cirugías previas..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-medicamentosActuales">
                    <Pill className="inline h-4 w-4 mr-1" />
                    Medicamentos Actuales
                  </Label>
                  <Textarea
                    id="edit-medicamentosActuales"
                    value={formData.medicamentosActuales}
                    onChange={(e) => handleChange('medicamentosActuales', e.target.value)}
                    placeholder="Ej: Losartán 50mg cada 24h, Metformina 500mg..."
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-medical-500 hover:bg-medical-600">
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
