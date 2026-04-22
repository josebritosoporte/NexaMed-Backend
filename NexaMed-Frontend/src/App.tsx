import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { Layout } from '@/components/layout/Layout'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Pacientes from '@/pages/Pacientes'
import Consultas from '@/pages/Consultas'
import Ordenes from '@/pages/Ordenes'
import Agenda from '@/pages/Agenda'
import Configuracion from '@/pages/Configuracion'
import Usuarios from '@/pages/Usuarios'
import ExpedienteClinico from '@/pages/ExpedienteClinico'
import NuevaConsulta from '@/pages/NuevaConsulta'
import NuevaOrden from '@/pages/NuevaOrden'
import ImprimirOrden from '@/pages/ImprimirOrden'
import ImprimirConsulta from '@/pages/ImprimirConsulta'
import MiSuscripcion from '@/pages/MiSuscripcion'
import Planes from '@/pages/Planes'
import SuperAdminLogin from '@/pages/superadmin/SuperAdminLogin'
import SuperAdminLayout from '@/pages/superadmin/SuperAdminLayout'
import SADashboard from '@/pages/superadmin/SADashboard'
import SASuscripciones from '@/pages/superadmin/SASuscripciones'
import SAPagos from '@/pages/superadmin/SAPagos'
import SATasa from '@/pages/superadmin/SATasa'
import SAConsultorios from '@/pages/superadmin/SAConsultorios'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <SubscriptionProvider>
        <Routes>
        {/* Landing Page - Página principal */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Rutas protegidas - Sistema */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <Layout title="Escritorio" description="Vista general de tu consultorio" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route 
          path="/app/pacientes" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <Layout title="Pacientes" description="Gestión de pacientes y expedientes" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Pacientes />} />
        </Route>

        {/* Expediente Clínico - Ruta especial sin Layout normal */}
        <Route 
          path="/app/pacientes/:id/expediente" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <div className="min-h-screen bg-background">
                <div className="flex">
                  <main className="flex-1 p-6">
                    <ExpedienteClinico />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Nueva Consulta */}
        <Route 
          path="/app/pacientes/:id/consulta" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <div className="min-h-screen bg-background">
                <div className="flex">
                  <main className="flex-1 p-6">
                    <NuevaConsulta />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Nueva Orden Médica */}
        <Route 
          path="/app/pacientes/:id/orden" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <div className="min-h-screen bg-background">
                <div className="flex">
                  <main className="flex-1 p-6">
                    <NuevaOrden />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Imprimir Orden Médica */}
        <Route 
          path="/app/imprimir/orden/:id" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <ImprimirOrden />
            </ProtectedRoute>
          }
        />

        {/* Imprimir Consulta */}
        <Route 
          path="/app/imprimir/consulta/:id" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <ImprimirConsulta />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/app/consultas" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <Layout title="Consultas" description="Registro de atenciones médicas" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Consultas />} />
        </Route>

        <Route 
          path="/app/ordenes" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <Layout title="Órdenes Médicas" description="Órdenes de laboratorio e imagenología" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Ordenes />} />
        </Route>

        <Route 
          path="/app/agenda" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <Layout title="Agenda" description="Calendario de citas" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Agenda />} />
        </Route>

        <Route 
          path="/app/configuracion" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <Layout title="Configuración" description="Ajustes del sistema" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Configuracion />} />
        </Route>

        <Route 
          path="/app/usuarios" 
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout title="Gestión de Usuarios" description="Administra los usuarios del sistema" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Usuarios />} />
        </Route>

        <Route 
          path="/app/suscripcion" 
          element={
            <ProtectedRoute>
              <Layout title="Mi Suscripción" description="Gestiona tu plan y pagos" />
            </ProtectedRoute>
          }
        >
          <Route index element={<MiSuscripcion />} />
        </Route>

        <Route 
          path="/app/planes" 
          element={
            <ProtectedRoute>
              <Layout title="Planes" description="Compara planes y elige el mejor para ti" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Planes />} />
        </Route>

        {/* SuperAdmin */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<SADashboard />} />
          <Route path="suscripciones" element={<SASuscripciones />} />
          <Route path="pagos" element={<SAPagos />} />
          <Route path="tasa" element={<SATasa />} />
          <Route path="consultorios" element={<SAConsultorios />} />
        </Route>
      </Routes>
      </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
