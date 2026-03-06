import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, Camera,
  LayoutDashboard, Building2, Award, TrendingUp
} from 'lucide-react';
import { UploadImage } from '../../components/ui/UploadImage';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Landing() {
  const { user } = useAuth();
  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
  const [loadingImage, setLoadingImage] = useState(false);
  
  // Imagens da aplicação
  const [images, setImages] = useState({
    // Imagem de perfil (círculo)
    profile: null as string | null,
    
    // Imagem hero (fundo)
    hero: null as string | null,
    
    // Imagens das features
    feature1: null as string | null,
    feature2: null as string | null,
    feature3: null as string | null,
    feature4: null as string | null,
    
    // Imagens das categorias
    categoryLimpeza: null as string | null,
    categoryEmpregadas: null as string | null,
    categoryEletrica: null as string | null,
    categoryCanalizacao: null as string | null,
    categoryCarpintaria: null as string | null,
    categoryConstrucao: null as string | null,
    categoryJardinagem: null as string | null,
    categoryPintura: null as string | null,
    categoryReparacoes: null as string | null,
    
    // Logos de parceiros
    partner1: null as string | null,
    partner2: null as string | null,
    partner3: null as string | null,
    partner4: null as string | null,
    partner5: null as string | null,
  });

  // Buscar todas as imagens
  useEffect(() => {
    const fetchAllImages = async () => {
      setLoadingImage(true);
      try {
        // Documento principal de imagens
        const imagesRef = doc(db, 'config', 'landingImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        }
      } catch (error) {
        console.error("Erro ao buscar imagens:", error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchAllImages();

    // Listener em tempo real
    const unsubscribe = onSnapshot(doc(db, 'config', 'landingImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Funções de upload
  const handleImageUpload = (field: string) => (url: string) => {
    console.log(`Imagem ${field} atualizada:`, url);
  };

  // Efeito para animação do título
  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    const animatePhrases = () => {
      setDisplayedPhrases([]);
      
      timeoutIds.push(setTimeout(() => {
        setDisplayedPhrases(['Soluções Domésticas']);
      }, 0));
      
      timeoutIds.push(setTimeout(() => {
        setDisplayedPhrases(['Soluções Domésticas', 'ao seu Alcance']);
      }, 1500));
      
      timeoutIds.push(setTimeout(() => {
        setDisplayedPhrases(['Soluções Domésticas', 'ao seu Alcance', 'no seu Celular']);
      }, 3000));
      
      timeoutIds.push(setTimeout(() => {
        animatePhrases();
      }, 5000));
    };
    
    animatePhrases();
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  const processSteps = [
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

  // Mapeamento de categorias para campos
  const categoryFields = {
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Menu */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="text-xl font-black text-primary">DEX<span className="text-accent">-app</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-accent">Início</Link>
            <Link to="/servicos" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Serviços</Link>
            <Link to="/sobre" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Sobre</Link>
            <Link to="/contacto" className="text-sm font-bold text-gray-600 hover:text-accent transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Botão para Admin Dashboard */}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-accent text-accent hover:bg-accent hover:text-white"
                  leftIcon={<LayoutDashboard size={16} />}
                >
                  Painel Admin
                </Button>
              </Link>
            )}
            
            {/* Imagem de perfil - só admin pode alterar */}
            {user?.role === 'admin' ? (
              <UploadImage 
                currentImageUrl={images.profile}
                onUpload={handleImageUpload('profile')}
                collectionPath="config"
                docId="landingImages"
                field="profile"
                isAdminOnly={true}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white">
                {images.profile ? (
                  <img src={images.profile} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">D</span>
                )}
              </div>
            )}
            
            {!user && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register-cliente">
                  <Button size="sm">Começar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-primary to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Imagem de fundo hero */}
          {images.hero && (
            <div className="absolute inset-0 opacity-20">
              <img src={images.hero} alt="Hero Background" className="w-full h-full object-cover" />
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
                className="w-32 h-20 rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Lado esquerdo - Texto */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block py-1 px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-black uppercase tracking-widest mb-6">
                  <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
                  A Melhor Plataforma de Serviços em Moçambique
                </span>
                
                {/* Título com animação */}
                <div className="space-y-2 mb-6 min-h-[180px] md:min-h-[220px]">
                  <AnimatePresence mode="popLayout">
                    {displayedPhrases.map((phrase, index) => (
                      <motion.h1
                        key={phrase}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`text-4xl md:text-6xl font-black ${
                          index === 0 ? 'text-white' : 
                          index === 1 ? 'text-accent' : 'text-white'
                        }`}
                      >
                        {phrase}
                      </motion.h1>
                    ))}
                  </AnimatePresence>
                </div>
                
                <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                  Encontre os melhores profissionais para cuidar do seu lar em Moçambique. Rápido, seguro e confiável.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/register-cliente">
                    <Button 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-white border-0 transform hover:scale-105 transition-all shadow-xl shadow-accent/30"
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Solicitar Serviço
                    </Button>
                  </Link>
                  <Link to="/register-prestador">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/20 text-white hover:bg-white/10 transform hover:scale-105 transition-all"
                    >
                      Seja um Prestador
                    </Button>
                  </Link>
                </div>

                <div className="mt-16 flex items-center justify-center lg:justify-start gap-8 text-sm font-bold text-white/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Atendimento Rápido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent" />
                    <span>Qualidade Garantida</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Lado direito - Moldura circular para imagem de perfil */}
            <div className="flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Círculo externo decorativo */}
                <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse"></div>
                
                {/* Círculo do meio decorativo */}
                <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"></div>
                
                {/* Moldura circular para imagem de perfil */}
                <div className="absolute inset-8 rounded-full overflow-hidden bg-gradient-to-br from-accent/30 to-orange-600/30 border-4 border-white/30 shadow-2xl">
                  {loadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <UploadImage 
                      currentImageUrl={images.profile}
                      onUpload={handleImageUpload('profile')}
                      collectionPath="config"
                      docId="landingImages"
                      field="profile"
                      isAdminOnly={true}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Ícone de câmera decorativo */}
                {!images.profile && !loadingImage && (
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section ref={processRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Como <span className="text-accent">Funciona</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Em 4 passos simples você resolve todas as suas necessidades domésticas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                {/* Número grande e visível */}
                <div className="absolute -top-6 -right-6 text-8xl font-black text-gray-100 opacity-60 group-hover:opacity-100 transition-opacity z-10">
                  {step.number}
                </div>
                
                {/* Card */}
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all z-20 overflow-hidden">
                  {/* Fundo gradiente no hover */}
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
                  
                  {/* Linha decorativa animada */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Por que escolher a <span className="text-accent">DEXAPP</span>?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Segurança, rapidez e qualidade em cada serviço
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                  {images.feature1 ? (
                    <img src={images.feature1} alt="Feature 1" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shield className="w-16 h-16 text-accent/30" />
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute bottom-2 right-2">
                      <UploadImage 
                        currentImageUrl={images.feature1}
                        onUpload={handleImageUpload('feature1')}
                        collectionPath="config"
                        docId="landingImages"
                        field="feature1"
                        isAdminOnly={true}
                        label="Alterar"
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Segurança Total</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Profissionais verificados e antecedentes criminais checados.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                  {images.feature2 ? (
                    <img src={images.feature2} alt="Feature 2" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Clock className="w-16 h-16 text-accent/30" />
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute bottom-2 right-2">
                      <UploadImage 
                        currentImageUrl={images.feature2}
                        onUpload={handleImageUpload('feature2')}
                        collectionPath="config"
                        docId="landingImages"
                        field="feature2"
                        isAdminOnly={true}
                        label="Alterar"
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Atendimento Rápido</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Encontre um profissional em minutos.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                  {images.feature3 ? (
                    <img src={images.feature3} alt="Feature 3" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="w-16 h-16 text-accent/30" />
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute bottom-2 right-2">
                      <UploadImage 
                        currentImageUrl={images.feature3}
                        onUpload={handleImageUpload('feature3')}
                        collectionPath="config"
                        docId="landingImages"
                        field="feature3"
                        isAdminOnly={true}
                        label="Alterar"
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Qualidade Garantida</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sistema de avaliações reais.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative group">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                  {images.feature4 ? (
                    <img src={images.feature4} alt="Feature 4" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-accent/30" />
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute bottom-2 right-2">
                      <UploadImage 
                        currentImageUrl={images.feature4}
                        onUpload={handleImageUpload('feature4')}
                        collectionPath="config"
                        docId="landingImages"
                        field="feature4"
                        isAdminOnly={true}
                        label="Alterar"
                        className="w-10 h-10 rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Suporte 24/7</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Nossa central está sempre pronta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Serviços</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Explore nossas categorias e encontre o profissional ideal para o seu serviço
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => {
              const fieldName = categoryFields[cat.name] || 'categoryReparacoes';
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer relative"
                >
                  <Link to={`/servicos?cat=${cat.id}`}>
                    <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full transition-all hover:shadow-2xl hover:border-accent/20 relative overflow-hidden">
                      {/* Fundo gradiente animado */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Imagem da categoria - editável por admin */}
                      <div className="relative h-32 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                        {images[fieldName] ? (
                          <img src={images[fieldName]} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${cat.color} opacity-20`} />
                        )}
                        {user?.role === 'admin' && (
                          <div className="absolute bottom-2 right-2 z-20">
                            <UploadImage 
                              currentImageUrl={images[fieldName]}
                              onUpload={handleImageUpload(fieldName)}
                              collectionPath="config"
                              docId="landingImages"
                              field={fieldName}
                              isAdminOnly={true}
                              label="Alterar"
                              className="w-8 h-8 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Ícone */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
                        <cat.icon size={32} />
                      </div>
                      
                      {/* Título */}
                      <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors relative z-10">
                        {cat.name}
                      </h3>
                      
                      {/* Descrição */}
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10">
                        Profissionais qualificados prontos para atender suas necessidades.
                      </p>
                      
                      {/* Link Detalhes */}
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

          <div className="text-center mt-12">
            <Link to="/servicos" className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all">
              Ver todos os serviços
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Parceiros</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Empresas que confiam na DEXAPP
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="relative group">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all">
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-50">
                    {images[`partner${num}`] ? (
                      <img src={images[`partner${num}`]} alt={`Partner ${num}`} className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {user?.role === 'admin' && (
                      <div className="absolute bottom-2 right-2">
                        <UploadImage 
                          currentImageUrl={images[`partner${num}`]}
                          onUpload={handleImageUpload(`partner${num}`)}
                          collectionPath="config"
                          docId="landingImages"
                          field={`partner${num}`}
                          isAdminOnly={true}
                          label="Alterar"
                          className="w-8 h-8 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mb-32 animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para começar?</h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Junte-se a milhares de moçambicanos que já confiam na DEXAPP para cuidar dos seus lares.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link to="/register-cliente">
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-accent/30 transform hover:scale-105 transition-all"
                  >
                    Criar Conta Grátis
                  </Button>
                </Link>
                <Link to="/register-prestador">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/20 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-2xl transform hover:scale-105 transition-all"
                  >
                    Quero ser Prestador
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
