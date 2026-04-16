export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'assistant'
  avatar?: string
  consultorioId?: string
}

export interface Consultorio {
  id: string
  name: string
  address: string
  phone: string
  email: string
  plan: 'individual' | 'consultorio' | 'premium'
  maxUsers: number
  storageLimit: number
}

export interface Paciente {
  id: string
  nombre: string
  apellido: string
  identificacion: string
  fechaNacimiento: string
  sexo: 'masculino' | 'femenino' | 'otro'
  telefono: string
  email: string
  direccion: string
  contactoEmergencia: {
    nombre: string
    telefono: string
    relacion: string
  }
  alergias: string[]
  antecedentes: string[]
  medicamentosActuales: string[]
  createdAt: string
  updatedAt: string
}

export interface Consulta {
  id: string
  pacienteId: string
  profesionalId: string
  fecha: string
  motivo: string
  subjetivo: string
  objetivo: string
  evaluacion: string
  plan: string
  diagnostico: string
  indicaciones: string
  signosVitales?: SignosVitales
  proximaCita?: string
  createdAt: string
}

export interface SignosVitales {
  presionArterial: string
  frecuenciaCardiaca: number
  frecuenciaRespiratoria: number
  temperatura: number
  peso: number
  talla: number
  imc?: number
  saturacionOxigeno?: number
}

export interface OrdenMedica {
  id: string
  pacienteId: string
  consultaId: string
  tipo: 'laboratorio' | 'imagenologia' | 'interconsulta' | 'otro'
  diagnosticoPresuntivo: string
  examenes: string[]
  notas: string
  estado: 'pendiente' | 'completada' | 'cancelada'
  pdfUrl?: string
  createdAt: string
}

export interface Archivo {
  id: string
  pacienteId: string
  tipo: 'laboratorio' | 'imagenologia' | 'ecografia' | 'receta' | 'informe' | 'otro'
  etiqueta: string
  nombre: string
  url: string
  mimeType: string
  size: number
  uploadedBy: string
  createdAt: string
}

export interface Cita {
  id: string
  pacienteId: string
  profesionalId: string
  fechaHora: string
  duracion: number
  estado: 'programada' | 'atendida' | 'cancelada' | 'ausente'
  motivo: string
  notas?: string
  createdAt: string
}

export interface Suscripcion {
  id: string
  consultorioId: string
  plan: 'individual' | 'consultorio' | 'premium'
  estado: 'activa' | 'suspendida' | 'cancelada'
  fechaInicio: string
  fechaFin: string
  limiteUsuarios: number
  limiteAlmacenamiento: number
  precio: number
}

export interface DashboardStats {
  citasHoy: number
  pacientesAtendidosHoy: number
  pacientesTotales: number
  consultasMes: number
  pendientesSeguimiento: number
}
