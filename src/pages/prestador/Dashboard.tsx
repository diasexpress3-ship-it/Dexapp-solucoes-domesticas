import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
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
  MapPin
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrestadorDashboard() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

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
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: newStatus
      });
      showToast(`Serviço ${translateStatus(newStatus).toLowerCase()} com sucesso!`, 'success');
    } catch (error) {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  if (user?.status === 'pending') {
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
                <span>Análise de documentos e antecedentes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <span>Entrevista técnica (se necessário).</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-yellow-500 shrink-0" />
                <span>Ativação do perfil no marketplace.</span>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary">Painel do Prestador</h1>
            <p className="text-gray-500">Gerencie seus serviços e ganhos.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
              user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              Status: {translateStatus(user?.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Requests */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-primary">Solicitações de Serviço</h2>
            
            <div className="space-y-4">
              {solicitacoes.length > 0 ? (
                solicitacoes.map((sol) => (
                  <Card key={sol.id} className={sol.status === 'buscando_prestador' ? 'border-accent/30 bg-accent/5' : ''}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                              <Briefcase size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary">{sol.servico}</h4>
                              <p className="text-xs text-gray-500">{sol.categoria}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                              <span>
                                {sol.endereco.bairro}
                                {sol.endereco.quarteirao ? `, Q. ${sol.endereco.quarteirao}` : ''}
                                {sol.endereco.casa ? `, Casa ${sol.endereco.casa}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} className="text-gray-400 shrink-0" />
                              <span>{formatDate(sol.dataAgendada)}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</p>
                            <p className="text-sm font-bold text-primary">{sol.clienteNome}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end gap-4">
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase">Seu Ganho (80%)</p>
                            <p className="text-2xl font-black text-primary">{formatCurrency(sol.valor80)}</p>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              sol.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              sol.status === 'buscando_prestador' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {translateStatus(sol.status)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {sol.status === 'buscando_prestador' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(sol.id, 'cancelado')}>
                                  Rejeitar
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(sol.id, 'prestador_atribuido')}>
                                  Aceitar
                                </Button>
                              </>
                            )}
                            {sol.status === 'prestador_atribuido' && (
                              <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(sol.id, 'em_andamento')}>
                                Iniciar Serviço
                              </Button>
                            )}
                            {sol.status === 'em_andamento' && (
                              <Button variant="success" size="sm" onClick={() => handleStatusUpdate(sol.id, 'concluido')}>
                                Concluir Serviço
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-2 bg-transparent">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="font-bold text-gray-700">Nenhuma solicitação no momento</h3>
                    <p className="text-sm text-gray-500">Fique atento às notificações para novos serviços.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Stats & Support */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary">Meus Ganhos</h2>
            <Card className="bg-primary text-white border-none">
              <CardContent className="p-6">
                <p className="text-xs font-bold opacity-60 uppercase tracking-wider mb-1">Saldo a Receber</p>
                <h3 className="text-3xl font-black mb-6">MT 0,00</h3>
                <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Solicitar Saque
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold text-primary">Suporte ao Prestador</h3>
              <a href="tel:+258840000000" className="block">
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Ligar para Central</p>
                      <p className="text-xs text-gray-500">Atendimento 24/7</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
              <a href="https://wa.me/258840000000" target="_blank" rel="noreferrer" className="block">
                <Card className="hover:border-green-500/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">WhatsApp Suporte</p>
                      <p className="text-xs text-gray-500">Resposta rápida</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
