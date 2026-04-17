import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { consultasApi } from '@/services/api'
import { formatDate } from '@/lib/utils'

interface ConsultorioConfig {
  nombre: string
  direccion: string
  telefono: string
}

export default function ImprimirConsulta() {
  const { id } = useParams()
  const [consulta, setConsulta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consultorio, setConsultorio] = useState<ConsultorioConfig>({
    nombre: 'Centro Médico Apure',
    direccion: 'Av. Bolívar Norte, San Fernando de Apure',
    telefono: 'Tel: +58 247-1234567'
  })

  // Cargar configuración del consultorio desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexamed_consultorio')
    if (saved) {
      const config = JSON.parse(saved)
      setConsultorio({
        nombre: config.nombre || 'Centro Médico Apure',
        direccion: config.direccion || 'Av. Bolívar Norte, San Fernando de Apure',
        telefono: config.telefono ? `Tel: ${config.telefono}` : 'Tel: +58 247-1234567'
      })
    }
  }, [])

  useEffect(() => {
    const loadConsulta = async () => {
      if (!id) {
        setError('Identificador de consulta no especificado')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await consultasApi.getById(parseInt(id))
        if (response.success && response.data) {
          setConsulta(response.data)
        } else {
          setError('Consulta no encontrada')
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la consulta')
      } finally {
        setLoading(false)
      }
    }
    loadConsulta()
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

  if (error || !consulta) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error || 'Consulta no encontrada'}</p>
      </div>
    )
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
      <div className="max-w-3xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center border-b-2 border-medical-500 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-medical-700">{consultorio.nombre}</h1>
          <p className="text-sm text-muted-foreground">{consultorio.direccion}</p>
          <p className="text-sm text-muted-foreground">{consultorio.telefono}</p>
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">Informe Médico</h2>
          <p className="text-sm text-muted-foreground mt-1">Consulta Médica</p>
        </div>

        {/* Fecha */}
        <div className="flex justify-end mb-4">
          <p className="text-sm">
            <strong>Fecha:</strong> {formatDate(consulta.fecha)}
          </p>
        </div>

        {/* Datos del paciente */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-medical-700">Datos del Paciente</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">{consulta.paciente_nombres} {consulta.paciente_apellidos}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cédula:</span>
              <p className="font-medium">{consulta.paciente_cedula}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha de Nacimiento:</span>
              <p className="font-medium">{consulta.fecha_nacimiento ? formatDate(consulta.fecha_nacimiento) : 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sexo:</span>
              <p className="font-medium capitalize">{consulta.sexo || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Datos del médico */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-medical-700">Médico Tratante</h3>
          <div className="text-sm">
            <p className="font-medium">{consulta.medico_nombre || 'No especificado'}</p>
          </div>
        </div>

        {/* Signos Vitales */}
        {(consulta.presion_sistolica || consulta.frecuencia_cardiaca || consulta.temperatura) && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3 text-medical-700">Signos Vitales</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {consulta.presion_sistolica && (
                <div>
                  <span className="text-muted-foreground">Presión Arterial:</span>
                  <p className="font-medium">{consulta.presion_sistolica}/{consulta.presion_diastolica} mmHg</p>
                </div>
              )}
              {consulta.frecuencia_cardiaca && (
                <div>
                  <span className="text-muted-foreground">Frec. Cardíaca:</span>
                  <p className="font-medium">{consulta.frecuencia_cardiaca} lpm</p>
                </div>
              )}
              {consulta.temperatura && (
                <div>
                  <span className="text-muted-foreground">Temperatura:</span>
                  <p className="font-medium">{consulta.temperatura} °C</p>
                </div>
              )}
              {consulta.frecuencia_respiratoria && (
                <div>
                  <span className="text-muted-foreground">Frec. Respiratoria:</span>
                  <p className="font-medium">{consulta.frecuencia_respiratoria} rpm</p>
                </div>
              )}
              {consulta.peso && (
                <div>
                  <span className="text-muted-foreground">Peso:</span>
                  <p className="font-medium">{consulta.peso} kg</p>
                </div>
              )}
              {consulta.talla && (
                <div>
                  <span className="text-muted-foreground">Talla:</span>
                  <p className="font-medium">{consulta.talla} m</p>
                </div>
              )}
              {consulta.imc && (
                <div>
                  <span className="text-muted-foreground">IMC:</span>
                  <p className="font-medium">{consulta.imc}</p>
                </div>
              )}
              {consulta.saturacion_oxigeno && (
                <div>
                  <span className="text-muted-foreground">Sat. O2:</span>
                  <p className="font-medium">{consulta.saturacion_oxigeno}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOAP */}
        <div className="space-y-4 mb-6">
          {consulta.subjetivo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 text-medical-700">Subjetivo (S)</h3>
              <p className="text-sm whitespace-pre-wrap">{consulta.subjetivo}</p>
            </div>
          )}
          
          {consulta.objetivo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 text-medical-700">Objetivo (O)</h3>
              <p className="text-sm whitespace-pre-wrap">{consulta.objetivo}</p>
            </div>
          )}
          
          {consulta.analisis && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 text-medical-700">Análisis (A)</h3>
              <p className="text-sm whitespace-pre-wrap">{consulta.analisis}</p>
            </div>
          )}
          
          {consulta.plan && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 text-medical-700">Plan (P)</h3>
              <p className="text-sm whitespace-pre-wrap">{consulta.plan}</p>
            </div>
          )}
        </div>

        {/* Diagnósticos */}
        {consulta.diagnosticos && consulta.diagnosticos.length > 0 && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3 text-medical-700">Diagnósticos</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">CIE-10</th>
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-left py-2">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {consulta.diagnosticos.map((diag: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 font-mono">{diag.codigo_cie10}</td>
                    <td className="py-2">{diag.descripcion}</td>
                    <td className="py-2 capitalize">{diag.tipo || 'Principal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Medicamentos */}
        {consulta.medicamentos && consulta.medicamentos.length > 0 && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3 text-medical-700">Medicamentos Recetados</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Medicamento</th>
                  <th className="text-left py-2">Dosis</th>
                  <th className="text-left py-2">Frecuencia</th>
                  <th className="text-left py-2">Duración</th>
                </tr>
              </thead>
              <tbody>
                {consulta.medicamentos.map((med: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2">{med.nombre}</td>
                    <td className="py-2">{med.dosis || '-'}</td>
                    <td className="py-2">{med.frecuencia || '-'}</td>
                    <td className="py-2">{med.duracion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Indicaciones */}
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Indicaciones:</h4>
              <ul className="text-sm space-y-1">
                {consulta.medicamentos.map((med: any, idx: number) => (
                  med.indicaciones && (
                    <li key={idx} className="text-muted-foreground">
                      • <strong>{med.nombre}:</strong> {med.indicaciones}
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Notas adicionales */}
        {consulta.notas_adicionales && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-medical-700">Notas Adicionales</h3>
            <p className="text-sm whitespace-pre-wrap">{consulta.notas_adicionales}</p>
          </div>
        )}

        {/* Próxima cita */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-medical-700">Próxima Cita</h3>
          <p className="text-sm">
            Se recomienda control en <strong>3 meses</strong> o antes si presenta síntomas.
          </p>
        </div>

        {/* Firma */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="border-t border-black w-48 mt-16"></div>
              <p className="text-sm mt-1">Firma del Médico</p>
              <p className="text-xs text-muted-foreground">{consulta.medico_nombre}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Consulta #{consulta.id}</p>
              <p>Generado el: {formatDate(consulta.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Este documento es un informe médico y no tiene validez legal.</p>
          <p>Para cualquier duda, contacte al centro médico.</p>
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
