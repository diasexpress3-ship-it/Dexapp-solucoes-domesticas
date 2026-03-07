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
  Loader2,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  Percent,
  Award,
  Briefcase,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Ban,
  Flag,
  Tag,
  Hash,
  Link,
  Globe,
  Map,
  Navigation,
  Camera,
  Image,
  Paperclip,
  Archive,
  Bookmark,
  BookOpen,
  Calculator,
  Scale,
  Weight,
  Ruler,
  Package,
  Box,
  Layers,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Printer as PrinterIcon,
  Scanner,
  Watch,
  Clock as ClockIcon,
  Hourglass,
  Timer,
  Stopwatch,
  AlarmCheck,
  AlarmClock,
  AlarmClockOff,
  BellRing,
  BellOff,
  BellPlus,
  BellMinus,
  BellElectric,
  BellDot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, where, addDoc, deleteDoc } from 'firebase/firestore';
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
    tipo?: 'poupanca' | 'corrente';
  };
  comprovativo?: string;
  taxa?: number;
  valorLiquido?: number;
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
  totalPrestadores: number;
  mediaSaque: number;
}

interface Filtros {
  periodo: 'todos' | 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano';
  status: string;
  busca: string;
  dataInicio?: Date;
  dataFim?: Date;
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
  const [filterPeriodo, setFilterPeriodo] = useState<string>('todos');
  const [showFiltros, setShowFiltros] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSaque, setSelectedSaque] = useState<Saque | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [comprovativo, setComprovativo] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<PagamentoStats>({
    totalPendente: 0,
    totalAprovado: 0,
    totalProcessado: 0,
    totalRejeitado: 0,
    valorPendente: 0,
    valorAprovado: 0,
    valorProcessado: 0,
    valorRejeitado: 0,
    totalPrestadores: 0,
    mediaSaque: 0
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
      
      const valorPendente = pendentes.reduce((acc, curr) => acc + curr.valor, 0);
      const valorAprovado = aprovados.reduce((acc, curr) => acc + curr.valor, 0);
      const valorProcessado = processados.reduce((acc, curr) => acc + curr.valor, 0);
      const valorRejeitado = rejeitados.reduce((acc, curr) => acc + curr.valor, 0);
      
      const totalPrestadores = new Set(docs.map(s => s.prestadorId)).size;
      const mediaSaque = docs.length > 0 
        ? docs.reduce((acc, curr) => acc + curr.valor, 0) / docs.length 
        : 0;

      setStats({
        totalPendente: pendentes.length,
        totalAprovado: aprovados.length,
        totalProcessado: processados.length,
        totalRejeitado: rejeitados.length,
        valorPendente,
        valorAprovado,
        valorProcessado,
        valorRejeitado,
        totalPrestadores,
        mediaSaque
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
  }, [searchTerm, saques, filterStatus, filterPeriodo]);

  const filterSaques = (status: string, docs = saques) => {
    let filtered = docs;

    // Filtro por status
    if (status !== 'todos') {
      filtered = filtered.filter(s => s.status === status);
    }

    // Filtro por período
    if (filterPeriodo !== 'todos') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (filterPeriodo === 'hoje') {
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        filtered = filtered.filter(s => 
          s.dataSolicitacao >= hoje && s.dataSolicitacao < amanha
        );
      } else if (filterPeriodo === 'semana') {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 7);
        filtered = filtered.filter(s => s.dataSolicitacao >= inicio);
      } else if (filterPeriodo === 'mes') {
        const inicio = new Date(hoje);
        inicio.setMonth(inicio.getMonth() - 1);
        filtered = filtered.filter(s => s.dataSolicitacao >= inicio);
      } else if (filterPeriodo === 'trimestre') {
        const inicio = new Date(hoje);
        inicio.setMonth(inicio.getMonth() - 3);
        filtered = filtered.filter(s => s.dataSolicitacao >= inicio);
      } else if (filterPeriodo === 'ano') {
        const inicio = new Date(hoje);
        inicio.setFullYear(inicio.getFullYear() - 1);
        filtered = filtered.filter(s => s.dataSolicitacao >= inicio);
      }
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

  const handlePeriodoChange = (periodo: string) => {
    setFilterPeriodo(periodo);
    filterSaques(filterStatus);
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
        processadoPor: user?.id,
        taxa: 0,
        valorLiquido: selectedSaque?.valor
      });
      showToast('Saque aprovado com sucesso!', 'success');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erro ao aprovar saque:', error);
      showToast('Erro ao aprovar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedSaque) return;
    
    if (!comprovativo.trim()) {
      showToast('Número de comprovativo é obrigatório', 'error');
      return;
    }

    setActionLoading(selectedSaque.id);
    try {
      await updateDoc(doc(db, 'saques', selectedSaque.id), {
        status: 'processado',
        dataProcessamento: new Date(),
        processadoPor: user?.id,
        comprovativo,
        observacao: 'Pagamento processado com sucesso'
      });
      showToast('Pagamento processado com sucesso!', 'success');
      setShowProcessModal(false);
      setShowDetailsModal(false);
      setComprovativo('');
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      showToast('Erro ao processar pagamento', 'error');
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este registro?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'saques', id));
      showToast('Registro excluído com sucesso!', 'success');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      showToast('Erro ao excluir registro', 'error');
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
      'Data Solicitação': formatDate(s.dataSolicitacao),
      'Data Processamento': s.dataProcessamento ? formatDate(s.dataProcessamento) : '',
      Banco: s.dadosBancarios?.banco || '',
      Conta: s.dadosBancarios?.conta || '',
      Titular: s.dadosBancarios?.titular || '',
      NIB: s.dadosBancarios?.nib || '',
      Comprovativo: s.comprovativo || '',
      Observação: s.observacao || ''
    }));
    exportToCSV(data, `saques_${new Date().toISOString().split('T')[0]}`);
    showToast('Lista exportada com sucesso!', 'success');
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'aprovado': return 'bg-green-100 text-green-700';
      case 'processado': return 'bg-blue-100 text-blue-700';
      case 'rejeitado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock size={14} className="mr-1" />;
      case 'aprovado': return <ThumbsUp size={14} className="mr-1" />;
      case 'processado': return <CheckCircle2 size={14} className="mr-1" />;
      case 'rejeitado': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

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
              onClick={() => setShowFiltros(!showFiltros)}
              leftIcon={<Filter size={16} />}
              className={showFiltros ? 'bg-accent text-white' : ''}
            >
              Filtros
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
        {/* FILTROS EXPANDIDOS */}
        {/* ======================================== */}
        {showFiltros && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Pesquisar por prestador, email ou conta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search size={18} />}
                    />
                  </div>
                  <select
                    value={filterPeriodo}
                    onChange={(e) => handlePeriodoChange(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
                  >
                    <option value="todos">Todo período</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Últimos 7 dias</option>
                    <option value="mes">Últimos 30 dias</option>
                    <option value="trimestre">Últimos 3 meses</option>
                    <option value="ano">Último ano</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
                  >
                    <option value="todos">Todos status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="aprovado">Aprovados</option>
                    <option value="processado">Processados</option>
                    <option value="rejeitado">Rejeitados</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* STATS CARDS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="opacity-80" />
                <span className="text-xs font-bold opacity-60">{stats.totalPendente}</span>
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Pendentes</p>
              <h3 className="text-2xl font-black mb-1">{formatCurrency(stats.valorPendente)}</h3>
              <p className="text-xs opacity-80">{stats.totalPendente} saques</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ThumbsUp size={24} className="opacity-80" />
                <span className="text-xs font-bold opacity-60">{stats.totalAprovado}</span>
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Aprovados</p>
              <h3 className="text-2xl font-black mb-1">{formatCurrency(stats.valorAprovado)}</h3>
              <p className="text-xs opacity-80">{stats.totalAprovado} saques</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 size={24} className="opacity-80" />
                <span className="text-xs font-bold opacity-60">{stats.totalProcessado}</span>
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Processados</p>
              <h3 className="text-2xl font-black mb-1">{formatCurrency(stats.valorProcessado)}</h3>
              <p className="text-xs opacity-80">{stats.totalProcessado} saques</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={24} className="opacity-80" />
                <span className="text-xs font-bold opacity-60">{stats.totalRejeitado}</span>
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Rejeitados</p>
              <h3 className="text-2xl font-black mb-1">{formatCurrency(stats.valorRejeitado)}</h3>
              <p className="text-xs opacity-80">{stats.totalRejeitado} saques</p>
            </CardContent>
          </Card>
        </div>

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
                          <span className={`inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(saque.status)}`}>
                            {getStatusIcon(saque.status)}
                            {saque.status === 'pendente' ? 'Pendente' :
                             saque.status === 'aprovado' ? 'Aprovado' :
                             saque.status === 'processado' ? 'Processado' : 'Rejeitado'}
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
                                setSelectedSaque(saque);
                                setShowProcessModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Send size={16} className="mr-1" />
                              Processar
                            </Button>
                          )}

                          {saque.status === 'processado' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSaque(saque);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
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
          <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-bold text-primary text-xl">{selectedSaque.prestadorNome}</h3>
                <p className="text-sm text-gray-500">Solicitado em {formatDate(selectedSaque.dataSolicitacao)}</p>
              </div>
              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(selectedSaque.status)}`}>
                {getStatusIcon(selectedSaque.status)}
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
                <div>
                  <p className="text-xs text-gray-500">Tipo de Conta</p>
                  <p className="font-bold text-primary capitalize">{selectedSaque.dadosBancarios?.tipo || 'Corrente'}</p>
                </div>
              </div>
            </div>

            {/* Comprovativo */}
            {selectedSaque.comprovativo && (
              <div>
                <h4 className="font-bold text-primary mb-3">Comprovativo</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-bold text-primary">{selectedSaque.comprovativo}</p>
                </div>
              </div>
            )}

            {/* Observação */}
            {selectedSaque.observacao && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs text-red-500 mb-1">Observação</p>
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
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowProcessModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Processar Pagamento
                </Button>
              )}

              {selectedSaque.status === 'processado' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Excluir Registro
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE PROCESSAMENTO */}
      {/* ======================================== */}
      <Modal isOpen={showProcessModal} onClose={() => setShowProcessModal(false)} title="Processar Pagamento">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 mb-2">
              Confirmar processamento do saque de <span className="font-bold">{formatCurrency(selectedSaque?.valor || 0)}</span>
            </p>
            <p className="text-xs text-blue-600">
              Prestador: {selectedSaque?.prestadorNome}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Número do Comprovativo *
            </label>
            <Input
              value={comprovativo}
              onChange={(e) => setComprovativo(e.target.value)}
              placeholder="Ex: TRANSF-123456"
            />
            <p className="text-xs text-gray-400 mt-1">
              Insira o número do comprovativo da transferência
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowProcessModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcess}
              disabled={actionLoading === selectedSaque?.id || !comprovativo}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionLoading === selectedSaque?.id ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE REJEIÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rejeitar Saque">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              Tem certeza que deseja rejeitar o saque de <span className="font-bold">{formatCurrency(selectedSaque?.valor || 0)}</span>?
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

      {/* ======================================== */}
      {/* MODAL DE EXCLUSÃO */}
      {/* ======================================== */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Excluir Registro">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              Tem certeza que deseja excluir permanentemente este registro?
            </p>
            <p className="text-xs text-red-600 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(selectedSaque?.id || '')}
              disabled={actionLoading === selectedSaque?.id}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading === selectedSaque?.id ? 'Excluindo...' : 'Excluir Permanentemente'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
