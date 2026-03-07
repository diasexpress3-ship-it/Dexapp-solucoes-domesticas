
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
  DollarSign,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Award,
  Wrench,
  Home,
  LogOut,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

interface PrestadorStats {
  totalGanhos: number;
  servicosConcluidos: number;
  servicosEmAndamento: number;
  servicosPendentes: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

export default function PrestadorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const [stats, setStats] = useState<PrestadorStats>({
    totalGanhos: 0,
    servicosConcluidos: 0,
    servicosEmAndamento: 0,
    servicosPendentes: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0
  });

  useEffect(() => {
    if (!user) return;

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
      
      const totalGanhos = concluidos.reduce((acc, curr) => acc + (curr.valor80 || 0), 0);
      
      // Calcular média de avaliações (simulado)
      const totalAvaliacoes = user?.totalAvaliacoes || 0;
      const avaliacaoMedia = user?.avaliacaoMedia || 4.8;
      
      setStats({
        totalGanhos,
        servicosConcluidos: concluidos.length,
        servicosEmAndamento: emAndamento.length,
        servicosPendentes: pendentes.length,
        avaliacaoMedia,
        totalAvaliacoes
      });
      
      filterSolicitacoes(filterStatus, docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
        status: 'concluido',
        dataConclusao: new Date()
      });
      showToast('Serviço concluído! Parabéns!', 'success');
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ======================================== */}
        {/* HEADER PERSONALIZADO */}
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
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                  user?.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user?.status === 'activo' ? 'Ativo' : 'Inativo'}
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
              onClick={() => window.location.reload()}
              title="Atualizar"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* STATS GRID */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-accent to-orange-600 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Ganhos Totais</p>
              <h3 className="text-2xl font-black">{formatCurrency(stats.totalGanhos)}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award size={24} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosConcluidos}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-orange-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Em Andamento</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosEmAndamento}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle size={24} className="text-yellow-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disponíveis</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosPendentes}</h3>
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
        {/* SOLICITAÇÕES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredSolicitacoes.length > 0 ? (
            filteredSolicitacoes.map((sol) => (
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

                      {/* Valores e Ações */}
                      <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                        <div className="text-right w-full">
                          <p className="text-xs font-bold text-gray-400 uppercase">Valor Total</p>
                          <p className="text-2xl font-black text-primary">{formatCurrency(sol.valorTotal)}</p>
                          <p className="text-xs text-gray-500">Seu ganho: {formatCurrency(sol.valor80)}</p>
                          <span className={`inline-block mt-2 text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            sol.status === 'concluido' ? 'bg-green-100 text-green-700' :
                            sol.status === 'buscando_prestador' ? 'bg-yellow-100 text-yellow-700' :
                            sol.status === 'prestador_atribuido' ? 'bg-blue-100 text-blue-700' :
                            sol.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700' :
                            sol.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {translateStatus(sol.status)}
                          </span>
                        </div>

                        {/* AÇÕES CRUD */}
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                          {/* Visualizar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(sol.id)}
                            title="Visualizar detalhes"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={18} />
                          </Button>

                          {/* Ações baseadas no status */}
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
                              {actionLoading === sol.id ? '...' : 'Concluir'}
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
            ))
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
    </AppLayout>
  );
}
