import { Timestamp } from 'firebase/firestore';

export type UserRole = 'cliente' | 'prestador' | 'central' | 'admin';
export type UserStatus = 'ativo' | 'pendente' | 'bloqueado' | 'suspenso';

export interface User {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  role: UserRole;
  status: UserStatus;
  dataCadastro: Timestamp | Date;
  ultimoAcesso?: Timestamp | Date;
  photoURL?: string;
  prestadorData?: {
    especialidades: string[];
    categoria: string;
    biUrl?: string;
    profileUrl?: string;
    rating: number;
    trabalhos: number;
    disponivel: boolean;
    agenda: any[];
    biografia?: string;
    localizacao?: string;
    experiencia?: string;
  };
}

export type SolicitacaoStatus = 
  | 'buscando_prestador' 
  | 'prestador_atribuido' 
  | 'em_andamento' 
  | 'concluido' 
  | 'cancelado' 
  | 'waiting_payment';

export interface Solicitacao {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  prestadorId?: string;
  prestadorNome?: string;
  servico: string;
  categoria: string;
  status: SolicitacaoStatus;
  valorTotal: number;
  valor80: number;
  valor20: number;
  endereco: {
    bairro: string;
    quarteirao?: string;
    casa?: string;
  };
  dataSolicitacao: Timestamp | Date;
  dataAgendada?: Timestamp | Date;
  dataConclusao?: Timestamp | Date;
  descricao?: string;
}

export type PagamentoStatus = 'pendente' | 'confirmado' | 'falhou';
export type PagamentoTipo = 'sinal_80' | 'restante_20' | 'deposito' | 'saque' | 'pagamento_servico';

export interface Pagamento {
  id: string;
  clienteId: string;
  clienteNome?: string;
  valor: number;
  metodo: string;
  dados?: string;
  status: PagamentoStatus;
  data: Timestamp | Date;
  tipo: PagamentoTipo;
  solicitacaoId?: string;
  comprovativoUrl?: string;
}

export interface Config {
  landingImagens: {
    hero: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
  };
  configuracoes: {
    nomePlataforma: string;
    emailContato: string;
    telefoneContato: string;
    taxaPlataforma: number;
    taxaSaque: number;
    minSaque: number;
    metodosPagamento: string[];
    contasBancarias: {
      banco: string;
      numero: string;
      titular: string;
    }[];
  };
}
