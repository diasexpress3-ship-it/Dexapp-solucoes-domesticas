import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { UploadImage } from '../../components/ui/UploadImage';
import { 
  Target, 
  Users, 
  ShieldCheck, 
  Heart,
  CheckCircle2,
  ArrowRight,
  Star,
  Award,
  Globe,
  TrendingUp,
  Briefcase,
  Clock,
  Zap,
  Camera,
  Home,
  ArrowLeft,
  Sparkles,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// ÍCONE CUSTOMIZADO (Rocket não existe no lucide-react)
// ============================================
const RocketIcon = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// ============================================
// INTERFACES
// ============================================
interface Stats {
  prestadores: number;
  clientes: number;
  servicos: number;
  avaliacao: number;
  cidades: number;
  satisfacao: number;
}

interface Images {
  team: string | null;
  office: string | null;
  work: string | null;
  mission: string | null;
  values: string | null;
  teamPhoto: string | null;
  history1: string | null;
  history2: string | null;
  history3: string | null;
  aboutHero: string | null;
  aboutMission: string | null;
  aboutVision: string | null;
}

// ============================================
// CONSTANTES
// ============================================
const VALUES = [
  { 
    icon: ShieldCheck, 
    title: 'Segurança', 
    description: 'Verificamos rigorosamente todos os prestadores para sua tranquilidade.', 
    color: 'from-blue-400 to-blue-600',
  },
  { 
    icon: Target, 
    title: 'Excelência', 
    description: 'Buscamos a perfeição em cada serviço prestado através da nossa plataforma.', 
    color: 'from-accent to-orange-600',
  },
  { 
    icon: Users, 
    title: 'Comunidade', 
    description: 'Fortalecemos a economia local conectando talentos a oportunidades.', 
    color: 'from-green-400 to-green-600',
  },
  { 
    icon: Heart, 
    title: 'Cuidado', 
    description: 'Tratamos cada casa como se fosse a nossa, com respeito e dedicação.', 
    color: 'from-pink-400 to-pink-600',
  },
];

const TIMELINE = [
  { 
    year: '2020', 
    event: 'Fundação da DEXAPP', 
    description: 'Iniciamos com a missão de revolucionar serviços domésticos em Moçambique.', 
    icon: RocketIcon,
    color: 'from-purple-400 to-purple-600'
  },
  { 
    year: '2021', 
    event: 'Primeiros 100 prestadores', 
    description: 'Alcançamos a marca de 100 profissionais verificados na plataforma.', 
    icon: Users,
    color: 'from-blue-400 to-blue-600'
  },
  { 
    year: '2022', 
    event: 'Lançamento do App Mobile', 
    description: 'Disponibilizamos nosso aplicativo para iOS e Android.', 
    icon: Zap,
    color: 'from-yellow-400 to-yellow-600'
  },
  { 
    year: '2023', 
    event: '+5000 clientes atendidos', 
    description: 'Ultrapassamos a marca de 5 mil famílias atendidas com excelência.', 
    icon: Award,
    color: 'from-green-400 to-green-600'
  },
  { 
    year: '2024', 
    event: 'Expansão para outras cidades', 
    description: 'Chegamos a novas províncias de Moçambique, incluindo Nampula e Beira.', 
    icon: Globe,
    color: 'from-indigo-400 to-indigo-600'
  },
  { 
    year: '2025', 
    event: 'Reconhecimento nacional', 
    description: 'Premiados como melhor plataforma de serviços domésticos em Moçambique.', 
    icon: Star,
    color: 'from-accent to-orange-600'
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SobrePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    prestadores: 850,
    clientes: 5000,
    servicos: 12000,
    avaliacao: 4.9,
    cidades: 12,
    satisfacao: 98
  });

  const [images, setImages] = useState<Images>({
    team: null,
    office: null,
    work: null,
    mission: null,
    values: null,
    teamPhoto: null,
    history1: null,
    history2: null,
    history3: null,
    aboutHero: null,
    aboutMission: null,
    aboutVision: null,
  });

  // Buscar estatísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRef = doc(db, 'config', 'estatisticas');
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          setStats(prev => ({ ...prev, ...statsSnap.data() }));
        }
      } catch (error) {
        console.warn('Usando estatísticas padrão');
      }
    };
    fetchStats();
  }, []);

  // Buscar imagens
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = doc(db, 'config', 'sobreImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        } else {
          await setDoc(imagesRef, { id: 'sobreImages' });
        }
      } catch (error) {
        console.error("Erro ao buscar imagens:", error);
      }
    };

    fetchImages();

    const unsubscribe = onSnapshot(doc(db, 'config', 'sobreImages'), (doc) => {
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
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-blue-900 pt-32 pb-24 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl" />
        </div>
        
        {images.aboutHero && (
          <div className="absolute inset-0">
            <img 
              src={images.aboutHero} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-10"
              loading="lazy"
            />
          </div>
        )}
        
        {user?.role === 'admin' && (
          <div className="absolute bottom-4 right-4 z-20">
            <UploadImage
              currentImageUrl={images.aboutHero}
              onUpload={handleImageUpload('aboutHero')}
              collectionPath="config"
              docId="sobreImages"
              field="aboutHero"
              isAdminOnly={true}
              label="Alterar Fundo"
              className="w-32 h-20 rounded-lg border-2 border-white/30 shadow-xl"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-8">
              <button
                onClick={() => navigate('/')}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Home size={14} />
                Início
              </button>
              <span>/</span>
              <span className="text-accent font-bold">Sobre Nós</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Transformando a forma como você cuida do seu{' '}
              <span className="text-accent">Lar</span>
            </h1>
            
            <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl">
              A DEXAPP nasceu da necessidade de conectar profissionais qualificados a famílias que buscam praticidade, 
              segurança e confiança em serviços domésticos em Moçambique.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, text: '+5 anos de experiência' },
                { icon: Users, text: '+5000 clientes' },
                { icon: MapPin, text: '12 cidades' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <item.icon size={16} className="text-accent" />
                  <span className="text-sm font-bold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: 'Prestadores', value: stats.prestadores, icon: Briefcase, suffix: '+' },
              { label: 'Clientes', value: stats.clientes, icon: Users, suffix: '+' },
              { label: 'Serviços', value: stats.servicos, icon: Zap, suffix: '+' },
              { label: 'Avaliação', value: stats.avaliacao, icon: Star, suffix: '' },
              { label: 'Cidades', value: stats.cidades, icon: MapPin, suffix: '' },
              { label: 'Satisfação', value: stats.satisfacao, icon: Heart, suffix: '%' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-accent" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-primary mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Valores</span>
            </h2>
            <p className="text-gray-500 text-lg">
              O que nos guia todos os dias para oferecer o melhor serviço.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all group">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <value.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossa <span className="text-accent">História</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Uma jornada de crescimento e dedicação aos nossos clientes.
            </p>
          </div>

          <div className="space-y-8">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-start">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-black text-xl shadow-lg`}>
                  {item.year.slice(-2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-primary mb-2">{item.event}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={images.office || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"} 
              alt="Equipa DEXAPP" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end">
              <div className="p-12 text-white">
                <h3 className="text-4xl font-black mb-4">
                  +{stats.prestadores} Profissionais
                </h3>
                <p className="text-xl opacity-90 max-w-2xl mb-6">
                  Uma equipa dedicada a conectar pessoas e transformar lares.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate('/register-prestador')}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Junte-se à equipa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/contacto')}
                    className="border-white text-white hover:bg-white/10"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Fale connosco
                  </Button>
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="absolute top-4 right-4 flex gap-2">
                <UploadImage
                  currentImageUrl={images.office}
                  onUpload={handleImageUpload('office')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="office"
                  isAdminOnly={true}
                  label="Escritório"
                  className="w-12 h-12 rounded-full shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mb-32 animate-pulse" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                Faça parte da nossa <span className="text-accent">história</span>
              </h2>
              
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                Junte-se a milhares de famílias e profissionais que já transformaram suas vidas com a DEXAPP.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Button
                  size="lg"
                  onClick={() => navigate('/register-cliente')}
                  className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl rounded-2xl shadow-xl shadow-accent/30"
                >
                  Quero contratar
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register-prestador')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl"
                >
                  Quero trabalhar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
