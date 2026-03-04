import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { translateStatus, formatCurrency, formatDate } from '../../utils/utils';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Star
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/ui/Modal';

export default function AcompanhamentoPage() {
  const { id } = useParams<{ id: string }>();
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'solicitacoes', id), (doc) => {
      if (doc.exists()) {
        setSolicitacao({ id: doc.id, ...doc.data() } as Solicitacao);
      } else {
        showToast('Solicitação não encontrada', 'error');
        navigate('/cliente/dashboard');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleFinalPayment = async () => {
    if (!solicitacao) return;
    try {
      await updateDoc(doc(db, 'solicitacoes', solicitacao.id), {
        status: 'concluido'
      });
      showToast('Pagamento final realizado com sucesso!', 'success');
      setIsRatingModalOpen(true);
    } catch (error) {
      showToast('Erro ao processar pagamento', 'error');
    }
  };

  const handleRate = async () => {
    if (!solicitacao) return;
    try {
      // Logic to save rating could go here (e.g., to a 'reviews' collection or updating prestador stats)
      showToast('Obrigado pela sua avaliação!', 'success');
      setIsRatingModalOpen(false);
    } catch (error) {
      showToast('Erro ao enviar avaliação', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!solicitacao) return null;

  const statusColors: any = {
    buscando_prestador: 'bg-yellow-100 text-yellow-700',
    prestador_atribuido: 'bg-blue-100 text-blue-700',
    em_andamento: 'bg-indigo-100 text-indigo-700',
    concluido: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-primary">Acompanhamento</h1>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${statusColors[solicitacao.status]}`}>
                  {translateStatus(solicitacao.status)}
                </span>
              </div>
              <p className="text-gray-500">ID da Solicitação: #{solicitacao.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" leftIcon={<MessageSquare size={18} />}>Chat</Button>
              {solicitacao.status === 'em_andamento' && (
                <Button onClick={handleFinalPayment} leftIcon={<CreditCard size={18} />}>Pagar Restante (20%)</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-primary">Status do Serviço</h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {[
                      { status: 'buscando_prestador', label: 'Solicitação Enviada', desc: 'Aguardando aceite do prestador.' },
                      { status: 'prestador_atribuido', label: 'Serviço Aceite', desc: 'O prestador confirmou o agendamento.' },
                      { status: 'em_andamento', label: 'Em Execução', desc: 'O serviço está sendo realizado.' },
                      { status: 'concluido', label: 'Concluído', desc: 'Serviço finalizado e pago.' },
                    ].map((step, idx) => {
                      const isCompleted = ['concluido', 'cancelado'].includes(solicitacao.status) || 
                                        (solicitacao.status === 'em_andamento' && idx <= 2) ||
                                        (solicitacao.status === 'prestador_atribuido' && idx <= 1) ||
                                        (solicitacao.status === 'buscando_prestador' && idx === 0);
                      
                      return (
                        <div key={step.status} className="flex gap-6 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                          </div>
                          <div>
                            <p className={`font-bold ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{step.label}</p>
                            <p className="text-xs text-gray-500">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-primary">Detalhes do Agendamento</h3>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Data</p>
                        <p className="font-bold text-primary">{formatDate(solicitacao.dataAgendada)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Hora</p>
                        <p className="font-bold text-primary">
                          {solicitacao.dataAgendada 
                            ? (solicitacao.dataAgendada instanceof Date 
                                ? solicitacao.dataAgendada.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(solicitacao.dataAgendada.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Local</p>
                        <p className="font-bold text-primary">
                          {solicitacao.endereco.bairro}
                          {solicitacao.endereco.quarteirao ? `, Q. ${solicitacao.endereco.quarteirao}` : ''}
                          {solicitacao.endereco.casa ? `, Casa ${solicitacao.endereco.casa}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Serviço</p>
                        <p className="font-bold text-primary">{solicitacao.servico}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Prestador Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-primary">Prestador</h3>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 overflow-hidden">
                    <UserIcon size={40} className="w-full h-full p-4 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-primary text-lg">{solicitacao.prestadorNome}</h4>
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-4">
                    <Star size={16} fill="currentColor" />
                    <span className="font-bold text-sm">4.9</span>
                  </div>
                  <Button variant="outline" className="w-full">Ver Perfil</Button>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card className="bg-primary text-white">
                <CardHeader>
                  <h3 className="font-bold">Resumo Financeiro</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Valor Total</span>
                    <span className="font-bold">{formatCurrency(solicitacao.valorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Pago (80%)</span>
                    <span className="font-bold text-green-400">{formatCurrency(solicitacao.valor80)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Pendente (20%)</span>
                    <span className="font-bold text-accent">{formatCurrency(solicitacao.valor20)}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Pago</span>
                    <span className="text-xl font-black">
                      {solicitacao.status === 'concluido' 
                        ? formatCurrency(solicitacao.valorTotal) 
                        : formatCurrency(solicitacao.valor80)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} title="Avalie o Serviço">
        <div className="text-center space-y-6">
          <p className="text-gray-500">Como foi sua experiência com {solicitacao.prestadorNome}?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className={`transition-all ${rating >= star ? 'text-yellow-500 scale-110' : 'text-gray-200'}`}
              >
                <Star size={40} fill={rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            placeholder="Deixe um comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button className="w-full" onClick={handleRate}>Enviar Avaliação</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
