import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public Pages
import Landing from './pages/public/Landing';
import Services from './pages/public/Services';
import SobrePage from './pages/public/SobrePage';
import ContactoPage from './pages/public/ContactoPage';
import UpdateAdmin from './pages/public/UpdateAdmin';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterCliente from './pages/auth/RegisterCliente';
import RegisterPrestador from './pages/auth/RegisterPrestador';

// Cliente Pages
import ClienteDashboard from './pages/cliente/Dashboard';
import NovaSolicitacao from './pages/cliente/NovaSolicitacao';
import AcompanhamentoPage from './pages/cliente/AcompanhamentoPage';
import CarteiraPage from './pages/cliente/CarteiraPage';
import AgendaPageCliente from './pages/cliente/AgendaPageCliente';

// Prestador Pages
import PrestadorDashboard from './pages/prestador/Dashboard';
import AgendaPagePrestador from './pages/prestador/AgendaPagePrestador';

// Central Pages
import CentralDashboard from './pages/central/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Usuarios from './pages/admin/Usuarios';
import Prestadores from './pages/admin/Prestadores';
import Pagamentos from './pages/admin/Pagamentos';
import Relatorios from './pages/admin/Relatorios';
import Configuracoes from './pages/admin/Configuracoes';
import { NovoAdmin } from './pages/admin/NovoAdmin';
import NovoUsuario from './pages/admin/NovoUsuario';

const ProtectedRoute = ({ children, allowedProfiles }: { children: React.ReactNode, allowedProfiles?: string[] }) => {
  const { user, loading, firebaseUser } = useAuth();

  console.log('🛡️ ProtectedRoute - user:', user);
  console.log('🛡️ ProtectedRoute - profile:', user?.profile);
  console.log('🛡️ ProtectedRoute - allowedProfiles:', allowedProfiles);

  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!firebaseUser) {
    console.log('🛡️ ProtectedRoute - não logado, redirecionando para login');
    return <Navigate to="/login" />;
  }
  
  if (allowedProfiles && user && !allowedProfiles.includes(user.profile)) {
    console.log('🛡️ ProtectedRoute - perfil não permitido:', user.profile);
    return <Navigate to="/" />;
  }

  console.log('🛡️ ProtectedRoute - acesso permitido');
  return <>{children}</>;
};

// Componente de redirecionamento da raiz
const HomeRedirect = () => {
  const { user, loading, firebaseUser } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!firebaseUser || !user) {
    return <Landing />;
  }

  // Admin vai para Landing (para poder fazer upload)
  if (user.profile === 'admin') {
    return <Landing />;
  }

  // Para outros perfis
  switch (user.profile) {
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />;
    case 'prestador':
      return <Navigate to="/prestador/dashboard" replace />;
    case 'central':
      return <Navigate to="/central/dashboard" replace />;
    default:
      return <Landing />;
  }
};

// Componente para rotas públicas (só não-logados)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (firebaseUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Rota raiz */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Public Routes */}
              <Route path="/servicos" element={<Services />} />
              <Route path="/sobre" element={<SobrePage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/update-admin" element={<UpdateAdmin />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />
              <Route path="/register-cliente" element={
                <PublicOnlyRoute>
                  <RegisterCliente />
                </PublicOnlyRoute>
              } />
              <Route path="/register-prestador" element={
                <PublicOnlyRoute>
                  <RegisterPrestador />
                </PublicOnlyRoute>
              } />

              {/* Admin Routes - VERIFICAR SE ESTÁ CORRETO */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <Usuarios />
                </ProtectedRoute>
              } />
              <Route path="/admin/prestadores" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <Prestadores />
                </ProtectedRoute>
              } />
              <Route path="/admin/pagamentos" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <Pagamentos />
                </ProtectedRoute>
              } />
              <Route path="/admin/relatorios" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <Relatorios />
                </ProtectedRoute>
              } />
              <Route path="/admin/configuracoes" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios/novo" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <NovoUsuario />
                </ProtectedRoute>
              } />
              <Route path="/admin/novo-admin" element={
                <ProtectedRoute allowedProfiles={['admin']}>
                  <NovoAdmin />
                </ProtectedRoute>
              } />

              {/* Outras rotas protegidas (cliente, prestador, central) */}
              <Route path="/cliente/dashboard" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <ClienteDashboard />
                </ProtectedRoute>
              } />
              {/* ... outras rotas ... */}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
