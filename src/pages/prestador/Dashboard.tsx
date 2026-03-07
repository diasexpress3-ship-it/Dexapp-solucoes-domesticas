import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate, translateStatus } from '../../utils/utils';
import { 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Phone,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Star,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Award,
  Wrench,
  Home,
  LogOut,
  Filter,
  Info,
  Upload,
  FileText,
  IdCard,
  DollarSign,
  TrendingUp,
  Wallet,
  Send,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  Percent,
  Calendar as CalendarIcon,
  Users,
  Building,
  Mail,
  Printer,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PrestadorStats {
  servicosConcluidos: number;
  servicosEmAndamento: number;
  servicosPendentes: number;
  servicosCancelados: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  ganhosTotais: number;
  ganhosDisponiveis: number;
  ganhosPendentes: number;
  ganhosProcessados: number;
}

interface SaqueRequest {
  id: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado';
  dataSolicitacao: Date;
  dataProcessamento?: Date;
  observacao?: string;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  lida: boolean;
  data: Date;
}

export default function PrestadorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSaqueModal, setShowSaqueModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showNotificacoesModal, setShowNotificacoesModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [valorSaque, setValorSaque] = useState<number>(0);
  const [saques, setSaques] = useState<SaqueRequest[]>([]);
  const [processingSaque, setProcessingSaque] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  
  const [stats, setStats] = useState<PrestadorStats>({
    servicosConcluidos: 0,
    servicosEmAndamento: 0,
    servicosPendentes: 0,
    servicosCancelados: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    ganhosTotais: 0,
    ganhosDisponiveis: 0,
    ganhosPendentes: 0,
    ganhosProcessados: 0
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
  // BUSCAR DADOS
  // ============================================
  useEffect(() => {
    if (!user) return;

    // Buscar solicitações do prestador
    const q = query(
      collection(db, 'solicitacoes'),
      where('prestadorId', '==', user.id),
      orderBy('dataSolicitacao', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setSolicitacoes(docs);
      
      // Calcular estatísticas
      const concluidos = docs.filter(s => s.status === 'concluido');
      const emAndamento = docs.filter(s => ['prestador_atribuido', 'em_andamento'].includes(s.status));
      const pendentes = docs.filter(s => s.status === 'buscando_prestador');
      const cancelados = docs.filter(s => s.status === 'cancelado');
      const aguardandoPagamento = docs.filter(s => s.status === 'aguardando_pagamento_final');
      
      // Calcular ganhos (60% do valor pago pelo cliente)
      const ganhosTotais = concluidos.reduce((acc, curr) => {
        const valorPrestador = curr.valorTotal ? Math.round(curr.valorTotal * 0.6) : 0;
        return acc + valorPrestador;
      }, 0);
      
      // Ganhos disponíveis (serviços concluídos)
      const ganhosDisponiveis = ganhosTotais * 0.8; // 80% disponível (simulação)
      const ganhosPendentes = ganhosTotais * 0.2; // 20% pendente
      const ganhosProcessados = saques.filter(s => s.status === 'processado').reduce((acc, s) => acc + s.valor, 0);
      
      // Calcular média de avaliações
      const totalAvaliacoes = user?.totalAvaliacoes || 0;
      const avaliacaoMedia = user?.avaliacaoMedia || 4.8;
      
      setStats({
        servicosConcluidos: concluidos.length,
        servicosEmAndamento: emAndamento.length + aguardandoPagamento.length,
        servicosPendentes: pendentes.length,
        servicosCancelados: cancelados.length,
        avaliacaoMedia,
        totalAvaliacoes,
        ganhosTotais,
        ganhosDisponiveis,
        ganhosPendentes,
        ganhosProcessados
      });
      
      filterSolicitacoes(filterStatus, docs);
      setIsLoading(false);
    });

    // Buscar histórico de saques
    const saquesQuery = query(
      collection(db, 'saques'),
      where('prestadorId', '==', user.id),
      orderBy('dataSolicitacao', 'desc')
    );

    const unsubscribeSaques = onSnapshot(saquesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataSolicitacao: doc.data().dataSolicitacao?.toDate?.() || new Date(doc.data().dataSolicitacao),
        dataProcessamento: doc.data().dataProcessamento?.toDate?.() || null
      } as SaqueRequest));
      setSaques(docs);
    });

    // Buscar notificações
    const notificacoesQuery = query(
      collection(db, 'notificacoes'),
      where('prestadorId', '==', user.id),
      orderBy('data', 'desc')
    );

    const unsubscribeNotificacoes = onSnapshot(notificacoesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate?.() || new Date(doc.data().data)
      } as Notificacao));
      setNotificacoes(docs);
      setNotificacoesNaoLidas(docs.filter(n => !n.lida).length);
    });

    return () => {
      unsubscribe();
      unsubscribeSaques();
      unsubscribeNotificacoes();
    };
  }, [user]);

  // ============================================
  // FILTRAR SOLICITAÇÕES
  // ============================================
  const filterSolicitacoes = (status: string, docs = solicitacoes) => {
    if (status === 'todas') {
      setFilteredSolicitacoes(docs);
    } else {
      setFilteredSolicitacoes(docs.filter(s => s.status === status));
    }
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterSolicitacoes(status);
  };

  // ============================================
  // FUNÇÕES DE SAQUE
  // ============================================
  const handleSolicitarSaque = async () => {
    if (valorSaque <= 0) {
      showToast('Valor inválido', 'error');
      return;
    }

    if (valorSaque > stats.ganhosDisponiveis) {
      showToast('Valor superior ao disponível para saque', 'error');
      return;
    }

    if (valorSaque < 500) {
      showToast('Valor mínimo para saque é 500 MT', 'error');
      return;
    }

    setProcessingSaque(true);

    try {
      await addDoc(collection(db, 'saques'), {
        prestadorId: user?.id,
        prestadorNome: user?.nome,
        valor: valorSaque,
        status: 'pendente',
        dataSolicitacao: new Date(),
        metodoPagamento: 'Transferência Bancária',
        dadosBancarios: {
          banco: 'BIM',
          conta: '123456789',
          titular: user?.nome
        }
      });

      showToast('Solicitação de saque enviada para a central!', 'success');
      setShowSaqueModal(false);
      setValorSaque(0);
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      showToast('Erro ao solicitar saque', 'error');
    } finally {
      setProcessingSaque(false);
    }
  };

  // ============================================
  // FUNÇÕES CRUD
  // ============================================
  const handleAcceptService = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'prestador_atribuido',
        dataAtribuicao: new Date()
      });
      showToast('Serviço aceito com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao aceitar serviço:', error);
      showToast('Erro ao aceitar serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectService = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'buscando_prestador',
        prestadorId: null,
        prestadorNome: null,
        dataRejeicao: new Date()
      });
      showToast('Serviço recusado', 'info');
    } catch (error) {
      console.error('Erro ao recusar serviço:', error);
      showToast('Erro ao recusar serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartService = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'em_andamento',
        dataInicio: new Date()
      });
      showToast('Serviço iniciado!', 'success');
    } catch (error) {
      console.error('Erro ao iniciar serviço:', error);
      showToast('Erro ao iniciar serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteService = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'aguardando_pagamento_final',
        dataConclusao: new Date()
      });
      showToast('Serviço concluído! Aguardando pagamento do cliente.', 'success');
    } catch (error) {
      console.error('Erro ao concluir serviço:', error);
      showToast('Erro ao concluir serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este serviço?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'cancelado',
        motivoCancelamento: 'Cancelado pelo prestador',
        dataCancelamento: new Date()
      });
      showToast('Serviço cancelado', 'info');
    } catch (error) {
      console.error('Erro ao cancelar serviço:', error);
      showToast('Erro ao cancelar serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este serviço?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'solicitacoes', id));
      showToast('Serviço excluído', 'success');
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      showToast('Erro ao excluir serviço', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshStatus = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      showToast('Status atualizado!', 'success');
      setActionLoading(null);
    }, 500);
  };

  const handleViewDetails = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setShowDetalhesModal(true);
  };

  const handleEditService = (id: string) => {
    navigate(`/prestador/agenda?id=${id}&edit=true`);
  };

  const handleUploadDocuments = () => {
    setShowDocumentModal(true);
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleMarcarNotificacaoLida = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notificacoes', id), { lida: true });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    const promises = notificacoes.filter(n => !n.lida).map(n => 
      updateDoc(doc(db, 'notificacoes', n.id), { lida: true })
    );
    await Promise.all(promises);
    showToast('Todas as notificações marcadas como lidas', 'success');
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-700';
      case 'aguardando_pagamento_final': return 'bg-purple-100 text-purple-700';
      case 'buscando_prestador': return 'bg-yellow-100 text-yellow-700';
      case 'prestador_atribuido': return 'bg-blue-100 text-blue-700';
      case 'em_andamento': return 'bg-indigo-100 text-indigo-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle size={14} className="mr-1" />;
      case 'aguardando_pagamento_final': return <Clock size={14} className="mr-1" />;
      case 'buscando_prestador': return <AlertCircle size={14} className="mr-1" />;
      case 'prestador_atribuido': return <UserCheck size={14} className="mr-1" />;
      case 'em_andamento': return <Wrench size={14} className="mr-1" />;
      case 'cancelado': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'aguardando_pagamento_final': return 'Aguardando Pagamento';
      case 'buscando_prestador': return 'Disponível';
      case 'prestador_atribuido': return 'Aceito';
      case 'em_andamento': return 'Em Andamento';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (user?.status === 'pendente') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mb-6">
            <Clock size={48} />
          </div>
          <h1 className="text-3xl font-black text-primary mb-4">Perfil em Análise</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Seu cadastro foi recebido e está sendo analisado pela nossa central. 
            Você receberá uma notificação assim que for aprovado.
          </p>
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 max-w-lg w-full">
            <h3 className="font-bold text-primary mb-4">Próximos Passos:</h3>
            <ul className="text-sm text-left space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <span>Análise de documentos.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <span>Verificação de antecedentes.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-yellow-500 shrink-0" />
                <span>Ativação do perfil (até 48h).</span>
              </li>
            </ul>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (user?.status === 'pendente_documentos') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-yellow-50 border-yellow-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-yellow-800 mb-2">
                    Documentos Pendentes
                  </h2>
                  <p className="text-sm text-yellow-700 mb-4">
                    Seu perfil está aguardando o envio dos documentos obrigatórios para ativação completa.
                    Envie agora para começar a receber solicitações de serviço.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUploadDocuments}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      leftIcon={<Upload size={16} />}
                    >
                      Enviar Documentos Agora
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDocumentModal(true)}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Saber mais
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {user?.nome?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-primary mb-1">
                  Olá, {user?.nome?.split(' ')[0] || 'Prestador'}! 👋
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {user?.especialidade || 'Profissional'}
                  </span>
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Pendente Documentos
                  </span>
                </div>
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
            </div>
          </div>

          <Card className="bg-gray-50 border-gray-200 mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Info size={16} className="text-gray-400" />
                Enquanto seus documentos não forem enviados, você não poderá aceitar novos serviços.
              </p>
            </CardContent>
          </Card>
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user?.nome?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary mb-1">
                Olá, {user?.nome?.split(' ')[0] || 'Prestador'}! 👋
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                  {user?.especialidade || 'Profissional'}
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-bold text-primary">{stats.avaliacaoMedia.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({stats.totalAvaliacoes})</span>
                </div>
                <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Ativo
                </span>
              </div>
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
              size="icon"
              onClick={() => setShowNotificacoesModal(true)}
              className="relative"
            >
              <Bell size={18} />
              {notificacoesNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificacoesNaoLidas}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPerfilModal(true)}
              title="Perfil"
            >
              <User size={18} />
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* CARDS DE GANHOS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Ganhos Totais</p>
              <h3 className="text-3xl font-black mb-1">{formatCurrency(stats.ganhosTotais)}</h3>
              <p className="text-xs opacity-60">60% do valor dos serviços</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Disponível</p>
              <h3 className="text-3xl font-black mb-1">{formatCurrency(stats.ganhosDisponiveis)}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaqueModal(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full mt-2"
                leftIcon={<Send size={14} />}
              >
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Pendente</p>
              <h3 className="text-3xl font-black">{formatCurrency(stats.ganhosPendentes)}</h3>
              <p className="text-xs opacity-60 mt-2">Aguardando liberação</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award size={24} className="opacity-80" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Processados</p>
              <h3 className="text-3xl font-black">{formatCurrency(stats.ganhosProcessados)}</h3>
              <p className="text-xs opacity-60 mt-2">Total sacado</p>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* STATS DE SERVIÇOS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award size={24} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosConcluidos}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-orange-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Em Andamento</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosEmAndamento}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle size={24} className="text-yellow-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disponíveis</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosPendentes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={24} className="text-red-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cancelados</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosCancelados}</h3>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* FILTROS */}
        {/* ======================================== */}
        <div className="flex flex-wrap gap-2 mb-6">
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
            className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          >
            Disponíveis
          </Button>
          <Button
            variant={filterStatus === 'prestador_atribuido' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('prestador_atribuido')}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Aceitas
          </Button>
          <Button
            variant={filterStatus === 'em_andamento' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('em_andamento')}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Em Andamento
          </Button>
          <Button
            variant={filterStatus === 'aguardando_pagamento_final' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('aguardando_pagamento_final')}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Aguardando Pagamento
          </Button>
          <Button
            variant={filterStatus === 'concluido' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('concluido')}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            Concluídas
          </Button>
          <Button
            variant={filterStatus === 'cancelado' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('cancelado')}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Canceladas
          </Button>
        </div>

        {/* ======================================== */}
        {/* LISTA DE SOLICITAÇÕES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredSolicitacoes.length > 0 ? (
            filteredSolicitacoes.map((sol) => {
              const ganhoPrestador = sol.valorTotal ? Math.round(sol.valorTotal * 0.6) : 0;
              
              return (
                <motion.div
                  key={sol.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`hover:shadow-xl transition-all cursor-pointer ${
                    sol.status === 'buscando_prestador' ? 'border-accent/30 bg-accent/5' : ''
                  }`}
                  onClick={() => handleViewDetails(sol)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Informações do Serviço */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                              <Wrench size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-primary text-lg">{sol.servico}</h4>
                              <p className="text-sm text-gray-500">{sol.categoria}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                              <span>
                                {sol.endereco?.bairro || 'N/A'}
                                {sol.endereco?.quarteirao ? `, Q. ${sol.endereco.quarteirao}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} className="text-gray-400 shrink-0" />
                              <span>{sol.dataAgendada ? formatDate(sol.dataAgendada) : 'A agendar'}</span>
                            </div>
                          </div>

                          <div className="p-4 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <User size={16} className="text-accent" />
                              <span className="text-sm font-bold text-primary">{sol.clienteNome}</span>
                            </div>
                            {sol.descricao && (
                              <p className="text-sm text-gray-500">{sol.descricao}</p>
                            )}
                            {sol.tamanho && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sol.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                  sol.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {sol.tamanho === 'pequeno' ? 'Pequeno' : 
                                   sol.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status, Ganhos e Ações */}
                        <div className="flex flex-col justify-between items-end gap-4 min-w-[250px]">
                          <div className="text-right w-full">
                            <span className={`inline-flex items-center text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2 ${getStatusColor(sol.status)}`}>
                              {getStatusIcon(sol.status)}
                              {getStatusTexto(sol.status)}
                            </span>
                            
                            {/* Mostrar ganho do prestador para serviços concluídos */}
                            {(sol.status === 'concluido' || sol.status === 'aguardando_pagamento_final') && (
                              <div className="mt-3 p-3 bg-green-50 rounded-xl">
                                <p className="text-xs text-gray-500">Seu ganho (60%)</p>
                                <p className="text-xl font-black text-green-600">{formatCurrency(ganhoPrestador)}</p>
                                <p className="text-[10px] text-gray-400">Total pago: {formatCurrency(sol.valorTotal)}</p>
                              </div>
                            )}
                          </div>

                          {/* Ações Rápidas */}
                          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(sol);
                              }}
                              title="Visualizar detalhes"
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </Button>

                            {sol.status === 'buscando_prestador' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectService(sol.id);
                                  }}
                                  disabled={actionLoading === sol.id}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  {actionLoading === sol.id ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptService(sol.id);
                                  }}
                                  disabled={actionLoading === sol.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {actionLoading === sol.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <ThumbsUp size={16} />
                                  )}
                                </Button>
                              </>
                            )}

                            {sol.status === 'prestador_atribuido' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditService(sol.id);
                                  }}
                                  title="Editar"
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <Edit size={18} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelService(sol.id);
                                  }}
                                  disabled={actionLoading === sol.id}
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartService(sol.id);
                                  }}
                                  disabled={actionLoading === sol.id}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Iniciar
                                </Button>
                              </>
                            )}

                            {sol.status === 'em_andamento' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteService(sol.id);
                                }}
                                disabled={actionLoading === sol.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === sol.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  'Concluir'
                                )}
                              </Button>
                            )}

                            {sol.status === 'aguardando_pagamento_final' && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="border-purple-200 text-purple-700"
                              >
                                Aguardando Pagamento
                              </Button>
                            )}

                            {sol.status === 'concluido' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRefreshStatus(sol.id);
                                }}
                                disabled={actionLoading === sol.id}
                                title="Atualizar"
                                className="text-gray-600 hover:bg-gray-50"
                              >
                                <RefreshCw size={16} className={actionLoading === sol.id ? 'animate-spin' : ''} />
                              </Button>
                            )}

                            {sol.status === 'cancelado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Tem certeza que deseja excluir permanentemente este serviço?')) {
                                    handleDeleteService(sol.id);
                                  }
                                }}
                                disabled={actionLoading === sol.id}
                                title="Excluir permanentemente"
                                className="text-red-600 hover:bg-red-50"
                              >
                                {actionLoading === sol.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Briefcase size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-sm text-gray-500">
                  {filterStatus === 'todas' 
                    ? 'Você ainda não tem serviços disponíveis.' 
                    : `Não há serviços com status "${getStatusTexto(filterStatus)}".`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE DETALHES */}
      {/* ======================================== */}
      <Modal isOpen={showDetalhesModal} onClose={() => setShowDetalhesModal(false)} title="Detalhes do Serviço" size="lg">
        {selectedSolicitacao && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-bold text-primary text-xl">{selectedSolicitacao.servico}</h3>
                <p className="text-sm text-gray-500">ID: #{selectedSolicitacao.id.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(selectedSolicitacao.status)}`}>
                {getStatusIcon(selectedSolicitacao.status)}
                {getStatusTexto(selectedSolicitacao.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-bold text-primary">{selectedSolicitacao.clienteNome}</p>
                <p className="text-xs text-gray-400">{selectedSolicitacao.telefoneCliente}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Agendada</p>
                <p className="font-bold text-primary">{formatDate(selectedSolicitacao.dataAgendada)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Local</p>
              <p className="text-sm text-primary bg-gray-50 p-3 rounded-xl">
                {selectedSolicitacao.endereco.bairro}
                {selectedSolicitacao.endereco.quarteirao && `, Q. ${selectedSolicitacao.endereco.quarteirao}`}
                {selectedSolicitacao.endereco.casa && `, Casa ${selectedSolicitacao.endereco.casa}`}
                {selectedSolicitacao.endereco.referencia && `\nRef: ${selectedSolicitacao.endereco.referencia}`}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                {selectedSolicitacao.descricao}
              </p>
            </div>

            {selectedSolicitacao.tamanho && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tamanho do Serviço</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedSolicitacao.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                  selectedSolicitacao.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedSolicitacao.tamanho === 'pequeno' ? 'Pequeno (1-6h)' : 
                   selectedSolicitacao.tamanho === 'medio' ? 'Médio (24-48h)' : 'Grande (+48h)'}
                </span>
              </div>
            )}

            {selectedSolicitacao.imagens && selectedSolicitacao.imagens.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Imagens do Serviço</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedSolicitacao.imagens.slice(0, 3).map((img, idx) => (
                    <img key={idx} src={img} alt={`Serviço ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetalhesModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetalhesModal(false);
                  navigate(`/prestador/agenda?id=${selectedSolicitacao.id}`);
                }}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                Ver na Agenda
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE SAQUE */}
      {/* ======================================== */}
      <Modal isOpen={showSaqueModal} onClose={() => setShowSaqueModal(false)} title="Solicitar Saque">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 mb-2">
              <span className="font-bold">Saldo disponível:</span> {formatCurrency(stats.ganhosDisponiveis)}
            </p>
            <p className="text-xs text-blue-600">
              Mínimo: 500 MT • Máximo: {formatCurrency(stats.ganhosDisponiveis)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Valor do Saque (MT)
            </label>
            <Input
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(Number(e.target.value))}
              max={stats.ganhosDisponiveis}
              min={500}
              step={100}
              placeholder="Digite o valor"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-primary mb-2">Dados Bancários</h4>
            <p className="text-sm text-gray-600 mb-3">
              Os dados abaixo serão usados para transferência:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Banco:</span>
                <span className="font-bold text-primary">BIM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conta:</span>
                <span className="font-bold text-primary">123456789</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Titular:</span>
                <span className="font-bold text-primary">{user?.nome}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-yellow-700 flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                O saque será processado pela central em até 48 horas úteis.
                Você receberá uma notificação quando for aprovado.
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaqueModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSolicitarSaque}
              disabled={processingSaque || valorSaque < 500 || valorSaque > stats.ganhosDisponiveis}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {processingSaque ? 'Processando...' : 'Solicitar Saque'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE NOTIFICAÇÕES */}
      {/* ======================================== */}
      <Modal isOpen={showNotificacoesModal} onClose={() => setShowNotificacoesModal(false)} title="Notificações" size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {notificacoes.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Total: {notificacoes.length}</p>
                {notificacoesNaoLidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarcarTodasLidas}
                    className="text-accent"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              {notificacoes.map((notificacao) => (
                <Card
                  key={notificacao.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    !notificacao.lida ? 'border-l-4 border-l-accent bg-accent/5' : ''
                  }`}
                  onClick={() => handleMarcarNotificacaoLida(notificacao.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notificacao.tipo === 'sucesso' ? 'bg-green-100 text-green-600' :
                          notificacao.tipo === 'aviso' ? 'bg-yellow-100 text-yellow-600' :
                          notificacao.tipo === 'erro' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notificacao.tipo === 'sucesso' ? <CheckCircle size={16} /> :
                           notificacao.tipo === 'aviso' ? <AlertCircle size={16} /> :
                           notificacao.tipo === 'erro' ? <XCircle size={16} /> :
                           <Info size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{notificacao.titulo}</p>
                          <p className="text-sm text-gray-600 mt-1">{notificacao.mensagem}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(notificacao.data)}</p>
                        </div>
                      </div>
                      {!notificacao.lida && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="py-12 text-center">
              <Bell size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE PERFIL */}
      {/* ======================================== */}
      <Modal isOpen={showPerfilModal} onClose={() => setShowPerfilModal(false)} title="Meu Perfil" size="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-3xl font-black">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-primary text-xl">{user?.nome}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.telefone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Especialidade</p>
              <p className="font-bold text-primary">{user?.especialidade || 'Profissional'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Cidade</p>
              <p className="font-bold text-primary">{user?.cidade || 'Maputo'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Valor/Hora</p>
              <p className="font-bold text-primary">{user?.valorHora ? formatCurrency(user.valorHora) : '500 MT'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Experiência</p>
              <p className="font-bold text-primary">{user?.experiencia || '3-5 anos'}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-yellow-500 fill-current" />
              <span className="font-bold text-primary">Avaliação</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-primary">{stats.avaliacaoMedia.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} size={20} fill={star <= Math.round(stats.avaliacaoMedia) ? 'currentColor' : 'none'} className="text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-gray-500">({stats.totalAvaliacoes} avaliações)</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Sobre</p>
            <p className="text-sm text-primary">{user?.descricao || 'Profissional dedicado e experiente.'}</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPerfilModal(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowPerfilModal(false);
                showToast('Funcionalidade em desenvolvimento', 'info');
              }}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              Editar Perfil
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
