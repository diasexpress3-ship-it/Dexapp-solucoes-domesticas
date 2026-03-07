import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao, User as UserType } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Headphones, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  User as UserIcon,
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Printer,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Wrench,
  Shield,
  UserCheck,
  UserX,
  Home,
  LogOut,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  IdCard,
  Upload,
  Download as DownloadIcon
} from 'lucide-react';
import { formatCurrency, formatDate, translateStatus, exportToCSV } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';

interface CentralStats {
  totalSolicitacoes: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  aguardandoOrcamento: number;
  totalPrestadores: number;
  prestadoresPendentes: number;
  prestadoresPendentesDocumentos: number;
  prestadoresAtivos: number;
  totalClientes: number;
  valorTotalMovimentado: number;
}

interface PrestadorPendente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  dataCadastro: Date;
  status: string;
  documentosAlert?: boolean;
  documentos: {
    bi?: { nome: string, tipo: string, dataUpload: Date };
    declaracaoBairro?: { nome: string, tipo: string, dataUpload: Date };
  };
}

export default function CentralDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [prestadoresPendentes, setPrestadoresPendentes] = useState<PrestadorPendente[]>([]);
  const [prestadoresPendentesDocumentos, setPrestadoresPendentesDocumentos] = useState<PrestadorPendente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const [selectedPrestador, setSelectedPrestador] = useState<PrestadorPendente | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [stats, setStats] = useState<CentralStats>({
    totalSolicitacoes: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    canceladas: 0,
    aguardandoOrcamento: 0,
    totalPrestadores: 0,
    prestadoresPendentes: 0,
    prestadoresPendentesDocumentos: 0,
    prestadoresAtivos: 0,
    totalClientes: 0,
    valorTotalMovimentado: 0
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

  useEffect(() => {
    // Buscar solicitações
    const q = query(collection(db, 'solicitacoes'), orderBy('dataSolicitacao', 'desc'));
    const unsubscribeSolicitacoes = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setSolicitacoes(docs);
      
      // Calcular estatísticas
      const pendentes = docs.filter(s => s.status === 'buscando_prestador').length;
      const emAndamento = docs.filter(s => ['prestador_atribuido', 'em_andamento'].includes(s.status)).length;
      const concluidas = docs.filter(s => s.status === 'concluido').length;
      const canceladas = docs.filter(s => s.status === 'cancelado').length;
      const aguardandoOrcamento = docs.filter(s => s.tamanho === 'grande' && s.status === 'aguardando_orcamento').length;
      const valorTotal = docs.filter(s => s.status === 'concluido').reduce((acc, curr) => acc + curr.valorTotal, 0);

      setStats(prev => ({
        ...prev,
        totalSolicitacoes: docs.length,
        pendentes,
        emAndamento,
        concluidas,
        canceladas,
        aguardandoOrcamento,
        valorTotalMovimentado: valorTotal
      }));

      filterSolicitacoes(filterStatus, docs);
      setIsLoading(false);
    });

    // Buscar prestadores pendentes (status = 'pendente')
    const prestadoresPendentesQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      where('status', '==', 'pendente')
    );
    const unsubscribePrestadoresPendentes = onSnapshot(prestadoresPendentesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrestadorPendente));
      setPrestadoresPendentes(docs);
      
      setStats(prev => ({
        ...prev,
        prestadoresPendentes: docs.length
      }));
    });

    // Buscar prestadores com documentos pendentes (status = 'pendente_documentos')
    const prestadoresDocumentosQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      where('status', '==', 'pendente_documentos')
    );
    const unsubscribePrestadoresDocumentos = onSnapshot(prestadoresDocumentosQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrestadorPendente));
      setPrestadoresPendentesDocumentos(docs);
      
      setStats(prev => ({
        ...prev,
        prestadoresPendentesDocumentos: docs.length
      }));
    });

    // Buscar total de prestadores ativos
    const prestadoresAtivosQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      where('status', '==', 'activo')
    );
    const unsubscribePrestadoresAtivos = onSnapshot(prestadoresAtivosQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        prestadoresAtivos: snapshot.docs.length,
        totalPrestadores: snapshot.docs.length + prestadoresPendentes.length + prestadoresPendentesDocumentos.length
      }));
    });

    // Buscar total de clientes
    const clientesQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'cliente')
    );
    const unsubscribeClientes = onSnapshot(clientesQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalClientes: snapshot.docs.length
      }));
    });

    return () => {
      unsubscribeSolicitacoes();
      unsubscribePrestadoresPendentes();
      unsubscribePrestadoresDocumentos();
      unsubscribePrestadoresAtivos();
      unsubscribeClientes();
    };
  }, []);

  // Filtrar solicitações
  useEffect(() => {
    filterSolicitacoes(filterStatus, solicitacoes);
  }, [searchTerm, solicitacoes]);

  const filterSolicitacoes = (status: string, docs = solicitacoes) => {
    let filtered = docs;

    // Filtro por status
    if (status !== 'todas') {
      filtered = filtered.filter(s => s.status === status);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prestadorNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSolicitacoes(filtered);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterSolicitacoes(status);
  };

  // ============================================
  // FUNÇÕES CRUD - SOLICITAÇÕES
  // ============================================

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: newStatus,
        [`data${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`]: new Date()
      });
      showToast(`Status atualizado para ${translateStatus(newStatus)}`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSolicitacao = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente esta solicitação?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'solicitacoes', id));
      showToast('Solicitação excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      showToast('Erro ao excluir solicitação', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignPrestador = async (id: string) => {
    showToast('Funcionalidade em desenvolvimento', 'info');
  };

  const handleGerarOrcamento = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'aguardando_aprovacao_cliente',
        dataOrcamento: new Date()
      });
      showToast('Orçamento enviado para o cliente!', 'success');
    } catch (error) {
      console.error('Erro ao gerar orçamento:', error);
      showToast('Erro ao gerar orçamento', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // FUNÇÕES CRUD - PRESTADORES
  // ============================================

  const handleViewDocuments = (prestador: PrestadorPendente) => {
    setSelectedPrestador(prestador);
    setShowDocumentModal(true);
  };

  const handleApprovePrestador = async (id: string) => {
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

  const handleRequestDocuments = async (id: string) => {
    setActionLoading(id);
    try {
      // Aqui você pode implementar o envio de notificação para o prestador
      showToast('Notificação enviada ao prestador para enviar documentos', 'success');
    } catch (error) {
      console.error('Erro ao notificar prestador:', error);
      showToast('Erro ao notificar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPrestador = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este prestador?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'rejeitado',
        dataRejeicao: new Date(),
        rejeitadoPor: user?.id
      });
      showToast('Prestador rejeitado', 'info');
    } catch (error) {
      console.error('Erro ao rejeitar prestador:', error);
      showToast('Erro ao rejeitar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePrestador = async (id: string) => {
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

  // ============================================
  // FUNÇÕES DE EXPORTAÇÃO
  // ============================================

  const handleExportCSV = () => {
    const data = filteredSolicitacoes.map(s => ({
      ID: s.id,
      Serviço: s.servico,
      Cliente: s.clienteNome,
      Prestador: s.prestadorNome || 'N/A',
      Status: translateStatus(s.status),
      Data: formatDate(s.dataSolicitacao),
      Valor: formatCurrency(s.valorTotal),
      Tamanho: s.tamanho || 'N/A'
    }));
    exportToCSV(data, `solicitacoes_${new Date().toISOString().split('T')[0]}`);
    showToast('Relatório exportado com sucesso!', 'success');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ======================================== */}
        {/* HEADER PERSONALIZADO */}
        {/* ======================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user?.nome?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary mb-1">
                Central de Atendimento
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <span>Olá, {user?.nome?.split(' ')[0] || 'Administrador'}!</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-accent font-bold">• Nível 3</span>
              </p>
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
              onClick={handleRefresh}
              title="Atualizar"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* STATS GRID */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Total Solicitações</p>
              <h3 className="text-2xl font-black">{stats.totalSolicitacoes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendentes</p>
              <h3 className="text-2xl font-black text-primary">{stats.pendentes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Info size={24} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aguardando Orçamento</p>
              <h3 className="text-2xl font-black text-primary">{stats.aguardandoOrcamento}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Movimentado</p>
              <h3 className="text-2xl font-black text-primary">{formatCurrency(stats.valorTotalMovimentado)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* PRESTADORES PENDENTES (DOCUMENTOS) */}
        {/* ======================================== */}
        {prestadoresPendentesDocumentos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-primary flex items-center gap-2 mb-4">
              <FileText size={20} className="text-accent" />
              Prestadores com Documentos Pendentes ({prestadoresPendentesDocumentos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prestadoresPendentesDocumentos.map((prestador) => (
                <motion.div
                  key={prestador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-orange-400 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{prestador.nome}</h4>
                            <p className="text-xs text-gray-500">{prestador.especialidade}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          Docs Pendentes
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          <span>{prestador.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} />
                          <span>{prestador.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {prestador.documentos?.bi ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              BI
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle size={12} />
                              BI
                            </span>
                          )}
                          {prestador.documentos?.declaracaoBairro ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Declaração
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle size={12} />
                              Declaração
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocuments(prestador)}
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          leftIcon={<Eye size={14} />}
                        >
                          Ver Docs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestDocuments(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                          leftIcon={<Upload size={14} />}
                        >
                          Notificar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* PRESTADORES PENDENTES (AGUARDANDO APROVAÇÃO) */}
        {/* ======================================== */}
        {prestadoresPendentes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-primary flex items-center gap-2 mb-4">
              <UserCheck size={20} className="text-accent" />
              Prestadores Pendentes de Aprovação ({prestadoresPendentes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prestadoresPendentes.map((prestador) => (
                <motion.div
                  key={prestador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-yellow-400 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{prestador.nome}</h4>
                            <p className="text-xs text-gray-500">{prestador.especialidade}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Pendente
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          <span>{prestador.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} />
                          <span>{prestador.telefone}</span>
                        </div>
                        {prestador.documentos?.bi && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={12} />
                            <span>BI carregado</span>
                          </div>
                        )}
                        {prestador.documentos?.declaracaoBairro && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={12} />
                            <span>Declaração do Bairro carregada</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectPrestador(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <UserX size={14} className="mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprovePrestador(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck size={14} className="mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* FILTROS E BUSCA */}
        {/* ======================================== */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por cliente, prestador ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'todas' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('todas')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'buscando_prestador' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('buscando_prestador')}
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === 'aguardando_orcamento' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('aguardando_orcamento')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Orçamento
                </Button>
                <Button
                  variant={filterStatus === 'em_andamento' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('em_andamento')}
                >
                  Em Andamento
                </Button>
                <Button
                  variant={filterStatus === 'concluido' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('concluido')}
                >
                  Concluídas
                </Button>
                <Button
                  variant={filterStatus === 'cancelado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('cancelado')}
                >
                  Canceladas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* LISTA DE SOLICITAÇÕES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredSolicitacoes.length > 0 ? (
            filteredSolicitacoes.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Barra de status lateral */}
                      <div className={`w-2 md:w-4 ${
                        s.status === 'buscando_prestador' ? 'bg-yellow-400' :
                        s.status === 'aguardando_orcamento' ? 'bg-blue-400' :
                        s.status === 'prestador_atribuido' ? 'bg-indigo-400' :
                        s.status === 'em_andamento' ? 'bg-purple-400' :
                        s.status === 'concluido' ? 'bg-green-400' :
                        s.status === 'cancelado' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} />
                      
                      <div className="flex-1 p-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          {/* Informações do serviço */}
                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Serviço</p>
                              <h4 className="font-black text-primary">{s.servico}</h4>
                              <p className="text-xs text-gray-500">{formatDate(s.dataAgendada)}</p>
                              {s.tamanho && (
                                <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  s.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                  s.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {s.tamanho === 'pequeno' ? 'Pequeno' : 
                                   s.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                </span>
                              )}
                              <span className={`inline-block mt-2 ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                s.status === 'concluido' ? 'bg-green-100 text-green-700' :
                                s.status === 'buscando_prestador' ? 'bg-yellow-100 text-yellow-700' :
                                s.status === 'aguardando_orcamento' ? 'bg-blue-100 text-blue-700' :
                                s.status === 'prestador_atribuido' ? 'bg-indigo-100 text-indigo-700' :
                                s.status === 'em_andamento' ? 'bg-purple-100 text-purple-700' :
                                s.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {translateStatus(s.status)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <UserIcon size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Cliente</p>
                                <p className="text-sm font-bold text-primary">{s.clienteNome}</p>
                                {s.telefoneCliente && (
                                  <p className="text-xs text-gray-500">{s.telefoneCliente}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <Wrench size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Prestador</p>
                                <p className="text-sm font-bold text-primary">{s.prestadorNome || 'Não atribuído'}</p>
                                {s.prestadorNome && (
                                  <p className="text-xs text-gray-500">ID: {s.prestadorId?.slice(-6)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Ações CRUD */}
                          <div className="flex items-center gap-3 justify-end">
                            <div className="text-right mr-2">
                              <p className="text-xs font-bold text-primary">{formatCurrency(s.valorTotal)}</p>
                              <p className="text-[10px] text-gray-400">Total</p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/solicitacoes/${s.id}`)}
                              title="Visualizar"
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </Button>

                            {s.status === 'buscando_prestador' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAssignPrestador(s.id)}
                                title="Atribuir Prestador"
                                className="text-green-600 hover:bg-green-50"
                              >
                                <UserCheck size={18} />
                              </Button>
                            )}

                            {s.status === 'aguardando_orcamento' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleGerarOrcamento(s.id)}
                                disabled={actionLoading === s.id}
                                title="Gerar Orçamento"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <DollarSign size={18} />
                              </Button>
                            )}

                            {s.status === 'buscando_prestador' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(s.id, 'cancelado')}
                                disabled={actionLoading === s.id}
                                title="Cancelar"
                                className="text-orange-600 hover:bg-orange-50"
                              >
                                <XCircle size={18} />
                              </Button>
                            )}

                            {s.status === 'cancelado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSolicitacao(s.id)}
                                disabled={actionLoading === s.id}
                                title="Excluir permanentemente"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRefresh()}
                              disabled={actionLoading === s.id}
                              title="Atualizar"
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              <RefreshCw size={18} className={actionLoading === s.id ? 'animate-spin' : ''} />
                            </Button>
                          </div>
                        </div>

                        {/* Endereço (se disponível) */}
                        {s.endereco && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={14} className="text-gray-400" />
                              <span>
                                {s.endereco.bairro}
                                {s.endereco.quarteirao && `, Q. ${s.endereco.quarteirao}`}
                                {s.endereco.casa && `, Casa ${s.endereco.casa}`}
                                {s.endereco.complemento && ` - ${s.endereco.complemento}`}
                                {s.endereco.referencia && ` (${s.endereco.referencia})`}
                              </span>
                            </div>
                          </div>
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
                  <AlertCircle size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm 
                    ? 'Tente ajustar seus filtros ou termos de busca.'
                    : 'Aguardando novas solicitações.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Visualização de Documentos */}
      <Modal isOpen={showDocumentModal} onClose={() => setShowDocumentModal(false)} title="Documentos do Prestador">
        {selectedPrestador && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black">
                {selectedPrestador.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-primary">{selectedPrestador.nome}</h3>
                <p className="text-sm text-gray-500">{selectedPrestador.especialidade}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Documento BI */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IdCard size={20} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Bilhete de Identidade</h4>
                      {selectedPrestador.documentos?.bi ? (
                        <p className="text-xs text-green-600">Carregado em {formatDate(selectedPrestador.documentos.bi.dataUpload)}</p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.bi && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('Download iniciado', 'success')}
                      leftIcon={<DownloadIcon size={14} />}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>

              {/* Documento Declaração do Bairro */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Home size={20} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Declaração do Bairro</h4>
                      {selectedPrestador.documentos?.declaracaoBairro ? (
                        <p className="text-xs text-green-600">Carregado em {formatDate(selectedPrestador.documentos.declaracaoBairro.dataUpload)}</p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.declaracaoBairro && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('Download iniciado', 'success')}
                      leftIcon={<DownloadIcon size={14} />}
                    >
                      Download
                    </Button>
                  )}
                </div>
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
              {(!selectedPrestador.documentos?.bi || !selectedPrestador.documentos?.declaracaoBairro) && (
                <Button
                  onClick={() => {
                    handleRequestDocuments(selectedPrestador.id);
                    setShowDocumentModal(false);
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  Notificar Prestador
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
