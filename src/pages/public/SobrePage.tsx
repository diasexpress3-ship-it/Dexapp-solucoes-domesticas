import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

export default function SobrePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    prestadores: 850,
    clientes: 5000,
    servicos: 12000,
    avaliacao: 4.9
  });

  const [images, setImages] = useState({
    team: null as string | null,
    office: null as string | null,
    work: null as string | null,
    mission: null as string | null,
    values: null as string | null,
    teamPhoto: null as string | null,
    history1: null as string | null,
    history2: null as string | null,
    history3: null as string | null,
  });

  const [loadingImage, setLoadingImage] = useState(false);

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

  // Buscar imagens da página Sobre
  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImage(true);
      try {
        const imagesRef = doc(db, 'config', 'sobreImages');
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

    fetchImages();

    // Listener em tempo real
    const unsubscribe = onSnapshot(doc(db, 'config', 'sobreImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = (field: string) => async (url: string) => {
    console.log(`Imagem ${field} atualizada:`, url);
    setImages(prev => ({ ...prev, [field]: url }));
    showToast('Imagem atualizada com sucesso!', 'success');
  };

  const values = [
    { icon: ShieldCheck, title: 'Segurança', desc: 'Verificamos rigorosamente todos os prestadores para sua tranquilidade.', color: 'from-blue-400 to-blue-600' },
    { icon: Target, title: 'Excelência', desc: 'Buscamos a perfeição em cada serviço prestado através da nossa plataforma.', color: 'from-accent to-orange-600' },
    { icon: Users, title: 'Comunidade', desc: 'Fortalecemos a economia local conectando talentos a oportunidades.', color: 'from-green-400 to-green-600' },
    { icon: Heart, title: 'Cuidado', desc: 'Tratamos cada casa como se fosse a nossa, com respeito e dedicação.', color: 'from-pink-400 to-pink-600' },
  ];

  const timeline = [
    { year: '2020', event: 'Fundação da DEXAPP', description: 'Iniciamos com a missão de revolucionar serviços domésticos em Moçambique.', icon: Rocket },
    { year: '2021', event: 'Primeiros 100 prestadores', description: 'Alcançamos a marca de 100 profissionais verificados na plataforma.', icon: Users },
    { year: '2022', event: 'Lançamento do App Mobile', description: 'Disponibilizamos nosso aplicativo para iOS e Android.', icon: Zap },
    { year: '2023', event: '+5000 clientes atendidos', description: 'Ultrapassamos a marca de 5 mil famílias atendidas com excelência.', icon: Award },
    { year: '2024', event: 'Expansão para outras cidades', description: 'Chegamos a novas províncias de Moçambique.', icon: Globe },
    { year: '2025', event: 'Reconhecimento nacional', description: 'Premiados como melhor plataforma de serviços domésticos.', icon: Star },
  ];

  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 pt-32 pb-24 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        {/* Imagem de fundo - editável por admin */}
        {images.mission && (
          <div className="absolute inset-0 opacity-10">
            <img src={images.mission} alt="Mission Background" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Upload da imagem de fundo - só admin vê */}
        {user?.role === 'admin' && (
          <div className="absolute bottom-4 right-4 z-20">
            <UploadImage 
              currentImageUrl={images.mission}
              onUpload={handleImageUpload('mission')}
              collectionPath="config"
              docId="sobreImages"
              field="mission"
              isAdminOnly={true}
              label="Alterar Fundo"
              className="w-32 h-20 rounded-lg"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black mb-6 leading-tight"
            >
              Transformando a forma como você cuida do seu <span className="text-accent">Lar</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl opacity-90 mb-8 leading-relaxed"
            >
              A DEXAPP nasceu da necessidade de conectar profissionais qualificados a famílias que buscam praticidade, segurança e confiança em serviços domésticos em Moçambique.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.prestadores}+</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">Prestadores Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.clientes}+</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">Clientes Satisfeitos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.servicos}+</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">Serviços Realizados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.avaliacao}</p>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-primary">Nossa Missão</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nossa missão é simplificar a vida das pessoas através de uma plataforma tecnológica intuitiva que garante acesso a serviços domésticos de alta qualidade, enquanto promove o empoderamento econômico de profissionais em Moçambique.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-primary">Nossos Compromissos</h3>
                <div className="space-y-3">
                  {[
                    'Praticidade no agendamento',
                    'Segurança garantida',
                    'Profissionais qualificados',
                    'Suporte dedicado 24/7'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-accent" size={20} />
                      <span className="font-bold text-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                className="mt-4" 
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigate('/register-prestador')}
              >
                Junte-se à nossa equipe
              </Button>
            </div>
            
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Imagem da equipe */}
              <img 
                src={images.team || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"} 
                alt="Equipe DEXAPP" 
                className="w-full h-full object-cover"
              />
              
              {/* Upload da imagem - só admin vê */}
              {user?.role === 'admin' && (
                <div className="absolute bottom-4 right-4">
                  <UploadImage 
                    currentImageUrl={images.team}
                    onUpload={handleImageUpload('team')}
                    collectionPath="config"
                    docId="sobreImages"
                    field="team"
                    isAdminOnly={true}
                    label="Alterar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 bg-accent p-6 rounded-2xl text-white shadow-xl">
                <p className="text-3xl font-black mb-1">+{stats.servicos}</p>
                <p className="text-xs font-bold uppercase tracking-wider">Serviços Realizados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-primary mb-4">Nossos Valores</h2>
            <p className="text-gray-500">O que nos guia todos os dias para oferecer o melhor serviço para você.</p>
          </div>
          
          {/* Imagem dos valores - editável por admin */}
          {user?.role === 'admin' && (
            <div className="mb-12 relative h-48 rounded-3xl overflow-hidden">
              <img 
                src={images.values || "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&q=80&w=800"} 
                alt="Valores" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <UploadImage 
                  currentImageUrl={images.values}
                  onUpload={handleImageUpload('values')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="values"
                  isAdminOnly={true}
                  label="Alterar Imagem"
                  className="w-12 h-12 rounded-full"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-lg transition-all group">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <value.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section ref={processRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-primary mb-4">Nossa História</h2>
            <p className="text-gray-500">Uma jornada de crescimento e dedicação aos nossos clientes.</p>
          </div>

          {/* Imagem da história - editável por admin */}
          <div className="mb-12 relative h-64 rounded-3xl overflow-hidden">
            <img 
              src={images.history1 || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} 
              alt="História DEXAPP" 
              className="w-full h-full object-cover"
            />
            {user?.role === 'admin' && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <UploadImage 
                  currentImageUrl={images.history1}
                  onUpload={handleImageUpload('history1')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="history1"
                  isAdminOnly={true}
                  label="Imagem 1"
                  className="w-12 h-12 rounded-full"
                />
                <UploadImage 
                  currentImageUrl={images.history2}
                  onUpload={handleImageUpload('history2')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="history2"
                  isAdminOnly={true}
                  label="Imagem 2"
                  className="w-12 h-12 rounded-full"
                />
                <UploadImage 
                  currentImageUrl={images.history3}
                  onUpload={handleImageUpload('history3')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="history3"
                  isAdminOnly={true}
                  label="Imagem 3"
                  className="w-12 h-12 rounded-full"
                />
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-accent/20 hidden lg:block" />
            
            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    idx % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="lg:w-1/2">
                    <Card className="border-none shadow-md hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-xl">
                            {item.year.slice(-2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-accent">{item.year}</p>
                            <h3 className="font-black text-primary">{item.event}</h3>
                          </div>
                        </div>
                        <p className="text-gray-500">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Image */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={images.office || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} 
              alt="Escritório DEXAPP" 
              className="w-full h-full object-cover"
            />
            
            {/* Upload da imagem do escritório - só admin vê */}
            {user?.role === 'admin' && (
              <div className="absolute bottom-4 right-4">
                <UploadImage 
                  currentImageUrl={images.office}
                  onUpload={handleImageUpload('office')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="office"
                  isAdminOnly={true}
                  label="Alterar"
                  className="w-12 h-12 rounded-full"
                />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end">
              <div className="p-12 text-white">
                <h3 className="text-3xl font-black mb-2">Nossa Equipe</h3>
                <p className="text-lg opacity-90 max-w-2xl">
                  Um time dedicado a conectar pessoas e transformar lares através de serviços de qualidade.
                </p>
                
                {/* Upload da foto da equipe - só admin vê */}
                {user?.role === 'admin' && (
                  <div className="mt-4">
                    <UploadImage 
                      currentImageUrl={images.teamPhoto}
                      onUpload={handleImageUpload('teamPhoto')}
                      collectionPath="config"
                      docId="sobreImages"
                      field="teamPhoto"
                      isAdminOnly={true}
                      label="Alterar Foto da Equipe"
                      className="w-32 h-20 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-blue-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-accent/5 -skew-y-6 translate-y-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para começar?</h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Junte-se a milhares de famílias que já confiam na DEXAPP para cuidar do seu lar.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 w-full md:w-auto"
                  onClick={() => navigate('/register-cliente')}
                >
                  Contratar Agora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 w-full md:w-auto"
                  onClick={() => navigate('/register-prestador')}
                >
                  Quero ser Prestador
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// Ícone Rocket (se não existir no lucide-react)
const Rocket = (props: any) => (
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
