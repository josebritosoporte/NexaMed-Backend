/**
 * NexaMed - Servicio API para conexión con backend PHP
 */

// URL del backend - usa variable de entorno o valor por defecto (local)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/NexaMed/api.php'

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
  const token = localStorage.getItem('nexamed_token')
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
    const response = await fetchApi<{ user: User; token: string }>(
      'auth',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      { action: 'login' }
    )
    
    if (response.success && response.data?.token) {
      localStorage.setItem('nexamed_token', response.data.token)
      localStorage.setItem('nexamed_user', JSON.stringify(response.data.user))
    }
    
    return response
  },

  logout: () => {
    localStorage.removeItem('nexamed_token')
    localStorage.removeItem('nexamed_user')
  },

  getCurrentUser: async () => {
    return fetchApi<User>('auth', {}, { action: 'me' })
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('nexamed_token')
  },

  getToken: () => {
    return localStorage.getItem('nexamed_token')
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
    return fetchApi('consultas', {
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
    return fetchApi('ordenes', {
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

export default {
  auth: authApi,
  pacientes: pacientesApi,
  consultas: consultasApi,
  citas: citasApi,
  dashboard: dashboardApi,
  usuarios: usuariosApi,
  adminUsuarios: adminUsuariosApi,
}
