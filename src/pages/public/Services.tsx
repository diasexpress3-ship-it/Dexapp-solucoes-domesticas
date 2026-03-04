import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, ArrowRight, Star, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredCategories = SERVICE_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            Nossos <span className="text-accent">Serviços</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-80 max-w-2xl mx-auto mb-10"
          >
            Escolha a categoria que melhor atende às suas necessidades e encontre os melhores profissionais de Moçambique.
          </motion.p>
          <div className="max-w-xl mx-auto">
            <Input
              placeholder="O que você está procurando hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-primary h-16 rounded-2xl shadow-xl"
              leftIcon={<Search className="text-gray-400" size={24} />}
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hoverable className="h-full border-none shadow-sm group">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <cat.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4">{cat.name}</h3>
                    <p className="text-gray-500 mb-8 flex-1">
                      Encontre profissionais qualificados para {cat.name.toLowerCase()} com garantia de qualidade e segurança DEXAPP.
                    </p>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>Média 4.8/5.0</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span>Profissionais Verificados</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      rightIcon={<ArrowRight size={18} />}
                      onClick={() => navigate('/auth/register-cliente')}
                    >
                      Solicitar Agora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Nenhuma categoria encontrada para "{searchTerm}".</p>
              <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm('')}>Limpar Pesquisa</Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={32} />
              </div>
              <h4 className="text-xl font-bold text-primary">Agendamento Rápido</h4>
              <p className="text-gray-500">Contrate um serviço em menos de 2 minutos através da nossa plataforma intuitiva.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-primary">Pagamento Seguro</h4>
              <p className="text-gray-500">Seu dinheiro está protegido. O prestador só recebe o valor total após a conclusão do serviço.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} />
              </div>
              <h4 className="text-xl font-bold text-primary">Qualidade Garantida</h4>
              <p className="text-gray-500">Todos os nossos profissionais passam por um rigoroso processo de seleção e treinamento.</p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
