import { Sparkles, Users, Zap, Droplet, Hammer, Building2, Flower2, Paintbrush, Wrench } from 'lucide-react';

export const SERVICE_CATEGORIES = [
  { id: 'limpeza', name: '🧹 Limpeza Doméstica', icon: Sparkles, color: 'from-blue-400 to-blue-600' },
  { id: 'empregadas', name: '👥 Empregadas Domésticas & Babás', icon: Users, color: 'from-pink-400 to-pink-600' },
  { id: 'eletrica', name: '⚡ Manutenção Elétrica', icon: Zap, color: 'from-yellow-400 to-yellow-600' },
  { id: 'canalizacao', name: '💧 Canalização', icon: Droplet, color: 'from-cyan-400 to-cyan-600' },
  { id: 'carpintaria', name: '🔨 Carpintaria & Marcenaria', icon: Hammer, color: 'from-amber-700 to-amber-900' },
  { id: 'construcao', name: '🏗️ Construção & Obras', icon: Building2, color: 'from-stone-600 to-stone-800' },
  { id: 'jardinagem', name: '🌿 Jardinagem & Exteriores', icon: Flower2, color: 'from-green-400 to-green-600' },
  { id: 'pintura', name: '🎨 Pintura & Acabamentos', icon: Paintbrush, color: 'from-purple-400 to-purple-600' },
  { id: 'reparacoes', name: '🛠️ Reparações Gerais', icon: Wrench, color: 'from-gray-500 to-gray-700' }
];

export const ESPECIALIDADES_POR_CATEGORIA: Record<string, string[]> = {
  '🧹 Limpeza Doméstica': ['Limpeza Geral', 'Limpeza Profunda', 'Limpeza Pós-Obra', 'Limpeza de Escritórios', 'Limpeza de Tapetes', 'Organização'],
  '👥 Empregadas Domésticas & Babás': ['Diarista', 'Mensalista', 'Babá', 'Cuidador de Idosos', 'Cozinheira', 'Passador(a)'],
  '⚡ Manutenção Elétrica': ['Instalações', 'Reparações', 'Tomadas', 'Luminárias', 'Segurança', 'Ar Condicionado'],
  '💧 Canalização': ['Torneiras', 'Desentupimentos', 'Sanitários', 'Canalizações', 'Água Quente'],
  '🔨 Carpintaria & Marcenaria': ['Reparação de Portas', 'Reparação de Móveis', 'Montagem', 'Armários', 'Acabamentos', 'Restauração'],
  '🏗️ Construção & Obras': ['Alvenaria', 'Pintura', 'Telhados', 'Acabamentos', 'Pavimentos'],
  '🌿 Jardinagem & Exteriores': ['Corte de Relva', 'Poda', 'Plantio', 'Irrigação', 'Limpeza', 'Pragas'],
  '🎨 Pintura & Acabamentos': ['Interiores', 'Exteriores', 'Texturas', 'Remoção', 'Preparação', 'Móveis'],
  '🛠️ Reparações Gerais': ['Arranjos', 'Montagem', 'Furações', 'Fechaduras', 'Prateleiras']
};
