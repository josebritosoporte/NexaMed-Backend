import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Upload,
  LogOut,
  Check,
  Key,
  Smartphone,
  Mail,
  Clock,
  Monitor,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { usuariosApi } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Configuracion() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('perfil')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos del perfil
  const [perfil, setPerfil] = useState({
    nombre: user?.name || '',
    email: user?.email || '',
    telefono: '',
    especialidad: '',
    registro: '',
    biografia: ''
  })

  // Cargar perfil del backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await usuariosApi.getProfile()
        if (response.success && response.data) {
          const data = response.data as any
          setPerfil({
            nombre: data.nombre || '',
            email: data.email || '',
            telefono: data.telefono || '',
            especialidad: data.especialidad || '',
            registro: data.registro_medico || '',
            biografia: data.biografia || ''
          })
        }
      } catch (err: any) {
        console.error('Error al cargar perfil:', err)
      }
    }

    loadProfile()
  }, [])

  // Datos del consultorio - cargar desde localStorage o usar valores por defecto
  const [consultorio, setConsultorio] = useState(() => {
    const saved = localStorage.getItem('nexamed_consultorio')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      nombre: 'Centro Médico Apure',
      rif: 'J-12345678-0',
      direccion: 'Av. Bolívar Norte, San Fernando de Apure',
      telefono: '+58 247-1234567',
      email: 'contacto@centromedicoapure.com',
      horario: 'Lunes a Viernes: 8:00 AM - 5:00 PM'
    }
  })

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState({
    nuevasCitas: true,
    recordatorios: true,
    resultadosLab: true,
    pacientesPendientes: false,
    actualizaciones: true
  })

  // Tema - usar el contexto
  const [colorPrincipal, setColorPrincipal] = useState('#0d9488')

  // Contraseña
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmar: ''
  })

  // Colores disponibles
  const coloresDisponibles = [
    { color: '#0d9488', nombre: 'Teal' },
    { color: '#0284c7', nombre: 'Azul' },
    { color: '#7c3aed', nombre: 'Violeta' },
    { color: '#db2777', nombre: 'Rosa' },
    { color: '#ea580c', nombre: 'Naranja' }
  ]

  // Guardar perfil
  const handleGuardarPerfil = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await usuariosApi.updateProfile({
        nombre: perfil.nombre,
        telefono: perfil.telefono,
        especialidad: perfil.especialidad,
        registro_medico: perfil.registro,
        biografia: perfil.biografia
      })
      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(response.message || 'Error al actualizar perfil')
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar consultorio en localStorage
  const handleGuardarConsultorio = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem('nexamed_consultorio', JSON.stringify(consultorio))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError('Error al guardar la configuración del consultorio')
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar contraseña
  const handleCambiarPassword = async () => {
    if (passwords.nueva !== passwords.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (passwords.nueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await usuariosApi.changePassword(passwords.actual, passwords.nueva)
      if (response.success) {
        setPasswords({ actual: '', nueva: '', confirmar: '' })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(response.message || 'Error al cambiar contraseña')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  // Cerrar sesión
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Obtener iniciales del usuario
  const getIniciales = () => {
    if (!user?.name) return 'DR'
    return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Toggle notificación
  const toggleNotificacion = (key: keyof typeof notificaciones) => {
    setNotificaciones(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Administra tu perfil y preferencias del sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="h-5 w-5" />
          Cambios guardados correctamente
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="consultorio" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Consultorio</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="perfil" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-medical-500" />
                Información del Perfil
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-medical-500 to-medical-600 text-white">
                    {getIniciales()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Cambiar foto
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG o GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Información de sesión */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sesión activa</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.role === 'doctor' ? 'Médico' : user?.role === 'assistant' ? 'Asistente' : 'Administrador'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{perfil.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Último acceso: Hoy, 8:45 AM</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input 
                    id="nombre" 
                    value={perfil.nombre}
                    onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input 
                    id="especialidad" 
                    value={perfil.especialidad}
                    onChange={(e) => setPerfil({ ...perfil, especialidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registro">N° de Registro</Label>
                  <Input 
                    id="registro" 
                    value={perfil.registro}
                    onChange={(e) => setPerfil({ ...perfil, registro: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="biografia">Biografía profesional</Label>
                  <textarea
                    id="biografia"
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                    value={perfil.biografia}
                    onChange={(e) => setPerfil({ ...perfil, biografia: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGuardarPerfil}
                  disabled={isLoading}
                  className="bg-medical-500 hover:bg-medical-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultorio */}
        <TabsContent value="consultorio" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-medical-500" />
                Información del Consultorio
              </CardTitle>
              <CardDescription>
                Configura los datos de tu consultorio o clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre-consultorio">Nombre del consultorio</Label>
                  <Input 
                    id="nombre-consultorio" 
                    value={consultorio.nombre}
                    onChange={(e) => setConsultorio({ ...consultorio, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rif">RUC / NIT</Label>
                  <Input 
                    id="rif" 
                    value={consultorio.rif}
                    onChange={(e) => setConsultorio({ ...consultorio, rif: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input 
                    id="direccion" 
                    value={consultorio.direccion}
                    onChange={(e) => setConsultorio({ ...consultorio, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono-consultorio">Teléfono</Label>
                  <Input 
                    id="telefono-consultorio" 
                    value={consultorio.telefono}
                    onChange={(e) => setConsultorio({ ...consultorio, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-consultorio">Correo electrónico</Label>
                  <Input 
                    id="email-consultorio" 
                    type="email" 
                    value={consultorio.email}
                    onChange={(e) => setConsultorio({ ...consultorio, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="horario">Horario de atención</Label>
                  <Input 
                    id="horario" 
                    value={consultorio.horario}
                    onChange={(e) => setConsultorio({ ...consultorio, horario: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGuardarConsultorio}
                  disabled={isLoading}
                  className="bg-medical-500 hover:bg-medical-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notificaciones" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-medical-500" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'nuevasCitas', label: 'Nuevas citas programadas', description: 'Recibir notificación cuando un paciente agenda una cita', icon: Clock },
                { key: 'recordatorios', label: 'Recordatorios de citas', description: 'Notificaciones antes de las citas programadas', icon: Bell },
                { key: 'resultadosLab', label: 'Resultados de laboratorio', description: 'Alertas cuando lleguen resultados de laboratorio', icon: Mail },
                { key: 'pacientesPendientes', label: 'Pacientes pendientes', description: 'Recordatorios de pacientes que necesitan seguimiento', icon: User },
                { key: 'actualizaciones', label: 'Actualizaciones del sistema', description: 'Notificaciones sobre nuevas funciones y mejoras', icon: Monitor },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between py-3 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificaciones[item.key as keyof typeof notificaciones]}
                      onChange={() => toggleNotificacion(item.key as keyof typeof notificaciones)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-500"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="seguridad" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-medical-500" />
                Seguridad de la Cuenta
              </CardTitle>
              <CardDescription>
                Gestiona tu contraseña y seguridad de la cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">Cambiar contraseña</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={passwords.actual}
                      onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={passwords.nueva}
                      onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={passwords.confirmar}
                      onChange={(e) => setPasswords({ ...passwords, confirmar: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleCambiarPassword}
                  disabled={isLoading || !passwords.actual || !passwords.nueva}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">Autenticación de dos factores</h4>
                  <Badge variant="outline" className="text-amber-600 border-amber-200">
                    Próximamente
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  Añade una capa extra de seguridad a tu cuenta habilitando la autenticación de dos factores.
                  Esta función estará disponible cuando se integre el backend.
                </p>
                <Button variant="outline" disabled className="ml-8">
                  Configurar 2FA
                </Button>
              </div>

              <Separator />

              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium text-red-700">Zona de peligro</h4>
                </div>
                <p className="text-sm text-red-600 ml-8">
                  Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos serán eliminados permanentemente.
                </p>
                <Button variant="destructive" className="ml-8">
                  Eliminar cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="apariencia" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-medical-500" />
                Personalización
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tema</h4>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${theme === 'light' ? 'border-medical-500 bg-medical-50' : 'border-border hover:border-muted-foreground'}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-white border shadow-sm mb-3 flex items-center justify-center">
                      <Sun className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="font-medium text-sm">Claro</p>
                    <p className="text-xs text-muted-foreground">Tema claro</p>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${theme === 'dark' ? 'border-medical-500 bg-slate-800' : 'border-border bg-slate-900 hover:border-slate-600'}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-700 border border-slate-600 mb-3 flex items-center justify-center">
                      <Moon className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="font-medium text-sm text-white">Oscuro</p>
                    <p className="text-xs text-slate-400">Tema oscuro</p>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${theme === 'system' ? 'border-medical-500 bg-medical-50' : 'border-border hover:border-muted-foreground'}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-white to-slate-800 border mb-3 flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-slate-600" />
                    </div>
                    <p className="font-medium text-sm">Sistema</p>
                    <p className="text-xs text-muted-foreground">Automático</p>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Color principal</h4>
                <p className="text-sm text-muted-foreground">
                  Elige el color principal para la aplicación
                </p>
                <div className="flex gap-4">
                  {coloresDisponibles.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setColorPrincipal(c.color)}
                      className={`h-12 w-12 rounded-xl border-2 shadow-md hover:scale-110 transition-all ${colorPrincipal === c.color ? 'border-foreground ring-2 ring-offset-2' : 'border-white'}`}
                      style={{ backgroundColor: c.color }}
                      title={c.nombre}
                    >
                      {colorPrincipal === c.color && (
                        <Check className="h-6 w-6 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Vista previa</h4>
                <div className="p-4 rounded-lg border" style={{ borderColor: colorPrincipal }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: colorPrincipal }}>
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Color seleccionado</p>
                      <p className="text-sm text-muted-foreground">{colorPrincipal}</p>
                    </div>
                  </div>
                  <Button style={{ backgroundColor: colorPrincipal }} className="text-white">
                    Botón de ejemplo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación de cierre de sesión */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


