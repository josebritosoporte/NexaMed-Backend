import { useState } from 'react'
import {
  TestTube,
  Scan,
  Stethoscope,
  Search,
  X,
  Printer,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

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
  'Cardiología', 'Dermatología', 'Endocrinología', 'Gastroenterología',
  'Ginecología', 'Hematología', 'Medicina Interna', 'Nefrología',
  'Neumología', 'Neurología', 'Oftalmología', 'Oncología',
  'Otorrinolaringología', 'Psiquiatría', 'Traumatología', 'Urología'
]

type TipoOrden = 'laboratorio' | 'imagenologia' | 'interconsulta'

interface ExamenSeleccionado {
  codigo: string
  nombre: string
  categoria: string
  indicaciones?: string
}

interface OrdenRapidaModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: any
  onGuardarOrden: (ordenData: any) => Promise<number | null>
}

export default function OrdenRapidaModal({ isOpen, onClose, paciente, onGuardarOrden }: OrdenRapidaModalProps) {
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>('laboratorio')
  const [observaciones, setObservaciones] = useState('')
  const [prioridad, setPrioridad] = useState<'normal' | 'urgente'>('normal')
  const [especialidadDestino, setEspecialidadDestino] = useState('')
  const [examenesSeleccionados, setExamenesSeleccionados] = useState<ExamenSeleccionado[]>([])
  const [buscarExamen, setBuscarExamen] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lista de exámenes según tipo
  const listaExamenes = tipoOrden === 'laboratorio' ? examenesLaboratorio :
                        tipoOrden === 'imagenologia' ? estudiosImagenologia : []

  // Filtrar exámenes
  const examenesFiltrados = listaExamenes.filter(e =>
    e.nombre.toLowerCase().includes(buscarExamen.toLowerCase()) ||
    e.codigo.toLowerCase().includes(buscarExamen.toLowerCase()) ||
    e.categoria.toLowerCase().includes(buscarExamen.toLowerCase())
  )

  const agregarExamen = (examen: { codigo: string; nombre: string; categoria: string }) => {
    if (!examenesSeleccionados.some(e => e.codigo === examen.codigo)) {
      setExamenesSeleccionados([...examenesSeleccionados, { ...examen, indicaciones: '' }])
    }
    setBuscarExamen('')
  }

  const eliminarExamen = (codigo: string) => {
    setExamenesSeleccionados(examenesSeleccionados.filter(e => e.codigo !== codigo))
  }

  const actualizarIndicaciones = (codigo: string, indicaciones: string) => {
    setExamenesSeleccionados(examenesSeleccionados.map(e =>
      e.codigo === codigo ? { ...e, indicaciones } : e
    ))
  }

  const resetForm = () => {
    setTipoOrden('laboratorio')
    setObservaciones('')
    setPrioridad('normal')
    setEspecialidadDestino('')
    setExamenesSeleccionados([])
    setBuscarExamen('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleGuardarEImprimir = async () => {
    // Validar
    if (tipoOrden !== 'interconsulta' && examenesSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un examen o estudio')
      return
    }
    if (tipoOrden === 'interconsulta' && !especialidadDestino) {
      setError('Debe seleccionar la especialidad destino')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const ordenData = {
        tipo: tipoOrden,
        especialidad: especialidadDestino,
        notas: observaciones,
        prioridad,
        examenes: examenesSeleccionados.map(e => ({
          codigo: e.codigo,
          nombre: e.nombre,
          categoria: e.categoria
        }))
      }

      const ordenId = await onGuardarOrden(ordenData)

      if (ordenId) {
        // Abrir ventana de impresión
        const ventana = window.open(
          `/imprimir/orden/${ordenId}`,
          '_blank',
          'width=800,height=600,noopener,noreferrer'
        )
        if (ventana) ventana.focus()
      }

      resetForm()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la orden')
    } finally {
      setIsLoading(false)
    }
  }

  const puedeGuardar = tipoOrden === 'interconsulta' 
    ? !!especialidadDestino 
    : examenesSeleccionados.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-medical-500" />
            Nueva Orden Médica
          </DialogTitle>
          <DialogDescription>
            Orden para {paciente?.nombres} {paciente?.apellidos} — Cédula: {paciente?.cedula}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Tipo de Orden */}
          <div>
            <Label className="mb-2 block font-semibold">Tipo de Orden</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={tipoOrden === 'laboratorio' ? 'default' : 'outline'}
                className={`h-16 flex-col gap-1 ${tipoOrden === 'laboratorio' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
                onClick={() => { setTipoOrden('laboratorio'); setExamenesSeleccionados([]) }}
              >
                <TestTube className="h-5 w-5" />
                <span className="text-xs">Laboratorio</span>
              </Button>
              <Button
                type="button"
                variant={tipoOrden === 'imagenologia' ? 'default' : 'outline'}
                className={`h-16 flex-col gap-1 ${tipoOrden === 'imagenologia' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
                onClick={() => { setTipoOrden('imagenologia'); setExamenesSeleccionados([]) }}
              >
                <Scan className="h-5 w-5" />
                <span className="text-xs">Imagenología</span>
              </Button>
              <Button
                type="button"
                variant={tipoOrden === 'interconsulta' ? 'default' : 'outline'}
                className={`h-16 flex-col gap-1 ${tipoOrden === 'interconsulta' ? 'bg-medical-500 hover:bg-medical-600' : ''}`}
                onClick={() => { setTipoOrden('interconsulta'); setExamenesSeleccionados([]) }}
              >
                <Stethoscope className="h-5 w-5" />
                <span className="text-xs">Interconsulta</span>
              </Button>
            </div>
          </div>

          {/* Interconsulta: Especialidad */}
          {tipoOrden === 'interconsulta' && (
            <div className="space-y-2">
              <Label>Especialidad Destino</Label>
              <Select value={especialidadDestino} onValueChange={setEspecialidadDestino}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad..." />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map(esp => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selección de Exámenes */}
          {tipoOrden !== 'interconsulta' && (
            <div className="space-y-3">
              <Label className="font-semibold">
                {tipoOrden === 'laboratorio' ? 'Exámenes de Laboratorio' : 'Estudios de Imagenología'}
              </Label>

              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código o categoría..."
                  value={buscarExamen}
                  onChange={(e) => setBuscarExamen(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Resultados de búsqueda */}
              {buscarExamen && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
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
                  {examenesFiltrados.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">Sin resultados</p>
                  )}
                </div>
              )}

              {/* Exámenes seleccionados */}
              <div className="space-y-2">
                <Label className="text-sm">Seleccionados ({examenesSeleccionados.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {examenesSeleccionados.map((ex) => (
                    <div key={ex.codigo} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{ex.codigo}</Badge>
                          <span className="text-sm font-medium">{ex.nombre}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => eliminarExamen(ex.codigo)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Indicaciones específicas (opcional)"
                        value={ex.indicaciones || ''}
                        onChange={(e) => actualizarIndicaciones(ex.codigo, e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  ))}
                  {examenesSeleccionados.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">
                      No hay {tipoOrden === 'laboratorio' ? 'exámenes' : 'estudios'} seleccionados. Use el buscador de arriba.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prioridad y Observaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as 'normal' | 'urgente')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                placeholder="Indicaciones generales para la orden..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEImprimir}
            disabled={!puedeGuardar || isLoading}
            className="bg-medical-500 hover:bg-medical-600 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                Guardar e Imprimir Orden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
