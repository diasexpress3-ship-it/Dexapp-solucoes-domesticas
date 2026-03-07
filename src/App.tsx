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

// ============================================
// COMPONENTE DE ROTA PROTEGIDA
// ============================================
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

// ============================================
// COMPONENTE DE REDIRECIONAMENTO DA RAIZ
// ============================================
const HomeRedirect = () => {
  const { user, loading, firebaseUser } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  // Se não estiver logado, vai para Landing
  if (!firebaseUser || !user) {
    console.log('🏠 HomeRedirect - não logado → Landing');
    return <Landing />;
  }

  // Redireciona baseado no perfil
  console.log('🏠 HomeRedirect - logado como:', user.profile);
  
  switch (user.profile) {
    case 'admin':
      console.log('🏠 HomeRedirect - admin → Landing (para upload)');
      return <Landing />;
    case 'cliente':
      console.log('🏠 HomeRedirect - cliente → /cliente/dashboard');
      return <Navigate to="/cliente/dashboard" replace />;
    case 'prestador':
      console.log('🏠 HomeRedirect - prestador → /prestador/dashboard');
      return <Navigate to="/prestador/dashboard" replace />;
    case 'central':
      console.log('🏠 HomeRedirect - central → /central/dashboard');
      return <Navigate to="/central/dashboard" replace />;
    default:
      console.log('🏠 HomeRedirect - perfil desconhecido → Landing');
      return <Landing />;
  }
};

// ============================================
// COMPONENTE PARA ROTAS PÚBLICAS (SÓ NÃO-LOGADOS)
// ============================================
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (firebaseUser) {
    console.log('🔓 PublicOnlyRoute - usuário logado, redirecionando para home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Rota raiz - HomeRedirect decide */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Public Routes */}
              <Route path="/servicos" element={<Services />} />
              <Route path="/sobre" element={<SobrePage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/update-admin" element={<UpdateAdmin />} />
              
              {/* Auth Routes - APENAS NÃO LOGADOS */}
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

              {/* Cliente Routes */}
              <Route path="/cliente/dashboard" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <ClienteDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cliente/nova-solicitacao" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <NovaSolicitacao />
                </ProtectedRoute>
              } />
              <Route path="/cliente/acompanhamento/:id" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <AcompanhamentoPage />
                </ProtectedRoute>
              } />
              <Route path="/cliente/carteira" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <CarteiraPage />
                </ProtectedRoute>
              } />
              <Route path="/cliente/agenda" element={
                <ProtectedRoute allowedProfiles={['cliente', 'admin']}>
                  <AgendaPageCliente />
                </ProtectedRoute>
              } />

              {/* Prestador Routes */}
              <Route path="/prestador/dashboard" element={
                <ProtectedRoute allowedProfiles={['prestador', 'admin']}>
                  <PrestadorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/prestador/agenda" element={
                <ProtectedRoute allowedProfiles={['prestador', 'admin']}>
                  <AgendaPagePrestador />
                </ProtectedRoute>
              } />

              {/* Central Routes */}
              <Route path="/central/dashboard" element={
                <ProtectedRoute allowedProfiles={['central', 'admin']}>
                  <CentralDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
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

              {/* Fallback - 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
