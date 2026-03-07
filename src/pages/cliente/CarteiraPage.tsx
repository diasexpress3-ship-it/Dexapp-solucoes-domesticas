import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
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
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Transacao extends Pagamento {
  tipo: 'entrada' | 'saida';
  descricao: string;
  saldoApos: number;
}

interface MetodoPagamento {
  id: string;
  nome: string;
  icon: any;
  cor: string;
  taxa: number;
}

// ============================================
// CONSTANTES
// ============================================
const METODOS_PAGAMENTO: MetodoPagamento[] = [
  { id: 'mpesa', nome: 'M-Pesa', icon: Smartphone, cor: 'from-green-500 to-green-600', taxa: 0.015 },
  { id: 'mkesh', nome: 'Mkesh', icon: Smartphone, cor: 'from-blue-500 to-blue-600', taxa: 0.01 },
  { id: 'emola', nome: 'E-Mola', icon: Smartphone, cor: 'from-red-500 to-red-600', taxa: 0.01 },
  { id: 'transferencia', nome: 'Transferência Bancária', icon: Building, cor: 'from-purple-500 to-purple-600', taxa: 0.02 }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CarteiraPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showExtratoModal, setShowExtratoModal] = useState(false);
  const [valorAdicionar, setValorAdicionar] = useState('');
  const [metodoSelecionado, setMetodoSelecionado] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

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
      setSaldo(5000 - totalGasto); // Saldo inicial de 5000 MT
      
      // Criar histórico de transações
      const transacoesData: Transacao[] = docs.map(doc => ({
        ...doc,
        tipo: 'saida',
        descricao: `Pagamento de serviço - ${doc.solicitacaoId?.slice(-6) || 'N/A'}`,
        saldoApos: 5000 - (docs.filter(d => d.data <= doc.data).reduce((acc, curr) => acc + curr.valor, 0))
      }));
      
      setTransacoes(transacoesData);
      setIsLoading(false);
    });

    return () => unsubscribePagamentos();
  }, [user]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddFunds = async () => {
    const valor = parseFloat(valorAdicionar);
    if (isNaN(valor) || valor < 100) {
      showToast('Valor mínimo é 100 MT', 'error');
      return;
    }

    setProcessing(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Registrar transação
      const novaTransacao = {
        clienteId: user?.id,
        valor,
        tipo: 'entrada',
        metodo: metodoSelecionado,
        status: 'confirmado',
        data: new Date(),
        referencia: `ADD-${Date.now().toString().slice(-8)}`,
        descricao: 'Adição de fundos à carteira'
      };

      await addDoc(collection(db, 'transacoes'), novaTransacao);
      
      setSaldo(prev => prev + valor);
      setShowAddFundsModal(false);
      setValorAdicionar('');
      showToast('Fundos adicionados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao adicionar fundos:', error);
      showToast('Erro ao processar pagamento', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyPix = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado('pix');
    setTimeout(() => setCopiado(null), 2000);
    showToast('Código PIX copiado!', 'success');
  };

  const handleDownloadExtrato = () => {
    // Gerar extrato em CSV
    const headers = ['Data', 'Descrição', 'Tipo', 'Valor', 'Saldo'];
    const rows = transacoes.map(t => [
      formatDate(t.data),
      t.descricao,
      t.tipo === 'entrada' ? 'Entrada' : 'Saída',
      t.tipo === 'entrada' ? `+${t.valor}` : `-${t.valor}`,
      t.saldoApos
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

  // ============================================
  // STATS
  // ============================================
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const ultimaTransacao = transacoes[0];

  // ============================================
  // RENDER
  // ============================================
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* ======================================== */}
          {/* HEADER */}
          {/* ======================================== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <Wallet size={32} className="text-accent" />
                Minha Carteira
              </h1>
              <p className="text-gray-500">Gerencie seus fundos e acompanhe suas transações.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                leftIcon={<Download size={18} />}
                onClick={() => setShowExtratoModal(true)}
              >
                Extrato
              </Button>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddFundsModal(true)}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Adicionar Saldo
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
                <h2 className="text-4xl font-black mb-6">{formatCurrency(saldo)}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-50">Total Gasto</p>
                    <p className="font-bold text-accent">{formatCurrency(totalSaidas)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-50">Cashback</p>
                    <p className="font-bold text-green-400">{formatCurrency(0)}</p>
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
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Método Preferido</p>
                      <p className="text-lg font-black text-primary">M-Pesa</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Usado em 80% das transações</p>
                </CardContent>
              </Card>
            </div>
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
                {transacoes.slice(0, 10).map((transacao, index) => (
                  <motion.div
                    key={transacao.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
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
                            {transacao.metodo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${
                        transacao.tipo === 'entrada' ? 'text-green-600' : 'text-primary'
                      }`}>
                        {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                      </p>
                      <p className="text-[10px] text-gray-400">Saldo: {formatCurrency(transacao.saldoApos)}</p>
                    </div>
                  </motion.div>
                ))}
                
                {transacoes.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <Wallet size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-bold text-gray-400 mb-1">Nenhuma transação encontrada</p>
                    <p className="text-sm">Adicione saldo ou realize serviços para começar.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL ADICIONAR SALDO */}
      {/* ======================================== */}
      <Modal 
        isOpen={showAddFundsModal} 
        onClose={() => setShowAddFundsModal(false)} 
        title="Adicionar Saldo"
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
            <p className="text-xs text-gray-400 mt-1">Valor mínimo: 100 MT</p>
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
                onClick={() => handleCopyPix('12345678901234567890')}
                className="w-full mt-3"
                leftIcon={copiado === 'pix' ? <Check size={16} /> : <Copy size={16} />}
              >
                {copiado === 'pix' ? 'Copiado!' : 'Copiar NIB'}
              </Button>
            </div>
          )}

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

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddFundsModal(false)}
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
              <p className="text-sm text-gray-500">Período: Todo o histórico</p>
              <p className="text-xs text-gray-400">Total de {transacoes.length} transações</p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadExtrato}
              leftIcon={<Download size={18} />}
            >
              Download CSV
            </Button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transacoes.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-primary">{formatDate(transacao.data)}</td>
                    <td className="p-3 text-sm font-bold text-primary">{transacao.descricao}</td>
                    <td className="p-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {transacao.metodo}
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
                    <td className="p-3 font-bold text-primary">{formatCurrency(transacao.saldoApos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
