import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
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
  Send
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PrestadorStats {
  servicosConcluidos: number;
  servicosEmAndamento: number;
  servicosPendentes: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  ganhosTotais: number;
  ganhosDisponiveis: number;
  ganhosPendentes: number;
}

interface SaqueRequest {
  id: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataSolicitacao: Date;
  dataProcessamento?: Date;
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
  const [valorSaque, setValorSaque] = useState<number>(0);
  const [saques, setSaques] = useState<SaqueRequest[]>([]);
  const [processingSaque, setProcessingSaque] = useState(false);
  
  const [stats, setStats] = useState<PrestadorStats>({
    servicosConcluidos: 0,
    servicosEmAndamento: 0,
    servicosPendentes: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    ganhosTotais: 0,
    ganhosDisponiveis: 0,
    ganhosPendentes: 0
  });

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
      const aguardandoPagamento = docs.filter(s => s.status === 'aguardando_pagamento_final');
      
      // Calcular ganhos (60% do valor pago pelo cliente)
      const ganhosTotais = concluidos.reduce((acc, curr) => {
        // prestadorRecebe60 = valorTotal * 0.6
        const valorPrestador = curr.valorTotal ? Math.round(curr.valorTotal * 0.6) : 0;
        return acc + valorPrestador;
      }, 0);
      
      // Ganhos disponíveis (serviços concluídos há mais de 7 dias - simulação)
      const ganhosDisponiveis = ganhosTotais * 0.8; // 80% disponível (simulação)
      const ganhosPendentes = ganhosTotais - ganhosDisponiveis;
      
      // Calcular média de avaliações
      const totalAvaliacoes = user?.totalAvaliacoes || 0;
      const avaliacaoMedia = user?.avaliacaoMedia || 4.8;
      
      setStats({
        servicosConcluidos: concluidos.length,
        servicosEmAndamento: emAndamento.length + aguardandoPagamento.length,
        servicosPendentes: pendentes.length,
        avaliacaoMedia,
        totalAvaliacoes,
        ganhosTotais,
        ganhosDisponiveis,
        ganhosPendentes
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
        ...doc.data()
      } as SaqueRequest));
      setSaques(docs);
    });

    return () => {
      unsubscribe();
      unsubscribeSaques();
    };
  }, [user]);

  // Filtrar solicitações por status
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
          banco: 'A confirmar',
          conta: 'A confirmar'
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

  const handleViewDetails = (id: string) => {
    navigate(`/prestador/agenda?id=${id}`);
  };

  const handleEditService = (id: string) => {
    navigate(`/prestador/agenda?id=${id}&edit=true`);
  };

  const handleUploadDocuments = () => {
    setShowDocumentModal(true);
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

          {/* HEADER */}
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

  // Dashboard normal para prestador ativo (COM GANHOS)
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
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
          </div>
        </div>

        {/* CARD DE GANHOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Disponível para Saque</p>
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
        </div>

        {/* STATS DE SERVIÇOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* FILTROS */}
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

        {/* SOLICITAÇÕES */}
        <div className="space-y-4">
          {filteredSolicitacoes.length > 0 ? (
            filteredSolicitacoes.map((sol) => {
              // Calcular ganho do prestador (60% do valor total)
              const ganhoPrestador = sol.valorTotal ? Math.round(sol.valorTotal * 0.6) : 0;
              
              return (
                <motion.div
                  key={sol.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`hover:shadow-xl transition-all ${
                    sol.status === 'buscando_prestador' ? 'border-accent/30 bg-accent/5' : ''
                  }`}>
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
                            <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2 ${
                              sol.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              sol.status === 'aguardando_pagamento_final' ? 'bg-purple-100 text-purple-700' :
                              sol.status === 'buscando_prestador' ? 'bg-yellow-100 text-yellow-700' :
                              sol.status === 'prestador_atribuido' ? 'bg-blue-100 text-blue-700' :
                              sol.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700' :
                              sol.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {translateStatus(sol.status)}
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

                          {/* AÇÕES */}
                          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(sol.id)}
                              title="Visualizar detalhes"
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </Button>

                            {sol.status === 'buscando_prestador' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectService(sol.id)}
                                  disabled={actionLoading === sol.id}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Recusar
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAcceptService(sol.id)}
                                  disabled={actionLoading === sol.id}
                                  className="bg-accent hover:bg-accent/90"
                                >
                                  {actionLoading === sol.id ? '...' : 'Aceitar'}
                                </Button>
                              </>
                            )}

                            {sol.status === 'prestador_atribuido' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditService(sol.id)}
                                  title="Editar"
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <Edit size={18} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelService(sol.id)}
                                  disabled={actionLoading === sol.id}
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleStartService(sol.id)}
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
                                onClick={() => handleCompleteService(sol.id)}
                                disabled={actionLoading === sol.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === sol.id ? '...' : 'Concluir Serviço'}
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
                                onClick={() => handleRefreshStatus(sol.id)}
                                disabled={actionLoading === sol.id}
                                title="Atualizar"
                                className="text-gray-600 hover:bg-gray-50"
                              >
                                <RefreshCw size={18} className={actionLoading === sol.id ? 'animate-spin' : ''} />
                              </Button>
                            )}

                            {sol.status === 'cancelado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteService(sol.id)}
                                disabled={actionLoading === sol.id}
                                title="Excluir permanentemente"
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
              );
            })
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <AlertCircle size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-sm text-gray-500">
                  {filterStatus === 'todas' 
                    ? 'Você ainda não tem serviços disponíveis.' 
                    : `Não há serviços com status "${translateStatus(filterStatus)}".`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Saque */}
      <Modal isOpen={showSaqueModal} onClose={() => setShowSaqueModal(false)} title="Solicitar Saque">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 mb-2">
              <span className="font-bold">Saldo disponível:</span> {formatCurrency(stats.ganhosDisponiveis)}
            </p>
            <p className="text-xs text-blue-600">
              O saque será processado pela central em até 48 horas úteis.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Valor do Saque (MT)
            </label>
            <input
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(Number(e.target.value))}
              max={stats.ganhosDisponiveis}
              min={100}
              step={100}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              placeholder="Digite o valor"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo: 100 MT</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-primary mb-2">Dados Bancários</h4>
            <p className="text-sm text-gray-600 mb-3">
              Os dados bancários cadastrados serão usados para transferência.
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
            </div>
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
              disabled={processingSaque || valorSaque <= 0 || valorSaque > stats.ganhosDisponiveis}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {processingSaque ? 'Processando...' : 'Solicitar Saque'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
