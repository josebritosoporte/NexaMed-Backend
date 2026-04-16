import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { Layout } from '@/components/layout/Layout'
import Login from '@/pages/Login'
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout title="Dashboard" description="Vista general de tu consultorio" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route 
          path="/pacientes" 
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
          path="/pacientes/:id/expediente" 
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
          path="/pacientes/:id/consulta" 
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
          path="/pacientes/:id/orden" 
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
          path="/imprimir/orden/:id" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <ImprimirOrden />
            </ProtectedRoute>
          }
        />

        {/* Imprimir Consulta */}
        <Route 
          path="/imprimir/consulta/:id" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <ImprimirConsulta />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/consultas" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <Layout title="Consultas" description="Registro de atenciones médicas" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Consultas />} />
        </Route>

        <Route 
          path="/ordenes" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <Layout title="Órdenes Médicas" description="Órdenes de laboratorio e imagenología" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Ordenes />} />
        </Route>

        <Route 
          path="/agenda" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'assistant']}>
              <Layout title="Agenda" description="Calendario de citas" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Agenda />} />
        </Route>

        <Route 
          path="/configuracion" 
          element={
            <ProtectedRoute requiredRoles={['admin', 'doctor']}>
              <Layout title="Configuración" description="Ajustes del sistema" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Configuracion />} />
        </Route>

        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout title="Gestión de Usuarios" description="Administra los usuarios del sistema" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Usuarios />} />
        </Route>
      </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
