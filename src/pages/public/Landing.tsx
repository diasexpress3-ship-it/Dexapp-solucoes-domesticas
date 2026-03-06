import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart, 
  Home, Phone, Info, Menu,
  Smartphone
} from 'lucide-react';
import { ProfileImageUpload } from '../../components/ui/ProfileImageUpload';
import { useAuth } from '../../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });
  
  // Estado para controlar a frase atual no título
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const phrases = [
    { text: "Soluções Domésticas", color: "text-white" },
    { text: "ao seu Alcance", color: "text-accent" },
    { text: "no seu Celular", color: "text-white" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval);
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
            {/* Profile Image Upload - Zona superior direita */}
            <ProfileImageUpload 
              currentImageUrl={user?.profileImageUrl}
              userId={user?.id}
              size="sm"
            />
            
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
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
                A Melhor Plataforma de Serviços em Moçambique
              </span>
              
              {/* Título com animação zoom in/out */}
              <div className="h-32 md:h-40 mb-6">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={currentPhraseIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className={`text-5xl md:text-7xl font-black ${phrases[currentPhraseIndex].color}`}
                  >
                    {phrases[currentPhraseIndex].text}
                  </motion.h1>
                </AnimatePresence>
              </div>
              
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium">
                Encontre os melhores profissionais para cuidar do seu lar em Moçambique. Rápido, seguro e confiável.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

              <div className="mt-16 flex items-center justify-center gap-8 text-sm font-bold text-white/60">
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
                <div className="absolute -top-6 -right-6 text-8xl font-black text-gray-100 opacity-60 group-hover:opacity-100 transition-opacity z-0">
                  {step.number}
                </div>
                
                {/* Card */}
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all z-10 overflow-hidden">
                  {/* Fundo gradiente no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
                    <step.icon size={36} />
                  </div>
                  
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors relative z-10">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 leading-relaxed relative z-10">
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

      {/* Categories Section */}
      <section className="py-24 bg-gray-50">
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
            {SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <Link to={`/servicos?cat=${cat.id}`}>
                  <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full transition-all hover:shadow-2xl hover:border-accent/20 relative overflow-hidden">
                    {/* Fundo gradiente animado */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Ícone animado */}
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
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/servicos" className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all">
              Ver todos os serviços
              <ArrowRight size={16} />
            </Link>
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
