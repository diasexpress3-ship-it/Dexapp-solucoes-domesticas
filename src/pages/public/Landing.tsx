import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, Camera,
  LayoutDashboard, Building2, Award, TrendingUp,
  CheckCircle, Zap, Globe, Smartphone
} from 'lucide-react';
import { UploadImage } from '../../components/ui/UploadImage';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

// ============================================
// INTERFACES E TIPOS
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

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// ============================================
// CONSTANTES
// ============================================
const FEATURES: Feature[] = [
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
    description: 'Sistema de avaliações reais de clientes verificados.',
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

const PROCESS_STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'BUSQUE O SERVIÇO',
    description: 'Navegue por categorias ou busque pelo serviço específico que precisa em nossa plataforma.',
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
    description: 'Marque data e horário de sua preferência e pague de forma segura.',
    color: 'from-green-400 to-green-600'
  },
  {
    number: '04',
    icon: ThumbsUp,
    title: 'AVALIE O SERVIÇO',
    description: 'Após a conclusão, avalie o profissional e compartilhe sua experiência.',
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
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Estados
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
  // ANIMAÇÃO DO TÍTULO (otimizada)
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
  // BUSCAR IMAGENS DO FIREBASE (otimizado)
  // ============================================
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const imagesRef = doc(db, 'config', 'landingImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        }
      } catch (error) {
        console.error('Erro ao buscar imagens:', error);
        showToast?.('Erro ao carregar imagens', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // Listener em tempo real
    const unsubscribe = onSnapshot(doc(db, 'config', 'landingImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  // ============================================
  // HANDLER DE UPLOAD (otimizado com useCallback)
  // ============================================
  const handleImageUpload = useCallback((field: keyof Images) => (url: string) => {
    console.log(`✨ Imagem ${field} atualizada:`, url);
    setImages(prev => ({ ...prev, [field]: url }));
    showToast?.('Imagem atualizada com sucesso!', 'success');
  }, [showToast]);

  // ============================================
  // RENDERIZAÇÃO
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ======================================== */}
      {/* HEADER / MENU - Versão 2026 */}
      {/* ======================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg py-4 border-b border-gray-100">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo com animação */}
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
            {[
              { to: '/', label: 'Início', isActive: true },
              { to: '/servicos', label: 'Serviços' },
              { to: '/sobre', label: 'Sobre' },
              { to: '/contacto', label: 'Contacto' }
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-bold transition-all hover:scale-105 ${
                  item.isActive 
                    ? 'text-accent border-b-2 border-accent' 
                    : 'text-gray-600 hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Área do usuário */}
          <div className="flex items-center gap-3">
            {/* BOTÃO ADMIN - CORRIGIDO com navegação direta */}
            {user?.role === 'admin' && (
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-white transition-all hover:scale-105 shadow-md"
                leftIcon={<LayoutDashboard size={16} />}
              >
                Painel Admin
              </Button>
            )}
            
            {/* Imagem de perfil com lazy loading */}
            <div className="relative">
              {user?.role === 'admin' ? (
                <UploadImage
                  currentImageUrl={images.profile}
                  onUpload={handleImageUpload('profile')}
                  collectionPath="config"
                  docId="landingImages"
                  field="profile"
                  isAdminOnly={true}
                  className="w-10 h-10 rounded-full border-2 border-accent cursor-pointer hover:scale-110 transition-transform"
                  loadingClassName="animate-pulse bg-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white shadow-lg">
                  {images.profile ? (
                    <img 
                      src={images.profile} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-bold">D</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Botões de autenticação */}
            {!user && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
                <Link to="/register-cliente">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all">
                    Começar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================== */}
      {/* HERO SECTION - Versão 2026 */}
      {/* ======================================== */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Imagem de fundo hero com overlay */}
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
        {user?.role === 'admin' && (
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
              {/* Badge animado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest mb-8 shadow-xl"
              >
                <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
                A Melhor Plataforma de Serviços em Moçambique • 2026
              </motion.div>
              
              {/* Título com animação melhorada */}
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
                <Link to="/register-cliente" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white border-0 transform hover:scale-105 transition-all shadow-xl shadow-accent/30 px-8 py-4 text-lg rounded-2xl"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    Solicitar Serviço Agora
                  </Button>
                </Link>
                <Link to="/register-prestador" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 transform hover:scale-105 transition-all px-8 py-4 text-lg rounded-2xl backdrop-blur-sm"
                  >
                    Quero ser Prestador
                  </Button>
                </Link>
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
                {/* Anéis decorativos animados */}
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping"></div>
                <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-pulse"></div>
                <div className="absolute inset-8 rounded-full bg-gradient-to-r from-accent/20 to-transparent animate-spin-slow"></div>
                
                {/* Moldura principal */}
                <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-br from-accent to-orange-600 border-4 border-white/30 shadow-2xl">
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    </div>
                  ) : (
                    <UploadImage
                      currentImageUrl={images.profile}
                      onUpload={handleImageUpload('profile')}
                      collectionPath="config"
                      docId="landingImages"
                      field="profile"
                      isAdminOnly={true}
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                      loadingClassName="animate-pulse bg-gray-200"
                    />
                  )}
                </div>
                
                {/* Ícone de câmera decorativo */}
                {!images.profile && !loading && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 1 }}
                    className="absolute -bottom-2 -right-2 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white"
                  >
                    <Camera className="w-6 h-6" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PROCESS STEPS - Mantido igual, apenas otimizado */}
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
      {/* FEATURES SECTION - Versão 2026 melhorada */}
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
              Por que escolher a <span className="text-accent">DEXAPP</span>?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Segurança, rapidez e qualidade em cada serviço
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
                  {/* Imagem da feature */}
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 group-hover:scale-105 transition-transform duration-300">
                    {images[feature.id as keyof Images] ? (
                      <img 
                        src={images[feature.id as keyof Images] as string} 
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
                    {user?.role === 'admin' && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadImage
                          currentImageUrl={images[feature.id as keyof Images]}
                          onUpload={handleImageUpload(feature.id as keyof Images)}
                          collectionPath="config"
                          docId="landingImages"
                          field={feature.id}
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
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CATEGORIES SECTION - Mantido igual com otimizações */}
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
              Explore nossas categorias e encontre o profissional ideal para o seu serviço
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => {
              const fieldName = CATEGORY_FIELDS[cat.name] || 'categoryReparacoes';
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
                    <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full transition-all hover:shadow-2xl hover:border-accent/20 relative overflow-hidden">
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
                        {user?.role === 'admin' && (
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
                        <cat.icon size={32} />
                      </div>
                      
                      <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors relative z-10">
                        {cat.name}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10">
                        Profissionais qualificados prontos para atender suas necessidades.
                      </p>
                      
                      <div className="flex items-center text-accent font-black text-sm uppercase tracking-widest group-hover:gap-3 transition-all relative z-10">
                        Ver detalhes 
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
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
      {/* PARTNERS SECTION - Versão 2026 */}
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
              Empresas que confiam na DEXAPP para transformar seus serviços
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((num) => (
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
                    {images[`partner${num}` as keyof Images] ? (
                      <img 
                        src={images[`partner${num}` as keyof Images] as string} 
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
                    {user?.role === 'admin' && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadImage
                          currentImageUrl={images[`partner${num}` as keyof Images]}
                          onUpload={handleImageUpload(`partner${num}` as keyof Images)}
                          collectionPath="config"
                          docId="landingImages"
                          field={`partner${num}`}
                          isAdminOnly={true}
                          label="Alterar"
                          className="w-8 h-8 rounded-lg shadow-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CTA SECTION - Versão 2026 */}
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
                Junte-se a milhares de moçambicanos que já confiam na DEXAPP para cuidar dos seus lares.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6"
              >
                <Link to="/register-cliente" className="w-full md:w-auto">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl rounded-2xl shadow-xl shadow-accent/30 transform hover:scale-105 transition-all"
                  >
                    Criar Conta Grátis
                  </Button>
                </Link>
                <Link to="/register-prestador" className="w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl transform hover:scale-105 transition-all backdrop-blur-sm"
                  >
                    Quero ser Prestador
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rodapé minimalista */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 DEXAPP - A Melhor Plataforma de Serviços Domésticos em Moçambique
          </p>
        </div>
      </footer>
    </div>
  );
}
