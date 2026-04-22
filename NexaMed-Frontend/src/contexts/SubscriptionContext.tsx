import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { suscripcionesApi, type SubscriptionInfo, type PlanInfo } from '@/services/api'
import { useAuth } from './AuthContext'

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null
  planes: PlanInfo[]
  tasaBs: number | null
  tasaFecha: string | null
  isLoading: boolean
  isReadOnly: boolean
  isExpired: boolean
  isTrial: boolean
  isGracePeriod: boolean
  diasRestantes: number
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [planes, setPlanes] = useState<PlanInfo[]>([])
  const [tasaBs, setTasaBs] = useState<number | null>(null)
  const [tasaFecha, setTasaFecha] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null)
      setPlanes([])
      setTasaBs(null)
      setTasaFecha(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await suscripcionesApi.getMiSuscripcion()
      if (response.success && response.data) {
        setSubscription(response.data.suscripcion)
        setPlanes(response.data.planes || [])
        setTasaBs(response.data.tasa_bs ?? null)
        setTasaFecha(response.data.tasa_fecha ?? null)
        localStorage.setItem('daliamed_subscription', JSON.stringify(response.data.suscripcion))
      }
    } catch (error) {
      console.error('Error al cargar suscripción:', error)
      // Intentar cargar desde localStorage como fallback
      const stored = localStorage.getItem('daliamed_subscription')
      if (stored) {
        try {
          setSubscription(JSON.parse(stored))
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      // Primero cargar de localStorage para respuesta rápida
      const stored = localStorage.getItem('daliamed_subscription')
      if (stored) {
        try {
          setSubscription(JSON.parse(stored))
        } catch {
          // ignore
        }
      }
      // Luego actualizar desde el servidor
      refresh()
    } else {
      setSubscription(null)
      setPlanes([])
      setIsLoading(false)
    }
  }, [isAuthenticated, refresh])

  const isReadOnly = subscription?.read_only ?? false
  const isExpired = subscription?.estado === 'expired'
  const isTrial = subscription?.estado === 'trial'
  const isGracePeriod = subscription?.estado === 'grace_period'
  const diasRestantes = subscription?.dias_restantes ?? 0

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        planes,
        tasaBs,
        tasaFecha,
        isLoading,
        isReadOnly,
        isExpired,
        isTrial,
        isGracePeriod,
        diasRestantes,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription debe ser usado dentro de un SubscriptionProvider')
  }
  return context
}
