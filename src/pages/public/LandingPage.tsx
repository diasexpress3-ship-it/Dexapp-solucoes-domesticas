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
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Config } from '../../types';

export default function LandingPage() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'platform'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as Config);
      }
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: 'Clientes Satisfeitos', value: '5k+', icon: Users, color: 'text-blue-500' },
    { label: 'Prestadores Ativos', value: '1.2k+', icon: Briefcase, color: 'text-orange-500' },
    { label: 'Serviços Realizados', value: '15k+', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Avaliação Média', value: '4.9/5', icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config?.landingImagens?.hero || "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1920"} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-10"
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
              <span className="inline-block py-1 px-4 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest mb-6">
                A Melhor Plataforma de Serviços em Moçambique
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-primary leading-tight mb-8">
                Soluções para a sua casa, <br />
                <span className="text-accent">num clique.</span>
              </h1>
              <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
                Conectamos você aos melhores profissionais para limpeza, manutenção, obras e muito mais. Qualidade garantida e segurança total.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-10 text-lg bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20"
                  rightIcon={<ArrowRight size={20} />}
                  as={Link}
                  to="/register-cliente"
                >
                  Solicitar Serviço
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-10 text-lg rounded-2xl border-2"
                  as={Link}
                  to="/register-prestador"
                >
                  Seja um Prestador
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gray-50 ${stat.color} mb-4`}>
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
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-primary mb-4">O que você precisa hoje?</h2>
            <p className="text-gray-500 font-medium">Explore nossas categorias e encontre o profissional ideal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.map((cat, index) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    <cat.icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Profissionais qualificados prontos para atender suas necessidades de {cat.name.toLowerCase()}.
                  </p>
                  <div className="flex items-center text-accent font-black text-sm uppercase tracking-widest">
                    Ver detalhes <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Por que escolher a <span className="text-accent">DEXAPP?</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Segurança Total', desc: 'Todos os prestadores passam por uma rigorosa verificação de documentos e antecedentes.', icon: ShieldCheck },
                  { title: 'Rapidez no Atendimento', desc: 'Encontre um profissional em minutos e agende conforme sua disponibilidade.', icon: Clock },
                  { title: 'Qualidade Garantida', desc: 'Sistema de avaliações reais que garante a excelência em cada serviço prestado.', icon: TrendingUp },
                  { title: 'Pagamento Facilitado', desc: 'Pague com segurança via M-Pesa, E-Mola ou transferência bancária.', icon: TrendingUp },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src={config?.landingImagens?.feature1 || "https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=1000"} 
                  alt="Feature" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-accent p-8 rounded-3xl shadow-xl hidden md:block">
                <p className="text-4xl font-black mb-1">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Seguro & Confiável</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="bg-accent rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-orange-200">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Pronto para começar?</h2>
              <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto font-medium">
                Junte-se a milhares de moçambicanos que já utilizam a DEXAPP para facilitar o seu dia a dia.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-16 px-12 text-lg bg-white text-accent hover:bg-gray-100 rounded-2xl font-black"
                  as={Link}
                  to="/register-cliente"
                >
                  Criar Conta Grátis
                </Button>
                <Link to="/contacto" className="text-white font-black hover:underline">
                  Falar com suporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
