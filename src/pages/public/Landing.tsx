import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion } from 'framer-motion';
import { 
  Shield, Clock, Star, Users, 
  Search, UserCheck, CreditCard, ThumbsUp,
  Sparkles, ArrowRight, Heart
} from 'lucide-react';

export default function Landing() {
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
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-primary to-blue-900 text-white">
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
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Soluções Domésticas <br />
                <span className="text-accent">ao seu Alcance</span>
              </h1>
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
      <section className="py-24 bg-white">
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
              <div key={index} className="relative group">
                <div className="absolute -top-4 -right-4 text-7xl font-black text-gray-100 opacity-50 group-hover:opacity-100 transition-opacity">
                  {step.number}
                </div>
                <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <step.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
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
          </div>
        </div>
      </section>
    </div>
  );
}
