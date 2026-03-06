import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { UploadImage } from '../../components/ui/UploadImage'; // Versão melhorada
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
  Rocket,
  Sparkles,
  MapPin,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

// ============================================
// INTERFACES E TIPOS
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

interface TimelineItem {
  year: string;
  event: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface ValueItem {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  stats?: string;
}

// ============================================
// CONSTANTES
// ============================================
const VALUES: ValueItem[] = [
  { 
    icon: ShieldCheck, 
    title: 'Segurança', 
    description: 'Verificamos rigorosamente todos os prestadores para sua tranquilidade.', 
    color: 'from-blue-400 to-blue-600',
    stats: '100% verificado'
  },
  { 
    icon: Target, 
    title: 'Excelência', 
    description: 'Buscamos a perfeição em cada serviço prestado através da nossa plataforma.', 
    color: 'from-accent to-orange-600',
    stats: '4.9 ★ média'
  },
  { 
    icon: Users, 
    title: 'Comunidade', 
    description: 'Fortalecemos a economia local conectando talentos a oportunidades.', 
    color: 'from-green-400 to-green-600',
    stats: '+500 famílias'
  },
  { 
    icon: Heart, 
    title: 'Cuidado', 
    description: 'Tratamos cada casa como se fosse a nossa, com respeito e dedicação.', 
    color: 'from-pink-400 to-pink-600',
    stats: '24/7 suporte'
  },
];

const TIMELINE: TimelineItem[] = [
  { 
    year: '2020', 
    event: 'Fundação da DEXAPP', 
    description: 'Iniciamos com a missão de revolucionar serviços domésticos em Moçambique.', 
    icon: Rocket,
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
    description: 'Disponibilizamos nosso aplicativo para iOS e Android com tecnologia de ponta.', 
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
  { 
    year: '2026', 
    event: 'Inovação contínua', 
    description: 'Lançamos novas funcionalidades com IA para melhorar a experiência.', 
    icon: Sparkles,
    color: 'from-cyan-400 to-cyan-600'
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SobrePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const controls = useAnimation();
  
  // Refs para animações
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Estados
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

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'historia' | 'missao' | 'valores'>('historia');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Hooks de visão para animações
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.1 });

  // ============================================
  // BUSCAR ESTATÍSTICAS
  // ============================================
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

  // ============================================
  // BUSCAR IMAGENS DA PÁGINA SOBRE
  // ============================================
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const imagesRef = doc(db, 'config', 'sobreImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        } else {
          // Criar documento se não existir
          await setDoc(imagesRef, { id: 'sobreImages' });
        }
      } catch (error) {
        console.error("Erro ao buscar imagens:", error);
        showToast?.('Erro ao carregar imagens', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // Listener em tempo real
    const unsubscribe = onSnapshot(doc(db, 'config', 'sobreImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  // ============================================
  // HANDLER DE UPLOAD
  // ============================================
  const handleImageUpload = useCallback((field: keyof Images) => (url: string) => {
    console.log(`✨ Imagem ${field} atualizada:`, url);
    setImages(prev => ({ ...prev, [field]: url }));
    showToast?.('Imagem atualizada com sucesso!', 'success');
  }, [showToast]);

  // ============================================
  // ATUALIZAR ESTATÍSTICAS (admin)
  // ============================================
  const handleUpdateStats = useCallback(async () => {
    if (user?.role !== 'admin') return;

    try {
      const statsRef = doc(db, 'config', 'estatisticas');
      await updateDoc(statsRef, stats);
      showToast?.('Estatísticas atualizadas!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar stats:', error);
      showToast?.('Erro ao atualizar estatísticas', 'error');
    }
  }, [stats, user?.role, showToast]);

  // ============================================
  // RENDERIZAÇÃO
  // ============================================
  return (
    <AppLayout>
      {/* ======================================== */}
      {/* HERO SECTION - Versão 2026 */}
      {/* ======================================== */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-primary via-primary to-blue-900 pt-32 pb-24 text-white overflow-hidden"
      >
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isHeroInView ? { opacity: 0.2, scale: 1 } : {}}
            transition={{ duration: 1 }}
            className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isHeroInView ? { opacity: 0.2, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl"
          />
          
          {/* Partículas animadas */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: [-20, -40],
                x: Math.sin(i) * 20
              }}
              transition={{ 
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: 'loop'
              }}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
        
        {/* Imagem de fundo hero */}
        {images.aboutHero && (
          <div className="absolute inset-0">
            <img 
              src={images.aboutHero} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-10"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
          </div>
        )}
        
        {/* Upload da imagem hero - só admin vê */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 right-4 z-20"
          >
            <UploadImage
              currentImageUrl={images.aboutHero}
              onUpload={handleImageUpload('aboutHero')}
              collectionPath="config"
              docId="sobreImages"
              field="aboutHero"
              isAdminOnly={true}
              label="Alterar Fundo"
              className="w-32 h-20 rounded-lg border-2 border-white/30 shadow-xl hover:scale-105 transition-transform"
            />
          </motion.div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Breadcrumb */}
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

            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            >
              Transformando a forma como você cuida do seu{' '}
              <span className="text-accent relative inline-block">
                Lar
                <motion.span
                  initial={{ width: 0 }}
                  animate={isHeroInView ? { width: '100%' } : {}}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-0 left-0 h-1 bg-accent"
                />
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl"
            >
              A DEXAPP nasceu da necessidade de conectar profissionais qualificados a famílias que buscam praticidade, 
              segurança e confiança em serviços domésticos em Moçambique.
            </motion.p>

            {/* Selos de qualidade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================================== */}
      {/* STATS SECTION - Versão 2026 */}
      {/* ======================================== */}
      <section ref={statsRef} className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { label: 'Prestadores', value: stats.prestadores, icon: Briefcase, suffix: '+' },
              { label: 'Clientes', value: stats.clientes, icon: Users, suffix: '+' },
              { label: 'Serviços', value: stats.servicos, icon: Zap, suffix: '+' },
              { label: 'Avaliação', value: stats.avaliacao, icon: Star, suffix: '', decimals: 1 },
              { label: 'Cidades', value: stats.cidades, icon: MapPin, suffix: '' },
              { label: 'Satisfação', value: stats.satisfacao, icon: Heart, suffix: '%' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center group cursor-default"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-orange-600/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-accent" />
                </div>
                <motion.p 
                  className="text-3xl md:text-4xl font-black text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={isStatsInView ? { scale: 1 } : {}}
                  transition={{ type: 'spring', delay: index * 0.15 }}
                >
                  {stat.value.toLocaleString()}{stat.suffix}
                </motion.p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Botão admin para editar stats */}
          {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isStatsInView ? { opacity: 1 } : {}}
              className="text-center mt-8"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateStats}
                className="border-accent text-accent hover:bg-accent hover:text-white"
              >
                Atualizar Estatísticas
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ======================================== */}
      {/* MISSION & VISION SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Tabs de navegação */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-2xl shadow-md">
              {[
                { id: 'historia', label: 'Nossa História' },
                { id: 'missao', label: 'Missão & Visão' },
                { id: 'valores', label: 'Valores' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent text-white'
                      : 'text-gray-600 hover:text-accent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* História */}
            {activeTab === 'historia' && (
              <motion.div
                key="historia"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-8">
                  <h2 className="text-4xl font-black text-primary">
                    Nossa <span className="text-accent">Jornada</span>
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Desde 2020, temos trabalhado incansavelmente para conectar famílias moçambicanas 
                    aos melhores profissionais de serviços domésticos. Nossa história é feita de 
                    dedicação, inovação e compromisso com a excelência.
                  </p>
                  <div className="space-y-4">
                    {[
                      'Começamos com uma pequena equipa de 3 pessoas',
                      'Hoje somos mais de 50 colaboradores',
                      'Presentes em 12 cidades de Moçambique',
                      'Mais de 12.000 serviços realizados com sucesso'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        </div>
                        <span className="font-bold text-primary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                  <img 
                    src={images.history1 || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} 
                    alt="História DEXAPP" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Upload button para admin */}
                  {user?.role === 'admin' && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadImage
                        currentImageUrl={images.history1}
                        onUpload={handleImageUpload('history1')}
                        collectionPath="config"
                        docId="sobreImages"
                        field="history1"
                        isAdminOnly={true}
                        label="Alterar"
                        className="w-12 h-12 rounded-full shadow-xl"
                      />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            )}

            {/* Missão & Visão */}
            {activeTab === 'missao' && (
              <motion.div
                key="missao"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Missão */}
                <Card className="border-none shadow-xl hover:shadow-2xl transition-all group">
                  <CardContent className="p-8">
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                      <img 
                        src={images.aboutMission || "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&q=80&w=800"} 
                        alt="Missão" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {user?.role === 'admin' && (
                        <div className="absolute bottom-2 right-2">
                          <UploadImage
                            currentImageUrl={images.aboutMission}
                            onUpload={handleImageUpload('aboutMission')}
                            collectionPath="config"
                            docId="sobreImages"
                            field="aboutMission"
                            isAdminOnly={true}
                            label="Alterar"
                            className="w-10 h-10 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4 flex items-center gap-2">
                      <Target className="text-accent" />
                      Nossa Missão
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Simplificar a vida das pessoas através de uma plataforma tecnológica intuitiva 
                      que garante acesso a serviços domésticos de alta qualidade, enquanto promove o 
                      empoderamento econômico de profissionais em Moçambique.
                    </p>
                  </CardContent>
                </Card>

                {/* Visão */}
                <Card className="border-none shadow-xl hover:shadow-2xl transition-all group">
                  <CardContent className="p-8">
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                      <img 
                        src={images.aboutVision || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"} 
                        alt="Visão" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {user?.role === 'admin' && (
                        <div className="absolute bottom-2 right-2">
                          <UploadImage
                            currentImageUrl={images.aboutVision}
                            onUpload={handleImageUpload('aboutVision')}
                            collectionPath="config"
                            docId="sobreImages"
                            field="aboutVision"
                            isAdminOnly={true}
                            label="Alterar"
                            className="w-10 h-10 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4 flex items-center gap-2">
                      <Globe className="text-accent" />
                      Nossa Visão
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Ser a plataforma referência em serviços domésticos em toda África, reconhecida 
                      pela qualidade, inovação e impacto social positivo nas comunidades onde atuamos.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Valores */}
            {activeTab === 'valores' && (
              <motion.div
                key="valores"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {VALUES.map((value, i) => (
                  <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    {/* Fundo gradiente no hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                        <value.icon size={36} />
                      </div>
                      
                      {/* Badge de estatística */}
                      <div className="absolute top-4 right-4">
                        <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 rounded-full">
                          {value.stats}
                        </span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ======================================== */}
      {/* TIMELINE SECTION - Versão 2026 */}
      {/* ======================================== */}
      <section ref={timelineRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isTimelineInView ? { opacity: 1, y: 0 } : {}}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossa <span className="text-accent">Evolução</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Uma jornada de crescimento, inovação e dedicação aos nossos clientes.
            </p>
          </motion.div>

          {/* Linha do tempo interativa */}
          <div className="relative">
            {/* Linha central decorativa */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-accent/20 via-accent to-accent/20 hidden lg:block" />
            
            <div className="space-y-12">
              {TIMELINE.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const isSelected = selectedYear === item.year;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    animate={isTimelineInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: idx * 0.15 }}
                    className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                      isEven ? 'lg:flex-row-reverse' : ''
                    }`}
                    onClick={() => setSelectedYear(isSelected ? null : item.year)}
                  >
                    {/* Card do evento */}
                    <div className="lg:w-1/2">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'scale-105' : ''
                        }`}
                      >
                        <Card className={`border-none shadow-md hover:shadow-2xl transition-all overflow-hidden ${
                          isSelected ? 'ring-2 ring-accent' : ''
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-black text-xl shadow-lg`}>
                                {item.year.slice(-2)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-accent mb-1">{item.year}</p>
                                <h3 className="font-black text-primary text-lg">{item.event}</h3>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-100"
                                >
                                  <p className="text-gray-500">{item.description}</p>
                                  
                                  {/* Ícone decorativo */}
                                  <div className="absolute -bottom-4 -right-4 opacity-10">
                                    <item.icon size={80} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                    
                    {/* Indicador na linha do tempo */}
                    <div className="lg:w-1/2 flex justify-center">
                      <motion.div
                        animate={isSelected ? { scale: 1.5 } : { scale: 1 }}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} shadow-lg cursor-pointer`}
                        onClick={() => setSelectedYear(isSelected ? null : item.year)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* TEAM SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossa <span className="text-accent">Equipa</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Conheça as pessoas dedicadas que tornam tudo possível.
            </p>
          </motion.div>

          <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
            <img 
              src={images.office || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"} 
              alt="Equipa DEXAPP" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            
            {/* Overlay com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent flex items-end">
              <div className="p-12 text-white">
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl font-black mb-4"
                >
                  +{stats.prestadores} Profissionais
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-xl opacity-90 max-w-2xl mb-6"
                >
                  Uma equipa dedicada a conectar pessoas e transformar lares através de serviços de qualidade.
                </motion.p>
                
                {/* Botões de ação */}
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

            {/* Upload buttons para admin */}
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
                <UploadImage
                  currentImageUrl={images.teamPhoto}
                  onUpload={handleImageUpload('teamPhoto')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="teamPhoto"
                  isAdminOnly={true}
                  label="Equipa"
                  className="w-12 h-12 rounded-full shadow-xl"
                />
              </div>
            )}
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
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mb-32 animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
            
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-black mb-6"
              >
                Faça parte da nossa <span className="text-accent">história</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
              >
                Junte-se a milhares de famílias e profissionais que já transformaram suas vidas com a DEXAPP.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/register-cliente')}
                  className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-xl rounded-2xl shadow-xl shadow-accent/30 transform hover:scale-105 transition-all"
                >
                  Quero contratar
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register-prestador')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl transform hover:scale-105 transition-all backdrop-blur-sm"
                >
                  Quero trabalhar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
