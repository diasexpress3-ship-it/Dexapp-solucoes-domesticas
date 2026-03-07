import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Pagamento } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History, 
  CreditCard,
  Download,
  DollarSign,
  Smartphone,
  Building,
  CheckCircle2,
  Loader2,
  X,
  Receipt,
  TrendingUp,
  Calendar,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  Printer,
  Share2,
  Home,
  LogOut,
  RefreshCw,
  AlertCircle,
  Info,
  Percent,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ============================================
// INTERFACES
// ============================================
interface Transacao extends Pagamento {
  tipo: 'entrada' | 'saida';
  descricao: string;
  saldoApos: number;
  categoria?: string;
  metodoDetalhado?: string;
  referencia?: string;
  comprovativo?: string;
}

interface MetodoPagamento {
  id: string;
  nome: string;
  icon: any;
  cor: string;
  taxa: number;
  limiteMin: number;
  limiteMax: number;
  tempoProcessamento: string;
}

interface Fatura {
  id: string;
  numero: string;
  data: Date;
  descricao: string;
  valor: number;
  status: 'pago' | 'pendente' | 'cancelado';
  metodo: string;
  pdfUrl?: string;
}

// ============================================
// CONSTANTES
// ============================================
const METODOS_PAGAMENTO: MetodoPagamento[] = [
  { 
    id: 'mpesa', 
    nome: 'M-Pesa', 
    icon: Smartphone, 
    cor: 'from-green-500 to-green-600', 
    taxa: 0.015,
    limiteMin: 10,
    limiteMax: 50000,
    tempoProcessamento: 'Imediato'
  },
  { 
    id: 'mkesh', 
    nome: 'Mkesh', 
    icon: Smartphone, 
    cor: 'from-blue-500 to-blue-600', 
    taxa: 0.01,
    limiteMin: 10,
    limiteMax: 50000,
    tempoProcessamento: 'Imediato'
  },
  { 
    id: 'emola', 
    nome: 'E-Mola', 
    icon: Smartphone, 
    cor: 'from-red-500 to-red-600', 
    taxa: 0.01,
    limiteMin: 10,
    limiteMax: 50000,
    tempoProcessamento: 'Imediato'
  },
  { 
    id: 'transferencia', 
    nome: 'Transferência Bancária', 
    icon: Building, 
    cor: 'from-purple-500 to-purple-600', 
    taxa: 0.02,
    limiteMin: 1000,
    limiteMax: 500000,
    tempoProcessamento: '1-2 dias úteis'
  }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CarteiraPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [saldoBloqueado, setSaldoBloqueado] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  
  // Modais
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showExtratoModal, setShowExtratoModal] = useState(false);
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  
  // Formulário de adicionar fundos
  const [valorAdicionar, setValorAdicionar] = useState('');
  const [metodoSelecionado, setMetodoSelecionado] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [referencia, setReferencia] = useState('');
  
  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | 'mes' | 'trimestre' | 'ano'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Logout efetuado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao fazer logout', 'error');
    }
  };

  // ============================================
  // BUSCAR DADOS
  // ============================================
  useEffect(() => {
    if (!user) return;

    // Buscar pagamentos do cliente
    const pagamentosQuery = query(
      collection(db, 'pagamentos'),
      where('clienteId', '==', user.id),
      orderBy('data', 'desc')
    );

    const unsubscribePagamentos = onSnapshot(pagamentosQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pagamento));
      setPagamentos(docs);
      
      // Calcular saldo (simulado - em produção viria de uma carteira real)
      const totalGasto = docs.reduce((acc, curr) => acc + curr.valor, 0);
      const totalEntradas = 10000; // Simulado
      const saldoAtual = totalEntradas - totalGasto;
      const saldoBloq = totalGasto * 0.1; // 10% bloqueado (simulado)
      
      setSaldo(saldoAtual);
      setSaldoBloqueado(saldoBloq);
      
      // Criar histórico de transações
      const transacoesData: Transacao[] = [
        // Entradas simuladas
        ...Array(3).fill(null).map((_, i) => ({
          id: `entrada-${i}`,
          tipo: 'entrada',
          valor: Math.random() * 5000 + 1000,
          data: new Date(Date.now() - i * 86400000),
          descricao: 'Adição de fundos',
          metodo: 'M-Pesa',
          status: 'confirmado',
          saldoApos: saldoAtual - i * 1000,
          referencia: `REF${Math.random().toString(36).substring(7).toUpperCase()}`
        })),
        // Saídas (pagamentos reais)
        ...docs.map((doc, index) => ({
          ...doc,
          tipo: 'saida',
          descricao: `Pagamento de serviço - ${doc.solicitacaoId?.slice(-6) || 'N/A'}`,
          saldoApos: saldoAtual - index * 500,
          metodoDetalhado: doc.metodo || 'M-Pesa',
          referencia: doc.referencia || `TRX-${Math.random().toString(36).substring(7).toUpperCase()}`
        }))
      ].sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setTransacoes(transacoesData);

      // Criar faturas
      const faturasData: Fatura[] = docs
        .filter(d => d.status === 'confirmado')
        .map((doc, index) => ({
          id: doc.id || `fat-${index}`,
          numero: `FAT-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
          data: doc.data,
          descricao: `Serviço de ${doc.categoria || 'limpeza'}`,
          valor: doc.valor,
          status: 'pago',
          metodo: doc.metodo || 'M-Pesa',
          pdfUrl: `#`
        }));
      
      setFaturas(faturasData);
      setIsLoading(false);
    });

    return () => unsubscribePagamentos();
  }, [user]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddFunds = async () => {
    const valor = parseFloat(valorAdicionar);
    const metodo = METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado);
    
    if (!metodo) return;

    if (isNaN(valor) || valor < metodo.limiteMin) {
      showToast(`Valor mínimo é ${metodo.limiteMin} MT`, 'error');
      return;
    }

    if (valor > metodo.limiteMax) {
      showToast(`Valor máximo é ${metodo.limiteMax} MT`, 'error');
      return;
    }

    setProcessing(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      const valorComTaxa = valor * (1 + metodo.taxa);
      const referenciaGerada = `ADD-${Date.now().toString().slice(-8)}-${metodo.id.toUpperCase()}`;

      // Registrar transação
      const novaTransacao = {
        clienteId: user?.id,
        valor,
        valorComTaxa,
        tipo: 'entrada',
        metodo: metodo.nome,
        metodoId: metodo.id,
        taxa: metodo.taxa,
        status: 'confirmado',
        data: new Date(),
        referencia: referenciaGerada,
        descricao: 'Adição de fundos à carteira'
      };

      await addDoc(collection(db, 'transacoes'), novaTransacao);
      
      setSaldo(prev => prev + valor);
      setReferencia(referenciaGerada);
      
      showToast('Fundos adicionados com sucesso!', 'success');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowAddFundsModal(false);
        setValorAdicionar('');
        setReferencia('');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao adicionar fundos:', error);
      showToast('Erro ao processar pagamento', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleDownloadExtrato = () => {
    // Filtrar transações baseado nos filtros
    let transacoesFiltradas = [...transacoes];
    
    const agora = new Date();
    if (filtroPeriodo === 'mes') {
      const mesPassado = new Date(agora.setMonth(agora.getMonth() - 1));
      transacoesFiltradas = transacoesFiltradas.filter(t => t.data >= mesPassado);
    } else if (filtroPeriodo === 'trimestre') {
      const tresMeses = new Date(agora.setMonth(agora.getMonth() - 3));
      transacoesFiltradas = transacoesFiltradas.filter(t => t.data >= tresMeses);
    } else if (filtroPeriodo === 'ano') {
      const anoPassado = new Date(agora.setFullYear(agora.getFullYear() - 1));
      transacoesFiltradas = transacoesFiltradas.filter(t => t.data >= anoPassado);
    }

    if (filtroTipo !== 'todos') {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === filtroTipo);
    }

    // Gerar extrato em CSV
    const headers = ['Data', 'Descrição', 'Tipo', 'Método', 'Valor', 'Saldo', 'Referência'];
    const rows = transacoesFiltradas.map(t => [
      formatDate(t.data),
      t.descricao,
      t.tipo === 'entrada' ? 'Entrada' : 'Saída',
      t.metodo || 'N/A',
      t.tipo === 'entrada' ? `+${t.valor}` : `-${t.valor}`,
      t.saldoApos || 0,
      t.referencia || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato_${formatDate(new Date()).replace(/\//g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Extrato baixado com sucesso!', 'success');
  };

  const handleDownloadFatura = (fatura: Fatura) => {
    showToast('A gerar fatura...', 'info');
    setTimeout(() => {
      showToast('Fatura gerada com sucesso!', 'success');
    }, 1500);
  };

  const handleVerDetalhes = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    setShowDetalhesModal(true);
  };

  const handleVerFatura = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setShowFaturaModal(true);
  };

  // ============================================
  // STATS
  // ============================================
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const ultimaTransacao = transacoes[0];
  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroTipo !== 'todos' && t.tipo !== filtroTipo) return false;
    
    const agora = new Date();
    if (filtroPeriodo === 'mes') {
      const mesPassado = new Date(agora.setMonth(agora.getMonth() - 1));
      return t.data >= mesPassado;
    } else if (filtroPeriodo === 'trimestre') {
      const tresMeses = new Date(agora.setMonth(agora.getMonth() - 3));
      return t.data >= tresMeses;
    } else if (filtroPeriodo === 'ano') {
      const anoPassado = new Date(agora.setFullYear(agora.getFullYear() - 1));
      return t.data >= anoPassado;
    }
    return true;
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* ======================================== */}
          {/* HEADER */}
          {/* ======================================== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                  <Wallet size={32} className="text-accent" />
                  Minha Carteira
                </h1>
                <p className="text-gray-500">Gerencie seus fundos e acompanhe suas transações.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                leftIcon={<Home size={16} />}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Início
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut size={16} />}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Sair
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExtratoModal(true)}
                leftIcon={<Download size={16} />}
              >
                Extrato
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
                title="Atualizar"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>

          {/* ======================================== */}
          {/* SALDO E STATS */}
          {/* ======================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Saldo Card */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12" />
              <CardContent className="p-8 relative z-10">
                <p className="text-xs font-bold uppercase opacity-70 mb-2">Saldo Disponível</p>
                <h2 className="text-4xl font-black mb-2">{formatCurrency(saldo)}</h2>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-4">
                  <Clock size={14} />
                  <span>Saldo bloqueado: {formatCurrency(saldoBloqueado)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-50">Total Entradas</p>
                    <p className="font-bold text-green-400">{formatCurrency(totalEntradas)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-50">Total Saídas</p>
                    <p className="font-bold text-accent">{formatCurrency(totalSaidas)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <ArrowDownRight size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Última Transação</p>
                      <p className="text-lg font-black text-primary">
                        {ultimaTransacao ? formatCurrency(ultimaTransacao.valor) : 'MT 0,00'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {ultimaTransacao ? formatDate(ultimaTransacao.data) : 'Nenhuma transação'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Entradas</p>
                      <p className="text-lg font-black text-primary">{formatCurrency(totalEntradas)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Desde o início</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Faturas</p>
                      <p className="text-lg font-black text-primary">{faturas.length}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{faturas.length} emitidas</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ======================================== */}
          {/* AÇÕES RÁPIDAS */}
          {/* ======================================== */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent"
              onClick={() => setShowAddFundsModal(true)}
            >
              <Plus size={24} />
              <span className="text-xs font-bold">Adicionar Fundos</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent"
              onClick={() => setShowExtratoModal(true)}
            >
              <Download size={24} />
              <span className="text-xs font-bold">Extrato</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent"
              onClick={() => navigate('/cliente/dashboard')}
            >
              <History size={24} />
              <span className="text-xs font-bold">Histórico</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent"
              onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}
            >
              <CreditCard size={24} />
              <span className="text-xs font-bold">Métodos</span>
            </Button>
          </div>

          {/* ======================================== */}
          {/* FILTROS */}
          {/* ======================================== */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filtroPeriodo === 'todos' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filtroPeriodo === 'mes' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('mes')}
            >
              Último mês
            </Button>
            <Button
              variant={filtroPeriodo === 'trimestre' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('trimestre')}
            >
              Últimos 3 meses
            </Button>
            <Button
              variant={filtroPeriodo === 'ano' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('ano')}
            >
              Último ano
            </Button>
            <div className="w-px h-8 bg-gray-200 mx-2" />
            <Button
              variant={filtroTipo === 'todos' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroTipo('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filtroTipo === 'entrada' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroTipo('entrada')}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              Entradas
            </Button>
            <Button
              variant={filtroTipo === 'saida' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroTipo('saida')}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Saídas
            </Button>
          </div>

          {/* ======================================== */}
          {/* HISTÓRICO DE TRANSAÇÕES */}
          {/* ======================================== */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History size={20} className="text-primary" />
                <h3 className="font-bold text-primary">Histórico de Transações</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowExtratoModal(true)}
              >
                Ver Tudo
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {transacoesFiltradas.slice(0, 10).map((transacao, index) => (
                  <motion.div
                    key={transacao.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => handleVerDetalhes(transacao)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transacao.tipo === 'entrada' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {transacao.tipo === 'entrada' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{transacao.descricao}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{formatDate(transacao.data)}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {transacao.metodo || 'M-Pesa'}
                          </span>
                          {transacao.referencia && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-[10px] text-gray-400">ID: {transacao.referencia.slice(-8)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${
                        transacao.tipo === 'entrada' ? 'text-green-600' : 'text-primary'
                      }`}>
                        {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                      </p>
                      {transacao.saldoApos !== undefined && (
                        <p className="text-[10px] text-gray-400">Saldo: {formatCurrency(transacao.saldoApos)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {transacoesFiltradas.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <Wallet size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-bold text-gray-400 mb-1">Nenhuma transação encontrada</p>
                    <p className="text-sm">Adicione fundos ou realize serviços para começar.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ======================================== */}
          {/* FATURAS RECENTES */}
          {/* ======================================== */}
          {faturas.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-black text-primary flex items-center gap-2 mb-4">
                <Receipt size={20} className="text-accent" />
                Faturas Recentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faturas.slice(0, 3).map((fatura) => (
                  <Card key={fatura.id} className="hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleVerFatura(fatura)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                          <FileText size={20} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {fatura.status}
                        </span>
                      </div>
                      <p className="font-bold text-primary mb-1">{fatura.numero}</p>
                      <p className="text-sm text-gray-600 mb-2">{fatura.descricao}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{formatDate(fatura.data)}</span>
                        <span className="font-black text-primary">{formatCurrency(fatura.valor)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL ADICIONAR FUNDOS */}
      {/* ======================================== */}
      <Modal 
        isOpen={showAddFundsModal} 
        onClose={() => {
          setShowAddFundsModal(false);
          setValorAdicionar('');
          setReferencia('');
        }} 
        title="Adicionar Fundos"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {METODOS_PAGAMENTO.map((metodo) => (
              <button
                key={metodo.id}
                onClick={() => setMetodoSelecionado(metodo.id)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  metodoSelecionado === metodo.id
                    ? `border-accent bg-gradient-to-r ${metodo.cor} text-white`
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <metodo.icon size={24} className={metodoSelecionado === metodo.id ? 'text-white' : 'text-gray-600'} />
                <p className={`font-bold mt-2 ${metodoSelecionado === metodo.id ? 'text-white' : 'text-primary'}`}>
                  {metodo.nome}
                </p>
                <p className={`text-xs mt-1 ${metodoSelecionado === metodo.id ? 'text-white/80' : 'text-gray-400'}`}>
                  Taxa: {metodo.taxa * 100}%
                </p>
                <p className={`text-xs ${metodoSelecionado === metodo.id ? 'text-white/60' : 'text-gray-400'}`}>
                  {metodo.tempoProcessamento}
                </p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Valor a Adicionar (MT)
            </label>
            <Input
              type="number"
              value={valorAdicionar}
              onChange={(e) => setValorAdicionar(e.target.value)}
              placeholder="Ex: 1000"
              min="100"
              step="100"
            />
            {metodoSelecionado && (
              <p className="text-xs text-gray-400 mt-1">
                Mín: {METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.limiteMin} MT | 
                Máx: {METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.limiteMax} MT
              </p>
            )}
          </div>

          {metodoSelecionado === 'transferencia' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-bold text-blue-700 mb-2">Dados para Transferência:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Banco:</span>
                  <span className="font-bold text-primary">BIM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">NIB:</span>
                  <span className="font-bold text-primary">12345678901234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Nome:</span>
                  <span className="font-bold text-primary">DEXAPP, LDA</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard('12345678901234567890', 'NIB')}
                className="w-full mt-3"
                leftIcon={copiado === 'NIB' ? <Check size={16} /> : <Copy size={16} />}
              >
                {copiado === 'NIB' ? 'Copiado!' : 'Copiar NIB'}
              </Button>
            </div>
          )}

          {valorAdicionar && metodoSelecionado && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Valor:</span>
                <span className="font-bold text-primary">{formatCurrency(parseFloat(valorAdicionar) || 0)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa ({METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.taxa * 100}%):</span>
                <span className="font-bold text-primary">
                  {formatCurrency((parseFloat(valorAdicionar) || 0) * (METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.taxa || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold text-primary">Total a Pagar:</span>
                <span className="text-xl font-black text-accent">
                  {formatCurrency((parseFloat(valorAdicionar) || 0) * (1 + (METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.taxa || 0)))}
                </span>
              </div>
            </div>
          )}

          {referencia && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <p className="font-bold text-green-700">Pagamento processado!</p>
              </div>
              <p className="text-sm text-green-600 mb-2">Referência: {referencia}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(referencia, 'Referência')}
                className="w-full border-green-300 text-green-700 hover:bg-green-100"
                leftIcon={copiado === 'Referência' ? <Check size={16} /> : <Copy size={16} />}
              >
                {copiado === 'Referência' ? 'Copiado!' : 'Copiar Referência'}
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddFundsModal(false);
                setValorAdicionar('');
                setReferencia('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddFunds}
              disabled={processing || !valorAdicionar}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Processando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL EXTRATO */}
      {/* ======================================== */}
      <Modal 
        isOpen={showExtratoModal} 
        onClose={() => setShowExtratoModal(false)} 
        title="Extrato Detalhado"
        size="full"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Período: {filtroPeriodo === 'todos' ? 'Todo histórico' : 
                        filtroPeriodo === 'mes' ? 'Último mês' :
                        filtroPeriodo === 'trimestre' ? 'Últimos 3 meses' : 'Último ano'}
              </p>
              <p className="text-xs text-gray-400">Total de {transacoesFiltradas.length} transações</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadExtrato}
                leftIcon={<Download size={18} />}
              >
                Download CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                leftIcon={<Printer size={18} />}
              >
                Imprimir
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Data</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Método</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Valor</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Saldo</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Referência</th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transacoesFiltradas.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-primary">{formatDate(transacao.data)}</td>
                    <td className="p-3 text-sm font-bold text-primary">{transacao.descricao}</td>
                    <td className="p-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {transacao.metodo || 'M-Pesa'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        transacao.tipo === 'entrada' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className={`p-3 font-black ${
                      transacao.tipo === 'entrada' ? 'text-green-600' : 'text-primary'
                    }`}>
                      {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(transacao.saldoApos || 0)}</td>
                    <td className="p-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {transacao.referencia?.slice(-8) || 'N/A'}
                      </code>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVerDetalhes(transacao)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DETALHES DA TRANSAÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showDetalhesModal} onClose={() => setShowDetalhesModal(false)} title="Detalhes da Transação">
        {selectedTransacao && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedTransacao.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {selectedTransacao.tipo === 'entrada' ? <ArrowDownRight size={32} /> : <ArrowUpRight size={32} />}
              </div>
              <div>
                <h3 className="font-bold text-primary text-xl">{selectedTransacao.descricao}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedTransacao.data)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Valor</p>
                <p className={`text-2xl font-black ${
                  selectedTransacao.tipo === 'entrada' ? 'text-green-600' : 'text-primary'
                }`}>
                  {selectedTransacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(selectedTransacao.valor)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Saldo após transação</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(selectedTransacao.saldoApos || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Método</p>
                <p className="font-bold text-primary">{selectedTransacao.metodo || 'M-Pesa'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {selectedTransacao.status || 'Confirmado'}
                </span>
              </div>
              {selectedTransacao.referencia && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Referência</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                      {selectedTransacao.referencia}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(selectedTransacao.referencia!, 'Referência')}
                      className="text-gray-400 hover:text-accent"
                    >
                      {copiado === 'Referência' ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL FATURA */}
      {/* ======================================== */}
      <Modal isOpen={showFaturaModal} onClose={() => setShowFaturaModal(false)} title="Detalhes da Fatura" size="lg">
        {selectedFatura && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary to-blue-900 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black">DEXAPP</h2>
                  <p className="text-xs opacity-80">Soluções Domésticas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">FATURA</p>
                  <p className="text-xs opacity-80">{selectedFatura.numero}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="opacity-80">Data de emissão</p>
                  <p className="font-bold">{formatDate(selectedFatura.data)}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-80">Status</p>
                  <p className="font-bold text-green-400">PAGO</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-bold text-primary">{user?.nome}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="border-t border-b border-gray-100 py-4">
                <p className="font-bold text-primary mb-2">{selectedFatura.descricao}</p>
                <p className="text-xs text-gray-500">Método de pagamento: {selectedFatura.metodo}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-primary">Total</p>
                <p className="text-3xl font-black text-accent">{formatCurrency(selectedFatura.valor)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowFaturaModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadFatura(selectedFatura)}
                className="flex-1"
                leftIcon={<Download size={16} />}
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1"
                leftIcon={<Printer size={16} />}
              >
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
