import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Save,
  FileText,
  Plus,
  X,
  Printer,
  Download,
  TestTube,
  Scan,
  Stethoscope,
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
import { pacientesApi, ordenesApi } from '@/services/api'

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
  tipoSangre: 'O+',
  alergias: ['Penicilina', 'Yodo']
}

// Exámenes de laboratorio comunes
const examenesLaboratorio = [
  { codigo: 'HEM', nombre: 'Hematología Completa', categoria: 'Hematología' },
  { codigo: 'QUIM', nombre: 'Química Sanguínea (6 elementos)', categoria: 'Bioquímica' },
  { codigo: 'GLI', nombre: 'Glucosa en ayunas', categoria: 'Bioquímica' },
  { codigo: 'PERFIL-LIP', nombre: 'Perfil Lipídico', categoria: 'Bioquímica' },
  { codigo: 'PERFIL-TIR', nombre: 'Perfil Tiroideo', categoria: 'Endocrinología' },
  { codigo: 'HBA1C', nombre: 'Hemoglobina Glicosilada', categoria: 'Endocrinología' },
  { codigo: 'UREA', nombre: 'Nitrógeno Ureico y Creatinina', categoria: 'Bioquímica' },
  { codigo: 'UA', nombre: 'Examen General de Orina', categoria: 'Uroanálisis' },
  { codigo: 'PSA', nombre: 'Antígeno Prostático Específico', categoria: 'Uroanálisis' },
  { codigo: 'HEP', nombre: 'Perfil Hepático', categoria: 'Bioquímica' },
  { codigo: 'ELEC', nombre: 'Electrolitos Séricos', categoria: 'Bioquímica' },
  { codigo: 'VitD', nombre: 'Vitamina D (25-OH)', categoria: 'Vitaminas' },
  { codigo: 'B12', nombre: 'Vitamina B12', categoria: 'Vitaminas' },
  { codigo: 'FE', nombre: 'Perfil de Hierro', categoria: 'Hematología' },
  { codigo: 'COP', nombre: 'Coprológico', categoria: 'Heces' }
]

// Estudios de imagenología
const estudiosImagenologia = [
  { codigo: 'RX-TOR', nombre: 'Radiografía de Tórax PA/L', categoria: 'Rayos X' },
  { codigo: 'RX-ABD', nombre: 'Radiografía de Abdomen', categoria: 'Rayos X' },
  { codigo: 'RX-COL', nombre: 'Radiografía de Columna', categoria: 'Rayos X' },
  { codigo: 'RX-EXT', nombre: 'Radiografía de Extremidades', categoria: 'Rayos X' },
  { codigo: 'USG-ABD', nombre: 'Ultrasonido Abdominal', categoria: 'Ultrasonido' },
  { codigo: 'USG-PEL', nombre: 'Ultrasonido Pélvico', categoria: 'Ultrasonido' },
  { codigo: 'USG-TIR', nombre: 'Ultrasonido de Tiroides', categoria: 'Ultrasonido' },
  { codigo: 'USG-OBG', nombre: 'Ultrasonido Obstétrico', categoria: 'Ultrasonido' },
  { codigo: 'USG-MAM', nombre: 'Ultrasonido Mamario', categoria: 'Ultrasonido' },
  { codigo: 'USG-REN', nombre: 'Ultrasonido Renal', categoria: 'Ultrasonido' },
  { codigo: 'ECO-CAR', nombre: 'Ecocardiograma', categoria: 'Especializados' },
  { codigo: 'TC-CER', nombre: 'Tomografía Cerebral', categoria: 'Tomografía' },
  { codigo: 'TC-ABD', nombre: 'Tomografía Abdominal', categoria: 'Tomografía' },
  { codigo: 'RMN-CER', nombre: 'Resonancia Cerebral', categoria: 'Resonancia' },
  { codigo: 'RMN-COL', nombre: 'Resonancia de Columna', categoria: 'Resonancia' }
]

// Especialidades para interconsulta
const especialidades = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Hematología',
  'Medicina Interna',
  'Nefrología',
  'Neumología',
  'Neurología',
  'Oftalmología',
  'Otorrinolaringología',
  'Psiquiatría',
  'Reumatología',
  'Traumatología',
  'Urología'
]

type TipoOrden = 'laboratorio' | 'imagenologia' | 'interconsulta'

interface ExamenSeleccionado {
  codigo: string
  nombre: string
  categoria: string
  indicaciones?: string
}

export default function NuevaOrden() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const consultaId = searchParams.get('consulta')
  const [paciente, setPaciente] = useState<any>(null)
  const [loadingPaciente, setLoadingPaciente] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false)

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

  // Tipo de orden
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>('laboratorio')

  // Datos de la orden - Inician vacíos para llenado manual
  const [diagnosticoPresuntivo, setDiagnosticoPresuntivo] = useState('')
  const [motivoSolicitud, setMotivoSolicitud] = useState('')
  const [prioridad, setPrioridad] = useState<'normal' | 'urgente'>('normal')
  const [observaciones, setObservaciones] = useState('')

  // Para interconsulta
  const [especialidadDestino, setEspecialidadDestino] = useState('')

  // Exámenes/Estudios seleccionados - Inicia vacío
  const [examenesSeleccionados, setExamenesSeleccionados] = useState<ExamenSeleccionado[]>([])
  const [buscarExamen, setBuscarExamen] = useState('')

  // Obtener lista según tipo de orden
  const listaExamenes = tipoOrden === 'laboratorio' ? examenesLaboratorio : 
                        tipoOrden === 'imagenologia' ? estudiosImagenologia : []

  // Filtrar exámenes por búsqueda
  const examenesFiltrados = listaExamenes.filter(e =>
    e.nombre.toLowerCase().includes(buscarExamen.toLowerCase()) ||
    e.codigo.toLowerCase().includes(buscarExamen.toLowerCase()) ||
    e.categoria.toLowerCase().includes(buscarExamen.toLowerCase())
  )

  // Agregar examen
  const agregarExamen = (examen: { codigo: string; nombre: string; categoria: string }) => {
    if (!examenesSeleccionados.some(e => e.codigo === examen.codigo)) {
      setExamenesSeleccionados([...examenesSeleccionados, { ...examen, indicaciones: '' }])
    }
    setBuscarExamen('')
  }

  // Eliminar examen
  const eliminarExamen = (codigo: string) => {
    setExamenesSeleccionados(examenesSeleccionados.filter(e => e.codigo !== codigo))
  }

  // Actualizar indicaciones de un examen
  const actualizarIndicaciones = (codigo: string, indicaciones: string) => {
    setExamenesSeleccionados(examenesSeleccionados.map(e =>
      e.codigo === codigo ? { ...e, indicaciones } : e
    ))
  }

  // Datos del médico (simulado)
  const medico = {
    nombre: 'Dr. Carlos Rodríguez',
    especialidad: 'Medicina Interna',
    registro: 'MN-12345',
    consultorio: 'Centro Médico Apure',
    direccion: 'Av. Bolívar Norte, San Fernando de Apure',
    telefono: '+58 247-1234567'
  }

  // Generar PDF / Imprimir
  const handleImprimir = () => {
    const fechaActual = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const contenidoOrden = `
      <html>
      <head>
        <title>Orden Médica - ${paciente?.nombres} ${paciente?.apellidos}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; max-width: 140mm; margin: 0 auto; font-size: 11px; }
          .header { border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 16px; font-weight: bold; color: #0d9488; }
          .fecha { font-size: 10px; color: #666; }
          .title { font-size: 12px; font-weight: bold; color: #333; margin: 8px 0; padding: 5px; background: #f0fdfa; border-radius: 4px; text-align: center; }
          .patient-row { display: flex; gap: 15px; margin-bottom: 8px; font-size: 10px; background: #f9f9f9; padding: 6px 8px; border-radius: 4px; }
          .patient-row span { white-space: nowrap; }
          .patient-row strong { color: #333; }
          .section-title { font-size: 10px; font-weight: bold; color: #0d9488; margin: 8px 0 4px; text-transform: uppercase; }
          .diagnostico { font-size: 10px; color: #333; margin-bottom: 8px; padding: 5px; background: #fff; border-left: 2px solid #0d9488; }
          .examenes-list { list-style: none; }
          .examenes-list li { padding: 4px 6px; background: #f8f8f8; margin-bottom: 2px; border-radius: 3px; font-size: 10px; display: flex; align-items: center; gap: 6px; }
          .examenes-list .cod { background: #0d9488; color: white; padding: 1px 5px; border-radius: 2px; font-size: 8px; font-weight: bold; }
          .examenes-list .nom { flex: 1; }
          .examenes-list .ind { color: #666; font-size: 9px; font-style: italic; }
          .observaciones { font-size: 9px; color: #666; margin-top: 6px; padding: 4px; background: #fffbeb; border-radius: 3px; }
          .footer { margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: flex-end; }
          .firma { text-align: center; }
          .firma-linea { border-top: 1px solid #333; width: 180px; margin-bottom: 4px; padding-top: 8px; }
          .firma-nombre { font-weight: bold; font-size: 10px; }
          .firma-datos { font-size: 8px; color: #666; }
          .urgente { background: #fef2f2; border: 1px solid #ef4444; padding: 4px; text-align: center; margin: 6px 0; border-radius: 3px; }
          .urgente-text { color: #dc2626; font-weight: bold; font-size: 10px; }
          .especialidad { font-size: 11px; font-weight: bold; color: #0d9488; margin: 6px 0; }
          .motivo { font-size: 10px; color: #333; }
          .disclaimer { margin-top: 8px; font-size: 8px; color: #999; text-align: center; }
          @media print {
            body { padding: 10mm; }
            @page { size: 140mm 216mm; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="logo">NexaMed</span>
          <span class="fecha">${fechaActual}</span>
        </div>

        <div class="title">ORDEN DE ${tipoOrden === 'laboratorio' ? 'LABORATORIO' : tipoOrden === 'imagenologia' ? 'IMAGENOLOGÍA' : 'INTERCONSULTA'}</div>

        ${prioridad === 'urgente' ? '<div class="urgente"><span class="urgente-text">⚠️ URGENTE</span></div>' : ''}

        <div class="patient-row">
          <span><strong>Paciente:</strong> ${paciente?.nombres} ${paciente?.apellidos}</span>
          <span><strong>CI:</strong> ${paciente?.cedula}</span>
          <span><strong>Edad:</strong> ${paciente?.fecha_nacimiento ? calculateAge(paciente.fecha_nacimiento) : '-'} años</span>
          <span><strong>Tel:</strong> ${paciente?.telefono}</span>
        </div>

        <div class="section-title">Diagnóstico Presuntivo</div>
        <div class="diagnostico">${diagnosticoPresuntivo || 'No especificado'}</div>

        ${tipoOrden !== 'interconsulta' ? `
          <div class="section-title">${tipoOrden === 'laboratorio' ? 'Exámenes Solicitados' : 'Estudios'}</div>
          <ul class="examenes-list">
            ${examenesSeleccionados.map(e => `
              <li>
                <span class="cod">${e.codigo}</span>
                <span class="nom">${e.nombre}</span>
                ${e.indicaciones ? `<span class="ind">(${e.indicaciones})</span>` : ''}
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="section-title">Derivar a</div>
          <div class="especialidad">${especialidadDestino}</div>
          <div class="section-title">Motivo</div>
          <div class="motivo">${motivoSolicitud || 'No especificado'}</div>
        `}

        ${observaciones ? `<div class="observaciones"><strong>Indicaciones:</strong> ${observaciones}</div>` : ''}

        <div class="footer">
          <div class="firma">
            <div class="firma-linea"></div>
            <div class="firma-nombre">${medico.nombre}</div>
            <div class="firma-datos">${medico.registro} | ${medico.especialidad}</div>
          </div>
        </div>

        <div class="disclaimer">Documento válido sin firma. Paciente: ${paciente.identificacion}</div>
      </body>
      </html>
    `

    const ventanaImpresion = window.open('', '_blank')
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoOrden)
      ventanaImpresion.document.close()
      ventanaImpresion.print()
    }
  }

  // Guardar orden
  const handleGuardar = async () => {
    if (!paciente) return
    
    setIsLoading(true)
    try {
      const ordenData = {
        paciente_id: parseInt(id!),
        consulta_id: consultaId ? parseInt(consultaId) : null,
        tipo: tipoOrden,
        especialidad: especialidadDestino,
        notas: observaciones,
        examenes: examenesSeleccionados.map(e => ({
          codigo: e.codigo,
          nombre: e.nombre,
          categoria: e.categoria
        }))
      }
      
      await ordenesApi.create(ordenData)
      navigate(`/app/pacientes/${id}/expediente`)
    } catch (err: any) {
      setError(err.message || 'Error al guardar la orden')
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1 className="text-2xl font-bold">Nueva Orden Médica</h1>
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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setMostrarVistaPrevia(true)}
            disabled={examenesSeleccionados.length === 0 && tipoOrden !== 'interconsulta'}
          >
            <FileText className="mr-2 h-4 w-4" />
            Vista Previa
          </Button>
          <Button 
            onClick={handleImprimir}
            disabled={examenesSeleccionados.length === 0 && tipoOrden !== 'interconsulta'}
            className="bg-medical-500 hover:bg-medical-600"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / PDF
          </Button>
        </div>
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

      {/* Tipo de Orden */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de Orden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={tipoOrden === 'laboratorio' ? 'default' : 'outline'}
              className={`h-24 flex-col gap-2 ${tipoOrden === 'laboratorio' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
              onClick={() => { setTipoOrden('laboratorio'); setExamenesSeleccionados([]) }}
            >
              <TestTube className="h-6 w-6" />
              Laboratorio
            </Button>
            <Button
              variant={tipoOrden === 'imagenologia' ? 'default' : 'outline'}
              className={`h-24 flex-col gap-2 ${tipoOrden === 'imagenologia' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
              onClick={() => { setTipoOrden('imagenologia'); setExamenesSeleccionados([]) }}
            >
              <Scan className="h-6 w-6" />
              Imagenología
            </Button>
            <Button
              variant={tipoOrden === 'interconsulta' ? 'default' : 'outline'}
              className={`h-24 flex-col gap-2 ${tipoOrden === 'interconsulta' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
              onClick={() => { setTipoOrden('interconsulta'); setExamenesSeleccionados([]) }}
            >
              <Stethoscope className="h-6 w-6" />
              Interconsulta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnóstico y Motivo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnóstico Presuntivo</Label>
              <Textarea
                placeholder="Describa el diagnóstico presuntivo..."
                value={diagnosticoPresuntivo}
                onChange={(e) => setDiagnosticoPresuntivo(e.target.value)}
                rows={3}
              />
            </div>

            {tipoOrden === 'interconsulta' && (
              <div className="space-y-2">
                <Label>Especialidad Destino</Label>
                <Select value={especialidadDestino} onValueChange={setEspecialidadDestino}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoOrden === 'interconsulta' && (
              <div className="space-y-2">
                <Label>Motivo de Solicitud</Label>
                <Textarea
                  placeholder="Describa el motivo de la interconsulta..."
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <div className="flex gap-4">
                <Button
                  variant={prioridad === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPrioridad('normal')}
                >
                  Normal
                </Button>
                <Button
                  variant={prioridad === 'urgente' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setPrioridad('urgente')}
                >
                  Urgente
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                placeholder="Indicaciones adicionales, ayuno, etc."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selección de Exámenes/Estudios */}
        {tipoOrden !== 'interconsulta' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {tipoOrden === 'laboratorio' ? 'Exámenes de Laboratorio' : 'Estudios de Imagenología'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label>Buscar {tipoOrden === 'laboratorio' ? 'exámenes' : 'estudios'}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre o código..."
                    value={buscarExamen}
                    onChange={(e) => setBuscarExamen(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Resultados de búsqueda */}
                {buscarExamen && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {examenesFiltrados.slice(0, 6).map((ex) => (
                      <button
                        key={ex.codigo}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-3"
                        onClick={() => agregarExamen(ex)}
                      >
                        <Badge variant="outline" className="text-xs">{ex.codigo}</Badge>
                        <div>
                          <p className="text-sm">{ex.nombre}</p>
                          <p className="text-xs text-muted-foreground">{ex.categoria}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Exámenes seleccionados */}
              <div className="space-y-2">
                <Label>Seleccionados ({examenesSeleccionados.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {examenesSeleccionados.map((ex) => (
                    <div key={ex.codigo} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{ex.codigo}</Badge>
                          <span className="text-sm font-medium">{ex.nombre}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => eliminarExamen(ex.codigo)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Indicaciones específicas (opcional)"
                        value={ex.indicaciones || ''}
                        onChange={(e) => actualizarIndicaciones(ex.codigo, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                  {examenesSeleccionados.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay {tipoOrden === 'laboratorio' ? 'exámenes' : 'estudios'} seleccionados
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
          {isLoading ? 'Guardando...' : 'Guardar Orden'}
        </Button>
      </div>
    </div>
  )
}
