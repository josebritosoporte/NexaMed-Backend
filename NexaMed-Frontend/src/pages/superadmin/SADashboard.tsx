import { useState, useEffect } from 'react'
import { Users, CreditCard, Receipt, AlertCircle, TrendingUp, Building2 } from 'lucide-react'
import { superadminApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SADashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    superadminApi.getDashboard().then(res => {
      if (res.success) setData(res.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" /></div>

  if (!data) return <p className="text-center text-muted-foreground">Error al cargar datos</p>

  const stats = [
    { label: 'Total consultorios', value: data.total_consultorios || 0, icon: Building2, color: 'text-blue-600 bg-blue-100' },
    { label: 'Suscripciones activas', value: data.activas || 0, icon: CreditCard, color: 'text-green-600 bg-green-100' },
    { label: 'En trial', value: data.trial || 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { label: 'Vencidas', value: data.vencidas || 0, icon: AlertCircle, color: 'text-red-600 bg-red-100' },
    { label: 'Pagos pendientes', value: data.pagos_pendientes || 0, icon: Receipt, color: 'text-amber-600 bg-amber-100' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
