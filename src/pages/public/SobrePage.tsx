import React from 'react';
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
  Sparkles,
  Rocket,
  Medal,
  Leaf
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function SobrePage() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  
  const [stats, setStats] = useState({
    prestadores: 850,
    clientes: 5000,
    servicos: 12000,
    avaliacao: 4.9
  });

  const [images, setImages] = useState({
    team: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    work: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800'
  });

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

  const values = [
    { icon: ShieldCheck, title: 'Segurança', desc: 'Verificamos rigorosamente todos os prestadores para sua tranquilidade.', color: 'from-blue-400 to-blue-600' },
    { icon: Target, title: 'Excelência', desc: 'Buscamos a perfeição em cada serviço prestado através da nossa plataforma.', color: 'from-orange-400 to-orange-600' },
    { icon: Users, title: 'Comunidade', desc: 'Fortalecemos a economia local conectando talentos a oportunidades.', color: 'from-green-400 to-green-600' },
    { icon: Heart, title: 'Cuidado', desc: 'Tratamos cada casa como se fosse a nossa, com respeito e dedicação.', color: 'from-pink-400 to-pink-600' },
  ];

  const timeline = [
    { year: '2020', event: 'Fundação da DEXAPP', description: 'Iniciamos com a missão de revolucionar serviços domésticos em Moçambique.', icon: Rocket },
    { year: '2021', event: 'Primeiros 100 prestadores', description: 'Alcançamos a marca de 100 profissionais verificados na plataforma.', icon: Users },
    { year: '2022', event: 'Lançamento do App Mobile', description: 'Disponibilizamos nosso aplicativo para iOS e Android.', icon: Sparkles },
    { year: '2023', event: '+5000 clientes atendidos', description: 'Ultrapassamos a marca de 5 mil famílias atendidas com excelência.', icon: Medal },
    { year: '2024', event: 'Expansão para outras cidades', description: 'Chegamos a novas províncias de Moçambique.', icon: Globe },
    { year: '2025', event: 'Reconhecimento nacional', description: 'Premiados como melhor plataforma de serviços domésticos.', icon: Award },
  ];

  return (
    <AppLayout>
      {/* Hero Section Impactante */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-blue-900 min-h-[80vh] flex items-center overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Texto Hero */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-black uppercase tracking-widest mb-8"
              >
                ✦ Sobre Nós ✦
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Transformando a forma
                <span className="text-accent"> de cuidar</span>
              </h1>

              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                A DEXAPP nasceu da necessidade de conectar profissionais qualificados a famílias que buscam praticidade, segurança e confiança em serviços domésticos em Moçambique.
              </p>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-white border-0 transform hover:scale-105 transition-all shadow-xl shadow-accent/30"
                  onClick={() => navigate('/register-cliente')}
                >
                  Contratar Agora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/20 text-white hover:bg-white/10 transform hover:scale-105 transition-all"
                  onClick={() => navigate('/contacto')}
                >
                  Fale Connosco
                </Button>
              </div>
            </motion.div>

            {/* Imagem Hero */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={images.team} 
                  alt="Equipe DEXAPP"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="absolute -bottom-6 -left-6 bg-accent p-6 rounded-2xl shadow-xl"
              >
                <p className="text-2xl font-black text-white mb-1">+{stats.servicos}</p>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Serviços Realizados</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section com contadores animados */}
      <section ref={statsRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Prestadores Ativos', value: stats.prestadores, icon: Briefcase, suffix: '+' },
              { label: 'Clientes Satisfeitos', value: stats.clientes, icon: Users, suffix: '+' },
              { label: 'Serviços Realizados', value: stats.servicos, icon: CheckCircle2, suffix: '+' },
              { label: 'Avaliação Média', value: stats.avaliacao, icon: Star, suffix: '' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-accent" />
                </div>
                <motion.h3 
                  initial={{ scale: 0 }}
                  animate={statsInView ? { scale: 1 } : {}}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                  className="text-4xl md:text-5xl font-black text-primary mb-1"
                >
                  {item.value}{item.suffix}
                </motion.h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Missão & Visão com imagem interativa */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-primary mb-4">Nossa Missão</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Simplificar a vida das pessoas através de uma plataforma tecnológica intuitiva que garante acesso a serviços domésticos de alta qualidade, enquanto promove o empoderamento econômico de profissionais em Moçambique.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-primary">Nossos Compromissos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    'Praticidade no agendamento',
                    'Segurança garantida',
                    'Profissionais qualificados',
                    'Suporte dedicado 24/7'
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm"
                    >
                      <CheckCircle2 className="text-accent" size={20} />
                      <span className="font-bold text-primary">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button 
                className="mt-4" 
                size="lg"
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigate('/register-prestador')}
              >
                Junte-se à nossa equipe
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <UploadImage
                  currentImageUrl={images.work}
                  onUpload={(url) => setImages(prev => ({ ...prev, work: url }))}
                  collectionPath="config"
                  docId="sobreImagens"
                  field="work"
                  label="Trabalho DEXAPP"
                  isAdminOnly={true}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <p className="text-white text-lg font-bold">+500 profissionais ativos</p>
                    <p className="text-white/60 text-sm">Em todo Moçambique</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores com cards flutuantes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-accent font-black text-sm uppercase tracking-widest mb-4 block">Nossos Valores</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">O que nos move</h2>
            <p className="text-gray-500 text-lg">Princípios que guiam cada serviço prestado</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <CardContent className="p-8 text-center">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                      <value.icon size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4">{value.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Moderna */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-accent font-black text-sm uppercase tracking-widest mb-4 block">Nossa Jornada</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">História de Sucesso</h2>
            <p className="text-gray-500 text-lg">Anos de dedicação e crescimento</p>
          </motion.div>

          <div className="relative">
            {/* Linha do tempo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-accent/20 via-accent to-accent/20 hidden lg:block" />
            
            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    idx % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="lg:w-1/2">
                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6 mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                            <item.icon size={32} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-accent mb-1">{item.year}</p>
                            <h3 className="text-2xl font-black text-primary">{item.event}</h3>
                          </div>
                        </div>
                        <p className="text-gray-500 text-lg leading-relaxed">{item.description}</p>
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

      {/* CTA Final Impactante */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary to-blue-900 rounded-3xl p-16 md:p-24 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full -ml-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full -mr-48 -mb-48 animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Pronto para começar?</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Junte-se a milhares de moçambicanos que já confiam na DEXAPP para cuidar dos seus lares.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-2xl shadow-2xl shadow-accent/30 transform hover:scale-105 transition-all"
                  onClick={() => navigate('/register-cliente')}
                >
                  Criar Conta Grátis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/20 text-white hover:bg-white/10 px-12 py-6 text-lg rounded-2xl transform hover:scale-105 transition-all"
                  onClick={() => navigate('/contacto')}
                >
                  Falar com Suporte
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
