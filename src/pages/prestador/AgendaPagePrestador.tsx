import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
  Wrench
} from 'lucide-react';
import { formatDate, translateStatus } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

export default function AgendaPagePrestador() {
  const { user, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Solicitacao[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'solicitacoes'),
      where('prestadorId', '==', user.id),
      where('status', 'in', ['prestador_atribuido', 'em_andamento', 'concluido']),
      orderBy('dataAgendada', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setAgendamentos(docs);
      filterAgendamentos(filterStatus, docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filterAgendamentos = (status: string, docs = agendamentos) => {
    if (status === 'todas') {
      setFilteredAgendamentos(docs);
    } else {
      setFilteredAgendamentos(docs.filter(s => s.status === status));
    }
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterAgendamentos(status);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/prestador/agenda/detalhes/${id}`);
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: newStatus,
        [`data${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`]: new Date()
      });
      showToast(`Status atualizado para ${translateStatus(newStatus)}`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  };

  if (user?.status === 'pendente' || user?.status === 'pendente_documentos') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mb-6">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-primary mb-4">Perfil não ativo</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Seu perfil precisa estar ativo para acessar a agenda.
            Complete seu cadastro ou aguarde a aprovação da central.
          </p>
          <Button onClick={() => navigate('/prestador/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

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
                <CalendarIcon size={32} className="text-accent" />
                Minha Agenda
              </h1>
              <p className="text-gray-500">Acompanhe seus serviços agendados.</p>
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
              variant={filterStatus === 'prestador_atribuido' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('prestador_atribuido')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Agendadas
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
          </div>

          {/* ======================================== */}
          {/* LISTA DE AGENDAMENTOS */}
          {/* ======================================== */}
          <div className="space-y-6">
            {filteredAgendamentos.length > 0 ? (
              filteredAgendamentos.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Data em destaque */}
                        <div className="bg-gradient-to-br from-primary to-blue-900 text-white p-6 md:w-48 flex flex-col items-center justify-center text-center">
                          <p className="text-xs font-bold uppercase opacity-70 mb-1">
                            {item.dataAgendada ? formatDate(item.dataAgendada).split(' ')[1] : 'Data'}
                          </p>
                          <p className="text-4xl font-black">
                            {item.dataAgendada ? formatDate(item.dataAgendada).split(' ')[0] : '--'}
                          </p>
                          <p className="text-xs font-bold mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {item.dataAgendada 
                              ? (item.dataAgendada instanceof Date 
                                  ? item.dataAgendada.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : new Date(item.dataAgendada.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                              : 'N/A'}
                          </p>
                        </div>

                        {/* Informações do serviço */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  item.status === 'prestador_atribuido' ? 'bg-blue-100 text-blue-700' :
                                  item.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {translateStatus(item.status)}
                                </span>
                                {item.tamanho && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                    item.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {item.tamanho === 'pequeno' ? 'Pequeno' : 
                                     item.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-black text-primary">{item.servico}</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <UserIcon size={16} className="text-gray-400" />
                                  <span className="font-bold">{item.clienteNome}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin size={16} className="text-gray-400" />
                                  <span>
                                    {item.endereco?.bairro}
                                    {item.endereco?.quarteirao ? `, Q. ${item.endereco.quarteirao}` : ''}
                                    {item.endereco?.casa ? `, Casa ${item.endereco.casa}` : ''}
                                  </span>
                                </div>
                              </div>

                              {item.descricao && (
                                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                                  {item.descricao}
                                </p>
                              )}

                              {/* Ações rápidas */}
                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContactClient('whatsapp', item.telefoneCliente)}
                                  className="text-green-600 hover:bg-green-50"
                                  leftIcon={<MessageSquare size={16} />}
                                >
                                  WhatsApp
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContactClient('ligacao', item.telefoneCliente)}
                                  className="text-blue-600 hover:bg-blue-50"
                                  leftIcon={<Phone size={16} />}
                                >
                                  Ligar
                                </Button>
                              </div>
                            </div>

                            {/* Ações do agendamento */}
                            <div className="flex flex-row md:flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(item.id)}
                                leftIcon={<Eye size={16} />}
                              >
                                Detalhes
                              </Button>
                              
                              {item.status === 'prestador_atribuido' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(item.id, 'em_andamento')}
                                  className="bg-indigo-600 hover:bg-indigo-700"
                                  leftIcon={<Clock size={16} />}
                                >
                                  Iniciar
                                </Button>
                              )}
                              
                              {item.status === 'em_andamento' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(item.id, 'concluido')}
                                  className="bg-green-600 hover:bg-green-700"
                                  leftIcon={<CheckCircle2 size={16} />}
                                >
                                  Concluir
                                </Button>
                              )}
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
                    {filterStatus === 'todas' 
                      ? 'Você não tem serviços agendados no momento.' 
                      : `Não há serviços com status "${translateStatus(filterStatus)}".`}
                  </p>
                  <Button onClick={() => navigate('/prestador/dashboard')}>
                    Ver serviços disponíveis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
