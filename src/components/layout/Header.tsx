import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Calendar, 
  Settings,
  Bell,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { 
      name: 'Início', 
      path: firebaseUser ? `/${user?.role || 'cliente'}/dashboard` : '/' 
    },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const userLinks = {
    cliente: [
      { name: 'Dashboard', path: '/cliente/dashboard', icon: LayoutDashboard },
      { name: 'Nova Solicitação', path: '/cliente/nova-solicitacao', icon: Briefcase },
      { name: 'Agenda', path: '/cliente/agenda', icon: Calendar },
      { name: 'Carteira', path: '/cliente/carteira', icon: Wallet },
    ],
    prestador: [
      { name: 'Dashboard', path: '/prestador/dashboard', icon: LayoutDashboard },
      { name: 'Agenda', path: '/prestador/agenda', icon: Calendar },
    ],
    central: [
      { name: 'Dashboard', path: '/central/dashboard', icon: LayoutDashboard },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Usuários', path: '/admin/usuarios', icon: Users },
      { name: 'Pagamentos', path: '/admin/pagamentos', icon: CreditCard },
      { name: 'Relatórios', path: '/admin/relatorios', icon: FileText },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          <span className="text-xl font-black text-primary tracking-tight hidden sm:block">
            DEXAPP
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-accent ${
                location.pathname === link.path ? 'text-accent' : 'text-gray-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {firebaseUser ? (
            <div className="flex items-center gap-3">
              <Link to={`/${user?.role}/dashboard`} className="hidden sm:flex items-center gap-2 p-1 pr-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-700">{user?.nome.split(' ')[0]}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/register-cliente">
                <Button variant="primary" size="sm">Registar</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-gray-700"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {firebaseUser ? (
                <>
                  {user?.role && userLinks[user.role].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-lg font-bold text-gray-700"
                    >
                      <link.icon size={20} className="text-primary" />
                      {link.name}
                    </Link>
                  ))}
                  <Button variant="danger" className="w-full" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </Link>
                  <Link to="/register-cliente" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Registar</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
