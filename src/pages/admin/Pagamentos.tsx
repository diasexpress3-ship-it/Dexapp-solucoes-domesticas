import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft,
  Home,
  LogOut,
  RefreshCw,
  Download,
  Filter,
  Search,
  Wallet,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Building,
  Calendar,
  TrendingUp,
  FileText,
  Printer,
  Mail,
  Phone,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/utils';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Saque {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  prestadorEmail?: string;
  prestadorTelefone?: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado';
  dataSolicitacao: Date;
  dataProcessamento?: Date;
  processadoPor?: string;
  observacao?: string;
  metodoPagamento: string;
  dadosBancarios: {
    banco: string;
    conta: string;
    titular?: string;
    nib?: string;
  };
  comprovativo?: string;
}

interface PagamentoStats {
  totalPendente: number;
  totalAprovado: number;
  totalProcessado: number;
  totalRejeitado: number;
  valorPendente: number;
  valorAprovado: number;
  valorProcessado: number;
  valorRejeitado: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Pagamentos() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [saques, setSaques] = useState<Saque[]>([]);
  const [filteredSaques, setFilteredSaques] = useState<Saque[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pendente');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSaque, setSelectedSaque] = useState<Saque | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<PagamentoStats>({
    totalPendente: 0,
    totalAprovado: 0,
    totalProcessado: 0,
    totalRejeitado: 0,
    valorPendente: 0,
    valorAprovado: 0,
    valorProcessado: 0,
    valorRejeitado: 0
  });

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
  // BUSCAR SAQUES
  // ============================================
  useEffect(() => {
    const q = query(
      collection(db, 'saques'),
      orderBy('dataSolicitacao', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataSolicitacao: doc.data().dataSolicitacao?.toDate?.() || new Date(doc.data().dataSolicitacao),
        dataProcessamento: doc.data().dataProcessamento?.toDate?.() || null
      } as Saque));
      
      setSaques(docs);
      
      // Calcular estatísticas
      const pendentes = docs.filter(s => s.status === 'pendente');
      const aprovados = docs.filter(s => s.status === 'aprovado');
      const processados = docs.filter(s => s.status === 'processado');
      const rejeitados = docs.filter(s => s.status === 'rejeitado');
      
      setStats({
        totalPendente: pendentes.length,
        totalAprovado: aprovados.length,
        totalProcessado: processados.length,
        totalRejeitado: rejeitados.length,
        valorPendente: pendentes.reduce((acc, curr) => acc + curr.valor, 0),
        valorAprovado: aprovados.reduce((acc, curr) => acc + curr.valor, 0),
        valorProcessado: processados.reduce((acc, curr) => acc + curr.valor, 0),
        valorRejeitado: rejeitados.reduce((acc, curr) => acc + curr.valor, 0)
      });

      filterSaques(filterStatus, docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // FILTRAR SAQUES
  // ============================================
  useEffect(() => {
    filterSaques(filterStatus, saques);
  }, [searchTerm, saques]);

  const filterSaques = (status: string, docs = saques) => {
    let filtered = docs;

    // Filtro por status
    if (status !== 'todos') {
      filtered = filtered.filter(s => s.status === status);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.prestadorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prestadorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dadosBancarios?.conta.includes(searchTerm)
      );
    }

    setFilteredSaques(filtered);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterSaques(status);
  };

  // ============================================
  // FUNÇÕES CRUD
  // ============================================
  const handleViewDetails = (saque: Saque) => {
    setSelectedSaque(saque);
    setShowDetailsModal(true);
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Confirmar aprovação deste saque?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'saques', id), {
        status: 'aprovado',
        dataProcessamento: new Date(),
        processadoPor: user?.id
      });
      showToast('Saque aprovado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao aprovar saque:', error);
      showToast('Erro ao aprovar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcess = async (id: string) => {
    if (!window.confirm('Confirmar que o pagamento foi processado?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'saques', id), {
        status: 'processado',
        dataProcessamento: new Date(),
        processadoPor: user?.id
      });
      showToast('Pagamento marcado como processado!', 'success');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      showToast('Erro ao processar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSaque) return;
    
    setActionLoading(selectedSaque.id);
    try {
      await updateDoc(doc(db, 'saques', selectedSaque.id), {
        status: 'rejeitado',
        dataProcessamento: new Date(),
        processadoPor: user?.id,
        observacao: rejectReason || 'Rejeitado pela central'
      });
      showToast('Saque rejeitado', 'info');
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar saque:', error);
      showToast('Erro ao rejeitar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleExportCSV = () => {
    const data = filteredSaques.map(s => ({
      ID: s.id,
      Prestador: s.prestadorNome,
      Email: s.prestadorEmail || '',
      Telefone: s.prestadorTelefone || '',
      Valor: formatCurrency(s.valor),
      Status: s.status,
      DataSolicitacao: formatDate(s.dataSolicitacao),
      DataProcessamento: s.dataProcessamento ? formatDate(s.dataProcessamento) : '',
      Banco: s.dadosBancarios?.banco || '',
      Conta: s.dadosBancarios?.conta || ''
    }));
    exportToCSV(data, `saques_${new Date().toISOString().split('T')[0]}`);
    showToast('Lista exportada com sucesso!', 'success');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
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
                Gestão de Pagamentos
              </h1>
              <p className="text-gray-500">Gerencie os saques solicitados pelos prestadores.</p>
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
              onClick={handleExportCSV}
              leftIcon={<Download size={16} />}
            >
              Exportar
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
        {/* STATS CARDS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Pendentes</p>
              <h3 className="text-2xl font-black">{stats.totalPendente}</h3>
              <p className="text-xs opacity-80 mt-1">{formatCurrency(stats.valorPendente)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Aprovados</p>
              <h3 className="text-2xl font-black">{stats.totalAprovado}</h3>
              <p className="text-xs opacity-80 mt-1">{formatCurrency(stats.valorAprovado)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Send size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Processados</p>
              <h3 className="text-2xl font-black">{stats.totalProcessado}</h3>
              <p className="text-xs opacity-80 mt-1">{formatCurrency(stats.valorProcessado)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Rejeitados</p>
              <h3 className="text-2xl font-black">{stats.totalRejeitado}</h3>
              <p className="text-xs opacity-80 mt-1">{formatCurrency(stats.valorRejeitado)}</p>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* FILTROS */}
        {/* ======================================== */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por prestador, email ou conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'todos' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'pendente' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('pendente')}
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === 'aprovado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('aprovado')}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Aprovados
                </Button>
                <Button
                  variant={filterStatus === 'processado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('processado')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Processados
                </Button>
                <Button
                  variant={filterStatus === 'rejeitado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('rejeitado')}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Rejeitados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* LISTA DE SAQUES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredSaques.length > 0 ? (
            filteredSaques.map((saque) => (
              <motion.div
                key={saque.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`hover:shadow-lg transition-all cursor-pointer ${
                  saque.status === 'pendente' ? 'border-l-4 border-l-yellow-400' :
                  saque.status === 'aprovado' ? 'border-l-4 border-l-green-400' :
                  saque.status === 'processado' ? 'border-l-4 border-l-blue-400' :
                  'border-l-4 border-l-red-400'
                }`}
                onClick={() => handleViewDetails(saque)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          saque.status === 'pendente' ? 'bg-yellow-100 text-yellow-600' :
                          saque.status === 'aprovado' ? 'bg-green-100 text-green-600' :
                          saque.status === 'processado' ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary">{saque.prestadorNome}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            <span>{formatDate(saque.dataSolicitacao)}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <Building size={12} />
                            <span>{saque.dadosBancarios?.banco || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-black text-primary">{formatCurrency(saque.valor)}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            saque.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                            saque.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                            saque.status === 'processado' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {saque.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {saque.status === 'pendente' && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(saque);
                                }}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye size={18} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSaque(saque);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <ThumbsDown size={18} />
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(saque.id);
                                }}
                                disabled={actionLoading === saque.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {actionLoading === saque.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <ThumbsUp size={16} />
                                )}
                              </Button>
                            </>
                          )}

                          {saque.status === 'aprovado' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProcess(saque.id);
                              }}
                              disabled={actionLoading === saque.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {actionLoading === saque.id ? (
                                <Loader2 size={16} className="animate-spin mr-1" />
                              ) : (
                                <Send size={16} className="mr-1" />
                              )}
                              Processar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Wallet size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhum saque encontrado</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm 
                    ? 'Tente ajustar seus filtros ou termos de busca.'
                    : 'Nenhum saque solicitado até o momento.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE DETALHES */}
      {/* ======================================== */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalhes do Saque" size="lg">
        {selectedSaque && (
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-bold text-primary">{selectedSaque.prestadorNome}</h3>
                <p className="text-sm text-gray-500">Solicitado em {formatDate(selectedSaque.dataSolicitacao)}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedSaque.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                selectedSaque.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                selectedSaque.status === 'processado' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedSaque.status === 'pendente' ? 'Pendente' :
                 selectedSaque.status === 'aprovado' ? 'Aprovado' :
                 selectedSaque.status === 'processado' ? 'Processado' : 'Rejeitado'}
              </span>
            </div>

            {/* Valor */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Valor do Saque</p>
              <p className="text-3xl font-black text-primary">{formatCurrency(selectedSaque.valor)}</p>
            </div>

            {/* Dados do Prestador */}
            <div>
              <h4 className="font-bold text-primary mb-3">Dados do Prestador</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-bold text-primary">{selectedSaque.prestadorEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="font-bold text-primary">{selectedSaque.prestadorTelefone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div>
              <h4 className="font-bold text-primary mb-3">Dados Bancários</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Banco</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.banco || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Conta</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.conta || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Titular</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.titular || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">NIB</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.nib || 'N/A'}</p>
                    {selectedSaque.dadosBancarios?.nib && (
                      <button
                        onClick={() => handleCopyToClipboard(selectedSaque.dadosBancarios!.nib!, 'NIB')}
                        className="text-gray-400 hover:text-accent"
                      >
                        {copiado === 'NIB' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Observação (se rejeitado) */}
            {selectedSaque.observacao && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs text-red-500 mb-1">Motivo da rejeição</p>
                <p className="text-sm text-red-700">{selectedSaque.observacao}</p>
              </div>
            )}

            {/* Datas de processamento */}
            {selectedSaque.dataProcessamento && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Processado em</p>
                <p className="font-bold text-primary">{formatDate(selectedSaque.dataProcessamento)}</p>
                {selectedSaque.processadoPor && (
                  <p className="text-xs text-gray-400 mt-1">Por: {selectedSaque.processadoPor}</p>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              
              {selectedSaque.status === 'pendente' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedSaque(selectedSaque);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedSaque.id)}
                    disabled={actionLoading === selectedSaque.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === selectedSaque.id ? 'Processando...' : 'Aprovar'}
                  </Button>
                </>
              )}

              {selectedSaque.status === 'aprovado' && (
                <Button
                  onClick={() => handleProcess(selectedSaque.id)}
                  disabled={actionLoading === selectedSaque.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {actionLoading === selectedSaque.id ? 'Processando...' : 'Marcar como Processado'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE REJEIÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rejeitar Saque">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              Tem certeza que deseja rejeitar o saque de <span className="font-bold">{selectedSaque ? formatCurrency(selectedSaque.valor) : ''}</span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Motivo da rejeição (opcional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Dados bancários incorretos, saldo insuficiente..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading === selectedSaque?.id}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading === selectedSaque?.id ? 'Processando...' : 'Rejeitar Saque'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
