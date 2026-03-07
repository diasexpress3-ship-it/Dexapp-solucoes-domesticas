// ============================================
// CATEGORIAS DE SERVIÇOS COM ESPECIALIDADES
// ============================================

export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icon: string;
  color: string;
  especialidades: Especialidade[];
}

export const SERVICE_CATEGORIES: Categoria[] = [
  {
    id: 'limpeza',
    nome: '🧹 Limpeza Doméstica',
    icon: 'Brush',
    color: 'from-blue-400 to-blue-600',
    especialidades: [
      { id: 'limpeza-geral', nome: 'Limpeza Geral', descricao: 'Limpeza completa de residências' },
      { id: 'limpeza-pesada', nome: 'Limpeza Pós-Obra', descricao: 'Limpeza após reformas e construções' },
      { id: 'limpeza-escritorio', nome: 'Limpeza de Escritórios', descricao: 'Limpeza comercial e corporativa' },
      { id: 'limpeza-tapetes', nome: 'Lavagem de Tapetes', descricao: 'Limpeza profunda de tapetes' },
      { id: 'limpeza-estofados', nome: 'Limpeza de Estofados', descricao: 'Hygienização de sofás e poltronas' },
      { id: 'limpeza-vidros', nome: 'Limpeza de Vidros', descricao: 'Limpeza de janelas e fachadas' }
    ]
  },
  {
    id: 'empregadas',
    nome: '👥 Empregadas Domésticas & Babás',
    icon: 'Users',
    color: 'from-pink-400 to-pink-600',
    especialidades: [
      { id: 'empregada-fixa', nome: 'Empregada Fixa', descricao: 'Serviço regular semanal ou mensal' },
      { id: 'diarista', nome: 'Diarista', descricao: 'Serviço por dia ou período' },
      { id: 'baba', nome: 'Babá', descricao: 'Cuidados com crianças' },
      { id: 'cuidador-idoso', nome: 'Cuidador de Idosos', descricao: 'Assistência para idosos' },
      { id: 'passadeira', nome: 'Serviço de Passadoria', descricao: 'Passar roupa' },
      { id: 'cozinheira', nome: 'Cozinheira', descricao: 'Preparo de refeições' }
    ]
  },
  {
    id: 'eletrica',
    nome: '⚡ Manutenção Elétrica',
    icon: 'Zap',
    color: 'from-yellow-400 to-yellow-600',
    especialidades: [
      { id: 'eletricista-geral', nome: 'Eletricista Geral', descricao: 'Instalações e reparos elétricos' },
      { id: 'instalacao-lampadas', nome: 'Instalação de Lâmpadas', descricao: 'Troca e instalação de iluminação' },
      { id: 'reparo-tomadas', nome: 'Reparo de Tomadas', descricao: 'Troca e conserto de tomadas' },
      { id: 'quadro-distribuicao', nome: 'Quadro de Distribuição', descricao: 'Instalação e manutenção' },
      { id: 'interruptores', nome: 'Interruptores', descricao: 'Troca e instalação' },
      { id: 'curto-circuito', nome: 'Curto-Circuito', descricao: 'Diagnóstico e reparo' }
    ]
  },
  {
    id: 'canalizacao',
    nome: '💧 Canalização',
    icon: 'Droplets',
    color: 'from-cyan-400 to-cyan-600',
    especialidades: [
      { id: 'canalizador-geral', nome: 'Canalizador Geral', descricao: 'Serviços de água e esgoto' },
      { id: 'desentupimento', nome: 'Desentupimento', descricao: 'Desentupir pias e vasos' },
      { id: 'torneiras', nome: 'Troca de Torneiras', descricao: 'Instalação de torneiras' },
      { id: 'caixas-agua', nome: 'Caixas de Água', descricao: 'Limpeza e instalação' },
      { id: 'esgoto', nome: 'Problemas de Esgoto', descricao: 'Reparo em encanamentos' },
      { id: 'aquecedores', nome: 'Aquecedores', descricao: 'Instalação de boilers' }
    ]
  },
  {
    id: 'carpintaria',
    nome: '🔨 Carpintaria & Marcenaria',
    icon: 'Hammer',
    color: 'from-amber-600 to-amber-800',
    especialidades: [
      { id: 'carpinteiro-geral', nome: 'Carpinteiro Geral', descricao: 'Móveis e estruturas de madeira' },
      { id: 'moveis-planejados', nome: 'Móveis Planejados', descricao: 'Projeto e montagem' },
      { id: 'portas-janelas', nome: 'Portas e Janelas', descricao: 'Instalação e reparo' },
      { id: 'armarios', nome: 'Armários', descricao: 'Montagem de armários' },
      { id: 'reparo-moveis', nome: 'Reparo de Móveis', descricao: 'Restauração' },
      { id: 'estantes', nome: 'Estantes', descricao: 'Instalação de prateleiras' }
    ]
  },
  {
    id: 'construcao',
    nome: '🏗️ Construção & Obras',
    icon: 'Building2',
    color: 'from-slate-600 to-slate-800',
    especialidades: [
      { id: 'pedreiro', nome: 'Pedreiro', descricao: 'Obras e reformas' },
      { id: 'azulejista', nome: 'Azulejista', descricao: 'Assentamento de azulejos' },
      { id: 'gesseiro', nome: 'Gesseiro', descricao: 'Forros e paredes de gesso' },
      { id: 'pintor', nome: 'Pintor', descricao: 'Pintura de paredes' },
      { id: 'piscineiro', nome: 'Piscineiro', descricao: 'Construção de piscinas' }
    ]
  },
  {
    id: 'jardinagem',
    nome: '🌿 Jardinagem & Exteriores',
    icon: 'Flower2',
    color: 'from-green-400 to-green-600',
    especialidades: [
      { id: 'jardineiro', nome: 'Jardineiro', descricao: 'Manutenção de jardins' },
      { id: 'poda-arvores', nome: 'Poda de Árvores', descricao: 'Corte e poda' },
      { id: 'gramado', nome: 'Gramado', descricao: 'Plantio e manutenção' },
      { id: 'irrigacao', nome: 'Sistema de Irrigação', descricao: 'Instalação e reparo' },
      { id: 'paisagismo', nome: 'Paisagismo', descricao: 'Projeto de jardins' }
    ]
  },
  {
    id: 'pintura',
    nome: '🎨 Pintura & Acabamentos',
    icon: 'Paintbrush',
    color: 'from-purple-400 to-purple-600',
    especialidades: [
      { id: 'pintor-geral', nome: 'Pintor Geral', descricao: 'Pintura residencial' },
      { id: 'pintura-externa', nome: 'Pintura Externa', descricao: 'Fachadas e muros' },
      { id: 'textura', nome: 'Textura', descricao: 'Aplicação de texturas' },
      { id: 'grafiato', nome: 'Grafiato', descricao: 'Acabamento texturizado' },
      { id: 'verniz', nome: 'Verniz', descricao: 'Envernizamento de madeiras' }
    ]
  },
  {
    id: 'reparacoes',
    nome: '🛠️ Reparações Gerais',
    icon: 'Wrench',
    color: 'from-orange-400 to-orange-600',
    especialidades: [
      { id: 'reparos-gerais', nome: 'Reparos Gerais', descricao: 'Pequenos consertos' },
      { id: 'eletrodomesticos', nome: 'Eletrodomésticos', descricao: 'Conserto de máquinas' },
      { id: 'mobilia', nome: 'Mobília', descricao: 'Montagem de móveis' },
      { id: 'fechaduras', nome: 'Fechaduras', descricao: 'Troca de fechaduras' },
      { id: 'chaveiro', nome: 'Chaveiro', descricao: 'Cópias de chaves' }
    ]
  }
];

// Helper para obter especialidades por categoria
export const getEspecialidadesByCategoria = (categoriaId: string): Especialidade[] => {
  const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
  return categoria?.especialidades || [];
};

// Helper para obter todas as especialidades
export const getAllEspecialidades = (): Especialidade[] => {
  return SERVICE_CATEGORIES.flatMap(c => c.especialidades);
};

// Helper para obter nome da categoria pelo ID
export const getCategoriaNome = (categoriaId: string): string => {
  const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
  return categoria?.nome || categoriaId;
};

// Helper para obter especialidade pelo ID
export const getEspecialidadeNome = (especialidadeId: string): string => {
  for (const cat of SERVICE_CATEGORIES) {
    const esp = cat.especialidades.find(e => e.id === especialidadeId);
    if (esp) return esp.nome;
  }
  return especialidadeId;
};
