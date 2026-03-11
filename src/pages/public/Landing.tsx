             import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, Camera,
  LayoutDashboard, Building2, Award, TrendingUp,
  Mail, Phone, MapPin, Facebook, Instagram, Linkedin,
  Home, LogOut, User, LogIn, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Info,
  Briefcase, Wrench, Brush, Zap, Droplets,
  Hammer, Flower2, Paintbrush, Menu, X
} from 'lucide-react';
import { UploadImage } from '../../components/ui/UploadImage';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// INTERFACES
// ============================================
interface Images {
  profile: string | null;
  hero: string | null;
  feature1: string | null;
  feature2: string | null;
  feature3: string | null;
  feature4: string | null;
  categoryLimpeza: string | null;
  categoryEmpregadas: string | null;
  categoryEletrica: string | null;
  categoryCanalizacao: string | null;
  categoryCarpintaria: string | null;
  categoryConstrucao: string | null;
  categoryJardinagem: string | null;
  categoryPintura: string | null;
  categoryReparacoes: string | null;
  partner1: string | null;
  partner2: string | null;
  partner3: string | null;
  partner4: string | null;
  partner5: string | null;
}

// ============================================
// CONSTANTES
// ============================================
const PROCESS_STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'BUSQUE O SERVIÇO',
    description: 'Navegue por categorias ou busque pelo serviço específico que precisa.',
    color: 'from-blue-400 to-blue-600'
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'ESCOLHA O PRESTADOR',
    description: 'Veja perfis verificados, avaliações reais e escolha o melhor profissional.',
    color: 'from-orange-400 to-orange-600'
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'AGENDE E PAGUE',
    description: 'Marque data e horário e pague de forma segura (70% inicial, 30% final).',
    color: 'from-green-400 to-green-600'
  },
  {
    number: '04',
    icon: ThumbsUp,
    title: 'AVALIE O SERVIÇO',
    description: 'Após a conclusão, avalie o profissional de 1 a 10 estrelas.',
    color: 'from-purple-400 to-purple-600'
  }
];

const FEATURES = [
  {
    id: 'feature1',
    title: 'Segurança Total',
    description: 'Profissionais verificados e antecedentes criminais checados para sua tranquilidade.',
    icon: Shield,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'feature2',
    title: 'Atendimento Rápido',
    description: 'Encontre um profissional qualificado em minutos, não em dias.',
    icon: Clock,
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'feature3',
    title: 'Qualidade Garantida',
    description: 'Sistema de avaliações reais de clientes verificados (1 a 10 estrelas).',
    icon: Star,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'feature4',
    title: 'Suporte 24/7',
    description: 'Nossa central de ajuda está sempre pronta para atender você.',
    icon: Users,
    color: 'from-purple-400 to-purple-600'
  }
];

const CATEGORY_FIELDS: Record<string, string> = {
  '🧹 Limpeza Doméstica': 'categoryLimpeza',
  '👥 Empregadas Domésticas & Babás': 'categoryEmpregadas',
  '⚡ Manutenção Elétrica': 'categoryEletrica',
  '💧 Canalização': 'categoryCanalizacao',
  '🔨 Carpintaria & Marcenaria': 'categoryCarpintaria',
  '🏗️ Construção & Obras': 'categoryConstrucao',
  '🌿 Jardinagem & Exteriores': 'categoryJardinagem',
  '🎨 Pintura & Acabamentos': 'categoryPintura',
  '🛠️ Reparações Gerais': 'categoryReparacoes',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
  const [images, setImages] = useState<Images>({
    profile: null,
    hero: null,
    feature1: null,
    feature2: null,
    feature3: null,
    feature4: null,
    categoryLimpeza: null,
    categoryEmpregadas: null,
    categoryEletrica: null,
    categoryCanalizacao: null,
    categoryCarpintaria: null,
    categoryConstrucao: null,
    categoryJardinagem: null,
    categoryPintura: null,
    categoryReparacoes: null,
    partner1: null,
    partner2: null,
    partner3: null,
    partner4: null,
    partner5: null,
  });

  // ============================================
  // ANIMAÇÃO DO TÍTULO
  // ============================================
  useEffect(() => {
    const phrases = ['Soluções Domésticas', 'ao seu Alcance', 'no seu Celular'];
    let mounted = true;
    
    const animatePhrases = () => {
      if (!mounted) return;
      
      phrases.forEach((_, index) => {
        setTimeout(() => {
          if (mounted) {
            setDisplayedPhrases(phrases.slice(0, index + 1));
          }
        }, index * 1500);
      });
      
      setTimeout(() => {
        if (mounted) {
          animatePhrases();
        }
      }, phrases.length * 1500 + 1000);
    };
    
    animatePhrases();
    
    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // BUSCAR IMAGENS DO FIREBASE
  // ============================================
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = doc(db, 'config', 'landingImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        }
      } catch (error) {
        console.error('Erro ao buscar imagens:', error);
      }
    };

    fetchImages();

    const unsubscribe = onSnapshot(doc(db, 'config', 'landingImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleImageUpload = useCallback((field: keyof Images) => (url: string) => {
    setImages(prev => ({ ...prev, [field]: url }));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleSolicitarServico = () => {
    if (user) {
      if (user.profile === 'cliente') {
        navigate('/cliente/nova-solicitacao');
      } else {
        navigate('/servicos');
      }
    } else {
      navigate('/register-cliente');
    }
  };

  const handleSerPrestador = () => {
    if (user) {
      if (user.profile === 'prestador') {
        navigate('/prestador/dashboard');
      } else {
        navigate('/register-prestador');
      }
    } else {
      navigate('/register-prestador');
    }
  };

  const isAdmin = user?.profile === 'admin';

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg py-4 border-b border-gray-100">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
              D
            </div>
            <span className="text-xl font-black text-primary group-hover:text-accent transition-colors">
              DEX<span className="text-accent group-hover:text-primary transition-colors">-app</span>
            </span>
          </Link>
          
          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-accent border-b-2 border-accent">Início</Link>
            <Link to="/servicos" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Serviços</Link>
            <Link to="/sobre" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Sobre</Link>
            <Link to="/contacto" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Contacto</Link>
          </nav>

          {/* Área do usuário - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Botão Admin */}
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-white flex items-center gap-2"
                leftIcon={<LayoutDashboard size={16} />}
              >
                Painel Admin
              </Button>
            )}
            
            {/* Avatar */}
            <div className="relative w-10 h-10">
              {isAdmin ? (
                <UploadImage
                  currentImageUrl={images.profile}
                  onUpload={handleImageUpload('profile')}
                  collectionPath="config"
                  docId="landingImages"
                  field="profile"
                  isAdminOnly={true}
                  className="w-full h-full rounded-full border-2 border-accent object-cover cursor-pointer"
                />
              ) : (
                <button
                  onClick={() => user ? navigate(`/${user.profile}/dashboard`) : navigate('/login')}
                  className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                  title={user ? `Ir para Dashboard` : 'Fazer Login'}
                >
                  {user ? (
                    <span className="text-sm font-bold">{user.nome?.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={20} />
                  )}
                </button>
              )}
            </div>

            {/* Botões de autenticação */}
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <LogIn size={16} />
                    Login
                  </Button>
                </Link>
                <Link to="/register-cliente">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                    Começar
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </Button>
            )}
          </div>

          {/* Menu Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-accent transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container mx-auto px-6 py-4 space-y-4">
                <nav className="flex flex-col space-y-2">
                  <Link 
                    to="/" 
                    className="py-2 text-sm font-bold text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Início
                  </Link>
                  <Link 
                    to="/servicos" 
                    className="py-2 text-sm font-bold text-gray-600 hover:text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Serviços
                  </Link>
                  <Link 
                    to="/sobre" 
                    className="py-2 text-sm font-bold text-gray-600 hover:text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sobre
                  </Link>
                  <Link 
                    to="/contacto" 
                    className="py-2 text-sm font-bold text-gray-600 hover:text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                </nav>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                      leftIcon={<LayoutDashboard size={16} />}
                    >
                      Painel Admin
                    </Button>
                  )}

                  {!user ? (
                    <>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register-cliente" onClick={() => setMobileMenuOpen(false)}>
                        <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white">
                          Começar
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                      leftIcon={<LogOut size={16} />}
                    >
                      Sair
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ======================================== */}
      {/* HERO SECTION */}
      {/* ======================================== */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Imagem de fundo hero */}
        {images.hero && (
          <div className="absolute inset-0">
            <img 
              src={images.hero} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-20"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
          </div>
        )}
        
        {/* Upload da imagem hero - só admin vê */}
        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-20">
            <UploadImage
              currentImageUrl={images.hero}
              onUpload={handleImageUpload('hero')}
              collectionPath="config"
              docId="landingImages"
              field="hero"
              isAdminOnly={true}
              label="Alterar Fundo"
              className="w-32 h-20 rounded-lg border-2 border-white shadow-xl hover:scale-105 transition-transform"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Lado esquerdo - Texto */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest mb-8 shadow-xl"
              >
                <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
                A Melhor Plataforma de Serviços em Moçambique • 2026
              </motion.div>
              
              {/* Título animado */}
              <div className="space-y-2 mb-8 min-h-[200px]">
                <AnimatePresence mode="wait">
                  {displayedPhrases.map((phrase, index) => (
                    <motion.h1
                      key={phrase}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`text-5xl md:text-7xl font-black leading-tight ${
                        index === 0 ? 'text-white' : 
                        index === 1 ? 'text-accent' : 'text-white'
                      }`}
                    >
                      {phrase}
                    </motion.h1>
                  ))}
                </AnimatePresence>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/90 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                Encontre os melhores profissionais para cuidar do seu lar em Moçambique. 
                <span className="block mt-2 text-accent font-bold">Rápido, seguro e 100% confiável.</span>
              </motion.p>
              
              {/* Botões de ação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <button
                  onClick={handleSolicitarServico}
                  className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Solicitar Serviço
                </button>
                <button
                  onClick={handleSerPrestador}
                  className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl font-bold transition-all transform hover:scale-105 backdrop-blur-sm"
                >
                  Quero ser Prestador
                </button>
              </motion.div>

              {/* Selos de qualidade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm font-bold text-white/70"
              >
                <div className="flex items-center gap-2 group hover:text-white transition-colors">
                  <Shield className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 group hover:text-white transition-colors">
                  <Clock className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                  <span>Atendimento Rápido</span>
                </div>
                <div className="flex items-center gap-2 group hover:text-white transition-colors">
                  <Heart className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                  <span>Qualidade Garantida</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Lado direito - Imagem de perfil circular */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center items-center"
            >
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Anéis decorativos */}
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping"></div>
                <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-pulse"></div>
                <div className="absolute inset-8 rounded-full bg-gradient-to-r from-accent/20 to-transparent animate-spin-slow"></div>
                
                {/* Moldura principal */}
                <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-br from-accent to-orange-600 border-4 border-white/30 shadow-2xl">
                  {isAdmin ? (
                    <UploadImage
                      currentImageUrl={images.profile}
                      onUpload={handleImageUpload('profile')}
                      collectionPath="config"
                      docId="landingImages"
                      field="profile"
                      isAdminOnly={true}
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <img 
                      src={images.profile || '/images/default-profile.jpg'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PROCESS STEPS */}
      {/* ======================================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Como <span className="text-accent">Funciona</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Em 4 passos simples você resolve todas as suas necessidades domésticas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="absolute -top-6 -right-6 text-8xl font-black text-gray-100 opacity-60 group-hover:opacity-100 transition-opacity z-10">
                  {step.number}
                </div>
                
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all z-20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-30`}>
                    <step.icon size={36} />
                  </div>
                  
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors relative z-30">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 leading-relaxed relative z-30">
                    {step.description}
                  </p>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* FEATURES SECTION */}
      {/* ======================================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Por que escolher a <span className="text-accent">DEX-app</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature) => {
              const field = feature.id as keyof Images;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
                    {/* Imagem da feature */}
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 group-hover:scale-105 transition-transform duration-300">
                      {images[field] ? (
                        <img 
                          src={images[field] as string} 
                          alt={feature.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <feature.icon className="w-16 h-16 text-accent/30" />
                        </div>
                      )}
                      
                      {/* Upload button para admin */}
                      {isAdmin && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadImage
                            currentImageUrl={images[field]}
                            onUpload={handleImageUpload(field)}
                            collectionPath="config"
                            docId="landingImages"
                            field={field}
                            isAdminOnly={true}
                            label="Alterar"
                            className="w-10 h-10 rounded-lg shadow-xl"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      <feature.icon size={28} />
                    </div>
                    
                    <h3 className="text-xl font-black text-primary mb-2 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CATEGORIES SECTION */}
      {/* ======================================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Serviços</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Explore nossas categorias e encontre o profissional ideal
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES && SERVICE_CATEGORIES.length > 0 ? (
              SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => {
                const fieldName = CATEGORY_FIELDS[cat.name] || 'categoryReparacoes';
                const IconComponent = 
                  cat.id === 'limpeza' ? Brush :
                  cat.id === 'empregadas' ? Users :
                  cat.id === 'eletrica' ? Zap :
                  cat.id === 'canalizacao' ? Droplets :
                  cat.id === 'carpintaria' ? Hammer :
                  cat.id === 'construcao' ? Building2 :
                  cat.id === 'jardinagem' ? Flower2 :
                  cat.id === 'pintura' ? Paintbrush :
                  Wrench;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Link to={`/servicos?cat=${cat.id}`}>
                      <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Imagem da categoria */}
                        <div className="relative h-32 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                          {images[fieldName as keyof Images] ? (
                            <img 
                              src={images[fieldName as keyof Images] as string} 
                              alt={cat.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${cat.color} opacity-20`} />
                          )}
                          
                          {/* Upload button para admin */}
                          {isAdmin && (
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              <UploadImage
                                currentImageUrl={images[fieldName as keyof Images]}
                                onUpload={handleImageUpload(fieldName as keyof Images)}
                                collectionPath="config"
                                docId="landingImages"
                                field={fieldName}
                                isAdminOnly={true}
                                label="Alterar"
                                className="w-8 h-8 rounded-lg shadow-xl"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
                          <IconComponent size={32} />
                        </div>
                        
                        <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors relative z-10">
                          {cat.name}
                        </h3>
                        
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10">
                          Profissionais qualificados prontos para atender.
                        </p>
                        
                        <div className="flex items-center text-accent font-black text-sm uppercase tracking-widest group-hover:gap-3 transition-all relative z-10">
                          Ver detalhes 
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center col-span-3">Carregando categorias...</p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              to="/servicos" 
              className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all text-lg"
            >
              Ver todos os serviços
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PARTNERS SECTION */}
      {/* ======================================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Parceiros</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Empresas que confiam na DEX-app para transformar seus serviços
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((num) => {
              const field = `partner${num}` as keyof Images;
              return (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: num * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="relative group"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all">
                    <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-50">
                      {images[field] ? (
                        <img 
                          src={images[field] as string} 
                          alt={`Partner ${num}`} 
                          className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Upload button para admin */}
                      {isAdmin && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadImage
                            currentImageUrl={images[field]}
                            onUpload={handleImageUpload(field)}
                            collectionPath="config"
                            docId="landingImages"
                            field={field}
                            isAdminOnly={true}
                            label="Alterar"
                            className="w-8 h-8 rounded-lg shadow-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CTA SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl"
          >
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mb-32 animate-pulse delay-1000"></div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
            
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-black mb-6"
              >
                Pronto para começar?
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
              >
                Junte-se a milhares de moçambicanos que já confiam na DEX-app para cuidar dos seus lares.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6"
              >
                <Link to="/register-cliente" className="w-full md:w-auto">
                  <button
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl rounded-2xl font-bold shadow-xl shadow-accent/30 transform hover:scale-105 transition-all"
                  >
                    Criar Conta Grátis
                  </button>
                </Link>
                <Link to="/register-prestador" className="w-full md:w-auto">
                  <button
                    className="w-full md:w-auto border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl font-bold transform hover:scale-105 transition-all backdrop-blur-sm"
                  >
                    Quero ser Prestador
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================== */}
      {/* FOOTER */}
      {/* ======================================== */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Sobre */}
            <div>
              <h3 className="text-xl font-black text-accent mb-4">DEX-app</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A melhor plataforma de serviços domésticos em Moçambique. Conectamos profissionais qualificados a famílias que buscam qualidade e segurança.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/servicos" className="text-gray-400 hover:text-accent transition-colors text-sm">Nossos Serviços</Link></li>
                <li><Link to="/sobre" className="text-gray-400 hover:text-accent transition-colors text-sm">Sobre Nós</Link></li>
                <li><Link to="/contacto" className="text-gray-400 hover:text-accent transition-colors text-sm">Contacto</Link></li>
                <li><Link to="/termos" className="text-gray-400 hover:text-accent transition-colors text-sm">Termos de Uso</Link></li>
              </ul>
            </div>

            {/* Serviços Populares */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Serviços Populares</h4>
              <ul className="space-y-2">
                <li><Link to="/servicos?cat=limpeza" className="text-gray-400 hover:text-accent transition-colors text-sm">Limpeza Doméstica</Link></li>
                <li><Link to="/servicos?cat=elektrica" className="text-gray-400 hover:text-accent transition-colors text-sm">Manutenção Elétrica</Link></li>
                <li><Link to="/servicos?cat=canalizacao" className="text-gray-400 hover:text-accent transition-colors text-sm">Canalização</Link></li>
                <li><Link to="/servicos?cat=jardinagem" className="text-gray-400 hover:text-accent transition-colors text-sm">Jardinagem</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">Receba dicas e promoções exclusivas.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-accent"
                />
                <button className="bg-accent px-4 py-2 rounded-r-lg text-white font-bold text-sm hover:bg-accent/90 transition-colors">
                  OK
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 DEX-app - Soluções Domésticas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}                               </AnimatePresence>
              
          
