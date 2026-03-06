import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, Camera,
  LayoutDashboard, Building2
} from 'lucide-react';
import { UploadImage } from '../../components/ui/UploadImage';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Images {
  profile: string | null;
  hero: string | null;
  feature1: string | null;
  feature2: string | null;
  feature3: string | null;
  feature4: string | null;
  partner1: string | null;
  partner2: string | null;
  partner3: string | null;
  partner4: string | null;
  partner5: string | null;
}

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
    description: 'Marque data e horário e pague de forma segura.',
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

const FEATURES = [
  { id: 'feature1', title: 'Segurança Total', icon: Shield },
  { id: 'feature2', title: 'Atendimento Rápido', icon: Clock },
  { id: 'feature3', title: 'Qualidade Garantida', icon: Star },
  { id: 'feature4', title: 'Suporte 24/7', icon: Users },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
  const [images, setImages] = useState<Images>({
    profile: null,
    hero: null,
    feature1: null,
    feature2: null,
    feature3: null,
    feature4: null,
    partner1: null,
    partner2: null,
    partner3: null,
    partner4: null,
    partner5: null,
  });

  // Animação do título
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

  // Buscar imagens
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

  const handleImageUpload = useCallback((field: keyof Images) => (url: string) => {
    setImages(prev => ({ ...prev, [field]: url }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg py-4 border-b border-gray-100">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
              D
            </div>
            <span className="text-xl font-black text-primary">
              DEX<span className="text-accent">-app</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-accent border-b-2 border-accent">Início</Link>
            <Link to="/servicos" className="text-sm font-bold text-gray-600 hover:text-accent">Serviços</Link>
            <Link to="/sobre" className="text-sm font-bold text-gray-600 hover:text-accent">Sobre</Link>
            <Link to="/contacto" className="text-sm font-bold text-gray-600 hover:text-accent">Contacto</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* BOTÃO ADMIN - AGORA VISÍVEL */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md"
              >
                <LayoutDashboard size={18} />
                Painel Admin
              </button>
            )}
            
            {/* Imagem de perfil */}
            <div className="relative">
              {user?.role === 'admin' ? (
                <UploadImage
                  currentImageUrl={images.profile}
                  onUpload={handleImageUpload('profile')}
                  collectionPath="config"
                  docId="landingImages"
                  field="profile"
                  isAdminOnly={true}
                  className="w-10 h-10 rounded-full border-2 border-accent"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white">
                  {images.profile ? (
                    <img src={images.profile} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">D</span>
                  )}
                </div>
              )}
            </div>
            
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
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        {images.hero && (
          <div className="absolute inset-0">
            <img src={images.hero} alt="Hero Background" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        
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
              className="w-32 h-20 rounded-lg border-2 border-white shadow-xl"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest mb-8">
                <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
                A Melhor Plataforma de Serviços em Moçambique
              </div>
              
              <div className="space-y-2 mb-8 min-h-[200px]">
                <AnimatePresence mode="wait">
                  {displayedPhrases.map((phrase, index) => (
                    <motion.h1
                      key={phrase}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.6 }}
                      className={`text-5xl md:text-7xl font-black leading-tight ${
                        index === 0 ? 'text-white' : index === 1 ? 'text-accent' : 'text-white'
                      }`}
                    >
                      {phrase}
                    </motion.h1>
                  ))}
                </AnimatePresence>
              </div>
              
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto lg:mx-0">
                Encontre os melhores profissionais para cuidar do seu lar em Moçambique.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register-cliente">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg rounded-2xl">
                    Solicitar Serviço
                  </Button>
                </Link>
                <Link to="/register-prestador">
                  <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl">
                    Quero ser Prestador
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-br from-accent to-orange-600 border-4 border-white/30 shadow-2xl">
                  <UploadImage
                    currentImageUrl={images.profile}
                    onUpload={handleImageUpload('profile')}
                    collectionPath="config"
                    docId="landingImages"
                    field="profile"
                    isAdminOnly={true}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Como <span className="text-accent">Funciona</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Em 4 passos simples você resolve todas as suas necessidades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -top-6 -right-6 text-8xl font-black text-gray-100 opacity-60">
                  {step.number}
                </div>
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6`}>
                    <step.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={feature.id} className="relative">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                    {images[feature.id as keyof Images] ? (
                      <img src={images[feature.id as keyof Images] as string} alt={feature.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <feature.icon className="w-16 h-16 text-accent/30" />
                      </div>
                    )}
                    
                    {/* BOTÃO DE UPLOAD PARA ADMIN */}
                    {user?.role === 'admin' && (
                      <div className="absolute bottom-2 right-2">
                        <UploadImage
                          currentImageUrl={images[feature.id as keyof Images]}
                          onUpload={handleImageUpload(feature.id as keyof Images)}
                          collectionPath="config"
                          docId="landingImages"
                          field={feature.id}
                          isAdminOnly={true}
                          label="Alterar"
                          className="w-10 h-10 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-black text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">
                    Profissionais verificados e qualidade garantida.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Parceiros</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="relative">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-50">
                    {images[`partner${num}` as keyof Images] ? (
                      <img src={images[`partner${num}` as keyof Images] as string} alt={`Partner ${num}`} className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* BOTÃO DE UPLOAD PARA ADMIN */}
                    {user?.role === 'admin' && (
                      <div className="absolute bottom-2 right-2">
                        <UploadImage
                          currentImageUrl={images[`partner${num}` as keyof Images]}
                          onUpload={handleImageUpload(`partner${num}` as keyof Images)}
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Pronto para começar?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Junte-se a milhares de moçambicanos que já confiam na DEXAPP.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/register-cliente">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl rounded-2xl">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
