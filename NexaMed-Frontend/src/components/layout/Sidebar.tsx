import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Stethoscope,
  ClipboardList,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Shield,
  Flower2,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Escritorio' },
  { path: '/app/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/app/consultas', icon: Stethoscope, label: 'Consultas' },
  { path: '/app/ordenes', icon: ClipboardList, label: 'Órdenes' },
  { path: '/app/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/app/configuracion', icon: Settings, label: 'Configuración' },
  { path: '/app/suscripcion', icon: CreditCard, label: 'Mi Suscripción' },
  { path: '/app/usuarios', icon: Shield, label: 'Usuarios', adminOnly: true },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuth()

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
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 shadow-lg">
              <Flower2 className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-foreground">
                DaliaMed
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              // Filtrar items solo para admin
              if (item.adminOnly && user?.role !== 'admin') {
                return null
              }
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-medical-100 text-medical-700 font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="h-9 w-9 rounded-full bg-medical-100 flex items-center justify-center">
              <span className="text-sm font-medium text-medical-700">
                {user ? getInitials(user.name) : 'DR'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user?.role === 'doctor' ? 'Médico' : 
                   user?.role === 'assistant' ? 'Asistente' : 
                   user?.role === 'admin' ? 'Administrador' : user?.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
