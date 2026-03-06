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

const ProtectedRoute = ({ children, allowedProfiles }: { children: React.ReactNode, allowedProfiles: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!allowedProfiles.includes(user.profile)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente de redirecionamento da raiz
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  // Se NÃO estiver logado, vai para Landing Page
  if (!user) {
    return <Landing />;
  }

  // Se estiver logado, redireciona para o dashboard baseado no perfil
  console.log('Usuário logado, redirecionando para:', user.profile);
  
  switch (user.profile) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />;
    case 'prestador':
      return <Navigate to="/prestador/dashboard" replace />;
    case 'central':
      return <Navigate to="/central/dashboard" replace />;
    default:
      console.warn('Perfil desconhecido:', user.profile);
      return <Landing />;
  }
};

// Componente para rotas que só não-logados podem acessar (login, register)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (user) {
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
