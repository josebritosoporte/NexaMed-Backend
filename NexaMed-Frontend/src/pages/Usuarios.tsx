import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  UserCircle,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminUsuariosApi } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface Usuario {
  id: number
  nombre: string
  email: string
  role: 'admin' | 'doctor' | 'assistant'
  telefono?: string
  especialidad?: string
  registro_medico?: string
  activo: boolean
  ultimo_acceso?: string
  created_at: string
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  doctor: 'Doctor',
  assistant: 'Asistente'
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  doctor: <Stethoscope className="h-4 w-4" />,
  assistant: <UserCircle className="h-4 w-4" />
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  assistant: 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

export default function Usuarios() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'assistant' as 'admin' | 'doctor' | 'assistant',
    telefono: '',
    especialidad: '',
    registro_medico: '',
    biografia: ''
  })

  // Cargar usuarios
  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminUsuariosApi.getAll()
      if (response.success && response.data) {
        setUsuarios(response.data)
      } else {
        setError(response.message || 'Error al cargar usuarios')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      nombre: '',
      email: '',
      password: '',
      role: 'assistant',
      telefono: '',
      especialidad: '',
      registro_medico: '',
      biografia: ''
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      role: usuario.role,
      telefono: usuario.telefono || '',
      especialidad: usuario.especialidad || '',
      registro_medico: usuario.registro_medico || '',
      biografia: ''
    })
    setIsModalOpen(true)
  }

  // Guardar usuario
  const handleSave = async () => {
    if (!formData.nombre || !formData.email) {
      setError('Nombre y email son requeridos')
      return
    }

    if (!editingUser && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (editingUser) {
        // Actualizar
        const response = await adminUsuariosApi.update(editingUser.id, formData)
        if (response.success) {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
          await loadUsuarios()
          setIsModalOpen(false)
        } else {
          setError(response.message || 'Error al actualizar usuario')
        }
      } else {
        // Crear
        const response = await adminUsuariosApi.create(formData)
        if (response.success) {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
          await loadUsuarios()
          setIsModalOpen(false)
        } else {
          setError(response.message || 'Error al crear usuario')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario')
    } finally {
      setIsSaving(false)
    }
  }

  // Confirmar eliminación
  const handleDeleteClick = (usuario: Usuario) => {
    setDeletingUser(usuario)
    setIsDeleteModalOpen(true)
  }

  // Eliminar usuario
  const handleDelete = async () => {
    if (!deletingUser) return

    setIsSaving(true)
    try {
      const response = await adminUsuariosApi.delete(deletingUser.id)
      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        await loadUsuarios()
        setIsDeleteModalOpen(false)
        setDeletingUser(null)
      } else {
        setError(response.message || 'Error al desactivar usuario')
      }
    } catch (err: any) {
      setError(err.message || 'Error al desactivar usuario')
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle activo
  const handleToggleActive = async (usuario: Usuario) => {
    // No permitir desactivar el propio usuario
    if (user?.id && usuario.id === parseInt(user.id)) {
      setError('No puede desactivar su propia cuenta')
      return
    }

    try {
      const response = await adminUsuariosApi.update(usuario.id, {
        ...usuario,
        activo: !usuario.activo
      })
      if (response.success) {
        await loadUsuarios()
      } else {
        setError(response.message || 'Error al cambiar estado')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado')
    }
  }

  // Obtener iniciales
  const getIniciales = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-medical-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-medical-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctores</p>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.role === 'doctor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asistentes</p>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.role === 'assistant').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.activo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          Operación completada correctamente
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>{filteredUsuarios.length} usuarios encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rol</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Especialidad</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Último Acceso</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-medical-700">
                            {getIniciales(usuario.nombre)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`gap-1 ${roleColors[usuario.role]}`}>
                        {roleIcons[usuario.role]}
                        {roleLabels[usuario.role]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {usuario.especialidad || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {usuario.activo ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          <UserX className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {usuario.ultimo_acceso
                        ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES')
                        : 'Nunca'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(usuario)}>
                            {usuario.activo ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          {(!user?.id || usuario.id !== parseInt(user.id)) && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(usuario)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Modifica los datos del usuario'
                : 'Completa los datos para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Dr. Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@nexamed.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••' : 'Mínimo 6 caracteres'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="assistant">Asistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+58 412-1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  placeholder="Medicina Interna"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registro_medico">N° Registro Médico</Label>
              <Input
                id="registro_medico"
                value={formData.registro_medico}
                onChange={(e) => setFormData({ ...formData, registro_medico: e.target.value })}
                placeholder="MN-12345"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{deletingUser?.nombre}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
