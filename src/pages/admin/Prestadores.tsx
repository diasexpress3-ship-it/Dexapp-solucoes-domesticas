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
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Star,
  Award,
  Wrench,
  FileText,
  IdCard,
  Building,
  Calendar,
  TrendingUp,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Copy,
  Check,
  UserCog,
  UserPlus,
  UserMinus,
  Briefcase,
  Wallet,
  MapPin,
  DollarSign,
  Percent,
  Upload,
  Download as DownloadIcon,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/utils';
import { motion } from 'framer-motion';
import { SERVICE_CATEGORIES, getEspecialidadeNome, getCategoriaNome } from '../../constants/categories';

// ============================================
// INTERFACES
// ============================================
interface Prestador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  profile: 'prestador';
  status: 'activo' | 'inactivo' | 'pendente' | 'pendente_documentos' | 'rejeitado';
  dataCadastro: Date;
  ultimoAcesso?: Date;
  
  // Dados profissionais
  especialidade: string;
  categoria: string;
  descricao: string;
  experiencia: string;
  endereco: string;
  cidade: string;
  valorHora: number;
  
  // Avaliações
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  
  // Documentos
  documentos: {
    bi?: { nome: string; tipo: string; dataUpload: Date; url?: string };
    declaracaoBairro?: { nome: string; tipo: string; dataUpload: Date; url?: string };
  };
  
  // Financeiro
  saldo?: number;
  totalGanho?: number;
  totalServicos?: number;
  servicosConcluidos?: number;
  
  // Histórico
  dataAprovacao?: Date;
  aprovadoPor?: string;
  dataRejeicao?: Date;
  rejeitadoPor?: string;
  observacao?: string;
}

interface PrestadorStats {
  total: number;
  activos: number;
  pendentes: number;
  documentosPendentes: number;
  rejeitados: number;
  inactivos: number;
  totalGanhos: number;
  mediaAvaliacao: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Prestadores() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [filteredPrestadores, setFilteredPrestadores] = useState<Prestador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPrestador, setSelectedPrestador] = useState<Prestador | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<PrestadorStats>({
    total: 0,
    activos: 0,
    pendentes: 0,
    documentosPendentes: 0,
    rejeitados: 0,
    inactivos: 0,
    totalGanhos: 0,
    mediaAvaliacao: 0
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
  // BUSCAR PRESTADORES
  // ============================================
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      orderBy('dataCadastro', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate?.() || new Date(doc.data().dataCadastro),
        ultimoAcesso: doc.data().ultimoAcesso?.toDate?.() || null,
        dataAprovacao: doc.data().dataAprovacao?.toDate?.() || null,
        dataRejeicao: doc.data().dataRejeicao?.toDate?.() || null,
        documentos: {
          bi: doc.data().documentos?.bi ? {
            ...doc.data().documentos.bi,
            dataUpload: doc.data().documentos.bi.dataUpload?.toDate?.() || new Date(doc.data().documentos.bi.dataUpload)
          } : null,
          declaracaoBairro: doc.data().documentos?.declaracaoBairro ? {
            ...doc.data().documentos.declaracaoBairro,
            dataUpload: doc.data().documentos.declaracaoBairro.dataUpload?.toDate?.() || new Date(doc.data().documentos.declaracaoBairro.dataUpload)
          } : null
        }
      } as Prestador));
      
      setPrestadores(docs);
      
      // Calcular estatísticas
      const activos = docs.filter(p => p.status === 'activo').length;
      const pendentes = docs.filter(p => p.status === 'pendente').length;
      const documentosPendentes = docs.filter(p => p.status === 'pendente_documentos').length;
      const rejeitados = docs.filter(p => p.status === 'rejeitado').length;
      const inactivos = docs.filter(p => p.status === 'inactivo').length;
      
      const totalGanhos = docs.reduce((acc, p) => acc + (p.totalGanho || 0), 0);
      const mediaAvaliacao = docs.length > 0 
        ? docs.reduce((acc, p) => acc + (p.avaliacaoMedia || 0), 0) / docs.length 
        : 0;

      setStats({
        total: docs.length,
        activos,
        pendentes,
        documentosPendentes,
        rejeitados,
        inactivos,
        totalGanhos,
        mediaAvaliacao
      });

      filterPrestadores(filterStatus, docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // FILTRAR PRESTADORES
  // ============================================
  useEffect(() => {
    filterPrestadores(filterStatus, prestadores);
  }, [searchTerm, prestadores]);

  const filterPrestadores = (status: string, docs = prestadores) => {
    let filtered = docs;

    // Filtro por status
    if (status !== 'todos') {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefone.includes(searchTerm) ||
        getEspecialidadeNome(p.especialidade).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cidade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrestadores(filtered);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterPrestadores(status);
  };

  // ============================================
  // FUNÇÕES CRUD
  // ============================================
  const handleViewDetails = (prestador: Prestador) => {
    setSelectedPrestador(prestador);
    setShowDetailsModal(true);
  };

  const handleViewDocuments = (prestador: Prestador) => {
    setSelectedPrestador(prestador);
    setShowDocumentModal(true);
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Confirmar aprovação deste prestador?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'activo',
        dataAprovacao: new Date(),
        aprovadoPor: user?.id
      });
      showToast('Prestador aprovado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao aprovar prestador:', error);
      showToast('Erro ao aprovar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPrestador) return;
    
    setActionLoading(selectedPrestador.id);
    try {
      await updateDoc(doc(db, 'users', selectedPrestador.id), {
        status: 'rejeitado',
        dataRejeicao: new Date(),
        rejeitadoPor: user?.id,
        observacao: rejectReason || 'Rejeitado pela central'
      });
      showToast('Prestador rejeitado', 'info');
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar prestador:', error);
      showToast('Erro ao rejeitar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    if (!window.confirm(`Tem certeza que deseja ${newStatus === 'activo' ? 'ativar' : 'desativar'} este prestador?`)) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: newStatus
      });
      showToast(`Prestador ${newStatus === 'activo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showToast('Erro ao alterar status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este prestador?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      showToast('Prestador excluído', 'success');
    } catch (error) {
      console.error('Erro ao excluir prestador:', error);
      showToast('Erro ao excluir prestador', 'error');
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
    const data = filteredPrestadores.map(p => ({
      Nome: p.nome,
      Email: p.email,
      Telefone: p.telefone,
      Especialidade: getEspecialidadeNome(p.especialidade),
      Categoria: getCategoriaNome(p.categoria),
      Cidade: p.cidade,
      Status: p.status,
      Avaliacao: p.avaliacaoMedia.toFixed(1),
      'Total Avaliações': p.totalAvaliacoes,
      'Valor Hora': formatCurrency(p.valorHora),
      'Total Ganho': formatCurrency(p.totalGanho || 0),
      'Serviços Concluídos': p.servicosConcluidos || 0,
      'Data Cadastro': formatDate(p.dataCadastro),
      'Documentos': p.documentos?.bi && p.documentos?.declaracaoBairro ? 'Completos' : 'Incompletos'
    }));
    exportToCSV(data, `prestadores_${new Date().toISOString().split('T')[0]}`);
    showToast('Lista exportada com sucesso!', 'success');
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'pendente_documentos': return 'bg-orange-100 text-orange-700';
      case 'rejeitado': return 'bg-red-100 text-red-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activo': return <CheckCircle2 size={14} className="mr-1" />;
      case 'pendente': return <Clock size={14} className="mr-1" />;
      case 'pendente_documentos': return <FileText size={14} className="mr-1" />;
      case 'rejeitado': return <XCircle size={14} className="mr-1" />;
      case 'inactivo': return <AlertCircle size={14} className="mr-1" />;
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
                <Wrench size={32} className="text-accent" />
                Gestão de Prestadores
              </h1>
              <p className="text-gray-500">Gerencie todos os prestadores da plataforma.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <Card className="bg-primary text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Total</p>
              <h3 className="text-2xl font-black">{stats.total}</h3>
            </CardContent>
          </Card>

          <Card className="bg-green-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Ativos</p>
              <h3 className="text-2xl font-black">{stats.activos}</h3>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Pendentes</p>
              <h3 className="text-2xl font-black">{stats.pendentes}</h3>
            </CardContent>
          </Card>

          <Card className="bg-orange-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Docs Pend</p>
              <h3 className="text-2xl font-black">{stats.documentosPendentes}</h3>
            </CardContent>
          </Card>

          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Rejeitados</p>
              <h3 className="text-2xl font-black">{stats.rejeitados}</h3>
            </CardContent>
          </Card>

          <Card className="bg-gray-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Inativos</p>
              <h3 className="text-2xl font-black">{stats.inactivos}</h3>
            </CardContent>
          </Card>

          <Card className="bg-accent text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Total Ganho</p>
              <h3 className="text-2xl font-black">{formatCurrency(stats.totalGanhos)}</h3>
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
                  placeholder="Pesquisar por nome, email, telefone, especialidade, cidade..."
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
                  variant={filterStatus === 'activo' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('activo')}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Ativos
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
                  variant={filterStatus === 'pendente_documentos' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('pendente_documentos')}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Docs Pendentes
                </Button>
                <Button
                  variant={filterStatus === 'rejeitado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('rejeitado')}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Rejeitados
                </Button>
                <Button
                  variant={filterStatus === 'inactivo' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('inactivo')}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* LISTA DE PRESTADORES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredPrestadores.length > 0 ? (
            filteredPrestadores.map((prestador) => (
              <motion.div
                key={prestador.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleViewDetails(prestador)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          prestador.status === 'activo' ? 'bg-green-100 text-green-600' :
                          prestador.status === 'pendente' ? 'bg-yellow-100 text-yellow-600' :
                          prestador.status === 'pendente_documentos' ? 'bg-orange-100 text-orange-600' :
                          prestador.status === 'rejeitado' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Award size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-primary">{prestador.nome}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center ${getStatusColor(prestador.status)}`}>
                              {getStatusIcon(prestador.status)}
                              {prestador.status === 'activo' ? 'Ativo' :
                               prestador.status === 'pendente' ? 'Pendente' :
                               prestador.status === 'pendente_documentos' ? 'Docs Pend' :
                               prestador.status === 'rejeitado' ? 'Rejeitado' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {prestador.email}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {prestador.telefone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                              {getEspecialidadeNome(prestador.especialidade)}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-bold text-primary">{prestador.avaliacaoMedia.toFixed(1)}</span>
                              <span className="text-xs text-gray-400">({prestador.totalAvaliacoes})</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {prestador.cidade}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <DollarSign size={12} className="text-accent" />
                            <span className="font-bold text-accent">{formatCurrency(prestador.valorHora)}/hora</span>
                            {prestador.totalGanho ? (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-600">Total: {formatCurrency(prestador.totalGanho)}</span>
                              </>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <FileText size={12} className="text-gray-400" />
                            <span className={prestador.documentos?.bi ? 'text-green-600' : 'text-red-600'}>
                              {prestador.documentos?.bi ? 'BI ✓' : 'BI ✗'}
                            </span>
                            <span className={prestador.documentos?.declaracaoBairro ? 'text-green-600' : 'text-red-600'}>
                              {prestador.documentos?.declaracaoBairro ? 'Declaração ✓' : 'Declaração ✗'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(prestador);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocuments(prestador);
                          }}
                          className="text-purple-600 hover:bg-purple-50"
                        >
                          <FileText size={18} />
                        </Button>

                        {(prestador.status === 'pendente' || prestador.status === 'pendente_documentos') && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPrestador(prestador);
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
                                handleApprove(prestador.id);
                              }}
                              disabled={actionLoading === prestador.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === prestador.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <ThumbsUp size={16} />
                              )}
                            </Button>
                          </>
                        )}

                        {prestador.status === 'activo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(prestador.id, prestador.status);
                            }}
                            disabled={actionLoading === prestador.id}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            {actionLoading === prestador.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <UserMinus size={18} />
                            )}
                          </Button>
                        )}

                        {prestador.status === 'inactivo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(prestador.id, prestador.status);
                            }}
                            disabled={actionLoading === prestador.id}
                            className="text-green-600 hover:bg-green-50"
                          >
                            {actionLoading === prestador.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <UserPlus size={18} />
                            )}
                          </Button>
                        )}

                        {prestador.status === 'rejeitado' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrestador(prestador);
                              setShowDeleteModal(true);
                            }}
                            disabled={actionLoading === prestador.id}
                            className="text-red-600 hover:bg-red-50"
                          >
                            {actionLoading === prestador.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </Button>
                        )}
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
                  <Wrench size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhum prestador encontrado</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm 
                    ? 'Tente ajustar seus filtros ou termos de busca.'
                    : 'Nenhum prestador cadastrado até o momento.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE DETALHES */}
      {/* ======================================== */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalhes do Prestador" size="lg">
        {selectedPrestador && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedPrestador.status === 'activo' ? 'bg-green-100 text-green-600' :
                  selectedPrestador.status === 'pendente' ? 'bg-yellow-100 text-yellow-600' :
                  selectedPrestador.status === 'pendente_documentos' ? 'bg-orange-100 text-orange-600' :
                  selectedPrestador.status === 'rejeitado' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-xl">{selectedPrestador.nome}</h3>
                  <p className="text-sm text-gray-500">{selectedPrestador.email}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${getStatusColor(selectedPrestador.status)}`}>
                {getStatusIcon(selectedPrestador.status)}
                {selectedPrestador.status === 'activo' ? 'Ativo' :
                 selectedPrestador.status === 'pendente' ? 'Pendente' :
                 selectedPrestador.status === 'pendente_documentos' ? 'Documentos Pendentes' :
                 selectedPrestador.status === 'rejeitado' ? 'Rejeitado' : 'Inativo'}
              </span>
            </div>

            {/* Grid de informações */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="font-bold text-primary">{selectedPrestador.telefone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cidade</p>
                <p className="font-bold text-primary">{selectedPrestador.cidade}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Endereço</p>
                <p className="font-bold text-primary">{selectedPrestador.endereco}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Cadastro</p>
                <p className="font-bold text-primary">{formatDate(selectedPrestador.dataCadastro)}</p>
              </div>
              {selectedPrestador.ultimoAcesso && (
                <div>
                  <p className="text-xs text-gray-500">Último Acesso</p>
                  <p className="font-bold text-primary">{formatDate(selectedPrestador.ultimoAcesso)}</p>
                </div>
              )}
            </div>

            {/* Profissão */}
            <div>
              <h4 className="font-bold text-primary mb-3">Dados Profissionais</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Categoria</p>
                  <p className="font-bold text-primary">{getCategoriaNome(selectedPrestador.categoria)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Especialidade</p>
                  <p className="font-bold text-primary">{getEspecialidadeNome(selectedPrestador.especialidade)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Experiência</p>
                  <p className="font-bold text-primary">{selectedPrestador.experiencia}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valor Hora</p>
                  <p className="font-bold text-primary">{formatCurrency(selectedPrestador.valorHora)}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Descrição</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  {selectedPrestador.descricao}
                </p>
              </div>
            </div>

            {/* Avaliações */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Avaliação Média</p>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-current" />
                  <span className="text-2xl font-black text-primary">{selectedPrestador.avaliacaoMedia.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedPrestador.totalAvaliacoes} avaliações</p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Ganho</p>
                <p className="text-2xl font-black text-green-600">{formatCurrency(selectedPrestador.totalGanho || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedPrestador.servicosConcluidos || 0} serviços concluídos</p>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h4 className="font-bold text-primary mb-3">Documentos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IdCard size={18} className="text-gray-500" />
                      <span className="font-bold text-primary">Bilhete de Identidade</span>
                    </div>
                    {selectedPrestador.documentos?.bi ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Carregado
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle size={14} />
                        Faltando
                      </span>
                    )}
                  </div>
                  {selectedPrestador.documentos?.bi && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {selectedPrestador.documentos.bi.nome} • {formatDate(selectedPrestador.documentos.bi.dataUpload)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(selectedPrestador.documentos?.bi?.url, '_blank')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <span className="font-bold text-primary">Declaração do Bairro</span>
                    </div>
                    {selectedPrestador.documentos?.declaracaoBairro ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Carregado
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle size={14} />
                        Faltando
                      </span>
                    )}
                  </div>
                  {selectedPrestador.documentos?.declaracaoBairro && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {selectedPrestador.documentos.declaracaoBairro.nome} • {formatDate(selectedPrestador.documentos.declaracaoBairro.dataUpload)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(selectedPrestador.documentos?.declaracaoBairro?.url, '_blank')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico */}
            {selectedPrestador.dataAprovacao && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 mb-1">Aprovado em</p>
                <p className="font-bold text-green-700">{formatDate(selectedPrestador.dataAprovacao)}</p>
                {selectedPrestador.aprovadoPor && (
                  <p className="text-xs text-green-600 mt-1">Por: {selectedPrestador.aprovadoPor}</p>
                )}
              </div>
            )}

            {selectedPrestador.dataRejeicao && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-600 mb-1">Rejeitado em</p>
                <p className="font-bold text-red-700">{formatDate(selectedPrestador.dataRejeicao)}</p>
                {selectedPrestador.rejeitadoPor && (
                  <p className="text-xs text-red-600 mt-1">Por: {selectedPrestador.rejeitadoPor}</p>
                )}
                {selectedPrestador.observacao && (
                  <p className="text-sm text-red-700 mt-2">{selectedPrestador.observacao}</p>
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
              
              {(selectedPrestador.status === 'pendente' || selectedPrestador.status === 'pendente_documentos') && (
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
                    onClick={() => handleApprove(selectedPrestador.id)}
                    disabled={actionLoading === selectedPrestador.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === selectedPrestador.id ? 'Processando...' : 'Aprovar'}
                  </Button>
                </>
              )}

              {selectedPrestador.status === 'activo' && (
                <Button
                  onClick={() => {
                    handleToggleStatus(selectedPrestador.id, selectedPrestador.status);
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading === selectedPrestador.id}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {actionLoading === selectedPrestador.id ? 'Processando...' : 'Desativar'}
                </Button>
              )}

              {selectedPrestador.status === 'inactivo' && (
                <Button
                  onClick={() => {
                    handleToggleStatus(selectedPrestador.id, selectedPrestador.status);
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading === selectedPrestador.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading === selectedPrestador.id ? 'Processando...' : 'Ativar'}
                </Button>
              )}

              {selectedPrestador.status === 'rejeitado' && (
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir Permanentemente
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE DOCUMENTOS */}
      {/* ======================================== */}
      <Modal isOpen={showDocumentModal} onClose={() => setShowDocumentModal(false)} title="Documentos do Prestador" size="lg">
        {selectedPrestador && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black">
                {selectedPrestador.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-primary">{selectedPrestador.nome}</h3>
                <p className="text-sm text-gray-500">{getEspecialidadeNome(selectedPrestador.especialidade)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* BI */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IdCard size={24} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Bilhete de Identidade</h4>
                      {selectedPrestador.documentos?.bi ? (
                        <p className="text-xs text-green-600">
                          Carregado em {formatDate(selectedPrestador.documentos.bi.dataUpload)}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.bi && (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                </div>
                {selectedPrestador.documentos?.bi && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPrestador.documentos?.bi?.url, '_blank')}
                      className="flex-1"
                      leftIcon={<Eye size={14} />}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(selectedPrestador.documentos?.bi?.url || '', 'URL do BI')}
                      className="flex-1"
                      leftIcon={<Copy size={14} />}
                    >
                      Copiar Link
                    </Button>
                  </div>
                )}
              </div>

              {/* Declaração do Bairro */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Declaração do Bairro</h4>
                      {selectedPrestador.documentos?.declaracaoBairro ? (
                        <p className="text-xs text-green-600">
                          Carregado em {formatDate(selectedPrestador.documentos.declaracaoBairro.dataUpload)}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.declaracaoBairro && (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                </div>
                {selectedPrestador.documentos?.declaracaoBairro && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPrestador.documentos?.declaracaoBairro?.url, '_blank')}
                      className="flex-1"
                      leftIcon={<Eye size={14} />}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(selectedPrestador.documentos?.declaracaoBairro?.url || '', 'URL da Declaração')}
                      className="flex-1"
                      leftIcon={<Copy size={14} />}
                    >
                      Copiar Link
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDocumentModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE REJEIÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rejeitar Prestador">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              Tem certeza que deseja rejeitar o prestador <span className="font-bold">{selectedPrestador?.nome}</span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Motivo da rejeição (opcional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Documentos inválidos, informações inconsistentes..."
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
              disabled={actionLoading === selectedPrestador?.id}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading === selectedPrestador?.id ? 'Processando...' : 'Rejeitar Prestador'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE EXCLUSÃO */}
      {/* ======================================== */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Excluir Prestador">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              Tem certeza que deseja excluir permanentemente o prestador{' '}
              <span className="font-bold">{selectedPrestador?.nome}</span>?
            </p>
            <p className="text-xs text-red-600 mt-2">
              Esta ação não pode ser desfeita. Todos os dados associados serão removidos.
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
              onClick={() => {
                if (selectedPrestador) {
                  handleDelete(selectedPrestador.id);
                  setShowDeleteModal(false);
                }
              }}
              disabled={actionLoading === selectedPrestador?.id}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading === selectedPrestador?.id ? 'Excluindo...' : 'Excluir Permanentemente'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
