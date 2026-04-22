import { AlertTriangle, Clock, CreditCard, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Button } from '@/components/ui/button'

export function SubscriptionBanner() {
  const { subscription, isTrial, isGracePeriod, isExpired, isReadOnly, diasRestantes } = useSubscription()
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  if (!subscription || dismissed) return null

  // No mostrar banner si todo está bien
  if (subscription.estado === 'active' && diasRestantes > 7) return null

  let bgColor = ''
  let textColor = ''
  let icon = <Clock className="h-4 w-4" />
  let message = ''
  let showAction = true
  let canDismiss = true

  if (isExpired) {
    bgColor = 'bg-red-600'
    textColor = 'text-white'
    icon = <AlertTriangle className="h-4 w-4" />
    message = 'Tu suscripción ha expirado. Tu cuenta está en modo solo lectura.'
    canDismiss = false
  } else if (subscription.estado === 'suspended') {
    bgColor = 'bg-red-600'
    textColor = 'text-white'
    icon = <AlertTriangle className="h-4 w-4" />
    message = 'Tu cuenta ha sido suspendida. Contacta al soporte.'
    canDismiss = false
  } else if (isGracePeriod) {
    bgColor = 'bg-amber-500'
    textColor = 'text-white'
    icon = <AlertTriangle className="h-4 w-4" />
    message = `Período de gracia: te quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} antes de que tu cuenta pase a solo lectura.`
    canDismiss = false
  } else if (isTrial) {
    bgColor = 'bg-blue-600'
    textColor = 'text-white'
    icon = <Clock className="h-4 w-4" />
    message = `Prueba gratuita: te quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}.`
  } else if (subscription.estado === 'active' && diasRestantes <= 7) {
    bgColor = 'bg-amber-500'
    textColor = 'text-white'
    icon = <Clock className="h-4 w-4" />
    message = `Tu suscripción vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}.`
  } else {
    return null
  }

  return (
    <div className={`${bgColor} ${textColor} px-4 py-2.5 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {showAction && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs font-semibold"
            onClick={() => navigate(isTrial ? '/app/planes' : '/app/suscripcion')}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {isExpired || isGracePeriod ? 'Renovar ahora' : isTrial ? 'Ver planes' : 'Mi suscripción'}
          </Button>
        )}
        {canDismiss && (
          <button onClick={() => setDismissed(true)} className="hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
