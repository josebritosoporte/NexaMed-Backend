import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Save,
  Stethoscope,
  Activity,
  Thermometer,
  Scale,
  Ruler,
  Heart,
  ClipboardList,
  Pill,
  FileText,
  Plus,
  X,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, calculateAge } from '@/lib/utils'
import { pacientesApi, consultasApi } from '@/services/api'

// Datos de ejemplo del paciente
const pacienteEjemplo = {
  id: '1',
  nombre: 'María Elena',
  apellido: 'González Pérez',
  identificacion: 'V-12.345.678',
  fechaNacimiento: '1979-03-15',
  sexo: 'femenino',
  telefono: '+58 412-1234567',
  alergias: ['Penicilina', 'Yodo'],
  antecedentes: ['Hipertensión', 'Diabetes gestacional'],
  tipoSangre: 'O+',
  medicamentosActuales: 'Losartán 50mg cada 24h'
}

// Códigos CIE-10 comunes
const diagnosticosCIE10 = [
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'I11.9', descripcion: 'Enfermedad cardíaca hipertensiva sin insuficiencia cardíaca' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { codigo: 'E10.9', descripcion: 'Diabetes mellitus tipo 1 sin complicaciones' },
  { codigo: 'J00', descripcion: 'Nasofaringitis aguda (resfriado común)' },
  { codigo: 'J06.9', descripcion: 'Infección aguda de las vías respiratorias superiores, sin especificar' },
  { codigo: 'K29.7', descripcion: 'Gastritis, sin especificar' },
  { codigo: 'K21.0', descripcion: 'Reflujo gastroesofágico con esofagitis' },
  { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
  { codigo: 'R51', descripcion: 'Cefalea' },
  { codigo: 'F32.9', descripcion: 'Episodio depresivo mayor, sin especificar' },
  { codigo: 'F41.9', descripcion: 'Ansiedad, sin especificar' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'J45.9', descripcion: 'Asma, sin especificar' },
  { codigo: 'J18.9', descripcion: 'Neumonía, sin especificar' },
]

// Medicamentos comunes
const medicamentosComunes = [
  { nombre: 'Losartán 50mg', presentacion: 'Tabletas', via: 'Oral' },
  { nombre: 'Metformina 850mg', presentacion: 'Tabletas', via: 'Oral' },
  { nombre: 'Omeprazol 20mg', presentacion: 'Cápsulas', via: 'Oral' },
  { nombre: 'Ibuprofeno 400mg', presentacion: 'Tabletas', via: 'Oral' },
  { nombre: 'Paracetamol 500mg', presentacion: 'Tabletas', via: 'Oral' },
  { nombre: 'Amoxicilina 500mg', presentacion: 'Cápsulas', via: 'Oral' },
  { nombre: 'Azitromicina 500mg', presentacion: 'Tabletas', via: 'Oral' },
  { nombre: 'Ciprofloxacino 500mg', presentacion: 'Tabletas', via: 'Oral' },
]

interface SignosVitales {
  presionSistolica: string
  presionDiastolica: string
  frecuenciaCardiaca: string
  frecuenciaRespiratoria: string
  temperatura: string
  peso: string
  talla: string
  imc: string
  saturacionOxigeno: string
}

interface Diagnostico {
  id: string
  codigo: string
  descripcion: string
  tipo: 'principal' | 'secundario'
}

interface MedicamentoReceta {
  id: string
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
  indicaciones: string
}

export default function NuevaConsulta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<any>(null)
  const [loadingPaciente, setLoadingPaciente] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cargar datos del paciente
  useEffect(() => {
    const loadPaciente = async () => {
      if (!id) {
        setError('ID de paciente no proporcionado')
        setLoadingPaciente(false)
        return
      }
      
      try {
        setLoadingPaciente(true)
        const response = await pacientesApi.getById(parseInt(id))
        if (response.success && response.data) {
          setPaciente(response.data)
        } else {
          setError('Paciente no encontrado')
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar paciente')
      } finally {
        setLoadingPaciente(false)
      }
    }
    
    loadPaciente()
  }, [id])

  // Signos vitales
  const [signosVitales, setSignosVitales] = useState<SignosVitales>({
    presionSistolica: '',
    presionDiastolica: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    temperatura: '',
    peso: '',
    talla: '',
    imc: '',
    saturacionOxigeno: ''
  })

  // SOAP
  const [subjetivo, setSubjetivo] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [analisis, setAnalisis] = useState('')
  const [plan, setPlan] = useState('')

  // Diagnósticos
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [buscarDiagnostico, setBuscarDiagnostico] = useState('')

  // Receta
  const [medicamentos, setMedicamentos] = useState<MedicamentoReceta[]>([])

  // Calcular IMC
  const calcularIMC = () => {
    const peso = parseFloat(signosVitales.peso)
    const talla = parseFloat(signosVitales.talla) / 100 // Convertir cm a m
    if (peso && talla) {
      const imc = (peso / (talla * talla)).toFixed(1)
      setSignosVitales(prev => ({ ...prev, imc }))
    }
  }

  // Agregar diagnóstico
  const agregarDiagnostico = (codigo: string, descripcion: string) => {
    const nuevoDiagnostico: Diagnostico = {
      id: Date.now().toString(),
      codigo,
      descripcion,
      tipo: diagnosticos.length === 0 ? 'principal' : 'secundario'
    }
    setDiagnosticos([...diagnosticos, nuevoDiagnostico])
    setBuscarDiagnostico('')
  }

  // Eliminar diagnóstico
  const eliminarDiagnostico = (id: string) => {
    const nuevosDiagnosticos = diagnosticos.filter(d => d.id !== id)
    // Si eliminamos el principal, el primero se convierte en principal
    if (nuevosDiagnosticos.length > 0 && !nuevosDiagnosticos.some(d => d.tipo === 'principal')) {
      nuevosDiagnosticos[0].tipo = 'principal'
    }
    setDiagnosticos(nuevosDiagnosticos)
  }

  // Agregar medicamento
  const agregarMedicamento = () => {
    const nuevoMedicamento: MedicamentoReceta = {
      id: Date.now().toString(),
      nombre: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: ''
    }
    setMedicamentos([...medicamentos, nuevoMedicamento])
  }

  // Actualizar medicamento
  const actualizarMedicamento = (id: string, field: keyof MedicamentoReceta, value: string) => {
    setMedicamentos(medicamentos.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  // Eliminar medicamento
  const eliminarMedicamento = (id: string) => {
    setMedicamentos(medicamentos.filter(m => m.id !== id))
  }

  // Guardar consulta
  const handleGuardar = async () => {
    if (!paciente) return
    
    setIsLoading(true)
    try {
      const consultaData = {
        paciente_id: parseInt(id!),
        presion_sistolica: signosVitales.presionSistolica ? parseInt(signosVitales.presionSistolica) : null,
        presion_diastolica: signosVitales.presionDiastolica ? parseInt(signosVitales.presionDiastolica) : null,
        frecuencia_cardiaca: signosVitales.frecuenciaCardiaca ? parseInt(signosVitales.frecuenciaCardiaca) : null,
        frecuencia_respiratoria: signosVitales.frecuenciaRespiratoria ? parseInt(signosVitales.frecuenciaRespiratoria) : null,
        temperatura: signosVitales.temperatura ? parseFloat(signosVitales.temperatura) : null,
        peso: signosVitales.peso ? parseFloat(signosVitales.peso) : null,
        talla: signosVitales.talla ? parseFloat(signosVitales.talla) : null,
        imc: signosVitales.imc ? parseFloat(signosVitales.imc) : null,
        saturacion_oxigeno: signosVitales.saturacionOxigeno ? parseInt(signosVitales.saturacionOxigeno) : null,
        subjetivo,
        objetivo,
        analisis,
        plan,
        diagnosticos: diagnosticos.map(d => ({
          codigo_cie10: d.codigo,
          descripcion: d.descripcion,
          tipo: d.tipo
        })),
        medicamentos: medicamentos.map(m => ({
          nombre: m.nombre,
          dosis: m.dosis,
          frecuencia: m.frecuencia,
          duracion: m.duracion,
          indicaciones: m.indicaciones
        }))
      }
      
      await consultasApi.create(consultaData)
      navigate(`/app/pacientes/${id}/expediente`)
    } catch (err: any) {
      setError(err.message || 'Error al guardar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar diagnósticos por búsqueda
  const diagnosticosFiltrados = diagnosticosCIE10.filter(d =>
    d.codigo.toLowerCase().includes(buscarDiagnostico.toLowerCase()) ||
    d.descripcion.toLowerCase().includes(buscarDiagnostico.toLowerCase())
  )

  if (loadingPaciente) {
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
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-600">Paciente no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/app/pacientes/${id}/expediente`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva Consulta</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleGuardar}
          disabled={isLoading}
          className="bg-medical-500 hover:bg-medical-600"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Consulta'}
        </Button>
      </div>

      {/* Patient Info Banner */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-medical-50 to-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-medical-100 flex items-center justify-center">
              <User className="h-7 w-7 text-medical-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {paciente?.nombres} {paciente?.apellidos}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span><strong>ID:</strong> {paciente?.cedula}</span>
                <span><strong>Edad:</strong> {paciente?.fecha_nacimiento ? calculateAge(paciente.fecha_nacimiento) : '-'} años</span>
                <span><strong>Sexo:</strong> {paciente?.sexo === 'femenino' ? 'Femenino' : 'Masculino'}</span>
                <span><strong>Tel:</strong> {paciente?.telefono}</span>
              </div>
            </div>
            {paciente?.alergias && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive" className="text-xs">
                  <X className="h-3 w-3 mr-1" />
                  {paciente.alergias}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signos Vitales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-medical-500" />
            Signos Vitales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Presión Arterial
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Sist"
                  value={signosVitales.presionSistolica}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, presionSistolica: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center">/</span>
                <Input
                  type="number"
                  placeholder="Diast"
                  value={signosVitales.presionDiastolica}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, presionDiastolica: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">mmHg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-pink-500" />
                F.C.
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="80"
                  value={signosVitales.frecuenciaCardiaca}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, frecuenciaCardiaca: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">lpm</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-orange-500" />
                Temperatura
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={signosVitales.temperatura}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, temperatura: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">°C</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Scale className="h-4 w-4 text-blue-500" />
                Peso
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={signosVitales.peso}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, peso: e.target.value }))}
                  onBlur={calcularIMC}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Ruler className="h-4 w-4 text-green-500" />
                Talla
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="165"
                  value={signosVitales.talla}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, talla: e.target.value }))}
                  onBlur={calcularIMC}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">cm</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>IMC</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  value={signosVitales.imc}
                  readOnly
                  className="w-20 bg-muted"
                />
                <span className="text-muted-foreground text-sm">kg/m²</span>
                {signosVitales.imc && (
                  <Badge variant={
                    parseFloat(signosVitales.imc) < 18.5 ? 'secondary' :
                    parseFloat(signosVitales.imc) < 25 ? 'default' :
                    parseFloat(signosVitales.imc) < 30 ? 'secondary' : 'destructive'
                  }>
                    {parseFloat(signosVitales.imc) < 18.5 ? 'Bajo peso' :
                     parseFloat(signosVitales.imc) < 25 ? 'Normal' :
                     parseFloat(signosVitales.imc) < 30 ? 'Sobrepeso' : 'Obesidad'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-cyan-500" />
                SpO2
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="98"
                  value={signosVitales.saturacionOxigeno}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, saturacionOxigeno: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Stethoscope className="h-4 w-4 text-purple-500" />
                F.R.
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="16"
                  value={signosVitales.frecuenciaRespiratoria}
                  onChange={(e) => setSignosVitales(prev => ({ ...prev, frecuenciaRespiratoria: e.target.value }))}
                  className="w-20"
                />
                <span className="flex items-center text-muted-foreground text-sm">rpm</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOAP Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjetivo */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className="text-blue-600 border-blue-200">S</Badge>
              Subjetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Motivo de Consulta</Label>
                <Textarea
                  placeholder="¿Qué le molesta al paciente?"
                  value={subjetivo}
                  onChange={(e) => setSubjetivo(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Historia de Enfermedad Actual</Label>
                <Textarea
                  placeholder="Describa el inicio, evolución, síntomas asociados, tratamientos previos..."
                  rows={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className="text-green-600 border-green-200">O</Badge>
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Examen Físico</Label>
              <Textarea
                placeholder="Hallazgos del examen físico: aspecto general, cabeza, cuello, tórax, abdomen, extremidades..."
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className="text-amber-600 border-amber-200">A</Badge>
              Análisis / Impresión Diagnóstica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Impresión Clínica</Label>
              <Textarea
                placeholder="Interpretación de los hallazgos, diagnósticos diferenciales..."
                value={analisis}
                onChange={(e) => setAnalisis(e.target.value)}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnósticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-medical-500" />
            Diagnósticos (CIE-10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Diagnósticos seleccionados */}
          {diagnosticos.length > 0 && (
            <div className="space-y-2 mb-4">
              {diagnosticos.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Badge variant={d.tipo === 'principal' ? 'default' : 'secondary'}>
                      {d.tipo === 'principal' ? 'Principal' : 'Secundario'}
                    </Badge>
                    <span className="font-mono text-sm">{d.codigo}</span>
                    <span>{d.descripcion}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => eliminarDiagnostico(d.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Buscar diagnóstico */}
          <div className="space-y-2">
            <Label>Buscar diagnóstico</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por código o descripción..."
                value={buscarDiagnostico}
                onChange={(e) => setBuscarDiagnostico(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Resultados */}
            {buscarDiagnostico && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {diagnosticosFiltrados.slice(0, 5).map((d) => (
                  <button
                    key={d.codigo}
                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-3"
                    onClick={() => agregarDiagnostico(d.codigo, d.descripcion)}
                  >
                    <span className="font-mono text-sm text-medical-600">{d.codigo}</span>
                    <span className="text-sm">{d.descripcion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan y Receta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="outline" className="text-purple-600 border-purple-200">P</Badge>
            Plan y Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Plan general */}
            <div className="space-y-2">
              <Label>Plan de Tratamiento</Label>
              <Textarea
                placeholder="Indicaciones generales, estudios complementarios, interconsultas..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={3}
              />
            </div>

            {/* Receta médica */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Receta Médica
                </Label>
                <Button variant="outline" size="sm" onClick={agregarMedicamento}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Medicamento
                </Button>
              </div>

              {medicamentos.map((med) => (
                <div key={med.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Medicamento</Label>
                        <Input
                          placeholder="Nombre del medicamento"
                          value={med.nombre}
                          onChange={(e) => actualizarMedicamento(med.id, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Dosis</Label>
                        <Input
                          placeholder="Ej: 1 tableta"
                          value={med.dosis}
                          onChange={(e) => actualizarMedicamento(med.id, 'dosis', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frecuencia</Label>
                        <Select
                          value={med.frecuencia}
                          onValueChange={(value) => actualizarMedicamento(med.id, 'frecuencia', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Cada..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8h">Cada 8 horas</SelectItem>
                            <SelectItem value="12h">Cada 12 horas</SelectItem>
                            <SelectItem value="24h">Cada 24 horas</SelectItem>
                            <SelectItem value="PRN">Solo si es necesario</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duración</Label>
                        <Input
                          placeholder="Ej: 7 días"
                          value={med.duracion}
                          onChange={(e) => actualizarMedicamento(med.id, 'duracion', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-3">
                        <Label className="text-xs">Indicaciones adicionales</Label>
                        <Input
                          placeholder="Ej: Tomar con alimentos"
                          value={med.indicaciones}
                          onChange={(e) => actualizarMedicamento(med.id, 'indicaciones', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => eliminarMedicamento(med.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {medicamentos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay medicamentos agregados. Haz clic en "Agregar Medicamento" para comenzar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones finales */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/pacientes/${id}/expediente`)}>
          Cancelar
        </Button>
        <Button 
          onClick={handleGuardar}
          disabled={isLoading}
          className="bg-medical-500 hover:bg-medical-600"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Consulta'}
        </Button>
      </div>
    </div>
  )
}
