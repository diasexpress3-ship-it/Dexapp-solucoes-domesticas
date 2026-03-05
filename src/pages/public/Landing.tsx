import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion, useInView } from 'framer-motion';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Zap, Heart
} from 'lucide-react';
import { useRef } from 'react';

export default function Landing() {
  const processRef = useRef(null);
  const isInView = useInView(processRef, { once: true, amount: 0.3 });

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
    <AppLayout>
      {/* Hero Section Melhorada */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Pattern SVG - CORRIGIDO */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" fill="#ffffff" fill-opacity="0.03"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-black uppercase tracking-widest mb-8"
            >
              <Sparkles className="inline w-4 h-4 mr-2 text-accent" />
              A Melhor Plataforma de Serviços em Moçambique
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            >
              Soluções Domésticas <br />
              <span className="text-accent relative">
                ao seu Alcance
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-3 bg-accent/30 -z-10"
                />
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed"
            >
              Encontre os melhores profissionais para cuidar do seu lar em Moçambique. Rápido, seguro e confiável.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/servicos">
                <Button 
                  variant="secondary" 
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
            </motion.div>

            {/* Indicadores de Confiança */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex items-center gap-8 text-sm font-bold text-white/60"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Processo Expresso Section - Conforme imagem */}
      <section ref={processRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
              O Processo <span className="text-accent">Expresso</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Em 4 passos simples você resolve todas as suas necessidades domésticas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                {/* Número grande no fundo */}
                <div className="absolute -top-4 -right-4 text-7xl font-black text-gray-100 opacity-50 group-hover:opacity-100 transition-opacity">
                  {step.number}
                </div>

                {/* Card */}
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                  {/* Ícone com gradiente */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <step.icon size={36} />
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>

                  {/* Descrição */}
                  <p className="text-sm text-gray-500 leading-relaxed">
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
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-primary mb-4"
            >
              O que você precisa hoje?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 max-w-2xl mx-auto"
            >
              Explore nossas categorias e encontre o profissional ideal para o seu serviço.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {SERVICE_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Link to={`/servicos?cat=${cat.id}`}>
                  <div className={`aspect-square rounded-3xl bg-gradient-to-br ${cat.color} p-6 flex flex-col items-center justify-center text-center text-white shadow-lg transition-all group-hover:shadow-2xl group-hover:scale-105`}>
                    <cat.icon size={40} className="mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm leading-tight">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Link para todas categorias */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link to="/servicos" className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all">
              Ver todos os serviços
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Segurança Total', desc: 'Profissionais verificados e antecedentes criminais checados.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Clock, title: 'Rapidez', desc: 'Encontre um prestador em minutos para serviços urgentes.', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Star, title: 'Qualidade', desc: 'Sistema de avaliações para garantir o melhor atendimento.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { icon: Users, title: 'Suporte 24/7', desc: 'Nossa central está sempre pronta para ajudar você.', color: 'text-green-500', bg: 'bg-green-50' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-center space-y-4 p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl">
                  <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mx-auto group-hover:scale-110 transition-transform`}>
                    <feature.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-3xl p-16 md:p-24 text-center text-white relative overflow-hidden"
          >
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-32 -mb-32 animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para começar?</h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Junte-se a milhares de moçambicanos que já confiam na DEXAPP para cuidar dos seus lares.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link to="/servicos">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-accent/30 transform hover:scale-105 transition-all"
                  >
                    Solicitar Serviço
                  </Button>
                </Link>
                <Link to="/register-prestador">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/20 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-2xl transform hover:scale-105 transition-all"
                  >
                    Seja um Prestador
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
