import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao, Pagamento } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, translateStatus } from '../../utils/utils';
import { 
  Briefcase, 
  Wallet, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Plus,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  Phone,
  Edit,
  Trash2,
  Eye,
  XCircle,
  RefreshCw,
  User,
  Star,
  Home,
  LogOut,
  Calendar,
  MapPin,
  DollarSign,
  Percent,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Loader2,
  Bell,
  Settings,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

// ============================================
// INTERFACES
// ============================================
interface SolicitacaoDetalhada extends Solicitacao {
  valorInicial70: number;
  valorFinal30: number;
  valorPago: number;
  valorRestante: number;
  percentualPago: number;
}

interface DashboardStats {
  totalGasto: number;
  servicosAtivos: number;
  servicosConcluidos: number;
  servicosCancelados: number;
  servicosAguardandoPagamento: number;
  avaliacaoMedia: number;
  tempoMedioResposta: string;
  cashbackAcumulado: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ClienteDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [recentSolicitacoes, setRecentSolicitacoes] = useState<SolicitacaoDetalhada[]>([]);
  const [allSolicitacoes, setAllSolicitacoes] = useState<SolicitacaoDetalhada[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalGasto: 0,
    servicosAtivos: 0,
    servicosConcluidos: 0,
    servicosCancelados: 0,
    servicosAguardandoPagamento: 0,
    avaliacaoMedia: 0,
    tempoMedioResposta: '15 min',
    cashbackAcumulado: 0
  });

  // ============================================
  // BUSCAR SOLICITAÇÕES
  // ============================================
  useEffect(() => {
    if (!user) return;

    // Buscar solicitações recentes (5)
    const recentQuery = query(
      collection(db, 'solicitacoes'),
      where('clienteId', '==', user.id),
      orderBy('dataSolicitacao', 'desc'),
      limit(5)
    );

    // Buscar todas as solicitações
    const allQuery = query(
      collection(db, 'solicitacoes'),
      where('clienteId', '==', user.id),
      orderBy('dataSolicitacao', 'desc')
    );

    const unsubscribeRecent = onSnapshot(recentQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        const valorTotal = data.valorTotal || 0;
        const valorInicial70 = Math.round(valorTotal * 0.7);
        const valorFinal30 = Math.round(valorTotal * 0.3);
        const valorPago = data.status === 'concluido' ? valorTotal : valorInicial70;
        const valorRestante = data.status === 'concluido' ? 0 : valorFinal30;
        const percentualPago = Math.round((valorPago / valorTotal) * 100);

        return {
          id: doc.id,
          ...data,
          valorInicial70,
          valorFinal30,
          valorPago,
          valorRestante,
          percentualPago
        } as SolicitacaoDetalhada;
      });
      setRecentSolicitacoes(docs);
    });

    const unsubscribeAll = onSnapshot(allQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        const valorTotal = data.valorTotal || 0;
        const valorInicial70 = Math.round(valorTotal * 0.7);
        const valorFinal30 = Math.round(valorTotal * 0.3);
        const valorPago = data.status === 'concluido' ? valorTotal : valorInicial70;
        const valorRestante = data.status === 'concluido' ? 0 : valorFinal30;
        const percentualPago = Math.round((valorPago / valorTotal) * 100);

        return {
          id: doc.id,
          ...data,
          valorInicial70,
          valorFinal30,
          valorPago,
          valorRestante,
          percentualPago
        } as SolicitacaoDetalhada;
      });
      
      setAllSolicitacoes(docs);
      
      // Calcular estatísticas
      const total = docs.reduce((acc, curr) => acc + (curr.status === 'concluido' ? curr.valorTotal : 0), 0);
      const active = docs.filter(s => ['buscando_prestador', 'prestador_atribuido', 'em_andamento'].includes(s.status)).length;
      const completed = docs.filter(s => s.status === 'concluido').length;
      const cancelled = docs.filter(s => s.status === 'cancelado').length;
      const aguardando = docs.filter(s => s.status === 'aguardando_pagamento_final').length;
      
      // Calcular média de avaliações (simulado)
      const avaliacoes = docs.filter(s => s.avaliacao).length;
      const somaAvaliacoes = docs.reduce((acc, curr) => acc + (curr.avaliacao || 0), 0);
      const mediaAvaliacoes = avaliacoes > 0 ? somaAvaliacoes / avaliacoes : 0;

      setStats({
        totalGasto: total,
        servicosAtivos: active,
        servicosConcluidos: completed,
        servicosCancelados: cancelled,
        servicosAguardandoPagamento: aguardando,
        avaliacaoMedia: mediaAvaliacoes,
        tempoMedioResposta: '15 min',
        cashbackAcumulado: total * 0.05
      });
      
      setIsLoading(false);
    });

    return () => {
      unsubscribeRecent();
      unsubscribeAll();
    };
  }, [user]);

  // ============================================
  // FUNÇÕES CRUD
  // ============================================
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Logout efetuado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao fazer logout', 'error');
    }
  };

  const handleCancelSolicitacao = async (id: string, status: string) => {
    if (!['buscando_prestador', 'prestador_atribuido'].includes(status)) {
      showToast('Não é possível cancelar este serviço neste estado', 'error');
      return;
    }

    if (!window.confirm('Tem certeza que deseja cancelar esta solicitação?')) return;

    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'cancelado',
        motivoCancelamento: 'Cancelado pelo cliente',
        dataCancelamento: new Date()
      });
      showToast('Solicitação cancelada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      showToast('Erro ao cancelar solicitação', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSolicitacao = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação permanentemente?')) return;

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

  const handleRefreshStatus = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      showToast('Status atualizado!', 'success');
      setActionLoading(null);
    }, 500);
  };

  const handleEditSolicitacao = (id: string) => {
    navigate(`/cliente/acompanhamento/${id}`);
  };

  const handleViewSolicitacao = (id: string) => {
    navigate(`/cliente/acompanhamento/${id}`);
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleDownloadRecibo = (id: string) => {
    showToast('A gerar recibo...', 'info');
    setTimeout(() => {
      showToast('Recibo gerado com sucesso!', 'success');
    }, 1500);
  };

  const solicitacoesToShow = showAll ? allSolicitacoes : recentSolicitacoes;

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 size={40} className="animate-spin text-accent mx-auto" />
          <p className="mt-4 text-gray-500">Carregando...</p>
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user?.nome?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary mb-1">
                Olá, {user?.nome?.split(' ')[0] || 'Cliente'}! 👋
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <span>Cliente desde {user?.dataCadastro ? formatDate(user.dataCadastro) : '2025'}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-accent font-bold">• {user?.cidade || 'Maputo'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* BOTÃO INÍCIO */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              leftIcon={<Home size={16} />}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Início
            </Button>
            {/* BOTÃO LOGOUT */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Sair
            </Button>
            {/* BOTÃO NOVA SOLICITAÇÃO */}
            <Link to="/cliente/nova-solicitacao">
              <Button 
                className="bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all"
                leftIcon={<Plus size={20} />}
              >
                Nova Solicitação
              </Button>
            </Link>
          </div>
        </div>

        {/* ======================================== */}
        {/* STATS GRID */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Total Investido</p>
              <h3 className="text-2xl font-black">{formatCurrency(stats.totalGasto)}</h3>
              <p className="text-xs opacity-60 mt-1">Cashback: {formatCurrency(stats.cashbackAcumulado)}</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serviços Ativos</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosAtivos}</h3>
              <p className="text-xs text-gray-400 mt-1">Tempo médio: {stats.tempoMedioResposta}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concluídos</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosConcluidos}</h3>
              <p className="text-xs text-gray-400 mt-1">Avaliação: {stats.avaliacaoMedia.toFixed(1)} ⭐</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle size={24} className="text-red-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cancelados</p>
              <h3 className="text-2xl font-black text-primary">{stats.servicosCancelados}</h3>
              <p className="text-xs text-gray-400 mt-1">Aguardando pagto: {stats.servicosAguardandoPagamento}</p>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* ALERTA DE PAGAMENTOS PENDENTES */}
        {/* ======================================== */}
        {stats.servicosAguardandoPagamento > 0 && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-yellow-600" />
                  <div>
                    <p className="font-bold text-yellow-700">
                      Você tem {stats.servicosAguardandoPagamento} serviço(s) com pagamento pendente
                    </p>
                    <p className="text-sm text-yellow-600">
                      Complete o pagamento final para concluir o serviço e liberar o prestador.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Ver serviços
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ======================================== */}
        {/* SOLICITAÇÕES */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-primary flex items-center gap-2">
                <Briefcase size={20} className="text-accent" />
                {showAll ? 'Todas as Solicitações' : 'Solicitações Recentes'}
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-accent hover:text-accent/80"
                >
                  {showAll ? 'Ver menos' : 'Ver todas'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.location.reload()}
                  title="Atualizar"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>

            {solicitacoesToShow.length > 0 ? (
              <div className="space-y-4">
                {solicitacoesToShow.map((sol) => (
                  <motion.div 
                    key={sol.id} 
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:border-accent/20 transition-all shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          {/* Linha superior */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                                <Briefcase size={20} />
                              </div>
                              <div>
                                <h4 className="font-black text-primary">{sol.servico}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Calendar size={12} />
                                  <span>{formatDate(sol.dataSolicitacao)}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <MapPin size={12} />
                                  <span>{sol.endereco?.bairro}</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              sol.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              sol.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                              sol.status === 'aguardando_pagamento_final' ? 'bg-yellow-100 text-yellow-700' :
                              sol.status === 'buscando_prestador' ? 'bg-orange-100 text-orange-700' :
                              sol.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {translateStatus(sol.status)}
                            </span>
                          </div>

                          {/* Barra de progresso do pagamento */}
                          {sol.status !== 'cancelado' && (
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-500">Pagamento</span>
                                  <span className="font-bold text-primary">{sol.percentualPago}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-accent transition-all duration-300" 
                                    style={{ width: `${sol.percentualPago}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-primary">{formatCurrency(sol.valorPago)}</p>
                                <p className="text-[10px] text-gray-400">de {formatCurrency(sol.valorTotal)}</p>
                              </div>
                            </div>
                          )}

                          {/* Informações adicionais e ações */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-xs">
                              {sol.prestadorNome && (
                                <span className="flex items-center gap-1">
                                  <User size={12} className="text-gray-400" />
                                  {sol.prestadorNome}
                                </span>
                              )}
                              {sol.valorRestante > 0 && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Percent size={12} />
                                  Restante: {formatCurrency(sol.valorRestante)}
                                </span>
                              )}
                            </div>

                            {/* AÇÕES */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewSolicitacao(sol.id)}
                                title="Visualizar"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye size={16} />
                              </Button>
                              
                              {sol.status === 'concluido' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownloadRecibo(sol.id)}
                                  title="Download Recibo"
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <Download size={16} />
                                </Button>
                              )}
                              
                              {['buscando_prestador', 'prestador_atribuido'].includes(sol.status) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditSolicitacao(sol.id)}
                                    title="Editar"
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCancelSolicitacao(sol.id, sol.status)}
                                    disabled={actionLoading === sol.id}
                                    title="Cancelar"
                                    className="text-orange-600 hover:bg-orange-50"
                                  >
                                    <XCircle size={16} />
                                  </Button>
                                </>
                              )}
                              
                              {sol.status === 'cancelado' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSolicitacao(sol.id)}
                                  disabled={actionLoading === sol.id}
                                  title="Excluir permanentemente"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRefreshStatus(sol.id)}
                                disabled={actionLoading === sol.id}
                                title="Atualizar status"
                                className="text-gray-600 hover:bg-gray-50"
                              >
                                <RefreshCw size={16} className={actionLoading === sol.id ? 'animate-spin' : ''} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="font-black text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                  <p className="text-sm text-gray-500 mb-6">Comece agora solicitando seu primeiro serviço.</p>
                  <Link to="/cliente/nova-solicitacao">
                    <Button className="bg-accent hover:bg-accent/90 text-white">
                      Solicitar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ======================================== */}
          {/* SIDEBAR */}
          {/* ======================================== */}
          <div className="space-y-6">
            {/* Carteira */}
            <h2 className="text-xl font-black text-primary flex items-center gap-2">
              <Wallet size={20} className="text-accent" />
              Minha Carteira
            </h2>
            <Card className="bg-gradient-to-br from-accent to-orange-600 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Saldo Disponível</p>
                    <h3 className="text-3xl font-black">MT 0,00</h3>
                  </div>
                  <TrendingUp size={24} className="opacity-50" />
                </div>
                <div className="space-y-2">
                  <Link to="/cliente/carteira">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                    >
                      Ver Carteira
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                    onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}
                  >
                    Adicionar Fundos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Faturas Recentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <FileText size={18} className="text-accent" />
                  Faturas Recentes
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/cliente/carteira')}>
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {allSolicitacoes.filter(s => s.status === 'concluido').slice(0, 3).map((sol) => (
                    <div key={sol.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-primary">{sol.servico}</p>
                        <p className="text-xs text-gray-500">{formatDate(sol.dataConclusao || sol.dataSolicitacao)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-primary">{formatCurrency(sol.valorTotal)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyToClipboard(sol.id, 'ID')}
                          className="text-gray-400 hover:text-accent"
                        >
                          {copiado === 'ID' ? <Check size={14} /> : <Copy size={14} />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suporte Rápido */}
            <h3 className="font-black text-primary flex items-center gap-2">
              <MessageCircle size={18} className="text-accent" />
              Suporte Rápido
            </h3>
            <div className="space-y-3">
              <Card className="bg-gray-50 border-none shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <a 
                    href="https://wa.me/258871425316" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">WhatsApp Suporte</p>
                      <p className="text-xs text-gray-500">+258 87 142 5316</p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-none shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <a href="tel:+258871425316" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Ligação Telefônica</p>
                      <p className="text-xs text-gray-500">Atendimento 24/7</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Links Úteis */}
            <Card className="bg-gray-50 border-none">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-gray-600 hover:text-accent flex items-center gap-2 py-2">
                    <HelpCircle size={16} />
                    Central de Ajuda
                  </button>
                  <button className="w-full text-left text-sm text-gray-600 hover:text-accent flex items-center gap-2 py-2">
                    <FileText size={16} />
                    Termos de Uso
                  </button>
                  <button className="w-full text-left text-sm text-gray-600 hover:text-accent flex items-center gap-2 py-2">
                    <Settings size={16} />
                    Configurações
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
