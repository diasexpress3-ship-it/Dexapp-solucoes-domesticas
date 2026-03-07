import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
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
  Star,
  Phone,
  Mail,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  Send,
  Percent,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Mensagem {
  id: string;
  remetente: 'cliente' | 'prestador' | 'central';
  texto: string;
  data: Date;
  lida: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AcompanhamentoPage() {
  const { id } = useParams<{ id: string }>();
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ============================================
  // BUSCAR SOLICITAÇÃO
  // ============================================
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

  // ============================================
  // BUSCAR MENSAGENS DO CHAT
  // ============================================
  useEffect(() => {
    if (!id) return;

    setMensagens([
      {
        id: '1',
        remetente: 'prestador',
        texto: 'Olá! Chegarei em 30 minutos.',
        data: new Date(Date.now() - 3600000),
        lida: true
      },
      {
        id: '2',
        remetente: 'cliente',
        texto: 'Ok, estou aguardando.',
        data: new Date(Date.now() - 1800000),
        lida: true
      },
      {
        id: '3',
        remetente: 'prestador',
        texto: 'Já estou a caminho!',
        data: new Date(Date.now() - 900000),
        lida: false
      }
    ]);
  }, [id]);

  // ============================================
  // HANDLERS
  // ============================================

  // Pagamento dos 30% finais
  const handleFinalPayment = async () => {
    if (!solicitacao) return;
    
    setProcessing(true);
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateDoc(doc(db, 'solicitacoes', solicitacao.id), {
        status: 'concluido',
        dataConclusao: new Date(),
        valorPagoTotal: solicitacao.valorTotal,
        pagamentoFinalConfirmado: true,
        dataPagamentoFinal: new Date()
      });
      
      showToast('✅ Pagamento final de 30% realizado com sucesso!', 'success');
      setIsPaymentModalOpen(false);
      
      // Abrir modal de avaliação
      setTimeout(() => setIsRatingModalOpen(true), 500);
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      showToast('Erro ao processar pagamento', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Avaliação do serviço (1 a 10 estrelas)
  const handleRate = async () => {
    if (!solicitacao) return;

    setProcessing(true);

    try {
      // Salvar avaliação
      await addDoc(collection(db, 'avaliacoes'), {
        solicitacaoId: solicitacao.id,
        prestadorId: solicitacao.prestadorId,
        clienteId: solicitacao.clienteId,
        nota: rating, // 1 a 10
        comentario: comment,
        data: new Date()
      });

      // Atualizar média do prestador (simplificado)
      showToast(`Obrigado pela sua avaliação! Nota: ${rating}/10`, 'success');
      setIsRatingModalOpen(false);
      
      // Redirecionar para dashboard após avaliação
      setTimeout(() => navigate('/cliente/dashboard'), 2000);
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      showToast('Erro ao enviar avaliação', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = () => {
    if (!novaMensagem.trim()) return;

    const novaMsg: Mensagem = {
      id: Date.now().toString(),
      remetente: 'cliente',
      texto: novaMensagem,
      data: new Date(),
      lida: false
    };

    setMensagens([...mensagens, novaMsg]);
    setNovaMensagem('');
    showToast('Mensagem enviada!', 'success');
  };

  const handleCancelService = async () => {
    if (!solicitacao) return;
    
    if (!window.confirm('Tem certeza que deseja cancelar este serviço?')) return;

    try {
      await updateDoc(doc(db, 'solicitacoes', solicitacao.id), {
        status: 'cancelado',
        motivoCancelamento: 'Cancelado pelo cliente',
        dataCancelamento: new Date()
      });
      showToast('Serviço cancelado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao cancelar serviço', 'error');
    }
  };

  const handleContactPrestador = (tipo: 'whatsapp' | 'ligacao') => {
    if (!solicitacao?.telefoneCliente) {
      showToast('Telefone do cliente não disponível', 'error');
      return;
    }

    if (tipo === 'whatsapp') {
      window.open(`https://wa.me/${solicitacao.telefoneCliente.replace(/\D/g, '')}`, '_blank');
    } else {
      window.open(`tel:${solicitacao.telefoneCliente}`);
    }
  };

  // ============================================
  // UTILS
  // ============================================
  const statusColors: any = {
    buscando_prestador: 'bg-yellow-100 text-yellow-700',
    prestador_atribuido: 'bg-blue-100 text-blue-700',
    em_andamento: 'bg-indigo-100 text-indigo-700',
    aguardando_pagamento_final: 'bg-purple-100 text-purple-700',
    concluido: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  const getProgressPercentage = () => {
    if (!solicitacao) return 0;
    switch (solicitacao.status) {
      case 'buscando_prestador': return 25;
      case 'prestador_atribuido': return 50;
      case 'em_andamento': return 75;
      case 'aguardando_pagamento_final': return 90;
      case 'concluido': return 100;
      default: return 0;
    }
  };

  const getPagamentoStatus = () => {
    if (!solicitacao) return { pago: 0, restante: 0, percentual: 0 };
    
    const total = solicitacao.valorTotal || 0;
    const pago = solicitacao.valorPago || solicitacao.valorInicial70 || 0;
    const restante = total - pago;
    const percentual = total > 0 ? Math.round((pago / total) * 100) : 0;
    
    return { total, pago, restante, percentual };
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!solicitacao) return null;

  const pagamento = getPagamentoStatus();
  const podePagarFinal = solicitacao.status === 'em_andamento' || solicitacao.status === 'aguardando_pagamento_final';
  const jaConcluido = solicitacao.status === 'concluido';

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ======================================== */}
          {/* HEADER */}
          {/* ======================================== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate('/cliente/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-3xl font-black text-primary">Acompanhamento</h1>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${statusColors[solicitacao.status]}`}>
                  {translateStatus(solicitacao.status)}
                </span>
              </div>
              <p className="text-gray-500 ml-12">ID: #{solicitacao.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                leftIcon={<MessageSquare size={18} />}
                onClick={() => setIsChatModalOpen(true)}
              >
                Chat
              </Button>
              {podePagarFinal && (
                <Button 
                  onClick={() => setIsPaymentModalOpen(true)} 
                  leftIcon={<CreditCard size={18} />}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  Pagar Restante (30%)
                </Button>
              )}
              {['buscando_prestador', 'prestador_atribuido'].includes(solicitacao.status) && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelService}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* ======================================== */}
          {/* BARRA DE PROGRESSO */}
          {/* ======================================== */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-600">Progresso do Serviço</span>
                <span className="text-sm font-black text-accent">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-accent"
                />
              </div>
            </CardContent>
          </Card>

          {/* ======================================== */}
          {/* STATUS DO PAGAMENTO */}
          {/* ======================================== */}
          <Card className="mb-6 border-2 border-accent/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-accent" />
                Status do Pagamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Valor Total</p>
                  <p className="text-xl font-black text-primary">{formatCurrency(pagamento.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Percent size={12} className="text-green-600" />
                    Pago (70%)
                  </p>
                  <p className="text-xl font-black text-green-600">{formatCurrency(pagamento.pago)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Percent size={12} className="text-orange-500" />
                    Restante (30%)
                  </p>
                  <p className="text-xl font-black text-orange-500">{formatCurrency(pagamento.restante)}</p>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pagamento.percentual}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 text-right">{pagamento.percentual}% pago</p>

              {jaConcluido && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <p className="text-sm text-green-700">Pagamento total concluído! Obrigado pela preferência.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* ======================================== */}
              {/* TIMELINE */}
              {/* ======================================== */}
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
                      { status: 'aguardando_pagamento_final', label: 'Aguardando Pagamento Final', desc: 'Serviço concluído, aguardando pagamento dos 30% restantes.' },
                      { status: 'concluido', label: 'Concluído', desc: 'Serviço finalizado e totalmente pago.' },
                    ].map((step, idx) => {
                      const isCompleted = 
                        (solicitacao.status === 'concluido' && idx <= 4) ||
                        (solicitacao.status === 'aguardando_pagamento_final' && idx <= 3) ||
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

              {/* ======================================== */}
              {/* DETALHES DO AGENDAMENTO */}
              {/* ======================================== */}
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

              {/* ======================================== */}
              {/* GALERIA DE IMAGENS */}
              {/* ======================================== */}
              {solicitacao.imagens && solicitacao.imagens.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-primary">Imagens do Serviço</h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {solicitacao.imagens.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setImagemSelecionada(img);
                            setIsGalleryModalOpen(true);
                          }}
                          className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img src={img} alt={`Serviço ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ======================================== */}
            {/* SIDEBAR - INFORMAÇÕES DO PRESTADOR */}
            {/* ======================================== */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-primary">Prestador</h3>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-900 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black">
                    {solicitacao.prestadorNome?.charAt(0) || 'P'}
                  </div>
                  <h4 className="font-bold text-primary text-lg">{solicitacao.prestadorNome}</h4>
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= 9 ? 'text-yellow-500 fill-current' : 'text-gray-300'} 
                      />
                    ))}
                    <span className="text-sm font-bold text-primary ml-1">9.0/10</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      leftIcon={<Phone size={16} />}
                      onClick={() => handleContactPrestador('ligacao')}
                    >
                      Ligar para Prestador
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                      leftIcon={<MessageSquare size={16} />}
                      onClick={() => handleContactPrestador('whatsapp')}
                    >
                      WhatsApp
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full">
                    Ver Perfil Completo
                  </Button>
                </CardContent>
              </Card>

              {/* ======================================== */}
              {/* RESUMO FINANCEIRO */}
              {/* ======================================== */}
              <Card className="bg-gradient-to-br from-primary to-blue-900 text-white">
                <CardHeader>
                  <h3 className="font-bold text-white">Resumo Financeiro</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Valor Total</span>
                    <span className="font-bold">{formatCurrency(solicitacao.valorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Pago (70%)</span>
                    <span className="font-bold text-green-400">{formatCurrency(pagamento.pago)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Pendente (30%)</span>
                    <span className="font-bold text-accent">{formatCurrency(pagamento.restante)}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Pago</span>
                    <span className="text-xl font-black">
                      {solicitacao.status === 'concluido' 
                        ? formatCurrency(solicitacao.valorTotal) 
                        : formatCurrency(pagamento.pago)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE PAGAMENTO FINAL (30%) */}
      {/* ======================================== */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Pagamento Final (30%)">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Valor Restante:</span>
              <span className="text-2xl font-black text-accent">{formatCurrency(pagamento.restante)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Percentual:</span>
              <span className="text-lg font-bold text-primary">30% do total</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-700 flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                Após confirmar o pagamento, você poderá avaliar o serviço de 1 a 10 estrelas.
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleFinalPayment}
              disabled={processing}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Processando...
                </>
              ) : (
                `Pagar ${formatCurrency(pagamento.restante)}`
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE AVALIAÇÃO (1-10 ESTRELAS) */}
      {/* ======================================== */}
      <Modal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} title="Avalie o Serviço">
        <div className="text-center space-y-6">
          <p className="text-gray-500">Como foi sua experiência com {solicitacao.prestadorNome}?</p>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">Avaliação (1 a 10)</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`transition-all ${rating >= star ? 'text-yellow-500 scale-110' : 'text-gray-200'}`}
                >
                  <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-accent">{rating}/10</p>
          </div>

          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            placeholder="Deixe um comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsRatingModalOpen(false)} className="flex-1">
              Depois
            </Button>
            <Button 
              onClick={handleRate} 
              disabled={processing}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {processing ? 'Enviando...' : `Enviar Avaliação ${rating}/10`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE CHAT */}
      {/* ======================================== */}
      <Modal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} title="Chat com Prestador" size="lg">
        <div className="h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.remetente === 'cliente' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.remetente === 'cliente'
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.texto}</p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {msg.data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!novaMensagem.trim()}
              className="bg-accent hover:bg-accent/90 text-white"
              leftIcon={<Send size={18} />}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DA GALERIA */}
      {/* ======================================== */}
      <Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)} title="Visualizar Imagem" size="full">
        {imagemSelecionada && (
          <div className="flex items-center justify-center">
            <img src={imagemSelecionada} alt="Imagem do serviço" className="max-w-full max-h-[80vh] rounded-lg" />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
