import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao, User as UserType } from '../../types';
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
  Printer,
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
  CheckCircle,
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
  CalculatorIcon,
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
  BellDot,
  BellRing as BellRingIcon
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
  const [filterTipo, setFilterTipo] = useState<string>('todas');
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
  }, []);

  // ============================================
  // FILTRAR SOLICITAÇÕES
  // ============================================
  useEffect(() => {
    filterSolicitacoes(filterStatus, solicitacoes);
  }, [searchTerm, solicitacoes]);

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
              <Refresh
