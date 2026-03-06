import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, ShieldCheck, 
  LayoutDashboard, Wrench, History, Wallet, Calendar, Settings,
  MessageSquare, Phone, Info, Home, 
  Facebook, Instagram, Twitter, MessageCircle,
  ChevronDown, Star, Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Links de navegação públicos - SEMPRE VISÍVEIS
  const navLinks = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Serviços', path: '/servicos', icon: Wrench },
    { name: 'Sobre', path: '/sobre', icon: Info },
    { name: 'Contacto', path: '/contacto', icon: Phone },
  ];

  // Função para obter o nome amigável do perfil
  const getProfileName = (profile: string) => {
    const profiles: Record<string, string> = {
      admin: 'Administrador',
      cliente: 'Cliente',
      prestador: 'Prestador',
      central: 'Central'
    };
    return profiles[profile] || profile;
  };

  // Função para obter a cor do perfil
  const getProfileColor = (profile: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      cliente: 'bg-blue-500',
      prestador: 'bg-orange-500',
      central: 'bg-green-500'
    };
    return colors[profile] || 'bg-primary';
  };

  // Função para obter a especialidade do prestador
  const getEspecialidade = () => {
    if (user?.profile === 'prestador' && user.prestadorData?.especialidades) {
      const especialidades = user.prestadorData.especialidades;
      return especialidades.length > 0 ? especialidades[0] : 'Profissional';
    }
    return null;
  };

  const dashboardLinks = {
    cliente: [
      { name: 'Dashboard', path: '/cliente/dashboard', icon: LayoutDashboard },
      { name: 'Nova Solicitação', path: '/cliente/nova-solicitacao', icon: Wrench },
      { name: 'Minha Agenda', path: '/cliente/agenda', icon: Calendar },
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
      { name: 'Utilizadores', path: '/admin/usuarios', icon: User },
      { name: 'Prestadores', path: '/admin/prestadores', icon: ShieldCheck },
      { name: 'Pagamentos', path: '/admin/pagamentos', icon: Wallet },
      { name: 'Relatórios', path: '/admin/relatorios', icon: History },
    ],
  };

  const currentDashboardLinks = user ? dashboardLinks[user.profile] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              DEX<span className="text-accent">-app</span>
            </span>
          </Link>

          {/* Desktop Navigation - SEMPRE VISÍVEL */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-bold transition-colors hover:text-accent ${
                  location.pathname === link.path ? 'text-accent' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Info / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Profile Info */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg ${getProfileColor(user.profile)} flex items-center justify-center text-white font-bold text-sm`}>
                    {user.nome?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-primary">{user.nome}</p>
                    <p className="text-[10px] text-gray-500">{getProfileName(user.profile)}</p>
                  </div>
                </div>

                {/* Logout Button - SEMPRE VISÍVEL */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                  leftIcon={<LogOut size={16} />}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register-cliente">
                  <Button size="sm">Começar Agora</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Menu</p>
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-black text-primary flex items-center gap-3"
                  >
                    <link.icon className="w-6 h-6" />
                    {link.name}
                  </Link>
                ))}
              </div>

              <hr className="border-gray-100" />

              {/* User Info in Mobile */}
              {user ? (
                <div className="flex flex-col gap-4">
                  {/* Perfil do usuário */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className={`w-12 h-12 rounded-xl ${getProfileColor(user.profile)} flex items-center justify-center text-white font-bold text-xl`}>
                      {user.nome?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary">{user.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black ${
                          user.profile === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.profile === 'cliente' ? 'bg-blue-100 text-blue-700' :
                          user.profile === 'prestador' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getProfileName(user.profile)}
                        </span>
                        {user.profile === 'prestador' && getEspecialidade() && (
                          <span className="text-xs text-gray-500">· {getEspecialidade()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-black text-primary">Painel</p>
                  {currentDashboardLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-lg font-bold text-gray-700"
                    >
                      <link.icon className="w-5 h-5 text-accent" />
                      {link.name}
                    </Link>
                  ))}
                  
                  {/* Botão de Logout Mobile - SEMPRE VISÍVEL */}
                  <Button 
                    variant="danger" 
                    fullWidth 
                    onClick={handleLogout} 
                    className="mt-4"
                    leftIcon={<LogOut size={18} />}
                  >
                    Sair da Conta
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Login</Button>
                  </Link>
                  <Link to="/register-cliente" onClick={() => setIsMenuOpen(false)}>
                    <Button fullWidth>Criar Conta Grátis</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">DEX<span className="text-accent">-app</span></span>
              </div>
              <p className="text-white/60 font-medium leading-relaxed">
                Soluções domésticas inteligentes e serviços verificados em Moçambique.
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://wa.me/258871425316" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
              <ul className="space-y-4 text-white/60 font-medium">
                <li><Link to="/servicos" className="hover:text-white transition-colors">Nossos Serviços</Link></li>
                <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
                <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Serviços Populares</h4>
              <ul className="space-y-4 text-white/60 font-medium">
                <li><Link to="/servicos?cat=limpeza" className="hover:text-white transition-colors">Limpeza Doméstica</Link></li>
                <li><Link to="/servicos?cat=eletrica" className="hover:text-white transition-colors">Manutenção Elétrica</Link></li>
                <li><Link to="/servicos?cat=canalizacao" className="hover:text-white transition-colors">Canalização</Link></li>
                <li><Link to="/servicos?cat=jardinagem" className="hover:text-white transition-colors">Jardinagem</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Newsletter</h4>
              <p className="text-white/60 font-medium mb-4">Receba dicas e promoções exclusivas.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 outline-none focus:border-accent text-white placeholder:text-white/40"
                />
                <Button size="sm" className="bg-accent hover:bg-accent/90">OK</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-white/40 text-sm font-medium">
            © 2026 DEX-app - Soluções Domésticas. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
