import { useState, useEffect } from 'react'
import { Bell, Search, User, LogOut, Settings, Info, AlertTriangle, AlertCircle, CheckCircle2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { notificacionesApi } from '@/services/api'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const [notifs, setNotifs] = useState<any[]>([])
  const [notifsOpen, setNotifsOpen] = useState(false)

  useEffect(() => {
    notificacionesApi.getCount().then(res => {
      if (res.success && res.data) setNotifCount(res.data.count)
    }).catch(() => {})
    // Poll every 60s
    const interval = setInterval(() => {
      notificacionesApi.getCount().then(res => {
        if (res.success && res.data) setNotifCount(res.data.count)
      }).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifs = async () => {
    try {
      const res = await notificacionesApi.getAll(10)
      if (res.success && res.data) setNotifs(res.data)
    } catch { /* ignore */ }
  }

  const handleOpenNotifs = () => {
    if (!notifsOpen) loadNotifs()
    setNotifsOpen(!notifsOpen)
  }

  const handleMarkAllRead = async () => {
    await notificacionesApi.marcarTodasLeidas()
    setNotifCount(0)
    setNotifs(prev => prev.map(n => ({ ...n, leida: 1 })))
  }

  const handleNotifClick = async (notif: any) => {
    if (!notif.leida) {
      await notificacionesApi.marcarLeida(notif.id)
      setNotifCount(prev => Math.max(0, prev - 1))
    }
    if (notif.link) navigate(notif.link)
    setNotifsOpen(false)
  }

  const notifIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const handleLogout = () => {
    logout()
    // La redirección ahora se maneja en AuthContext
  }

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-64 pl-9 bg-muted border-0"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu open={notifsOpen} onOpenChange={setNotifsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" onClick={handleOpenNotifs}>
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {notifCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-medical-600 hover:underline flex items-center gap-1">
                    <Check className="h-3 w-3" /> Marcar todas
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifs.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">Sin notificaciones</div>
              ) : (
                notifs.slice(0, 8).map(notif => (
                  <DropdownMenuItem key={notif.id} className="cursor-pointer py-2" onClick={() => handleNotifClick(notif)}>
                    <div className="flex gap-2 w-full">
                      <div className="mt-0.5">{notifIcon(notif.tipo)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.leida ? 'text-muted-foreground' : 'font-medium'}`}>{notif.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.mensaje}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-medical-100 text-medical-700">
                    {user ? getInitials(user.name) : 'DR'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  <p className="text-xs text-medical-600 capitalize">
                    {user?.role === 'doctor' ? 'Médico' : 
                     user?.role === 'assistant' ? 'Asistente' : 
                     user?.role === 'admin' ? 'Administrador' : user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/configuracion')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/configuracion')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
