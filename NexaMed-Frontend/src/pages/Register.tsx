import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Flower2, UserPlus, ArrowLeft, Check } from 'lucide-react'
import { authApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    consultorio_nombre: '',
    especialidad: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        consultorio_nombre: formData.consultorio_nombre,
        especialidad: formData.especialidad || undefined,
      })
      if (res.success) {
        // Redirigir al dashboard automáticamente
        window.location.href = '/app'
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  const trialFeatures = [
    '14 días de prueba gratuita',
    'Plan Profesional completo',
    'Hasta 5 usuarios y 500 pacientes',
    'Sin tarjeta de crédito',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left - Benefits */}
        <div className="flex flex-col justify-center p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center shadow-lg">
              <Flower2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">DaliaMed</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Comienza gratis</h2>
          <p className="text-muted-foreground mb-6">Tu consultorio digital en minutos. Sin compromisos.</p>

          <ul className="space-y-3">
            {trialFeatures.map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Crear cuenta</CardTitle>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link to="/login" className="text-medical-600 hover:underline font-medium">Inicia sesión</Link>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <Label>Nombre completo *</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Dr. Juan García" required />
              </div>

              <div>
                <Label>Correo electrónico *</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="doctor@email.com" required />
              </div>

              <div>
                <Label>Nombre del consultorio *</Label>
                <Input name="consultorio_nombre" value={formData.consultorio_nombre} onChange={handleChange} placeholder="Consultorio Dr. García" required />
              </div>

              <div>
                <Label>Especialidad (opcional)</Label>
                <Input name="especialidad" value={formData.especialidad} onChange={handleChange} placeholder="Ej: Medicina General" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contraseña *</Label>
                  <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 caracteres" required />
                </div>
                <div>
                  <Label>Confirmar *</Label>
                  <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repetir" required />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratuita'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al registrarte aceptas nuestros términos de uso y política de privacidad.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
