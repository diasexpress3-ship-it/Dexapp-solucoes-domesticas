import { 
  Sparkles, Users, Zap, Droplet, Hammer, Building2, 
  Flower2, Paintbrush, Wrench, Baby, Shield, Clock,
  Home, Scissors, Droplets, Fan, Lightbulb, Lock,
  Bath, Trash2, Armchair, Sofa, Trees, Bug,
  Calendar, Sun, Moon, Heart, Utensils, Wind,
  Plug, Tool, Ruler, Drill, DoorClosed, Grid,
  Fence, Sprout, Compass, Scroll, Palette,
  Brush, Volume2, Tv, WashingMachine, Refrigerator,
  Stove, Microwave, Vacuum, Camera, Printer,
  Coffee, ChefHat, Dog, Cat, Car, Bike,
  Phone, Mail, MessageCircle, MapPin, CreditCard,
  Wallet, DollarSign, Award, Star, ThumbsUp,
  AlertCircle, CheckCircle, XCircle, Info
} from 'lucide-react';

// Interfaces para tipagem forte
export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  keywords: string[];
  popular: boolean;
  imageUrl?: string;
}

export interface Specialty {
  name: string;
  icon: any;
  description?: string;
  estimatedTime?: string;
  minPrice?: number;
  popular?: boolean;
}

// Categorias com informações completas
export const SERVICE_CATEGORIES: Category[] = [
  { 
    id: 'limpeza', 
    name: '🧹 Limpeza Doméstica', 
    icon: Sparkles, 
    color: 'from-blue-400 to-blue-600',
    description: 'Serviços profissionais de limpeza para manter sua casa impecável e organizada.',
    keywords: ['limpeza', 'faxina', 'higienização', 'organização', 'casa'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'
  },
  { 
    id: 'empregadas', 
    name: '👥 Empregadas Domésticas & Babás', 
    icon: Users, 
    color: 'from-pink-400 to-pink-600',
    description: 'Profissionais dedicadas para cuidar da sua casa e dos seus filhos com carinho e confiança.',
    keywords: ['doméstica', 'babá', 'cuidadora', 'diarista', 'mensalista'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'
  },
  { 
    id: 'eletrica', 
    name: '⚡ Manutenção Elétrica', 
    icon: Zap, 
    color: 'from-yellow-400 to-yellow-600',
    description: 'Eletricistas qualificados para instalações, reparações e manutenção da sua rede elétrica.',
    keywords: ['eletricista', 'luz', 'tomada', 'interruptor', 'curto-circuito'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a2a2c?w=400'
  },
  { 
    id: 'canalizacao', 
    name: '💧 Canalização', 
    icon: Droplet, 
    color: 'from-cyan-400 to-cyan-600',
    description: 'Canalizadores experientes para resolver fugas, entupimentos e instalações hidráulicas.',
    keywords: ['canalizador', 'água', 'torneira', 'desentupimento', 'fuga'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400'
  },
  { 
    id: 'carpintaria', 
    name: '🔨 Carpintaria & Marcenaria', 
    icon: Hammer, 
    color: 'from-amber-700 to-amber-900',
    description: 'Artesãos da madeira para criar, reparar ou restaurar móveis e estruturas.',
    keywords: ['carpinteiro', 'marceneiro', 'madeira', 'móveis', 'portas'],
    popular: false,
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
  },
  { 
    id: 'construcao', 
    name: '🏗️ Construção & Obras', 
    icon: Building2, 
    color: 'from-stone-600 to-stone-800',
    description: 'Profissionais para obras, reformas e construção civil com qualidade e segurança.',
    keywords: ['pedreiro', 'obra', 'construção', 'alvenaria', 'reforma'],
    popular: false,
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400'
  },
  { 
    id: 'jardinagem', 
    name: '🌿 Jardinagem & Exteriores', 
    icon: Flower2, 
    color: 'from-green-400 to-green-600',
    description: 'Jardineiros para manter seu jardim bonito e seus espaços exteriores impecáveis.',
    keywords: ['jardineiro', 'jardim', 'plantas', 'relva', 'poda'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=400'
  },
  { 
    id: 'pintura', 
    name: '🎨 Pintura & Acabamentos', 
    icon: Paintbrush, 
    color: 'from-purple-400 to-purple-600',
    description: 'Pintores profissionais para dar cor e vida aos seus ambientes com acabamentos perfeitos.',
    keywords: ['pintor', 'pintura', 'tinta', 'acabamento', 'textura'],
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'
  },
  { 
    id: 'reparacoes', 
    name: '🛠️ Reparações Gerais', 
    icon: Wrench, 
    color: 'from-gray-500 to-gray-700',
    description: 'Faz-tudo para pequenas reparações e manutenção geral da sua casa.',
    keywords: ['reparações', 'manutenção', 'arranjos', 'montagem'],
    popular: false,
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'
  }
];

// Especialidades detalhadas com ícones e informações
export const ESPECIALIDADES_POR_CATEGORIA: Record<string, Specialty[]> = {
  '🧹 Limpeza Doméstica': [
    { name: 'Limpeza Geral', icon: Sparkles, description: 'Limpeza padrão de toda a casa', estimatedTime: '2-3h', minPrice: 1500 },
    { name: 'Limpeza Profunda', icon: Brush, description: 'Limpeza detalhada de todos os cantos', estimatedTime: '4-6h', minPrice: 2500, popular: true },
    { name: 'Limpeza Pós-Obra', icon: Building2, description: 'Remoção de resíduos de construção', estimatedTime: '5-8h', minPrice: 3500 },
    { name: 'Limpeza de Escritórios', icon: Home, description: 'Limpeza profissional para empresas', estimatedTime: '2-4h', minPrice: 2000 },
    { name: 'Limpeza de Tapetes', icon: Sofa, description: 'Higienização de tapetes e carpetes', estimatedTime: '1-2h', minPrice: 800 },
    { name: 'Organização', icon: Armchair, description: 'Organização de armários e espaços', estimatedTime: '2-3h', minPrice: 1200 },
    { name: 'Limpeza de Vidros', icon: Droplets, description: 'Limpeza de janelas e vidros', estimatedTime: '1-2h', minPrice: 600 },
    { name: 'Limpeza de Estofados', icon: Sofa, description: 'Limpeza a vapor de sofás', estimatedTime: '2-3h', minPrice: 1800 }
  ],
  
  '👥 Empregadas Domésticas & Babás': [
    { name: 'Diarista', icon: Sun, description: 'Limpeza diária ou semanal', estimatedTime: '4-6h', minPrice: 1200, popular: true },
    { name: 'Mensalista', icon: Calendar, description: 'Serviços mensais contratados', estimatedTime: '6-8h', minPrice: 3500 },
    { name: 'Babá', icon: Baby, description: 'Cuidados infantis', estimatedTime: 'por hora', minPrice: 500, popular: true },
    { name: 'Cuidador de Idosos', icon: Heart, description: 'Assistência a idosos', estimatedTime: 'por hora', minPrice: 600 },
    { name: 'Cozinheira', icon: Utensils, description: 'Preparo de refeições', estimatedTime: '3-4h', minPrice: 1500 },
    { name: 'Passador(a)', icon: Wind, description: 'Passar e engomar roupa', estimatedTime: '2-3h', minPrice: 800 },
    { name: 'Babá Noturna', icon: Moon, description: 'Cuidados noturnos', estimatedTime: '8h', minPrice: 2000 }
  ],
  
  '⚡ Manutenção Elétrica': [
    { name: 'Instalações Elétricas', icon: Zap, description: 'Instalação de fiação e quadros', estimatedTime: '3-5h', minPrice: 2000 },
    { name: 'Reparações', icon: Lightbulb, description: 'Conserto de curto-circuitos', estimatedTime: '1-2h', minPrice: 800, popular: true },
    { name: 'Tomadas', icon: Plug, description: 'Troca e instalação de tomadas', estimatedTime: '30min', minPrice: 400 },
    { name: 'Luminárias', icon: Lightbulb, description: 'Instalação de lustres e spots', estimatedTime: '1h', minPrice: 600 },
    { name: 'Segurança', icon: Shield, description: 'Sistemas de alarme e câmeras', estimatedTime: '4-6h', minPrice: 3000 },
    { name: 'Ar Condicionado', icon: Fan, description: 'Instalação e manutenção', estimatedTime: '2-3h', minPrice: 2500, popular: true },
    { name: 'Ventiladores', icon: Fan, description: 'Instalação de ventiladores', estimatedTime: '1h', minPrice: 500 }
  ],
  
  '💧 Canalização': [
    { name: 'Torneiras', icon: Droplet, description: 'Troca e reparação', estimatedTime: '30min', minPrice: 400, popular: true },
    { name: 'Desentupimentos', icon: Trash2, description: 'Desentupir canos', estimatedTime: '1-2h', minPrice: 1000 },
    { name: 'Sanitários', icon: Bath, description: 'Instalação de vasos sanitários', estimatedTime: '2-3h', minPrice: 1500 },
    { name: 'Canalizações', icon: Droplet, description: 'Reparação de tubagens', estimatedTime: '2-4h', minPrice: 1800 },
    { name: 'Água Quente', icon: Droplet, description: 'Esquentadores e boilers', estimatedTime: '2-3h', minPrice: 2000 },
    { name: 'Fugas de Água', icon: Droplets, description: 'Detecção e reparação', estimatedTime: '1-2h', minPrice: 1200, popular: true }
  ],
  
  '🔨 Carpintaria & Marcenaria': [
    { name: 'Reparação de Portas', icon: DoorClosed, description: 'Ajustes e consertos', estimatedTime: '1-2h', minPrice: 800 },
    { name: 'Reparação de Móveis', icon: Armchair, description: 'Conserto de cadeiras e mesas', estimatedTime: '1-2h', minPrice: 600 },
    { name: 'Montagem', icon: Tool, description: 'Montagem de móveis', estimatedTime: '1-3h', minPrice: 500, popular: true },
    { name: 'Armários', icon: Home, description: 'Construção de armários', estimatedTime: '4-8h', minPrice: 3500 },
    { name: 'Acabamentos', icon: Brush, description: 'Acabamentos em madeira', estimatedTime: '2-4h', minPrice: 1500 },
    { name: 'Restauração', icon: Armchair, description: 'Restauro de móveis antigos', estimatedTime: '5-10h', minPrice: 4000 }
  ],
  
  '🏗️ Construção & Obras': [
    { name: 'Alvenaria', icon: Building2, description: 'Construção de paredes', estimatedTime: 'por m²', minPrice: 2000 },
    { name: 'Pintura', icon: Paintbrush, description: 'Pintura de paredes', estimatedTime: 'por m²', minPrice: 500 },
    { name: 'Telhados', icon: Home, description: 'Reparação de telhados', estimatedTime: '4-8h', minPrice: 3000 },
    { name: 'Acabamentos', icon: Brush, description: 'Reboco e texturas', estimatedTime: 'por m²', minPrice: 800 },
    { name: 'Pavimentos', icon: Grid, description: 'Colocação de pisos', estimatedTime: 'por m²', minPrice: 1500, popular: true },
    { name: 'Muros', icon: Fence, description: 'Construção de muros', estimatedTime: 'por m²', minPrice: 1800 }
  ],
  
  '🌿 Jardinagem & Exteriores': [
    { name: 'Corte de Relva', icon: Scissors, description: 'Corte e manutenção', estimatedTime: '1-2h', minPrice: 600, popular: true },
    { name: 'Poda', icon: Trees, description: 'Poda de árvores', estimatedTime: '2-4h', minPrice: 1200 },
    { name: 'Plantio', icon: Sprout, description: 'Plantio de flores', estimatedTime: '1-2h', minPrice: 800 },
    { name: 'Irrigação', icon: Droplet, description: 'Sistemas de rega', estimatedTime: '3-5h', minPrice: 2000 },
    { name: 'Limpeza', icon: Trash2, description: 'Limpeza de jardins', estimatedTime: '2-3h', minPrice: 1000 },
    { name: 'Pragas', icon: Bug, description: 'Controlo de pragas', estimatedTime: '1-2h', minPrice: 1500 },
    { name: 'Paisagismo', icon: Compass, description: 'Projetos paisagísticos', estimatedTime: 'por projeto', minPrice: 5000 }
  ],
  
  '🎨 Pintura & Acabamentos': [
    { name: 'Interiores', icon: Home, description: 'Pintura de interiores', estimatedTime: 'por m²', minPrice: 400, popular: true },
    { name: 'Exteriores', icon: Building2, description: 'Pintura de fachadas', estimatedTime: 'por m²', minPrice: 600 },
    { name: 'Texturas', icon: Palette, description: 'Efeitos decorativos', estimatedTime: 'por m²', minPrice: 800 },
    { name: 'Remoção', icon: Scroll, description: 'Remoção de tinta antiga', estimatedTime: 'por m²', minPrice: 300 },
    { name: 'Preparação', icon: Tool, description: 'Massas e lixamento', estimatedTime: 'por m²', minPrice: 350 },
    { name: 'Móveis', icon: Armchair, description: 'Pintura de móveis', estimatedTime: '2-4h', minPrice: 1200 }
  ],
  
  '🛠️ Reparações Gerais': [
    { name: 'Arranjos', icon: Wrench, description: 'Pequenas reparações', estimatedTime: '1h', minPrice: 400, popular: true },
    { name: 'Montagem', icon: Tool, description: 'Montagem de móveis', estimatedTime: '1-2h', minPrice: 500 },
    { name: 'Furações', icon: Drill, description: 'Furos para instalações', estimatedTime: '30min', minPrice: 200 },
    { name: 'Fechaduras', icon: Lock, description: 'Troca de fechaduras', estimatedTime: '1h', minPrice: 600 },
    { name: 'Prateleiras', icon: Grid, description: 'Instalação de prateleiras', estimatedTime: '1h', minPrice: 400 },
    { name: 'Janelas', icon: DoorClosed, description: 'Reparação de janelas', estimatedTime: '1-2h', minPrice: 800 }
  ]
};

// Categorias populares (para destaque na UI)
export const POPULAR_CATEGORIES = SERVICE_CATEGORIES.filter(cat => cat.popular);

// Função para buscar especialidades por nome da categoria (com segurança)
export function getSpecialtiesByCategory(categoryName: string): Specialty[] {
  if (!categoryName) return [];
  const specialties = ESPECIALIDADES_POR_CATEGORIA[categoryName];
  return specialties || [];
}

// Função para buscar categoria por ID
export function getCategoryById(id: string): Category | undefined {
  if (!id) return undefined;
  return SERVICE_CATEGORIES.find(cat => cat.id === id);
}

// Função para buscar categoria por nome
export function getCategoryByName(name: string): Category | undefined {
  if (!name) return undefined;
  return SERVICE_CATEGORIES.find(cat => cat.name === name);
}

// Lista de todas as especialidades (para buscas)
export const ALL_SPECIALTIES = Object.values(ESPECIALIDADES_POR_CATEGORIA)
  .flat()
  .map(s => s.name);

// Preços médios por categoria (para orçamentos rápidos)
export const CATEGORY_AVERAGE_PRICES: Record<string, number> = {
  '🧹 Limpeza Doméstica': 1800,
  '👥 Empregadas Domésticas & Babás': 1500,
  '⚡ Manutenção Elétrica': 2000,
  '💧 Canalização': 1800,
  '🔨 Carpintaria & Marcenaria': 2500,
  '🏗️ Construção & Obras': 3000,
  '🌿 Jardinagem & Exteriores': 1500,
  '🎨 Pintura & Acabamentos': 1800,
  '🛠️ Reparações Gerais': 500
};

// Tempos médios estimados
export const CATEGORY_AVERAGE_TIME: Record<string, string> = {
  '🧹 Limpeza Doméstica': '2-4 horas',
  '👥 Empregadas Domésticas & Babás': '4-6 horas',
  '⚡ Manutenção Elétrica': '1-3 horas',
  '💧 Canalização': '1-3 horas',
  '🔨 Carpintaria & Marcenaria': '2-5 horas',
  '🏗️ Construção & Obras': '4-8 horas',
  '🌿 Jardinagem & Exteriores': '2-4 horas',
  '🎨 Pintura & Acabamentos': '3-6 horas',
  '🛠️ Reparações Gerais': '1-2 horas'
};
