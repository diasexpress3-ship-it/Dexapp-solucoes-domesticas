import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Star,
  Users,
  Briefcase,
  TrendingUp,
  MapPin,
  Search,
  UserCheck,
  CreditCard,
  ThumbsUp,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Config } from '../../types';

export default function LandingPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'platform'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as Config);
      }
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: 'Clientes Satisfeitos', value: '5k+', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Prestadores Ativos', value: '1.2k+', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Serviços Realizados', value: '15k+', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Avaliação Média', value: '4.9/5', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

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
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config?.landingImagens?.hero || "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1920"} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-10 scale-105 animate-slow-zoom"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block py-1 px-4 rounded-full bg-gradient-to-r from-accent/20 to-accent/5 text-accent text-xs font-black uppercase tracking-widest mb-6 border border-accent/20"
              >
                <Sparkles className="inline w-3 h-3 mr-1" />
                A Melhor Plataforma de Serviços em Moçambique
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black text-primary leading-tight mb-8"
              >
                Soluções para a sua casa, <br />
                <span className="text-accent relative inline-block">
                  num clique.
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-2 left-0 h-3 bg-accent/20 -z-10"
                  />
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium"
              >
                Conectamos você aos melhores profissionais para limpeza, manutenção, obras e muito mais. Qualidade garantida e segurança total.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-10 text-lg bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transform hover:scale-105 transition-all"
                  rightIcon={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  as={Link}
                  to="/register-cliente"
                >
                  Solicitar Serviço
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-10 text-lg rounded-2xl border-2 border-primary/20 hover:border-accent hover:bg-accent hover:text-white transition-all transform hover:scale-105"
                  as={Link}
                  to="/register-prestador"
                >
                  Seja um Prestador
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-16 flex items-center justify-center gap-8 text-sm font-bold text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section - O Processo Expresso */}
      <section ref={processRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <span className="text-accent font-black text-sm uppercase tracking-widest mb-4 block">Como Funciona</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              O Processo <span className="text-accent">Expresso</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              Em 4 passos simples você resolve todas as suas necessidades domésticas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl transform group-hover:scale-105 transition-all duration-300" />
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform`}>
                      <step.icon size={28} />
                    </div>
                    <span className="text-5xl font-black text-gray-100">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`${stat.bg} p-8 rounded-3xl border border-gray-100 text-center hover:shadow-xl transition-all`}
              >
                <div className={`inline-flex p-4 rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
                  <stat.icon size={32} />
                </div>
                <h3 className="text-3xl font-black text-primary mb-1">{stat.value}</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-primary mb-4">O que você precisa hoje?</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              Explore nossas categorias e encontre o profissional ideal para cada necessidade
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.slice(0, 6).map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 h-full transition-all hover:shadow-2xl hover:border-accent/20">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <cat.icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {cat.description || `Profissionais qualificados prontos para atender suas necessidades de ${cat.name.toLowerCase()}.`}
                  </p>
                  <div className="flex items-center text-accent font-black text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
                    Ver detalhes 
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-black text-sm uppercase tracking-widest mb-4 block">Diferenciais</span>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Por que escolher a <span className="text-accent">DEXAPP?</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Segurança Total', desc: 'Todos os prestadores passam por uma rigorosa verificação de documentos e antecedentes.', icon: ShieldCheck },
                  { title: 'Rapidez no Atendimento', desc: 'Encontre um profissional em minutos e agende conforme sua disponibilidade.', icon: Clock },
                  { title: 'Qualidade Garantida', desc: 'Sistema de avaliações reais que garante a excelência em cada serviço prestado.', icon: TrendingUp },
                  { title: 'Pagamento Facilitado', desc: 'Pague com segurança via M-Pesa, E-Mola ou transferência bancária.', icon: CreditCard },
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={config?.landingImagens?.feature1 || "https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=1000"} 
                  alt="Feature" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-10 -left-10 bg-accent p-8 rounded-3xl shadow-xl hidden md:block"
              >
                <p className="text-4xl font-black mb-1">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Seguro & Confiável</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-accent to-orange-600 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mb-32 animate-pulse delay-700"></div>
            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-black mb-8"
              >
                Pronto para começar?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl opacity-90 mb-12 max-w-2xl mx-auto font-medium"
              >
                Junte-se a milhares de moçambicanos que já utilizam a DEXAPP para facilitar o seu dia a dia.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-12 text-lg bg-white text-accent hover:bg-gray-100 rounded-2xl font-black transform hover:scale-105 transition-all shadow-xl"
                  as={Link}
                  to="/register-cliente"
                >
                  Criar Conta Grátis
                </Button>
                <Link to="/contacto" className="text-white font-black hover:underline hover:text-white/80 transition-colors">
                  Falar com suporte
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
