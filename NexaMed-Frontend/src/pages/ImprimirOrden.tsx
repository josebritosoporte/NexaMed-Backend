import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordenesApi } from '@/services/api'
import { formatDate } from '@/lib/utils'

export default function ImprimirOrden() {
  const { id } = useParams()
  const [orden, setOrden] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrden = async () => {
      if (!id) {
        setError('Identificador de orden no especificado')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await ordenesApi.getById(parseInt(id))
        if (response.success && response.data) {
          setOrden(response.data)
        } else {
          setError('Orden no encontrada')
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la orden')
      } finally {
        setLoading(false)
      }
    }
    loadOrden()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medical-500" />
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error || 'Orden no encontrada'}</p>
      </div>
    )
  }

  const tipoOrdenTexto = {
    laboratorio: 'Laboratorio',
    imagenologia: 'Imagenología',
    interconsulta: 'Interconsulta'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Botón de imprimir - solo visible en pantalla */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Contenido del documento */}
      <div className="max-w-2xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center border-b-2 border-medical-500 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-medical-700">Centro Médico Las Américas</h1>
          <p className="text-sm text-muted-foreground">Av. Amazonas 1234, Quito</p>
          <p className="text-sm text-muted-foreground">Tel: +593 2-222-1234</p>
        </div>

        {/* Título y número de orden */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">
            Orden de {tipoOrdenTexto[orden.tipo as keyof typeof tipoOrdenTexto] || orden.tipo}
          </h2>
          <p className="text-lg font-mono mt-2">{orden.numero_orden}</p>
        </div>

        {/* Fecha */}
        <div className="flex justify-end mb-4">
          <p className="text-sm">
            <strong>Fecha:</strong> {formatDate(orden.fecha)}
          </p>
        </div>

        {/* Datos del paciente */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-medical-700">Datos del Paciente</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">{orden.paciente_nombres} {orden.paciente_apellidos}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cédula:</span>
              <p className="font-medium">{orden.paciente_cedula}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha de Nacimiento:</span>
              <p className="font-medium">{orden.fecha_nacimiento ? formatDate(orden.fecha_nacimiento) : 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sexo:</span>
              <p className="font-medium capitalize">{orden.sexo || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Datos del médico */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-medical-700">Médico Solicitante</h3>
          <div className="text-sm">
            <p className="font-medium">{orden.medico_nombre || 'No especificado'}</p>
            {orden.medico_especialidad && (
              <p className="text-muted-foreground">{orden.medico_especialidad}</p>
            )}
            {orden.medico_registro && (
              <p className="text-muted-foreground">Registro: {orden.medico_registro}</p>
            )}
          </div>
        </div>

        {/* Especialidad destino (solo para interconsulta) */}
        {orden.tipo === 'interconsulta' && orden.especialidad && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-medical-700">Especialidad Destino</h3>
            <p className="text-sm">{orden.especialidad}</p>
          </div>
        )}

        {/* Exámenes solicitados */}
        {orden.examenes && orden.examenes.length > 0 && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3 text-medical-700">Exámenes Solicitados</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Código</th>
                  <th className="text-left py-2">Examen</th>
                  <th className="text-left py-2">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {orden.examenes.map((examen: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 font-mono">{examen.codigo}</td>
                    <td className="py-2">{examen.nombre}</td>
                    <td className="py-2 text-muted-foreground">{examen.categoria || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notas */}
        {orden.notas && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-medical-700">Notas / Indicaciones</h3>
            <p className="text-sm whitespace-pre-wrap">{orden.notas}</p>
          </div>
        )}

        {/* Información de la consulta vinculada */}
        {orden.consulta_fecha && (
          <div className="text-sm text-muted-foreground mb-6">
            <p>Orden generada en consulta del {formatDate(orden.consulta_fecha)}</p>
            {orden.consulta_motivo && <p>Motivo: {orden.consulta_motivo}</p>}
          </div>
        )}

        {/* Firma */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="border-t border-black w-48 mt-16"></div>
              <p className="text-sm mt-1">Firma del Médico</p>
              <p className="text-xs text-muted-foreground">{orden.medico_nombre}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Estado: <span className="capitalize font-medium">{orden.estado}</span></p>
              <p>Generado el: {formatDate(orden.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Este documento es válido por 30 días a partir de la fecha de emisión.</p>
          <p>Para resultados, presentar esta orden en el laboratorio.</p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
