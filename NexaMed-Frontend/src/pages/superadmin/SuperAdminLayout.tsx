import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, CreditCard, Receipt, DollarSign, Building2, 
  LogOut, Flower2, ChevronLeft, ChevronRight, Menu 
} from 'lucide-react'
import { superadminApi } from '@/services/api'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/superadmin/suscripciones', icon: CreditCard, label: 'Suscripciones' },
  { path: '/superadmin/pagos', icon: Receipt, label: 'Pagos' },
  { path: '/superadmin/tasa', icon: DollarSign, label: 'Tasa de cambio' },
  { path: '/superadmin/consultorios', icon: Building2, label: 'Consultorios' },
]

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [saUser, setSaUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('daliamed_sa_token')
    if (!token) {
      navigate('/superadmin/login')
      return
    }
    const stored = localStorage.getItem('daliamed_sa_user')
    if (stored) {
      try { setSaUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [navigate])

  const handleLogout = () => {
    superadminApi.logout()
    navigate('/superadmin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-medical-500 flex items-center justify-center">
                <Flower2 className="h-5 w-5 text-white" />
              </div>
              {!collapsed && <span className="font-bold text-sm">SuperAdmin</span>}
            </div>
            <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-700 rounded">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 py-3 px-2 space-y-1">
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive ? "bg-medical-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-700 p-3">
            {!collapsed && saUser && (
              <p className="text-xs text-slate-400 mb-2 truncate">{saUser.nombre || saUser.email}</p>
            )}
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors w-full",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
        <Outlet />
      </main>
    </div>
  )
}
