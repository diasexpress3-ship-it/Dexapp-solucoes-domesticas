import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, Camera
} from 'lucide-react';
import { UploadImage } from '../../components/ui/UploadImage';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Landing() {
  const { user } = useAuth();
  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedPhrases, setDisplayedPhrases] = useState<string[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  const phrases = [
    "Soluções Domésticas",
    "ao seu Alcance",
    "no seu Celular"
  ];

  // Buscar imagem do Firestore quando o usuário estiver logado
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.profileImageUrl) {
              setProfileImageUrl(data.profileImageUrl);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar imagem de perfil:", error);
        }
      }
    };

    fetchProfileImage();
  }, [user?.id]);

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

  const handleImageUpload = (url: string) => {
    console.log('Imagem carregada com sucesso:', url);
    setProfileImageUrl(url);
  };

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
                
                {/* Título com animação de acúmulo */}
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

            {/* Lado direito - Moldura circular para imagem */}
            <div className="flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Círculo externo decorativo */}
                <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse"></div>
                
                {/* Círculo do meio decorativo */}
                <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"></div>
                
                {/* Moldura circular para upload de imagem */}
                <div className="absolute inset-8 rounded-full overflow-hidden bg-gradient-to-br from-accent/30 to-orange-600/30 border-4 border-white/30 shadow-2xl">
                  <UploadImage 
                    currentImageUrl={profileImageUrl}
                    onUpload={handleImageUpload}
                    collectionPath="users"
                    docId={user?.id}
                    field="profileImageUrl"
                    isAdminOnly={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Ícone de câmera decorativo (quando não tem imagem) */}
                {!profileImageUrl && (
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resto do código permanece igual */}
      {/* ... */}
    </div>
  );
}
