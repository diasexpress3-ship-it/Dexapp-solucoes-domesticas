// ============================================
// CATEGORIAS DE SERVIÇOS COM ESPECIALIDADES
// ============================================

export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  tamanho: 'pequeno' | 'medio' | 'grande'; // TAMANHO do serviço (não tempo)
  precoBase: number;
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
      { id: 'limpeza-geral', nome: 'Limpeza Geral', descricao: 'Limpeza completa de residências', tamanho: 'pequeno', precoBase: 1500 },
      { id: 'limpeza-pesada', nome: 'Limpeza Pós-Obra', descricao: 'Limpeza após reformas e construções', tamanho: 'medio', precoBase: 3500 },
      { id: 'limpeza-escritorio', nome: 'Limpeza de Escritórios', descricao: 'Limpeza comercial e corporativa', tamanho: 'pequeno', precoBase: 1800 },
      { id: 'limpeza-tapetes', nome: 'Lavagem de Tapetes', descricao: 'Limpeza profunda de tapetes', tamanho: 'pequeno', precoBase: 2000 },
      { id: 'limpeza-estofados', nome: 'Limpeza de Estofados', descricao: 'Hygienização de sofás e poltronas', tamanho: 'pequeno', precoBase: 2200 },
      { id: 'limpeza-vidros', nome: 'Limpeza de Vidros', descricao: 'Limpeza de janelas e fachadas', tamanho: 'pequeno', precoBase: 1200 }
    ]
  },
  {
    id: 'empregadas',
    nome: '👥 Empregadas Domésticas & Babás',
    icon: 'Users',
    color: 'from-pink-400 to-pink-600',
    especialidades: [
      { id: 'empregada-fixa', nome: 'Empregada Fixa', descricao: 'Serviço regular semanal ou mensal', tamanho: 'medio', precoBase: 5000 },
      { id: 'diarista', nome: 'Diarista', descricao: 'Serviço por dia ou período', tamanho: 'pequeno', precoBase: 1200 },
      { id: 'baba', nome: 'Babá', descricao: 'Cuidados com crianças', tamanho: 'pequeno', precoBase: 1500 },
      { id: 'cuidador-idoso', nome: 'Cuidador de Idosos', descricao: 'Assistência para idosos', tamanho: 'medio', precoBase: 2500 },
      { id: 'passadeira', nome: 'Serviço de Passadoria', descricao: 'Passar roupa', tamanho: 'pequeno', precoBase: 800 },
      { id: 'cozinheira', nome: 'Cozinheira', descricao: 'Preparo de refeições', tamanho: 'pequeno', precoBase: 1500 }
    ]
  },
  {
    id: 'eletrica',
    nome: '⚡ Manutenção Elétrica',
    icon: 'Zap',
    color: 'from-yellow-400 to-yellow-600',
    especialidades: [
      { id: 'eletricista-geral', nome: 'Eletricista Geral', descricao: 'Instalações e reparos elétricos', tamanho: 'pequeno', precoBase: 2000 },
      { id: 'instalacao-lampadas', nome: 'Instalação de Lâmpadas', descricao: 'Troca e instalação de iluminação', tamanho: 'pequeno', precoBase: 800 },
      { id: 'reparo-tomadas', nome: 'Reparo de Tomadas', descricao: 'Troca e conserto de tomadas', tamanho: 'pequeno', precoBase: 1000 },
      { id: 'quadro-distribuicao', nome: 'Quadro de Distribuição', descricao: 'Instalação e manutenção', tamanho: 'medio', precoBase: 3500 },
      { id: 'interruptores', nome: 'Interruptores', descricao: 'Troca e instalação', tamanho: 'pequeno', precoBase: 800 },
      { id: 'curto-circuito', nome: 'Curto-Circuito', descricao: 'Diagnóstico e reparo', tamanho: 'pequeno', precoBase: 1800 }
    ]
  },
  {
    id: 'canalizacao',
    nome: '💧 Canalização',
    icon: 'Droplets',
    color: 'from-cyan-400 to-cyan-600',
    especialidades: [
      { id: 'canalizador-geral', nome: 'Canalizador Geral', descricao: 'Serviços de água e esgoto', tamanho: 'pequeno', precoBase: 1800 },
      { id: 'desentupimento', nome: 'Desentupimento', descricao: 'Desentupir pias e vasos', tamanho: 'pequeno', precoBase: 1500 },
      { id: 'torneiras', nome: 'Troca de Torneiras', descricao: 'Instalação de torneiras', tamanho: 'pequeno', precoBase: 800 },
      { id: 'caixas-agua', nome: 'Caixas de Água', descricao: 'Limpeza e instalação', tamanho: 'medio', precoBase: 2500 },
      { id: 'esgoto', nome: 'Problemas de Esgoto', descricao: 'Reparo em encanamentos', tamanho: 'grande', precoBase: 5000 },
      { id: 'aquecedores', nome: 'Aquecedores', descricao: 'Instalação de boilers', tamanho: 'medio', precoBase: 2200 }
    ]
  },
  {
    id: 'carpintaria',
    nome: '🔨 Carpintaria & Marcenaria',
    icon: 'Hammer',
    color: 'from-amber-600 to-amber-800',
    especialidades: [
      { id: 'carpinteiro-geral', nome: 'Carpinteiro Geral', descricao: 'Móveis e estruturas de madeira', tamanho: 'medio', precoBase: 3000 },
      { id: 'moveis-planejados', nome: 'Móveis Planejados', descricao: 'Projeto e montagem', tamanho: 'grande', precoBase: 8000 },
      { id: 'portas-janelas', nome: 'Portas e Janelas', descricao: 'Instalação e reparo', tamanho: 'medio', precoBase: 2500 },
      { id: 'armarios', nome: 'Armários', descricao: 'Montagem de armários', tamanho: 'medio', precoBase: 2000 },
      { id: 'reparo-moveis', nome: 'Reparo de Móveis', descricao: 'Restauração', tamanho: 'pequeno', precoBase: 1500 },
      { id: 'estantes', nome: 'Estantes', descricao: 'Instalação de prateleiras', tamanho: 'pequeno', precoBase: 1200 }
    ]
  },
  {
    id: 'construcao',
    nome: '🏗️ Construção & Obras',
    icon: 'Building2',
    color: 'from-slate-600 to-slate-800',
    especialidades: [
      { id: 'pedreiro', nome: 'Pedreiro', descricao: 'Obras e reformas', tamanho: 'grande', precoBase: 10000 },
      { id: 'azulejista', nome: 'Azulejista', descricao: 'Assentamento de azulejos', tamanho: 'medio', precoBase: 4500 },
      { id: 'gesseiro', nome: 'Gesseiro', descricao: 'Forros e paredes de gesso', tamanho: 'medio', precoBase: 3500 },
      { id: 'pintor', nome: 'Pintor', descricao: 'Pintura de paredes', tamanho: 'medio', precoBase: 3000 },
      { id: 'piscineiro', nome: 'Piscineiro', descricao: 'Construção de piscinas', tamanho: 'grande', precoBase: 15000 }
    ]
  },
  {
    id: 'jardinagem',
    nome: '🌿 Jardinagem & Exteriores',
    icon: 'Flower2',
    color: 'from-green-400 to-green-600',
    especialidades: [
      { id: 'jardineiro', nome: 'Jardineiro', descricao: 'Manutenção de jardins', tamanho: 'pequeno', precoBase: 1200 },
      { id: 'poda-arvores', nome: 'Poda de Árvores', descricao: 'Corte e poda', tamanho: 'medio', precoBase: 2500 },
      { id: 'gramado', nome: 'Gramado', descricao: 'Plantio e manutenção', tamanho: 'medio', precoBase: 2000 },
      { id: 'irrigacao', nome: 'Sistema de Irrigação', descricao: 'Instalação e reparo', tamanho: 'medio', precoBase: 3000 },
      { id: 'paisagismo', nome: 'Paisagismo', descricao: 'Projeto de jardins', tamanho: 'grande', precoBase: 6000 }
    ]
  },
  {
    id: 'pintura',
    nome: '🎨 Pintura & Acabamentos',
    icon: 'Paintbrush',
    color: 'from-purple-400 to-purple-600',
    especialidades: [
      { id: 'pintor-geral', nome: 'Pintor Geral', descricao: 'Pintura residencial', tamanho: 'medio', precoBase: 3000 },
      { id: 'pintura-externa', nome: 'Pintura Externa', descricao: 'Fachadas e muros', tamanho: 'grande', precoBase: 8000 },
      { id: 'textura', nome: 'Textura', descricao: 'Aplicação de texturas', tamanho: 'medio', precoBase: 3500 },
      { id: 'grafiato', nome: 'Grafiato', descricao: 'Acabamento texturizado', tamanho: 'medio', precoBase: 3500 },
      { id: 'verniz', nome: 'Verniz', descricao: 'Envernizamento de madeiras', tamanho: 'pequeno', precoBase: 1500 }
    ]
  },
  {
    id: 'reparacoes',
    nome: '🛠️ Reparações Gerais',
    icon: 'Wrench',
    color: 'from-orange-400 to-orange-600',
    especialidades: [
      { id: 'reparos-gerais', nome: 'Reparos Gerais', descricao: 'Pequenos consertos', tamanho: 'pequeno', precoBase: 1000 },
      { id: 'eletrodomesticos', nome: 'Eletrodomésticos', descricao: 'Conserto de máquinas', tamanho: 'medio', precoBase: 2500 },
      { id: 'mobilia', nome: 'Mobília', descricao: 'Montagem de móveis', tamanho: 'pequeno', precoBase: 800 },
      { id: 'fechaduras', nome: 'Fechaduras', descricao: 'Troca de fechaduras', tamanho: 'pequeno', precoBase: 600 },
      { id: 'chaveiro', nome: 'Chaveiro', descricao: 'Cópias de chaves', tamanho: 'pequeno', precoBase: 400 }
    ]
  }
];

// ============================================
// HELPERS
// ============================================

export const getEspecialidadesByCategoria = (categoriaId: string): Especialidade[] => {
  const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
  return categoria?.especialidades || [];
};

export const getAllEspecialidades = (): Especialidade[] => {
  return SERVICE_CATEGORIES.flatMap(c => c.especialidades);
};

export const getCategoriaNome = (categoriaId: string): string => {
  const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
  return categoria?.nome || categoriaId;
};

export const getEspecialidadeNome = (especialidadeId: string): string => {
  for (const cat of SERVICE_CATEGORIES) {
    const esp = cat.especialidades.find(e => e.id === especialidadeId);
    if (esp) return esp.nome;
  }
  return especialidadeId;
};

export const getSpecialtiesByCategory = (categoryId: string): Especialidade[] => {
  return getEspecialidadesByCategoria(categoryId);
};

export const ESPECIALIDADES_POR_CATEGORIA = SERVICE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.especialidades;
  return acc;
}, {} as Record<string, Especialidade[]>);

// ============================================
// FUNÇÕES PARA CÁLCULO DE PREÇO BASEADO NO TAMANHO
// ============================================

export const calcularPrecoEstimado = (
  especialidadeId: string,
  tamanho: 'pequeno' | 'medio' | 'grande'
): number => {
  const especialidade = getAllEspecialidades().find(e => e.id === especialidadeId);
  if (!especialidade) return 0;

  const multiplicador = {
    pequeno: 1,
    medio: 1.5,
    grande: 2.5
  };

  return especialidade.precoBase * multiplicador[tamanho];
};

export const getTamanhoDescricao = (tamanho: 'pequeno' | 'medio' | 'grande'): string => {
  switch (tamanho) {
    case 'pequeno': return 'Pequeno (1-6 horas)';
    case 'medio': return 'Médio (24-48 horas)';
    case 'grande': return 'Grande (mais de 48 horas, orçamento via central)';
    default: return '';
  }
};
