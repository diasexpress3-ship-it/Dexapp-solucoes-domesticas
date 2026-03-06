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
  
  // DEBUG - Mostra o objeto completo
  console.log('👤 Usuário completo:', user);
  console.log('👑 profile:', user?.profile);
  console.log('👑 é admin?', user?.profile === 'admin');
  
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ======================================== */}
      {/* HEADER */}
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
            {/* BOTÃO ADMIN - CORRIGIDO: usa profile */}
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
                onClick={() => {/* implementar logout */}}
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
      {/* HERO SECTION */}
      {/* ======================================== */}
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
        
        {/* Upload hero - para admin */}
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

            {/* Imagem de perfil circular - COM UPLOAD PARA ADMIN */}
            <div className="flex justify-center items-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-br from-accent to-orange-600 border-4 border-white/30 shadow-2xl">
                  {isAdmin ? (
                    <UploadImage
                      currentImageUrl={images.profile}
                      onUpload={handleImageUpload('profile')}
                      collectionPath="config"
                      docId="landingImages"
                      field="profile"
                      isAdminOnly={true}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  ) : (
                    <img 
                      src={images.profile || 'https://via.placeholder.com/400'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PROCESS STEPS */}
      {/* ======================================== */}
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

      {/* ======================================== */}
      {/* FEATURES SECTION - COM UPLOAD PARA ADMIN */}
      {/* ======================================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Por que escolher a <span className="text-accent">DEX-app</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((num) => {
              const field = `feature${num}` as keyof Images;
              return (
                <div key={num} className="relative">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                      {images[field] ? (
                        <img src={images[field] as string} alt={`Feature ${num}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shield className="w-16 h-16 text-accent/30" />
                        </div>
                      )}
                      
                      {/* Botão de upload para admin */}
                      {isAdmin && (
                        <div className="absolute bottom-2 right-2">
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
                    
                    <h3 className="text-xl font-black text-primary mb-2">
                      {num === 1 && 'Segurança Total'}
                      {num === 2 && 'Atendimento Rápido'}
                      {num === 3 && 'Qualidade Garantida'}
                      {num === 4 && 'Suporte 24/7'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Profissionais verificados e qualidade garantida.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CATEGORIES SECTION - COM UPLOAD PARA ADMIN */}
      {/* ======================================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Serviços</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Explore nossas categorias e encontre o profissional ideal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES && SERVICE_CATEGORIES.length > 0 ? (
              SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => {
                const fieldName = CATEGORY_FIELDS[cat.name] || 'categoryReparacoes';
                return (
                  <div key={cat.id} className="group">
                    <Link to={`/servicos?cat=${cat.id}`}>
                      <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full hover:shadow-2xl transition-all">
                        {/* Imagem da categoria */}
                        <div className="relative h-32 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
                          {images[fieldName as keyof Images] ? (
                            <img 
                              src={images[fieldName as keyof Images] as string} 
                              alt={cat.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${cat.color} opacity-20`} />
                          )}
                          
                          {/* Botão de upload para admin */}
                          {isAdmin && (
                            <div className="absolute bottom-2 right-2">
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
                        
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6`}>
                          <cat.icon size={32} />
                        </div>
                        
                        <h3 className="text-xl font-black text-primary mb-3">{cat.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Profissionais qualificados prontos para atender.
                        </p>
                        
                        <div className="flex items-center text-accent font-black text-sm">
                          Ver detalhes 
                          <ArrowRight size={16} className="ml-2" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <p className="text-center col-span-3">Carregando categorias...</p>
            )}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PARTNERS SECTION - COM UPLOAD PARA ADMIN */}
      {/* ======================================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              Nossos <span className="text-accent">Parceiros</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((num) => {
              const field = `partner${num}` as keyof Images;
              return (
                <div key={num} className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-50">
                      {images[field] ? (
                        <img src={images[field] as string} alt={`Partner ${num}`} className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Botão de upload para admin */}
                      {isAdmin && (
                        <div className="absolute bottom-2 right-2">
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
                </div>
              );
            })}
          </div>
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
}

