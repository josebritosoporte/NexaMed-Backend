import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type User } from '@/services/api'

export type { User }

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar sesión al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('daliamed_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('daliamed_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ email, password })
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      }
      
      return { success: false, error: 'Error al iniciar sesión' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Correo electrónico o contraseña incorrectos' }
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    // Redirigir a la landing page después de cerrar sesión
    window.location.href = '/'
  }

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
