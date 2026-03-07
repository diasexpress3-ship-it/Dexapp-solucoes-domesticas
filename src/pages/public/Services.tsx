import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { SERVICE_CATEGORIES, getSpecialtiesByCategory, ESPECIALIDADES_POR_CATEGORIA } from '../../constants/categories';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ChevronRight,
  Filter,
  Wrench,
  Users,
  Zap,
  Droplets,
  Hammer,
  Building2,
  Flower2,
  Paintbrush,
  Brush
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mapeamento de ícones por categoria
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Brush,
    Users,
    Zap,
    Droplets,
    Hammer,
    Building2,
    Flower2,
    Paintbrush,
    Wrench
  };
  return icons[iconName] || Wrench;
};

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<string | null>(null);

  // Filtrar categorias baseado na busca
  const filteredCategories = SERVICE_CATEGORIES.filter(cat =>
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.especialidades.some(esp => esp.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setSelectedEspecialidade(null);
  };

  const handleEspecialidadeClick = (especialidadeId: string) => {
    setSelectedEspecialidade(especialidadeId);
    // Aqui você pode navegar para a página de busca com a especialidade selecionada
    console.log('Especialidade selecionada:', especialidadeId);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">
            Nossos <span className="text-accent">Serviços</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Encontre o profissional ideal para qualquer necessidade doméstica.
          </p>
        </div>

        {/* Busca */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar serviços ou especialidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-accent"
            />
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-6">
          {filteredCategories.map((categoria) => {
            const IconComponent = getIcon(categoria.icon);
            const isSelected = selectedCategory === categoria.id;

            return (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    {/* Cabeçalho da Categoria (clicável) */}
                    <button
                      onClick={() => handleCategoryClick(categoria.id)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoria.color} flex items-center justify-center text-white shadow-lg`}>
                          <IconComponent size={32} />
                        </div>
                        <div className="text-left">
                          <h2 className="text-2xl font-black text-primary mb-1">
                            {categoria.nome}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {categoria.especialidades.length} especialidades disponíveis
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={24}
                        className={`text-gray-400 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {/* Especialidades (expansível) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50"
                      >
                        <div className="p-6">
                          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
                            Especialidades disponíveis
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoria.especialidades.map((esp) => (
                              <button
                                key={esp.id}
                                onClick={() => handleEspecialidadeClick(esp.id)}
                                className={`p-4 rounded-xl text-left transition-all ${
                                  selectedEspecialidade === esp.id
                                    ? 'bg-accent text-white shadow-lg'
                                    : 'bg-white hover:shadow-md border border-gray-200'
                                }`}
                              >
                                <h4 className={`font-bold mb-1 ${
                                  selectedEspecialidade === esp.id ? 'text-white' : 'text-primary'
                                }`}>
                                  {esp.nome}
                                </h4>
                                <p className={`text-xs ${
                                  selectedEspecialidade === esp.id ? 'text-white/80' : 'text-gray-500'
                                }`}>
                                  {esp.descricao}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredCategories.length === 0 && (
            <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
              <CardContent className="py-12 text-center">
                <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-gray-500">
                  Tente buscar com outros termos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-primary to-blue-900 text-white border-none">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-black mb-4">
              Não encontrou o que procura?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e faremos o possível para encontrar o profissional ideal para sua necessidade.
            </p>
            <Link to="/contacto">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg rounded-2xl"
              >
                Fale Conosco
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
