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
  Home, LogOut
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
    console.log(`📸 Upload da imagem ${field}:`, url);
    setImages(prev => ({ ...prev, [field]: url }));
  }, []);

  // CORREÇÃO: usar profile em vez de role
  const isAdmin = user?.profile === 'admin';

  // Função para navegar para o dashboard com verificação
  const goToAdminDashboard = () => {
    console.log('🔘 Clicou no botão Painel Admin');
    console.log('👤 Usuário:', user);
    console.log('👑 isAdmin:', isAdmin);
    
    if (isAdmin) {
      console.log('✅ Navegando para /admin/dashboard');
      navigate('/admin/dashboard');
    } else {
      console.log('❌ Usuário não é admin');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ======================================== */}
      {/* HEADER - CORRIGIDO */}
      {/* ======================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg py-4 border-b border-gray-100">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
              D
            </div>
            <span className="text-xl font-black text-primary">
              DEX<span className="text-accent">-app</span>
            </span>
          </Link>
          
          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-accent border-b-2 border-accent">Início</Link>
            <Link to="/servicos" className="text-sm font-bold text-gray-600 hover:text-accent">Serviços</Link>
            <Link to="/sobre" className="text-sm font-bold text-gray-600 hover:text-accent">Sobre</Link>
            <Link to="/contacto" className="text-sm font-bold text-gray-600 hover:text-accent">Contacto</Link>
          </nav>

          {/* Área do usuário */}
          <div className="flex items-center gap-4">
            {/* BOTÃO ADMIN - CORRIGIDO com função direta */}
            {isAdmin && (
              <Button
                onClick={goToAdminDashboard}
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-white flex items-center gap-2"
                leftIcon={<LayoutDashboard size={16} />}
              >
                Painel Admin
              </Button>
            )}
            
            {/* BOTÃO INÍCIO - Volta para Landing */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-accent transition-colors"
              title="Ir para Início"
            >
              <Home size={20} />
              <span className="text-sm font-bold hidden sm:inline">Início</span>
            </button>
            
            {/* Texto "Administrador" - Apenas indicador visual */}
            {isAdmin && (
              <span className="text-sm font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                Administrador
              </span>
            )}
            
            {/* Avatar - UploadImage para admin */}
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
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white shadow-lg">
                  {images.profile ? (
                    <img src={images.profile} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">D</span>
                  )}
                </div>
              )}
            </div>

            {/* Botão Sair (apenas se logado) */}
            {user && (
              <button
                onClick={() => console.log('Logout')}
                className="text-gray-400 hover:text-rose-600 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ======================================== */}
      {/* TODO O RESTO DO CONTEÚDO PERMANECE IGUAL */}
      {/* ======================================== */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        {/* ... conteúdo existente ... */}
      </section>

      {/* ... todas as outras seções ... */}
      
    </div>
  );
}
