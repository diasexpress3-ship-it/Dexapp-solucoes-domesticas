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
  Share2
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
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
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

    // Simular mensagens de exemplo
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
  const handleFinalPayment = async () => {
    if (!solicitacao) return;
    try {
      await updateDoc(doc(db, 'solicitacoes', solicitacao.id), {
        status: 'concluido',
        dataConclusao: new Date()
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
      // Salvar avaliação
      await addDoc(collection(db, 'avaliacoes'), {
        solicitacaoId: solicitacao.id,
        prestadorId: solicitacao.prestadorId,
        clienteId: solicitacao.clienteId,
        nota: rating,
        comentario: comment,
        data: new Date()
      });

      // Atualizar média do prestador (simplificado)
      showToast('Obrigado pela sua avaliação!', 'success');
      setIsRatingModalOpen(false);
    } catch (error) {
      showToast('Erro ao enviar avaliação', 'error');
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
    if (!solicitacao?.prestadorTelefone) {
      showToast('Telefone do prestador não disponível', 'error');
      return;
    }

    if (tipo === 'whatsapp') {
      window.open(`https://wa.me/${solicitacao.prestadorTelefone.replace(/\D/g, '')}`, '_blank');
    } else {
      window.open(`tel:${solicitacao.prestadorTelefone}`);
    }
  };

  // ============================================
  // UTILS
  // ============================================
  const statusColors: any = {
    buscando_prestador: 'bg-yellow-100 text-yellow-700',
    prestador_atribuido: 'bg-blue-100 text-blue-700',
    em_andamento: 'bg-indigo-100 text-indigo-700',
    concluido: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  const getProgressPercentage = () => {
    if (!solicitacao) return 0;
    switch (solicitacao.status) {
      case 'buscando_prestador': return 25;
      case 'prestador_atribuido': return 50;
      case 'em_andamento': return 75;
      case 'concluido': return 100;
      default: return 0;
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!solicitacao) return null;

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
              {solicitacao.status === 'em_andamento' && (
                <Button 
                  onClick={handleFinalPayment} 
                  leftIcon={<CreditCard size={18} />}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  Pagar Restante (20%)
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
          <Card className="mb-6
