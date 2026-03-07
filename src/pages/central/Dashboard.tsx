import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  Headphones, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  User as UserIcon,
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Wrench,
  Shield,
  UserCheck,
  UserX,
  Home,
  LogOut,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  IdCard,
  Upload,
  Download as DownloadIcon,
  Wallet,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Loader2,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  Percent,
  Calendar as CalendarIcon,
  Building,
  Award,
  Target,
  Activity,
  PieChart,
  BarChart3,
  LineChart,
  Users2,
  UserCog,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Ban,
  Flag,
  Tag,
  Hash,
  Link,
  Globe,
  Map,
  Navigation,
  Camera,
  Image,
  Paperclip,
  Archive,
  Bookmark,
  BookOpen,
  Calculator,
  Scale,
  Weight,
  Ruler,
  Package,
  Box,
  Layers,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Printer as PrinterIcon,
  Scanner,
  Watch,
  Clock as ClockIcon,
  Hourglass,
  Timer,
  Stopwatch,
  AlarmCheck,
  AlarmClock,
  AlarmClockOff,
  BellRing,
  BellOff,
  BellPlus,
  BellMinus,
  BellElectric,
  BellDot
} from 'lucide-react';
import { formatCurrency, formatDate, translateStatus, exportToCSV } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface CentralStats {
  // Solicitações
  totalSolicitacoes: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  aguardandoOrcamento: number;
  aguardandoPagamento: number;
  
  // Usuários
  totalUsuarios: number;
  totalClientes: number;
  totalPrestadores: number;
  prestadoresPendentes: number;
  prestadoresPendentesDocumentos: number;
  prestadoresAtivos: number;
  totalCentral: number;
  totalAdmin: number;
  
  // Financeiro
  valorTotalMovimentado: number;
  valorPlataforma: number;
  valorPrestadores: number;
  totalSaquesPendentes: number;
  totalSaquesAprovados: number;
  valorSaquesPendentes: number;
  
  // Avaliações
  mediaAvaliacoes: number;
  totalAvaliacoes: number;
}

interface PrestadorPendente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  dataCadastro: Date;
  status: string;
  documentosAlert?: boolean;
  documentos: {
    bi?: { nome: string; tipo: string; dataUpload: Date; url?: string };
    declaracaoBairro?: { nome: string; tipo: string; dataUpload: Date; url?: string };
  };
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
}

interface SaqueRequest {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado';
  dataSolicitacao: Date;
  dataProcessamento?: Date;
  processadoPor?: string;
  observacao?: string;
  metodoPagamento: string;
  dadosBancarios: {
    banco: string;
    conta: string;
    titular?: string;
    nib?: string;
  };
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  lida: boolean;
  data: Date;
  destinatarioId: string;
  destinatarioTipo: 'prestador' | 'cliente' | 'central';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CentralDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [prestadoresPendentes, setPrestadoresPendentes] = useState<PrestadorPendente[]>([]);
  const [prestadoresPendentesDocumentos, setPrestadoresPendentesDocumentos] = useState<PrestadorPendente[]>([]);
  const [saquesPendentes, setSaquesPendentes] = useState<SaqueRequest[]>([]);
  const [saquesProcessados, setSaquesProcessados] = useState<SaqueRequest[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const [selectedPrestador, setSelectedPrestador] = useState<PrestadorPendente | null>(null);
  const [selectedSaque, setSelectedSaque] = useState<SaqueRequest | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSaqueModal, setShowSaqueModal] = useState(false);
  const [showNotificacoesModal, setShowNotificacoesModal] = useState(false);
  const [showDetalhesSolicitacaoModal, setShowDetalhesSolicitacaoModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<CentralStats>({
    totalSolicitacoes: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    canceladas: 0,
    aguardandoOrcamento: 0,
    aguardandoPagamento: 0,
    totalUsuarios: 0,
    totalClientes: 0,
    totalPrestadores: 0,
    prestadoresPendentes: 0,
    prestadoresPendentesDocumentos: 0,
    prestadoresAtivos: 0,
    totalCentral: 0,
    totalAdmin: 0,
    valorTotalMovimentado: 0,
    valorPlataforma: 0,
    valorPrestadores: 0,
    totalSaquesPendentes: 0,
    totalSaquesAprovados: 0,
    valorSaquesPendentes: 0,
    mediaAvaliacoes: 0,
    totalAvaliacoes: 0
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
    // Buscar solicitações
    const q = query(collection(db, 'solicitacoes'), orderBy('dataSolicitacao', 'desc'));
    const unsubscribeSolicitacoes = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setSolicitacoes(docs);
      
      // Calcular estatísticas de solicitações
      const pendentes = docs.filter(s => s.status === 'buscando_prestador').length;
      const emAndamento = docs.filter(s => ['prestador_atribuido', 'em_andamento'].includes(s.status)).length;
      const concluidas = docs.filter(s => s.status === 'concluido').length;
      const canceladas = docs.filter(s => s.status === 'cancelado').length;
      const aguardandoOrcamento = docs.filter(s => s.tamanho === 'grande' && s.status === 'aguardando_orcamento').length;
      const aguardandoPagamento = docs.filter(s => s.status === 'aguardando_pagamento_final').length;
      
      const valorTotal = docs.filter(s => s.status === 'concluido').reduce((acc, curr) => acc + curr.valorTotal, 0);
      const valorPlataforma = valorTotal * 0.4;
      const valorPrestadores = valorTotal * 0.6;

      setStats(prev => ({
        ...prev,
        totalSolicitacoes: docs.length,
        pendentes,
        emAndamento,
        concluidas,
        canceladas,
        aguardandoOrcamento,
        aguardandoPagamento,
        valorTotalMovimentado: valorTotal,
        valorPlataforma,
        valorPrestadores
      }));

      filterSolicitacoes(filterStatus, docs);
      setIsLoading(false);
    });

    // Buscar usuários
    const usuariosQuery = query(collection(db, 'users'), orderBy('dataCadastro', 'desc'));
    const unsubscribeUsuarios = onSnapshot(usuariosQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalUsuarios = docs.length;
      const totalClientes = docs.filter(u => u.profile === 'cliente').length;
      const totalPrestadores = docs.filter(u => u.profile === 'prestador').length;
      const prestadoresPendentes = docs.filter(u => u.profile === 'prestador' && u.status === 'pendente').length;
      const prestadoresPendentesDocumentos = docs.filter(u => u.profile === 'prestador' && u.status === 'pendente_documentos').length;
      const prestadoresAtivos = docs.filter(u => u.profile === 'prestador' && u.status === 'activo').length;
      const totalCentral = docs.filter(u => u.profile === 'central').length;
      const totalAdmin = docs.filter(u => u.profile === 'admin').length;

      setStats(prev => ({
        ...prev,
        totalUsuarios,
        totalClientes,
        totalPrestadores,
        prestadoresPendentes,
        prestadoresPendentesDocumentos,
        prestadoresAtivos,
        totalCentral,
        totalAdmin
      }));
    });

    // Buscar prestadores pendentes (status = 'pendente')
    const prestadoresPendentesQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      where('status', '==', 'pendente')
    );
    const unsubscribePrestadoresPendentes = onSnapshot(prestadoresPendentesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate?.() || new Date(doc.data().dataCadastro),
        documentos: {
          bi: doc.data().documentos?.bi ? {
            ...doc.data().documentos.bi,
            dataUpload: doc.data().documentos.bi.dataUpload?.toDate?.() || new Date(doc.data().documentos.bi.dataUpload)
          } : null,
          declaracaoBairro: doc.data().documentos?.declaracaoBairro ? {
            ...doc.data().documentos.declaracaoBairro,
            dataUpload: doc.data().documentos.declaracaoBairro.dataUpload?.toDate?.() || new Date(doc.data().documentos.declaracaoBairro.dataUpload)
          } : null
        }
      } as PrestadorPendente));
      setPrestadoresPendentes(docs);
    });

    // Buscar prestadores com documentos pendentes (status = 'pendente_documentos')
    const prestadoresDocumentosQuery = query(
      collection(db, 'users'),
      where('profile', '==', 'prestador'),
      where('status', '==', 'pendente_documentos')
    );
    const unsubscribePrestadoresDocumentos = onSnapshot(prestadoresDocumentosQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate?.() || new Date(doc.data().dataCadastro),
        documentos: {
          bi: doc.data().documentos?.bi ? {
            ...doc.data().documentos.bi,
            dataUpload: doc.data().documentos.bi.dataUpload?.toDate?.() || new Date(doc.data().documentos.bi.dataUpload)
          } : null,
          declaracaoBairro: doc.data().documentos?.declaracaoBairro ? {
            ...doc.data().documentos.declaracaoBairro,
            dataUpload: doc.data().documentos.declaracaoBairro.dataUpload?.toDate?.() || new Date(doc.data().documentos.declaracaoBairro.dataUpload)
          } : null
        }
      } as PrestadorPendente));
      setPrestadoresPendentesDocumentos(docs);
    });

    // Buscar saques pendentes
    const saquesPendentesQuery = query(
      collection(db, 'saques'),
      where('status', '==', 'pendente'),
      orderBy('dataSolicitacao', 'desc')
    );
    const unsubscribeSaquesPendentes = onSnapshot(saquesPendentesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataSolicitacao: doc.data().dataSolicitacao?.toDate?.() || new Date(doc.data().dataSolicitacao),
        dataProcessamento: doc.data().dataProcessamento?.toDate?.() || null
      } as SaqueRequest));
      setSaquesPendentes(docs);
      
      const totalValor = docs.reduce((acc, curr) => acc + curr.valor, 0);
      setStats(prev => ({
        ...prev,
        totalSaquesPendentes: docs.length,
        valorSaquesPendentes: totalValor
      }));
    });

    // Buscar saques processados
    const saquesProcessadosQuery = query(
      collection(db, 'saques'),
      where('status', 'in', ['aprovado', 'rejeitado', 'processado']),
      orderBy('dataProcessamento', 'desc'),
      orderBy('dataSolicitacao', 'desc')
    );
    const unsubscribeSaquesProcessados = onSnapshot(saquesProcessadosQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataSolicitacao: doc.data().dataSolicitacao?.toDate?.() || new Date(doc.data().dataSolicitacao),
        dataProcessamento: doc.data().dataProcessamento?.toDate?.() || null
      } as SaqueRequest));
      setSaquesProcessados(docs);
      
      const aprovados = docs.filter(d => d.status === 'aprovado' || d.status === 'processado').length;
      setStats(prev => ({
        ...prev,
        totalSaquesAprovados: aprovados
      }));
    });

    // Buscar avaliações
    const avaliacoesQuery = query(collection(db, 'avaliacoes'));
    const unsubscribeAvaliacoes = onSnapshot(avaliacoesQuery, (snapshot) => {
      const docs = snapshot.docs;
      const totalAvaliacoes = docs.length;
      const somaNotas = docs.reduce((acc, doc) => acc + (doc.data().nota || 0), 0);
      const mediaAvaliacoes = totalAvaliacoes > 0 ? somaNotas / totalAvaliacoes : 0;

      setStats(prev => ({
        ...prev,
        totalAvaliacoes,
        mediaAvaliacoes
      }));
    });

    // Buscar notificações
    const notificacoesQuery = query(
      collection(db, 'notificacoes'),
      where('destinatarioId', '==', user?.id),
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
      unsubscribeSolicitacoes();
      unsubscribeUsuarios();
      unsubscribePrestadoresPendentes();
      unsubscribePrestadoresDocumentos();
      unsubscribeSaquesPendentes();
      unsubscribeSaquesProcessados();
      unsubscribeAvaliacoes();
      unsubscribeNotificacoes();
    };
  }, [user?.id]);

  // ============================================
  // FILTRAR SOLICITAÇÕES
  // ============================================
  useEffect(() => {
    filterSolicitacoes(filterStatus, solicitacoes);
  }, [searchTerm, solicitacoes, filterStatus]);

  const filterSolicitacoes = (status: string, docs = solicitacoes) => {
    let filtered = docs;

    // Filtro por status
    if (status !== 'todas') {
      filtered = filtered.filter(s => s.status === status);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prestadorNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSolicitacoes(filtered);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterSolicitacoes(status);
  };

  // ============================================
  // FUNÇÕES CRUD - SOLICITAÇÕES
  // ============================================
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: newStatus,
        [`data${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`]: new Date()
      });
      showToast(`Status atualizado para ${translateStatus(newStatus)}`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSolicitacao = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente esta solicitação?')) return;
    
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

  const handleAssignPrestador = async (id: string) => {
    setSelectedSolicitacao(solicitacoes.find(s => s.id === id) || null);
    showToast('Funcionalidade de atribuição em desenvolvimento', 'info');
  };

  const handleGerarOrcamento = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'solicitacoes', id), {
        status: 'aguardando_aprovacao_cliente',
        dataOrcamento: new Date()
      });
      showToast('Orçamento enviado para o cliente!', 'success');
    } catch (error) {
      console.error('Erro ao gerar orçamento:', error);
      showToast('Erro ao gerar orçamento', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewSolicitacao = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setShowDetalhesSolicitacaoModal(true);
  };

  // ============================================
  // FUNÇÕES CRUD - PRESTADORES
  // ============================================
  const handleViewDocuments = (prestador: PrestadorPendente) => {
    setSelectedPrestador(prestador);
    setShowDocumentModal(true);
  };

  const handleApprovePrestador = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'activo',
        dataAprovacao: new Date(),
        aprovadoPor: user?.id
      });
      showToast('Prestador aprovado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao aprovar prestador:', error);
      showToast('Erro ao aprovar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestDocuments = async (id: string) => {
    setActionLoading(id);
    try {
      await addDoc(collection(db, 'notificacoes'), {
        prestadorId: id,
        titulo: 'Documentos Pendentes',
        mensagem: 'Por favor, envie os documentos necessários para completar seu cadastro.',
        tipo: 'aviso',
        lida: false,
        data: new Date()
      });
      showToast('Notificação enviada ao prestador', 'success');
    } catch (error) {
      console.error('Erro ao notificar prestador:', error);
      showToast('Erro ao notificar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPrestador = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este prestador?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'rejeitado',
        dataRejeicao: new Date(),
        rejeitadoPor: user?.id
      });
      showToast('Prestador rejeitado', 'info');
    } catch (error) {
      console.error('Erro ao rejeitar prestador:', error);
      showToast('Erro ao rejeitar prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePrestador = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este prestador?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      showToast('Prestador excluído', 'success');
    } catch (error) {
      console.error('Erro ao excluir prestador:', error);
      showToast('Erro ao excluir prestador', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // FUNÇÕES CRUD - SAQUES
  // ============================================
  const handleViewSaque = (saque: SaqueRequest) => {
    setSelectedSaque(saque);
    setShowSaqueModal(true);
  };

  const handleApproveSaque = async (id: string) => {
    if (!window.confirm(`Confirmar aprovação do saque de ${formatCurrency(selectedSaque?.valor || 0)}?`)) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'saques', id), {
        status: 'aprovado',
        dataProcessamento: new Date(),
        processadoPor: user?.id
      });
      showToast('Saque aprovado com sucesso!', 'success');
      setShowSaqueModal(false);
    } catch (error) {
      console.error('Erro ao aprovar saque:', error);
      showToast('Erro ao aprovar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessSaque = async (id: string) => {
    if (!window.confirm('Confirmar que o pagamento foi processado?')) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'saques', id), {
        status: 'processado',
        dataProcessamento: new Date(),
        processadoPor: user?.id
      });
      showToast('Saque marcado como processado!', 'success');
      setShowSaqueModal(false);
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      showToast('Erro ao processar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSaque = async (id: string) => {
    const motivo = window.prompt('Motivo da rejeição (opcional):');
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'saques', id), {
        status: 'rejeitado',
        dataProcessamento: new Date(),
        processadoPor: user?.id,
        observacao: motivo || 'Rejeitado pela central'
      });
      showToast('Saque rejeitado', 'info');
      setShowSaqueModal(false);
    } catch (error) {
      console.error('Erro ao rejeitar saque:', error);
      showToast('Erro ao rejeitar saque', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // FUNÇÕES DE NOTIFICAÇÃO
  // ============================================
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
  // FUNÇÕES DE EXPORTAÇÃO
  // ============================================
  const handleExportCSV = () => {
    const data = filteredSolicitacoes.map(s => ({
      ID: s.id,
      Serviço: s.servico,
      Cliente: s.clienteNome,
      Prestador: s.prestadorNome || 'N/A',
      Status: translateStatus(s.status),
      Data: formatDate(s.dataSolicitacao),
      Valor: formatCurrency(s.valorTotal),
      Tamanho: s.tamanho || 'N/A'
    }));
    exportToCSV(data, `solicitacoes_${new Date().toISOString().split('T')[0]}`);
    showToast('Relatório exportado com sucesso!', 'success');
  };

  const handleExportSaques = () => {
    const data = saquesPendentes.map(s => ({
      ID: s.id,
      Prestador: s.prestadorNome,
      Valor: formatCurrency(s.valor),
      Data: formatDate(s.dataSolicitacao),
      Banco: s.dadosBancarios?.banco || 'N/A',
      Conta: s.dadosBancarios?.conta || 'N/A'
    }));
    exportToCSV(data, `saques_pendentes_${new Date().toISOString().split('T')[0]}`);
    showToast('Lista de saques exportada!', 'success');
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'buscando_prestador': return 'bg-yellow-100 text-yellow-700';
      case 'aguardando_orcamento': return 'bg-blue-100 text-blue-700';
      case 'prestador_atribuido': return 'bg-indigo-100 text-indigo-700';
      case 'em_andamento': return 'bg-purple-100 text-purple-700';
      case 'aguardando_pagamento_final': return 'bg-orange-100 text-orange-700';
      case 'concluido': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'buscando_prestador': return <Clock size={14} className="mr-1" />;
      case 'aguardando_orcamento': return <DollarSign size={14} className="mr-1" />;
      case 'prestador_atribuido': return <UserCheck size={14} className="mr-1" />;
      case 'em_andamento': return <Wrench size={14} className="mr-1" />;
      case 'aguardando_pagamento_final': return <Clock size={14} className="mr-1" />;
      case 'concluido': return <CheckCircle2 size={14} className="mr-1" />;
      case 'cancelado': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'buscando_prestador': return 'Aguardando Prestador';
      case 'aguardando_orcamento': return 'Orçamento Pendente';
      case 'prestador_atribuido': return 'Prestador Atribuído';
      case 'em_andamento': return 'Em Andamento';
      case 'aguardando_pagamento_final': return 'Aguardando Pagamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
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
                Central de Atendimento
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <span>Olá, {user?.nome?.split(' ')[0] || 'Administrador'}!</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-accent font-bold">• Nível 3</span>
              </p>
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
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download size={16} />}
            >
              Exportar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Atualizar"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* STATS CARDS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Total Solicitações</p>
              <h3 className="text-2xl font-black">{stats.totalSolicitacoes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendentes</p>
              <h3 className="text-2xl font-black text-primary">{stats.pendentes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orçamentos</p>
              <h3 className="text-2xl font-black text-primary">{stats.aguardandoOrcamento}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Movimentado</p>
              <h3 className="text-2xl font-black text-primary">{formatCurrency(stats.valorTotalMovimentado)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* SAQUES PENDENTES */}
        {/* ======================================== */}
        {saquesPendentes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-primary flex items-center gap-2">
                <Wallet size={20} className="text-accent" />
                Saques Pendentes ({stats.totalSaquesPendentes})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSaques}
                leftIcon={<Download size={14} />}
              >
                Exportar Lista
              </Button>
            </div>
            
            <Card className="bg-yellow-50 border-yellow-200 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-yellow-700">Valor total pendente:</span>
                  <span className="text-xl font-black text-yellow-700">{formatCurrency(stats.valorSaquesPendentes)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {saquesPendentes.map((saque) => (
                <motion.div
                  key={saque.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-yellow-400 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleViewSaque(saque)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <Send size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{saque.prestadorNome}</h4>
                            <p className="text-xs text-gray-500">{formatDate(saque.dataSolicitacao)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Pendente
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-2xl font-black text-primary">{formatCurrency(saque.valor)}</p>
                        <p className="text-xs text-gray-500">
                          {saque.dadosBancarios?.banco} - Conta {saque.dadosBancarios?.conta}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSaque(saque);
                            setShowSaqueModal(true);
                          }}
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          leftIcon={<Eye size={14} />}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSaque(saque);
                            setShowSaqueModal(true);
                          }}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          leftIcon={<ThumbsDown size={14} />}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSaque(saque);
                            setShowSaqueModal(true);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          leftIcon={<ThumbsUp size={14} />}
                        >
                          Aprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* PRESTADORES PENDENTES (DOCUMENTOS) */}
        {/* ======================================== */}
        {prestadoresPendentesDocumentos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-primary flex items-center gap-2 mb-4">
              <FileText size={20} className="text-accent" />
              Prestadores com Documentos Pendentes ({prestadoresPendentesDocumentos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prestadoresPendentesDocumentos.map((prestador) => (
                <motion.div
                  key={prestador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-orange-400 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{prestador.nome}</h4>
                            <p className="text-xs text-gray-500">{prestador.especialidade}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          Docs Pendentes
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          <span>{prestador.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} />
                          <span>{prestador.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {prestador.documentos?.bi ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              BI
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle size={12} />
                              BI
                            </span>
                          )}
                          {prestador.documentos?.declaracaoBairro ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Declaração
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle size={12} />
                              Declaração
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocuments(prestador)}
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          leftIcon={<Eye size={14} />}
                        >
                          Ver Docs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestDocuments(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                          leftIcon={<Upload size={14} />}
                        >
                          Notificar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* PRESTADORES PENDENTES (AGUARDANDO APROVAÇÃO) */}
        {/* ======================================== */}
        {prestadoresPendentes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-primary flex items-center gap-2 mb-4">
              <UserCheck size={20} className="text-accent" />
              Prestadores Pendentes de Aprovação ({prestadoresPendentes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prestadoresPendentes.map((prestador) => (
                <motion.div
                  key={prestador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-yellow-400 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{prestador.nome}</h4>
                            <p className="text-xs text-gray-500">{prestador.especialidade}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Pendente
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          <span>{prestador.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} />
                          <span>{prestador.telefone}</span>
                        </div>
                        {prestador.documentos?.bi && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={12} />
                            <span>BI carregado</span>
                          </div>
                        )}
                        {prestador.documentos?.declaracaoBairro && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={12} />
                            <span>Declaração do Bairro carregada</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectPrestador(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <UserX size={14} className="mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprovePrestador(prestador.id)}
                          disabled={actionLoading === prestador.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck size={14} className="mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* FILTROS E BUSCA */}
        {/* ======================================== */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por cliente, prestador ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <div className="flex flex-wrap gap-2">
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
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === 'aguardando_orcamento' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('aguardando_orcamento')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Orçamento
                </Button>
                <Button
                  variant={filterStatus === 'em_andamento' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('em_andamento')}
                >
                  Em Andamento
                </Button>
                <Button
                  variant={filterStatus === 'concluido' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('concluido')}
                >
                  Concluídas
                </Button>
                <Button
                  variant={filterStatus === 'cancelado' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('cancelado')}
                >
                  Canceladas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* LISTA DE SOLICITAÇÕES */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredSolicitacoes.length > 0 ? (
            filteredSolicitacoes.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => handleViewSolicitacao(s)}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Barra de status lateral */}
                      <div className={`w-2 md:w-4 ${
                        s.status === 'buscando_prestador' ? 'bg-yellow-400' :
                        s.status === 'aguardando_orcamento' ? 'bg-blue-400' :
                        s.status === 'prestador_atribuido' ? 'bg-indigo-400' :
                        s.status === 'em_andamento' ? 'bg-purple-400' :
                        s.status === 'aguardando_pagamento_final' ? 'bg-orange-400' :
                        s.status === 'concluido' ? 'bg-green-400' :
                        s.status === 'cancelado' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} />
                      
                      <div className="flex-1 p-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          {/* Informações do serviço */}
                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Serviço</p>
                              <h4 className="font-black text-primary">{s.servico}</h4>
                              <p className="text-xs text-gray-500">{formatDate(s.dataAgendada)}</p>
                              {s.tamanho && (
                                <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  s.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                  s.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {s.tamanho === 'pequeno' ? 'Pequeno' : 
                                   s.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                </span>
                              )}
                              <span className={`inline-block mt-2 ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(s.status)}`}>
                                {getStatusIcon(s.status)}
                                {getStatusTexto(s.status)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <UserIcon size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Cliente</p>
                                <p className="text-sm font-bold text-primary">{s.clienteNome}</p>
                                {s.telefoneCliente && (
                                  <p className="text-xs text-gray-500">{s.telefoneCliente}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <Wrench size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Prestador</p>
                                <p className="text-sm font-bold text-primary">{s.prestadorNome || 'Não atribuído'}</p>
                                {s.prestadorNome && (
                                  <p className="text-xs text-gray-500">ID: {s.prestadorId?.slice(-6)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Ações CRUD */}
                          <div className="flex items-center gap-3 justify-end">
                            <div className="text-right mr-2">
                              <p className="text-xs font-bold text-primary">{formatCurrency(s.valorTotal)}</p>
                              <p className="text-[10px] text-gray-400">Total</p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSolicitacao(s);
                              }}
                              title="Visualizar"
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </Button>

                            {s.status === 'buscando_prestador' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignPrestador(s.id);
                                }}
                                title="Atribuir Prestador"
                                className="text-green-600 hover:bg-green-50"
                              >
                                <UserCheck size={18} />
                              </Button>
                            )}

                            {s.status === 'aguardando_orcamento' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGerarOrcamento(s.id);
                                }}
                                disabled={actionLoading === s.id}
                                title="Gerar Orçamento"
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <DollarSign size={18} />
                              </Button>
                            )}

                            {s.status === 'buscando_prestador' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(s.id, 'cancelado');
                                }}
                                disabled={actionLoading === s.id}
                                title="Cancelar"
                                className="text-orange-600 hover:bg-orange-50"
                              >
                                <XCircle size={18} />
                              </Button>
                            )}

                            {s.status === 'cancelado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSolicitacao(s.id);
                                }}
                                disabled={actionLoading === s.id}
                                title="Excluir permanentemente"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefresh();
                              }}
                              disabled={actionLoading === s.id}
                              title="Atualizar"
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              <RefreshCw size={18} className={actionLoading === s.id ? 'animate-spin' : ''} />
                            </Button>
                          </div>
                        </div>

                        {/* Endereço (se disponível) */}
                        {s.endereco && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={14} className="text-gray-400" />
                              <span>
                                {s.endereco.bairro}
                                {s.endereco.quarteirao && `, Q. ${s.endereco.quarteirao}`}
                                {s.endereco.casa && `, Casa ${s.endereco.casa}`}
                                {s.endereco.complemento && ` - ${s.endereco.complemento}`}
                                {s.endereco.referencia && ` (${s.endereco.referencia})`}
                              </span>
                            </div>
                          </div>
                        )}
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
                  {searchTerm 
                    ? 'Tente ajustar seus filtros ou termos de busca.'
                    : 'Aguardando novas solicitações.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
                          {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={16} /> :
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
      {/* MODAL DE DOCUMENTOS */}
      {/* ======================================== */}
      <Modal isOpen={showDocumentModal} onClose={() => setShowDocumentModal(false)} title="Documentos do Prestador" size="lg">
        {selectedPrestador && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black">
                {selectedPrestador.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-primary">{selectedPrestador.nome}</h3>
                <p className="text-sm text-gray-500">{selectedPrestador.especialidade}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* BI */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IdCard size={24} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Bilhete de Identidade</h4>
                      {selectedPrestador.documentos?.bi ? (
                        <p className="text-xs text-green-600">
                          Carregado em {formatDate(selectedPrestador.documentos.bi.dataUpload)}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.bi && (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                </div>
                {selectedPrestador.documentos?.bi && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPrestador.documentos?.bi?.url, '_blank')}
                      className="flex-1"
                      leftIcon={<Eye size={14} />}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(selectedPrestador.documentos?.bi?.url || '', 'URL do BI')}
                      className="flex-1"
                      leftIcon={<Copy size={14} />}
                    >
                      Copiar Link
                    </Button>
                  </div>
                )}
              </div>

              {/* Declaração do Bairro */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-gray-600" />
                    <div>
                      <h4 className="font-bold text-primary">Declaração do Bairro</h4>
                      {selectedPrestador.documentos?.declaracaoBairro ? (
                        <p className="text-xs text-green-600">
                          Carregado em {formatDate(selectedPrestador.documentos.declaracaoBairro.dataUpload)}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Não carregado</p>
                      )}
                    </div>
                  </div>
                  {selectedPrestador.documentos?.declaracaoBairro && (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                </div>
                {selectedPrestador.documentos?.declaracaoBairro && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPrestador.documentos?.declaracaoBairro?.url, '_blank')}
                      className="flex-1"
                      leftIcon={<Eye size={14} />}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(selectedPrestador.documentos?.declaracaoBairro?.url || '', 'URL da Declaração')}
                      className="flex-1"
                      leftIcon={<Copy size={14} />}
                    >
                      Copiar Link
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDocumentModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              {(!selectedPrestador.documentos?.bi || !selectedPrestador.documentos?.declaracaoBairro) && (
                <Button
                  onClick={() => {
                    handleRequestDocuments(selectedPrestador.id);
                    setShowDocumentModal(false);
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  Notificar Prestador
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE SAQUE */}
      {/* ======================================== */}
      <Modal isOpen={showSaqueModal} onClose={() => setShowSaqueModal(false)} title="Detalhes do Saque" size="lg">
        {selectedSaque && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-bold text-primary">{selectedSaque.prestadorNome}</h3>
                <p className="text-sm text-gray-500">Solicitado em {formatDate(selectedSaque.dataSolicitacao)}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedSaque.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                selectedSaque.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                selectedSaque.status === 'processado' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedSaque.status === 'pendente' ? 'Pendente' :
                 selectedSaque.status === 'aprovado' ? 'Aprovado' :
                 selectedSaque.status === 'processado' ? 'Processado' : 'Rejeitado'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Valor do Saque</p>
              <p className="text-3xl font-black text-primary">{formatCurrency(selectedSaque.valor)}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-primary">Dados Bancários</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Banco</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.banco || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Conta</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.conta || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Titular</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.titular || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">NIB</p>
                  <p className="font-bold text-primary">{selectedSaque.dadosBancarios?.nib || 'N/A'}</p>
                </div>
              </div>
            </div>

            {selectedSaque.observacao && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs text-red-500 mb-1">Motivo da rejeição</p>
                <p className="text-sm text-red-700">{selectedSaque.observacao}</p>
              </div>
            )}

            {selectedSaque.dataProcessamento && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Processado em</p>
                <p className="font-bold text-primary">{formatDate(selectedSaque.dataProcessamento)}</p>
                {selectedSaque.processadoPor && (
                  <p className="text-xs text-gray-400 mt-1">Por: {selectedSaque.processadoPor}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSaqueModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              
              {selectedSaque.status === 'pendente' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectSaque(selectedSaque.id);
                      setShowSaqueModal(false);
                    }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveSaque(selectedSaque.id);
                      setShowSaqueModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Aprovar
                  </Button>
                </>
              )}

              {selectedSaque.status === 'aprovado' && (
                <Button
                  onClick={() => {
                    handleProcessSaque(selectedSaque.id);
                    setShowSaqueModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Marcar como Processado
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE DETALHES DA SOLICITAÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showDetalhesSolicitacaoModal} onClose={() => setShowDetalhesSolicitacaoModal(false)} title="Detalhes da Solicitação" size="lg">
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
                <p className="text-xs text-gray-500">Prestador</p>
                <p className="font-bold text-primary">{selectedSolicitacao.prestadorNome || 'Não atribuído'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Data Agendada</p>
                <p className="font-bold text-primary">{formatDate(selectedSolicitacao.dataAgendada)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Solicitação</p>
                <p className="font-bold text-primary">{formatDate(selectedSolicitacao.dataSolicitacao)}</p>
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

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Valores</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valor Total:</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedSolicitacao.valorTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">70% Inicial:</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedSolicitacao.valorInicial70 || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">30% Final:</span>
                  <span className="font-bold text-orange-500">{formatCurrency(selectedSolicitacao.valorFinal30 || 0)}</span>
                </div>
              </div>
            </div>

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
                onClick={() => setShowDetalhesSolicitacaoModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetalhesSolicitacaoModal(false);
                }}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
