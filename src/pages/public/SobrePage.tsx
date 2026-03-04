import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { 
  Target, 
  Users, 
  ShieldCheck, 
  Heart,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function SobrePage() {
  const navigate = useNavigate();

  const values = [
    { icon: ShieldCheck, title: 'Segurança', desc: 'Verificamos rigorosamente todos os prestadores para sua tranquilidade.' },
    { icon: Target, title: 'Excelência', desc: 'Buscamos a perfeição em cada serviço prestado através da nossa plataforma.' },
    { icon: Users, title: 'Comunidade', desc: 'Fortalecemos a economia local conectando talentos a oportunidades.' },
    { icon: Heart, title: 'Cuidado', desc: 'Tratamos cada casa como se fosse a nossa, com respeito e dedicação.' },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12 translate-x-1/4" />
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
              className="text-xl opacity-80 mb-8 leading-relaxed"
            >
              A DEXAPP nasceu da necessidade de conectar profissionais qualificados a famílias que buscam praticidade, segurança e confiança em serviços domésticos em Moçambique.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-primary">Nossa Missão</h2>
              <p className="text-gray-600 leading-relaxed">
                Nossa missão é simplificar a vida das pessoas através de uma plataforma tecnológica intuitiva que garante acesso a serviços domésticos de alta qualidade, enquanto promove o empoderamento econômico de profissionais em Moçambique.
              </p>
              <div className="space-y-3">
                {['Praticidade no agendamento', 'Segurança garantida', 'Profissionais qualificados', 'Suporte dedicado'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-accent" size={20} />
                    <span className="font-bold text-primary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" 
                  alt="Equipe DEXAPP" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent p-8 rounded-3xl text-white shadow-xl hidden md:block">
                <p className="text-4xl font-black mb-1">+500</p>
                <p className="text-xs font-bold uppercase tracking-wider">Prestadores Ativos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-primary mb-4">Nossos Valores</h2>
            <p className="text-gray-500">O que nos guia todos os dias para oferecer o melhor serviço para você.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
                    <value.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-accent/5 -skew-y-6 translate-y-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para começar?</h2>
              <p className="text-xl opacity-80 mb-10 max-w-2xl mx-auto">
                Junte-se a milhares de famílias que já confiam na DEXAPP para cuidar do seu lar.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 w-full md:w-auto"
                  onClick={() => navigate('/auth/register-cliente')}
                >
                  Contratar Agora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 w-full md:w-auto"
                  onClick={() => navigate('/auth/register-prestador')}
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
