import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { SERVICE_CATEGORIES, ESPECIALIDADES_POR_CATEGORIA, getSpecialtiesByCategory } from '../../constants/categories';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const filteredCategories = SERVICE_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSpecialtiesByCategory(cat.name).some(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSolicitar = (categoryName: string, specialtyName?: string) => {
    showToast(`Redirecionando para solicitação de ${specialtyName || categoryName}`, 'info');
    navigate('/register-cliente', { 
      state: { 
        categoria: categoryName,
        especialidade: specialtyName 
      } 
    });
  };

  return (
    <AppLayout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary to-blue-900 py-20 text-white">
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
            className="text-xl opacity-90 max-w-2xl mx-auto mb-10"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCategories.map((cat, i) => {
              const specialties = getSpecialtiesByCategory(cat.name);
              const isExpanded = expandedCategory === cat.id;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-lg transition-all overflow-hidden">
                    <CardContent className="p-0">
                      {/* Cabeçalho da Categoria */}
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                            <cat.icon size={32} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-black text-primary">{cat.name}</h3>
                              {isExpanded ? (
                                <ChevronUp className="text-accent" size={24} />
                              ) : (
                                <ChevronDown className="text-accent" size={24} />
                              )}
                            </div>
                            
                            {/* Informações rápidas quando fechado */}
                            {!isExpanded && (
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Briefcase size={16} />
                                  <span>{specialties.length} especialidades</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                  <span>4.8/5.0</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Especialidades (expansível) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="p-6 bg-gray-50/50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {specialties.map((specialty, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="group relative"
                                  >
                                    <button
                                      onClick={() => handleSolicitar(cat.name, specialty.name)}
                                      className="w-full p-4 bg-white rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all text-left"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          {specialty.icon && <specialty.icon size={16} className="text-accent" />}
                                          <span className="font-bold text-primary">{specialty.name}</span>
                                        </div>
                                        {specialty.popular && (
                                          <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase rounded-full">
                                            Popular
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          {specialty.estimatedTime || '2-3h'}
                                        </span>
                                        <span className="font-bold text-accent">
                                          A partir de {specialty.minPrice || 1000} MTn
                                        </span>
                                      </div>

                                      {specialty.description && (
                                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                          {specialty.description}
                                        </p>
                                      )}
                                    </button>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Botão para solicitar categoria completa */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleSolicitar(cat.name)}
                                  rightIcon={<ArrowRight size={16} />}
                                >
                                  Solicitar {cat.name} Completa
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-xl text-gray-500 mb-4">Nenhuma categoria encontrada para "{searchTerm}"</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Limpar Pesquisa
              </Button>
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
