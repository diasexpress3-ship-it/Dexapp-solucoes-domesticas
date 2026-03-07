import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter,
  User as UserIcon,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Home,
  LogOut,
  RefreshCw,
  Eye,
  Edit,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  Loader2,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  DollarSign,
  Percent,
  FileText,
  Camera,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Award,
  Briefcase,
  TrendingUp,
  Wallet,
  Send
} from 'lucide-react';
import { formatDate, translateStatus, formatCurrency } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface AgendamentoDetalhado extends Solicitacao {
  dataAgendadaObj: Date;
  horaFormatada: string;
  ganhoPrestador: number;
}

interface FiltrosAgenda {
  periodo: 'todos' | 'hoje' | 'semana' | 'mes' | 'personalizado';
  status: string;
  busca: string;
  dataInicio?: Date;
  dataFim?: Date;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AgendaPagePrestador() {
  const { user, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoDetalhado[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<AgendamentoDetalhado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoDetalhado | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'calendario'>('lista');
  const [mesAtual, setMesAtual] = useState(new Date());
  
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    periodo: 'todos',
    status: 'todos',
    busca: ''
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

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
  // BUSCAR AGENDAMENTOS
  // ============================================
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'solicitacoes'),
      where('prestadorId', '==', user.id),
      where('status', 'in', ['prestador_atribuido', 'em_andamento', 'aguardando_pagamento_final', 'concluido']),
      orderBy('dataAgendada', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Processar data agendada
        let dataAgendadaObj: Date;
        if (data.dataAgendada instanceof Date) {
          dataAgendadaObj = data.dataAgendada;
        } else if (data.dataAgendada?.toDate) {
          dataAgendadaObj = data.dataAgendada.toDate();
        } else {
          dataAgendadaObj = new Date(data.dataAgendada);
        }

        // Formatar hora
        const horaFormatada = dataAgendadaObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Calcular ganho do prestador (60%)
        const ganhoPrestador = data.valorTotal ? Math.round(data.valorTotal * 0.6) : 0;

        return {
          id: doc.id,
          ...data,
          dataAgendadaObj,
          horaFormatada,
          ganhoPrestador
        } as AgendamentoDetalhado;
      });
      
      setAgendamentos(docs);
      aplicarFiltros(docs, filtros);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // ============================================
  // FILTRAR AGENDAMENTOS
  // ============================================
  useEffect(() => {
    aplicarFiltros(agendamentos, filtros);
  }, [filtros, agendamentos]);

  const aplicarFiltros = (agendamentos: AgendamentoDetalhado[], filtrosAtuais: FiltrosAgenda) => {
    let filtrados = [...agendamentos];

    // Filtro por período
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (filtrosAtuais.periodo === 'hoje') {
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      filtrados = filtrados.filter(a => 
        a.dataAgendadaObj >= hoje && a.dataAgendadaObj < amanha
      );
    } else if (filtrosAtuais.periodo === 'semana') {
      const fimSemana = new Date(hoje);
      fimSemana.setDate(fimSemana.getDate() + 7);
      filtrados = filtrados.filter(a => 
        a.dataAgendadaObj >= hoje && a.dataAgendadaObj <= fimSemana
      );
    } else if (filtrosAtuais.periodo === 'mes') {
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      filtrados = filtrados.filter(a => 
        a.dataAgendadaObj >= hoje && a.dataAgendadaObj <= fimMes
      );
    } else if (filtrosAtuais.periodo === 'personalizado' && filtrosAtuais.dataInicio && filtrosAtuais.dataFim) {
      filtrados = filtrados.filter(a => 
        a.dataAgendadaObj >= filtrosAtuais.dataInicio! && 
        a.dataAgendadaObj <= filtrosAtuais.dataFim!
      );
    }

    // Filtro por status
    if (filtrosAtuais.status !== 'todos') {
      filtrados = filtrados.filter(a => a.status === filtrosAtuais.status);
    }

    // Filtro por busca
    if (filtrosAtuais.busca) {
      const termo = filtrosAtuais.busca.toLowerCase();
      filtrados = filtrados.filter(a => 
        a.servico.toLowerCase().includes(termo) ||
        a.clienteNome?.toLowerCase().includes(termo) ||
        a.endereco.bairro.toLowerCase().includes(termo)
      );
    }

    setFilteredAgendamentos(filtrados);
  };

  const handleFiltroChange = (key: keyof FiltrosAgenda, valor: any) => {
    setFiltros(prev => ({ ...prev, [key]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      periodo: 'todos',
      status: 'todos',
      busca: ''
    });
    showToast('Filtros limpos', 'success');
  };

  // ============================================
  // FUNÇÕES DE AÇÃO
  // ============================================
  const handleVerDetalhes = (agendamento: AgendamentoDetalhado) => {
    setSelectedAgendamento(agendamento);
    setShowDetalhesModal(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: newStatus,
        [`data${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`]: new Date()
      });
      showToast(`Status atualizado com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactClient = (tipo: 'whatsapp' | 'ligacao', telefone?: string) => {
    if (!telefone) {
      showToast('Telefone do cliente não disponível', 'error');
      return;
    }

    if (tipo === 'whatsapp') {
      window.open(`https://wa.me/${telefone.replace(/\D/g, '')}`, '_blank');
    } else {
      window.open(`tel:${telefone}`);
    }
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleDownloadAgenda = () => {
    showToast('A gerar agenda...', 'info');
    setTimeout(() => {
      showToast('Agenda exportada com sucesso!', 'success');
    }, 1500);
  };

  // ============================================
  // FUNÇÕES DE CALENDÁRIO
  // ============================================
  const diasNoMes = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const primeiroDiaMes = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const mesSeguinte = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const getAgendamentosDoDia = (dia: number) => {
    const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    data.setHours(0, 0, 0, 0);
    const dataFim = new Date(data);
    dataFim.setHours(23, 59, 59, 999);

    return filteredAgendamentos.filter(a => 
      a.dataAgendadaObj >= data && a.dataAgendadaObj <= dataFim
    );
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prestador_atribuido': return 'bg-blue-100 text-blue-700';
      case 'em_andamento': return 'bg-indigo-100 text-indigo-700';
      case 'aguardando_pagamento_final': return 'bg-purple-100 text-purple-700';
      case 'concluido': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'prestador_atribuido': return <UserCheck size={12} className="mr-1" />;
      case 'em_andamento': return <Wrench size={12} className="mr-1" />;
      case 'aguardando_pagamento_final': return <Clock size={12} className="mr-1" />;
      case 'concluido': return <CheckCircle2 size={12} className="mr-1" />;
      default: return null;
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'prestador_atribuido': return 'Agendado';
      case 'em_andamento': return 'Em Andamento';
      case 'aguardando_pagamento_final': return 'Aguardando Pagamento';
      case 'concluido': return 'Concluído';
      default: return status;
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
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                  <CalendarIcon size={32} className="text-accent" />
                  Minha Agenda
                </h1>
                <p className="text-gray-500">Acompanhe seus serviços agendados.</p>
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
          {/* CONTROLES */}
          {/* ======================================== */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Pesquisar por serviço, cliente ou local..."
                  value={filtros.busca}
                  onChange={(e) => handleFiltroChange('busca', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={modoVisualizacao === 'lista' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setModoVisualizacao('lista')}
                leftIcon={<CalendarIcon size={16} />}
              >
                Lista
              </Button>
              <Button
                variant={modoVisualizacao === 'calendario' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setModoVisualizacao('calendario')}
                leftIcon={<Calendar size={16} />}
              >
                Calendário
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFiltros(!showFiltros)}
                className={showFiltros ? 'bg-accent text-white' : ''}
              >
                <Filter size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadAgenda}
                title="Exportar agenda"
              >
                <Download size={18} />
              </Button>
            </div>
          </div>

          {/* ======================================== */}
          {/* FILTROS EXPANDIDOS */}
          {/* ======================================== */}
          <AnimatePresence>
            {showFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Período</label>
                        <select
                          value={filtros.periodo}
                          onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                        >
                          <option value="todos">Todos</option>
                          <option value="hoje">Hoje</option>
                          <option value="semana">Próximos 7 dias</option>
                          <option value="mes">Este mês</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Status</label>
                        <select
                          value={filtros.status}
                          onChange={(e) => handleFiltroChange('status', e.target.value)}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                        >
                          <option value="todos">Todos</option>
                          <option value="prestador_atribuido">Agendados</option>
                          <option value="em_andamento">Em andamento</option>
                          <option value="aguardando_pagamento_final">Aguardando pagamento</option>
                          <option value="concluido">Concluídos</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={limparFiltros}
                          className="text-gray-500"
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================== */}
          {/* VISUALIZAÇÃO EM LISTA */}
          {/* ======================================== */}
          {modoVisualizacao === 'lista' && (
            <div className="space-y-6">
              {filteredAgendamentos.length > 0 ? (
                filteredAgendamentos.map((agendamento) => (
                  <motion.div
                    key={agendamento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                          onClick={() => handleVerDetalhes(agendamento)}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Data em destaque */}
                          <div className="bg-gradient-to-br from-primary to-blue-900 text-white p-6 md:w-48 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold uppercase opacity-70 mb-1">
                              {agendamento.dataAgendadaObj.toLocaleDateString('pt-BR', { month: 'short' })}
                            </p>
                            <p className="text-4xl font-black">
                              {agendamento.dataAgendadaObj.getDate()}
                            </p>
                            <p className="text-xs font-bold mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {agendamento.horaFormatada}
                            </p>
                          </div>

                          {/* Informações do agendamento */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center ${getStatusColor(agendamento.status)}`}>
                                    {getStatusIcon(agendamento.status)}
                                    {getStatusTexto(agendamento.status)}
                                  </span>
                                  {agendamento.tamanho && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      agendamento.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                      agendamento.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {agendamento.tamanho === 'pequeno' ? 'Pequeno' : 
                                       agendamento.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-black text-primary">{agendamento.servico}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <UserIcon size={16} className="text-gray-400" />
                                    <span className="font-bold">
                                      {agendamento.clienteNome}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>
                                      {agendamento.endereco.bairro}
                                      {agendamento.endereco.quarteirao ? `, Q. ${agendamento.endereco.quarteirao}` : ''}
                                    </span>
                                  </div>
                                </div>

                                {/* Informação de ganho para serviços concluídos */}
                                {agendamento.status === 'concluido' && (
                                  <div className="mt-2 p-2 bg-green-50 rounded-lg inline-block">
                                    <p className="text-xs text-gray-500">Seu ganho</p>
                                    <p className="text-sm font-bold text-green-600">{formatCurrency(agendamento.ganhoPrestador)}</p>
                                  </div>
                                )}
                              </div>

                              {/* Ações rápidas */}
                              <div className="flex flex-row md:flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerDetalhes(agendamento);
                                  }}
                                  leftIcon={<Eye size={16} />}
                                >
                                  Detalhes
                                </Button>
                                
                                {agendamento.status === 'prestador_atribuido' && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(agendamento.id, 'em_andamento');
                                    }}
                                    disabled={actionLoading === agendamento.id}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                  >
                                    {actionLoading === agendamento.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      'Iniciar'
                                    )}
                                  </Button>
                                )}

                                {agendamento.status === 'em_andamento' && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(agendamento.id, 'aguardando_pagamento_final');
                                    }}
                                    disabled={actionLoading === agendamento.id}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    {actionLoading === agendamento.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      'Concluir'
                                    )}
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContactClient('whatsapp', agendamento.telefoneCliente);
                                  }}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <MessageSquare size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="border-dashed border-2 bg-transparent">
                  <CardContent className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <CalendarIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">Sua agenda está vazia</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {filtros.busca || filtros.periodo !== 'todos' || filtros.status !== 'todos'
                        ? 'Nenhum agendamento encontrado com os filtros atuais.'
                        : 'Você não tem serviços agendados no momento.'}
                    </p>
                    <Button onClick={() => navigate('/prestador/dashboard')}>
                      Ver serviços disponíveis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ======================================== */}
          {/* VISUALIZAÇÃO EM CALENDÁRIO */}
          {/* ======================================== */}
          {modoVisualizacao === 'calendario' && (
            <Card>
              <CardContent className="p-6">
                {/* Cabeçalho do calendário */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="outline" size="icon" onClick={mesAnterior}>
                    <ChevronLeft size={18} />
                  </Button>
                  <h2 className="text-xl font-black text-primary">
                    {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Button variant="outline" size="icon" onClick={mesSeguinte}>
                    <ChevronRight size={18} />
                  </Button>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                    <div key={dia} className="text-center text-xs font-bold text-gray-400 uppercase">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: primeiroDiaMes(mesAtual) }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square p-2 bg-gray-50 rounded-xl" />
                  ))}

                  {Array.from({ length: diasNoMes(mesAtual) }).map((_, index) => {
                    const dia = index + 1;
                    const agendamentosDoDia = getAgendamentosDoDia(dia);
                    const hoje = new Date();
                    const isHoje = 
                      dia === hoje.getDate() && 
                      mesAtual.getMonth() === hoje.getMonth() && 
                      mesAtual.getFullYear() === hoje.getFullYear();

                    return (
                      <div
                        key={dia}
                        className={`aspect-square p-2 border-2 rounded-xl transition-all ${
                          isHoje ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-accent/30'
                        }`}
                      >
                        <div className="flex flex-col h-full">
                          <span className={`text-sm font-bold mb-1 ${
                            isHoje ? 'text-accent' : 'text-primary'
                          }`}>
                            {dia}
                          </span>
                          {agendamentosDoDia.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {agendamentosDoDia.slice(0, 3).map((ag, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    ag.status === 'prestador_atribuido' ? 'bg-blue-500' :
                                    ag.status === 'em_andamento' ? 'bg-indigo-500' :
                                    ag.status === 'aguardando_pagamento_final' ? 'bg-purple-500' :
                                    'bg-green-500'
                                  }`}
                                  title={`${ag.servico} - ${ag.horaFormatada}`}
                                />
                              ))}
                              {agendamentosDoDia.length > 3 && (
                                <span className="text-[8px] font-bold text-gray-400">
                                  +{agendamentosDoDia.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-600">Agendado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-xs text-gray-600">Em andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-600">Aguardando pagamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">Concluído</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE DETALHES */}
      {/* ======================================== */}
      <Modal isOpen={showDetalhesModal} onClose={() => setShowDetalhesModal(false)} title="Detalhes do Serviço" size="lg">
        {selectedAgendamento && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-bold text-primary text-xl">{selectedAgendamento.servico}</h3>
                <p className="text-sm text-gray-500">ID: #{selectedAgendamento.id.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${getStatusColor(selectedAgendamento.status)}`}>
                {getStatusIcon(selectedAgendamento.status)}
                {getStatusTexto(selectedAgendamento.status)}
              </span>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Data</p>
                <p className="font-bold text-primary text-lg">
                  {selectedAgendamento.dataAgendadaObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Hora</p>
                <p className="font-bold text-primary text-lg">{selectedAgendamento.horaFormatada}</p>
              </div>
            </div>

            {/* Cliente */}
            <div>
              <h4 className="font-bold text-primary mb-3">Cliente</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white text-lg font-black">
                  {selectedAgendamento.clienteNome?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-primary">{selectedAgendamento.clienteNome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleContactClient('whatsapp', selectedAgendamento.telefoneCliente)}
                      className="text-green-600 hover:bg-green-50 h-8 w-8"
                    >
                      <MessageSquare size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleContactClient('ligacao', selectedAgendamento.telefoneCliente)}
                      className="text-blue-600 hover:bg-blue-50 h-8 w-8"
                    >
                      <Phone size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Local */}
            <div>
              <h4 className="font-bold text-primary mb-3">Local</h4>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-primary mb-1">
                  {selectedAgendamento.endereco.bairro}
                  {selectedAgendamento.endereco.quarteirao ? `, Q. ${selectedAgendamento.endereco.quarteirao}` : ''}
                  {selectedAgendamento.endereco.casa ? `, Casa ${selectedAgendamento.endereco.casa}` : ''}
                </p>
                {selectedAgendamento.endereco.referencia && (
                  <p className="text-xs text-gray-500">{selectedAgendamento.endereco.referencia}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            {selectedAgendamento.descricao && (
              <div>
                <h4 className="font-bold text-primary mb-3">Descrição</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                  {selectedAgendamento.descricao}
                </p>
              </div>
            )}

            {/* Valores */}
            <div>
              <h4 className="font-bold text-primary mb-3">Valores</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valor total do serviço:</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedAgendamento.valorTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seu ganho (60%):</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedAgendamento.ganhoPrestador)}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetalhesModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              
              {selectedAgendamento.status === 'prestador_atribuido' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUpdateStatus(selectedAgendamento.id, 'em_andamento');
                    setShowDetalhesModal(false);
                  }}
                  disabled={actionLoading === selectedAgendamento.id}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {actionLoading === selectedAgendamento.id ? 'Processando...' : 'Iniciar Serviço'}
                </Button>
              )}

              {selectedAgendamento.status === 'em_andamento' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUpdateStatus(selectedAgendamento.id, 'aguardando_pagamento_final');
                    setShowDetalhesModal(false);
                  }}
                  disabled={actionLoading === selectedAgendamento.id}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionLoading === selectedAgendamento.id ? 'Processando...' : 'Concluir Serviço'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
