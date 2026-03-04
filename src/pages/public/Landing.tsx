import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { motion } from 'framer-motion';
import { Shield, Clock, Star, Users } from 'lucide-react';

export default function Landing() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-primary text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            >
              Soluções Domésticas <br />
              <span className="text-accent">ao seu Alcance</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-10 max-w-xl"
            >
              Encontre os melhores profissionais para cuidar do seu lar em Moçambique. Rápido, seguro e confiável.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/servicos">
                <Button variant="secondary" size="lg">Solicitar Serviço</Button>
              </Link>
              <Link to="/register-prestador">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Seja um Prestador</Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 skew-x-12 translate-x-1/4" />
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">O que você precisa hoje?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Explore nossas categorias e encontre o profissional ideal para o seu serviço.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {SERVICE_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Link to={`/servicos?cat=${cat.id}`}>
                  <div className={`aspect-square rounded-3xl bg-gradient-to-br ${cat.color} p-6 flex flex-col items-center justify-center text-center text-white shadow-lg transition-all group-hover:shadow-xl`}>
                    <cat.icon size={40} className="mb-4" />
                    <span className="font-bold text-sm leading-tight">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mx-auto">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary">Segurança Total</h3>
              <p className="text-gray-500 text-sm">Profissionais verificados e antecedentes criminais checados.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mx-auto">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary">Rapidez</h3>
              <p className="text-gray-500 text-sm">Encontre um prestador em minutos para serviços urgentes.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mx-auto">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary">Qualidade</h3>
              <p className="text-gray-500 text-sm">Sistema de avaliações para garantir o melhor atendimento.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mx-auto">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary">Suporte 24/7</h3>
              <p className="text-gray-500 text-sm">Nossa central está sempre pronta para ajudar você.</p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
