/**
 * DaliaMed - Servicio API para conexión con backend PHP
 */

// URL del backend - usa variable de entorno o valor por defecto (local)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/DaliaMed/api.php'

// Tipos
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'assistant'
  consultorio_id: number
  avatar?: string
  especialidad?: string
  registro?: string
}

export interface SubscriptionInfo {
  id: number
  plan_nombre: string
  plan_slug: string
  estado: 'trial' | 'active' | 'grace_period' | 'expired' | 'suspended' | 'cancelled'
  periodo: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  fecha_fin: string
  trial_ends_at: string | null
  plan_precio: number | null
  max_usuarios: number
  max_pacientes: number
  dias_restantes: number
  read_only: boolean
  features: {
    asistente: boolean
    adjuntos: boolean
    branding: string
    exportacion: string
    agenda_compartida: boolean
    permisos_rol: string
    reportes_avanzados: boolean
    plantillas: boolean
    respaldo: boolean
  }
}

export interface PlanPrecio {
  id: number
  plan_id: number
  periodo: string
  dias: number
  precio: number
  precio_bs?: number
}

export interface PlanInfo {
  id: number
  nombre: string
  slug: string
  descripcion: string
  max_usuarios: number
  max_pacientes: number
  max_storage_gb: number
  precios: PlanPrecio[]
}

// Función auxiliar para hacer peticiones
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  // Construir URL con query params
  let url = `${API_BASE_URL}?endpoint=${endpoint}`
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url += `&${key}=${encodeURIComponent(value)}`
      }
    })
  }

  // Configuración por defecto
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Agregar token de autenticación si existe
  const token = localStorage.getItem('daliamed_token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Error en la petición')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Servicio de Autenticación
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetchApi<{ user: User; token: string; subscription: SubscriptionInfo | null }>(
      'auth',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      { action: 'login' }
    )
    
    if (response.success && response.data?.token) {
      localStorage.setItem('daliamed_token', response.data.token)
      localStorage.setItem('daliamed_user', JSON.stringify(response.data.user))
      if (response.data.subscription) {
        localStorage.setItem('daliamed_subscription', JSON.stringify(response.data.subscription))
      }
    }
    
    return response
  },

  logout: () => {
    localStorage.removeItem('daliamed_token')
    localStorage.removeItem('daliamed_user')
    localStorage.removeItem('daliamed_subscription')
  },

  getCurrentUser: async () => {
    return fetchApi<User>('auth', {}, { action: 'me' })
  },

  register: async (data: { nombre: string; email: string; password: string; consultorio_nombre: string; especialidad?: string }) => {
    const response = await fetchApi<{ user: User; token: string; subscription: SubscriptionInfo | null }>(
      'auth',
      { method: 'POST', body: JSON.stringify(data) },
      { action: 'register' }
    )
    if (response.success && response.data?.token) {
      localStorage.setItem('daliamed_token', response.data.token)
      localStorage.setItem('daliamed_user', JSON.stringify(response.data.user))
      if (response.data.subscription) {
        localStorage.setItem('daliamed_subscription', JSON.stringify(response.data.subscription))
      }
    }
    return response
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('daliamed_token')
  },

  getToken: () => {
    return localStorage.getItem('daliamed_token')
  },
}

// Servicio de Pacientes
export const pacientesApi = {
  getAll: async (page = 1, limit = 10, search = '') => {
    return fetchApi<any[]>('pacientes', {}, { page, limit, search })
  },

  getById: async (id: number) => {
    return fetchApi<any>('pacientes', {}, { id })
  },

  create: async (paciente: any) => {
    return fetchApi('pacientes', {
      method: 'POST',
      body: JSON.stringify(paciente),
    })
  },

  update: async (id: number, paciente: any) => {
    return fetchApi('pacientes', {
      method: 'PUT',
      body: JSON.stringify(paciente),
    }, { id })
  },

  delete: async (id: number) => {
    return fetchApi('pacientes', {
      method: 'DELETE',
    }, { id })
  },
}

// Servicio de Consultas
export const consultasApi = {
  getAll: async (page = 1, limit = 10, filters?: any) => {
    const params: any = { page, limit, ...filters }
    return fetchApi<any[]>('consultas', {}, params)
  },

  getById: async (id: number) => {
    return fetchApi<any>('consultas', {}, { id })
  },

  create: async (consulta: any) => {
    return fetchApi<{id: number}>('consultas', {
      method: 'POST',
      body: JSON.stringify(consulta),
    })
  },
}

// Servicio de Citas
export const citasApi = {
  getByDateRange: async (fechaInicio: string, fechaFin: string) => {
    return fetchApi<any[]>('citas', {}, { fecha_inicio: fechaInicio, fecha_fin: fechaFin })
  },

  create: async (cita: any) => {
    return fetchApi('citas', {
      method: 'POST',
      body: JSON.stringify(cita),
    })
  },

  update: async (id: number, cita: any) => {
    return fetchApi('citas', {
      method: 'PUT',
      body: JSON.stringify(cita),
    }, { id })
  },

  updateEstado: async (id: number, estado: string) => {
    return fetchApi('citas', {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }, { id, action: 'estado' })
  },

  delete: async (id: number) => {
    return fetchApi('citas', {
      method: 'DELETE',
    }, { id })
  },
}

// Servicio de Órdenes
export const ordenesApi = {
  getAll: async (page = 1, limit = 10, filters?: any) => {
    const params: any = { page, limit, ...filters }
    return fetchApi<any[]>('ordenes', {}, params)
  },

  getById: async (id: number) => {
    return fetchApi<any>('ordenes', {}, { id })
  },

  create: async (orden: any) => {
    return fetchApi<{id: number}>('ordenes', {
      method: 'POST',
      body: JSON.stringify(orden),
    })
  },

  update: async (id: number, data: any) => {
    return fetchApi('ordenes', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { id })
  },

  delete: async (id: number) => {
    return fetchApi('ordenes', {
      method: 'DELETE',
    }, { id })
  },
}

// Servicio de Dashboard
export const dashboardApi = {
  getStats: async () => {
    return fetchApi('dashboard', {}, { action: 'stats' })
  },

  getCitasHoy: async () => {
    return fetchApi('dashboard', {}, { action: 'citas-hoy' })
  },

  getActividad: async () => {
    return fetchApi('dashboard', {}, { action: 'actividad' })
  },
}

export const usuariosApi = {
  getProfile: async () => {
    return fetchApi('usuarios', {}, { action: 'profile' })
  },

  updateProfile: async (data: any) => {
    return fetchApi('usuarios', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  changePassword: async (passwordActual: string, passwordNueva: string) => {
    return fetchApi('usuarios', {
      method: 'PUT',
      body: JSON.stringify({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      }),
    }, { action: 'password' })
  },
}

export const adminUsuariosApi = {
  getAll: async () => {
    return fetchApi<any[]>('admin_usuarios')
  },

  getById: async (id: number) => {
    return fetchApi(`admin_usuarios`, {}, { id })
  },

  create: async (usuario: any) => {
    return fetchApi('admin_usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    })
  },

  update: async (id: number, usuario: any) => {
    return fetchApi('admin_usuarios', {
      method: 'PUT',
      body: JSON.stringify(usuario),
    }, { id })
  },

  delete: async (id: number) => {
    return fetchApi('admin_usuarios', { method: 'DELETE' }, { id })
  },
}

// Servicio de Planes (público)
export const notificacionesApi = {
  getAll: async (limit = 20) => {
    return fetchApi<any[]>('notificaciones', {}, { limit })
  },

  getCount: async () => {
    return fetchApi<{ count: number }>('notificaciones', {}, { action: 'count' })
  },

  marcarLeida: async (id: number) => {
    return fetchApi('notificaciones', { method: 'PUT' }, { id })
  },

  marcarTodasLeidas: async () => {
    return fetchApi('notificaciones', { method: 'PUT' }, { action: 'leer-todas' })
  },
}

// Servicio de Planes (público)
export const planesApi = {
  getAll: async () => {
    return fetchApi<{ planes: PlanInfo[]; tasa_bs: number | null; tasa_fecha: string | null }>('planes')
  },

  getById: async (id: number) => {
    return fetchApi<PlanInfo>('planes', {}, { id })
  },

  getTasa: async () => {
    return fetchApi<{ tasa_bs: number | null; fecha: string | null }>('planes', {}, { action: 'tasa' })
  },
}

// Servicio de Suscripciones (cliente autenticado)
export const suscripcionesApi = {
  getMiSuscripcion: async () => {
    return fetchApi<{ suscripcion: SubscriptionInfo; planes: PlanInfo[]; tasa_bs: number | null; tasa_fecha: string | null }>(
      'suscripciones', {}, { action: 'mi-suscripcion' }
    )
  },

  getMisPagos: async () => {
    return fetchApi<any[]>('suscripciones', {}, { action: 'pagos' })
  },

  enviarPago: async (pago: { plan_id: number; periodo: string; metodo_pago: string; referencia: string; fecha_pago: string; comprobante_nota?: string; comprobante_file?: File }) => {
    const { comprobante_file, ...fields } = pago
    
    if (comprobante_file) {
      // Enviar como FormData cuando hay archivo
      const formData = new FormData()
      Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined) formData.append(key, String(val))
      })
      formData.append('comprobante', comprobante_file)

      const token = localStorage.getItem('daliamed_token')
      const url = `${API_BASE_URL}?endpoint=suscripciones&action=pago`
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al enviar pago')
      return data as ApiResponse<any>
    }

    // Sin archivo: enviar JSON normal
    return fetchApi('suscripciones', {
      method: 'POST',
      body: JSON.stringify(fields),
    }, { action: 'pago' })
  },
}

// Servicio SuperAdmin
const SA_API_URL = import.meta.env.VITE_API_URL || 'http://localhost/DaliaMed/api.php'

async function fetchSuperAdmin<T>(
  action: string,
  options: RequestInit = {},
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  let url = `${SA_API_URL}?endpoint=superadmin&action=${action}`
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url += `&${key}=${encodeURIComponent(value)}`
      }
    })
  }
  const config: RequestInit = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }
  const token = localStorage.getItem('daliamed_sa_token')
  if (token) {
    config.headers = { ...config.headers, 'Authorization': `Bearer ${token}` }
  }
  const response = await fetch(url, config)
  const data = await response.json()
  if (!data.success) throw new Error(data.message || 'Error en la petición')
  return data
}

export const superadminApi = {
  login: async (email: string, password: string) => {
    const response = await fetchSuperAdmin<{ user: any; token: string }>('login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (response.success && response.data?.token) {
      localStorage.setItem('daliamed_sa_token', response.data.token)
      localStorage.setItem('daliamed_sa_user', JSON.stringify(response.data.user))
    }
    return response
  },

  logout: () => {
    localStorage.removeItem('daliamed_sa_token')
    localStorage.removeItem('daliamed_sa_user')
  },

  getMe: async () => fetchSuperAdmin<any>('me'),
  getDashboard: async () => fetchSuperAdmin<any>('dashboard'),
  getSuscripciones: async (estado?: string, search?: string) => {
    const params: any = {}
    if (estado) params.estado = estado
    if (search) params.search = search
    return fetchSuperAdmin<any[]>('suscripciones', {}, params)
  },
  modificarSuscripcion: async (id: number, data: any) => {
    return fetchSuperAdmin('suscripcion', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { id })
  },
  getPagos: async (estado?: string) => {
    const params: any = {}
    if (estado) params.estado = estado
    return fetchSuperAdmin<any[]>('pagos', {}, params)
  },
  getPagosPendientes: async () => fetchSuperAdmin<any[]>('pagos-pendientes'),
  aprobarPago: async (id: number, notas?: string) => {
    return fetchSuperAdmin('pago-aprobar', {
      method: 'PUT',
      body: JSON.stringify({ notas }),
    }, { id })
  },
  rechazarPago: async (id: number, notas: string) => {
    return fetchSuperAdmin('pago-rechazar', {
      method: 'PUT',
      body: JSON.stringify({ notas }),
    }, { id })
  },
  getTasa: async () => fetchSuperAdmin<any>('tasa'),
  getTasasHistorial: async (limit = 30) => fetchSuperAdmin<any[]>('tasas-historial', {}, { limit }),
  registrarTasa: async (tasa_bs: number, fecha?: string) => {
    return fetchSuperAdmin('tasa', {
      method: 'POST',
      body: JSON.stringify({ tasa_bs, fecha }),
    })
  },
  getConsultorios: async () => fetchSuperAdmin<any[]>('consultorios'),
  crearConsultorio: async (data: any) => {
    return fetchSuperAdmin('consultorio', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export default {
  auth: authApi,
  pacientes: pacientesApi,
  consultas: consultasApi,
  citas: citasApi,
  dashboard: dashboardApi,
  usuarios: usuariosApi,
  adminUsuarios: adminUsuariosApi,
  notificaciones: notificacionesApi,
  planes: planesApi,
  suscripciones: suscripcionesApi,
  superadmin: superadminApi,
}
