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
  Sparkles,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const filters = [
    { id: 'todos', label: 'Todos os Serviços', icon: Sparkles },
    { id: 'populares', label: 'Mais Populares', icon: Star },
    { id: 'recomendados', label: 'Recomendados', icon: ShieldCheck },
    { id: 'rapidos', label: 'Atendimento Rápido', icon: Clock }
  ];

  const filteredCategories = SERVICE_CATEGORIES.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSpecialtiesByCategory(cat.name).some(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (selectedFilter === 'todos') return matchesSearch;
    if (selectedFilter === 'populares') return cat.popular && matchesSearch;
    return matchesSearch;
  });

  const handleSolicitar = (categoryName: string, specialtyName?: string) => {
    showToast(`Redirecionando para solicitação`, 'info');
    navigate('/register-cliente', { 
      state: { 
        categoria: categoryName,
        especialidade: specialtyName 
      } 
    });
  };

  return (
    <AppLayout>
      {/* Header Section com efeito de vidro */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-blue-900 pt-32 pb-40 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-black uppercase tracking-widest mb-8"
            >
              ✦ Nossos Serviços ✦
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Encontre o <span className="text-accent">Profissional</span>
              <br />Perfeito para Você
            </h1>
            
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Mais de 15 categorias e 200 especialidades à sua disposição. Qualidade e segurança em cada serviço.
            </p>

            {/* Barra de Pesquisa Moderna */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity blur-lg"></div>
              <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
                <Search className="absolute left-6 text-white/60" size={24} />
                <input
                  type="text"
                  placeholder="O que você está procurando hoje?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/60 pl-16 pr-4 py-6 outline-none text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-6 text-white/60 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filtros Rápidos */}
      <section className="bg-white border-b border-gray-100 sticky top-24 z-30 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <filter.icon size={16} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Categorias - Estilo imagem anexada */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCategories.map((cat, i) => {
              const specialties = getSpecialtiesByCategory(cat.name);
              const isExpanded = expandedCategory === cat.id;
              const specialtyCount = specialties.length;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    {/* Cabeçalho da Categoria - Estilo imagem */}
                    <div 
                      className={`relative cursor-pointer overflow-hidden ${
                        isExpanded ? 'bg-gradient-to-br from-primary/5 to-accent/5' : ''
                      }`}
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    >
                      {/* Gradiente de fundo */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      <div className="relative p-8">
                        <div className="flex items-start gap-5">
                          {/* Ícone com efeito 3D */}
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <cat.icon size={36} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-2xl font-black text-primary group-hover:text-accent transition-colors">
                                {cat.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                  {specialtyCount} {specialtyCount === 1 ? 'serviço' : 'serviços'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="text-accent" size={24} />
                                ) : (
                                  <ChevronDown className="text-accent" size={24} />
                                )}
                              </div>
                            </div>

                            {/* Informações Rápidas - Visíveis mesmo fechado */}
                            {!isExpanded && (
                              <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-gray-600">4.8/5.0</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-accent" />
                                  <span className="font-bold text-gray-600">850+ profissionais</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Especialidades Expansíveis */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-8 bg-gradient-to-b from-gray-50/50 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {specialties.map((specialty, idx) => (
                                <motion.button
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.02 }}
                                  onClick={() => handleSolicitar(cat.name, specialty.name)}
                                  className="group relative p-4 bg-white rounded-xl border border-gray-100 hover:border-accent hover:shadow-lg transition-all text-left"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {specialty.icon && (
                                          <specialty.icon size={16} className="text-accent" />
                                        )}
                                        <span className="font-bold text-primary group-hover:text-accent transition-colors">
                                          {specialty.name}
                                        </span>
                                      </div>
                                      
                                      {specialty.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                          {specialty.description}
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center gap-4 mt-3 text-xs">
                                        <span className="text-gray-400">
                                          <Clock className="inline w-3 h-3 mr-1" />
                                          {specialty.estimatedTime || '2-3h'}
                                        </span>
                                        {specialty.popular && (
                                          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-black text-[9px] uppercase">
                                            Popular
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <ArrowRight 
                                      size={16} 
                                      className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all" 
                                    />
                                  </div>
                                </motion.button>
                              ))}
                            </div>

                            {/* Ver Todos os Serviços */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => handleSolicitar(cat.name)}
                                className="w-full flex items-center justify-center gap-2 text-accent font-bold hover:gap-3 transition-all"
                              >
                                Ver todos os serviços de {cat.name.toLowerCase()}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mensagem de Nenhum Resultado */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-2">Nenhum serviço encontrado</h3>
              <p className="text-gray-500 mb-6">Não encontramos resultados para "{searchTerm}"</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('todos');
                }}
                className="text-accent font-bold hover:underline"
              >
                Limpar busca
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Seção de Confiança */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, text: 'Profissionais Verificados', color: 'text-green-500' },
              { icon: Clock, text: 'Atendimento Rápido', color: 'text-blue-500' },
              { icon: Star, text: 'Qualidade Garantida', color: 'text-yellow-500' },
              { icon: Users, text: '+5000 Clientes', color: 'text-purple-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gray-50 ${item.color} mb-3`}>
                  <item.icon size={24} />
                </div>
                <p className="text-sm font-bold text-primary">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
