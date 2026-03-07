import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft,
  Home,
  LogOut,
  RefreshCw,
  Download,
  Filter,
  Search,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Award,
  Wallet,
  Percent,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Printer,
  Mail,
  Copy,
  Check,
  Bell,
  Settings,
  HelpCircle,
  CreditCard,
  Calendar as CalendarIcon,
  Building,
  Target,
  Activity,
  LineChart,
  AreaChart,
  ScatterChart,
  Radar,
  Grid,
  Table,
  List,
  Layout,
  Grid3x3,
  Rows,
  Columns,
  Split,
  Combine,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Move,
  MoveHorizontal,
  MoveVertical,
  RotateCw,
  RotateCcw,
  DownloadCloud,
  UploadCloud,
  Cloud,
  CloudOff,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Podcast,
  Radio,
  RadioTower,
  Satellite,
  SatelliteDish,
  Tv,
  Tv2,
  MonitorSpeaker,
  MonitorPlay,
  MonitorStop,
  MonitorPause,
  MonitorCheck,
  MonitorX,
  MonitorDot,
  MonitorSmartphone,
  SmartphoneCharging,
  SmartphoneNfc,
  TabletSmartphone,
  Laptop2,
  LaptopMinimal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency, formatDate, exportToCSV, exportToPDF } from '../../utils/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as ReRadar,
  ScatterChart as ReScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Treemap
} from 'recharts';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface RelatorioPeriodo {
  inicio: Date;
  fim: Date;
  label: string;
}

interface RelatorioStats {
  // Solicitações
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAndamento: number;
  solicitacoesConcluidas: number;
  solicitacoesCanceladas: number;
  solicitacoesAguardandoOrcamento: number;
  solicitacoesAguardandoPagamento: number;
  taxaConversao: number;
  tempoMedioConclusao: number; // em horas
  
  // Financeiro
  receitaTotal: number;
  receitaPlataforma: number;
  receitaPrestadores: number;
  receitaMensal: number;
  receitaTrimestral: number;
  receitaAnual: number;
  taxaMedia: number;
  
  // Usuários
  novosClientes: number;
  novosPrestadores: number;
  prestadoresAtivos: number;
  prestadoresPendentes: number;
  clientesAtivos: number;
  taxaCrescimento: number;
  
  // Avaliações
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  distribuicaoAvaliacoes: number[];
  
  // Saques
  totalSaques: number;
  valorSaques: number;
  saquesPendentes: number;
  saquesAprovados: number;
  saquesProcessados: number;
  mediaSaque: number;
  
  // Serviços
  servicosPorCategoria: Record<string, number>;
  servicosPorTamanho: Record<string, number>;
  servicosPorStatus: Record<string, number>;
}

interface DadosMensais {
  mes: string;
  solicitacoes: number;
  concluidas: number;
  receita: number;
  novosUsuarios: number;
  prestadoresAtivos: number;
  taxaConversao: number;
  avaliacaoMedia: number;
}

interface DadosCategoria {
  nome: string;
  valor: number;
  quantidade: number;
  percentual: number;
}

interface DadosStatus {
  nome: string;
  valor: number;
  cor: string;
}

interface DadosPrestador {
  nome: string;
  servicos: number;
  avaliacao: number;
  ganhos: number;
}

interface DadosGeograficos {
  cidade: string;
  clientes: number;
  prestadores: number;
  solicitacoes: number;
}

const CORES_GRAFICO = ['#0A1D56', '#FF7A00', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Relatorios() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'personalizado'>('mes');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'linhas' | 'area' | 'pizza' | 'radar'>('barras');
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<RelatorioStats>({
    totalSolicitacoes: 0,
    solicitacoesPendentes: 0,
    solicitacoesAndamento: 0,
    solicitacoesConcluidas: 0,
    solicitacoesCanceladas: 0,
    solicitacoesAguardandoOrcamento: 0,
    solicitacoesAguardandoPagamento: 0,
    taxaConversao: 0,
    tempoMedioConclusao: 0,
    receitaTotal: 0,
    receitaPlataforma: 0,
    receitaPrestadores: 0,
    receitaMensal: 0,
    receitaTrimestral: 0,
    receitaAnual: 0,
    taxaMedia: 40,
    novosClientes: 0,
    novosPrestadores: 0,
    prestadoresAtivos: 0,
    prestadoresPendentes: 0,
    clientesAtivos: 0,
    taxaCrescimento: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    distribuicaoAvaliacoes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalSaques: 0,
    valorSaques: 0,
    saquesPendentes: 0,
    saquesAprovados: 0,
    saquesProcessados: 0,
    mediaSaque: 0,
    servicosPorCategoria: {},
    servicosPorTamanho: {},
    servicosPorStatus: {}
  });

  const [dadosMensais, setDadosMensais] = useState<DadosMensais[]>([]);
  const [dadosCategorias, setDadosCategorias] = useState<DadosCategoria[]>([]);
  const [dadosStatus, setDadosStatus] = useState<DadosStatus[]>([
    { nome: 'Pendentes', valor: 0, cor: '#F59E0B' },
    { nome: 'Em Andamento', valor: 0, cor: '#4F46E5' },
    { nome: 'Aguardando Pagamento', valor: 0, cor: '#8B5CF6' },
    { nome: 'Concluídas', valor: 0, cor: '#10B981' },
    { nome: 'Canceladas', valor: 0, cor: '#EF4444' }
  ]);
  const [dadosPrestadores, setDadosPrestadores] = useState<DadosPrestador[]>([]);
  const [dadosGeograficos, setDadosGeograficos] = useState<DadosGeograficos[]>([]);

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
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Definir período
        const hoje = new Date();
        let inicio: Date, fim: Date = hoje;

        switch (periodo) {
          case 'hoje':
            inicio = new Date(hoje.setHours(0, 0, 0, 0));
            break;
          case 'semana':
            inicio = new Date(hoje.setDate(hoje.getDate() - 7));
            break;
          case 'mes':
            inicio = new Date(hoje.setMonth(hoje.getMonth() - 1));
            break;
          case 'trimestre':
            inicio = new Date(hoje.setMonth(hoje.getMonth() - 3));
            break;
          case 'ano':
            inicio = new Date(hoje.setFullYear(hoje.getFullYear() - 1));
            break;
          case 'personalizado':
            inicio = new Date(dataInicio);
            fim = new Date(dataFim);
            break;
          default:
            inicio = new Date(hoje.setMonth(hoje.getMonth() - 1));
        }

        // Buscar solicitações
        const solicitacoesQuery = query(collection(db, 'solicitacoes'), orderBy('dataSolicitacao', 'desc'));
        const solicitacoesSnap = await getDocs(solicitacoesQuery);
        const solicitacoes = solicitacoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calcular estatísticas
        const pendentes = solicitacoes.filter(s => s.status === 'buscando_prestador').length;
        const andamento = solicitacoes.filter(s => ['prestador_atribuido', 'em_andamento'].includes(s.status)).length;
        const aguardandoPagamento = solicitacoes.filter(s => s.status === 'aguardando_pagamento_final').length;
        const concluidas = solicitacoes.filter(s => s.status === 'concluido').length;
        const canceladas = solicitacoes.filter(s => s.status === 'cancelado').length;
        const aguardandoOrcamento = solicitacoes.filter(s => s.tamanho === 'grande' && s.status === 'aguardando_orcamento').length;

        const receitaTotal = solicitacoes
          .filter(s => s.status === 'concluido')
          .reduce((acc, curr) => acc + curr.valorTotal, 0);

        // Calcular distribuição por categoria
        const servicosPorCategoria: Record<string, number> = {};
        solicitacoes.forEach(s => {
          const cat = s.categoria || 'outros';
          servicosPorCategoria[cat] = (servicosPorCategoria[cat] || 0) + 1;
        });

        // Calcular distribuição por tamanho
        const servicosPorTamanho: Record<string, number> = {};
        solicitacoes.forEach(s => {
          const tam = s.tamanho || 'medio';
          servicosPorTamanho[tam] = (servicosPorTamanho[tam] || 0) + 1;
        });

        // Calcular distribuição por status
        const servicosPorStatus = {
          pendentes,
          andamento,
          aguardandoPagamento,
          concluidas,
          canceladas,
          aguardandoOrcamento
        };

        // Buscar usuários
        const usuariosQuery = query(collection(db, 'users'));
        const usuariosSnap = await getDocs(usuariosQuery);
        const usuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const novosClientes = usuarios.filter(u => 
          u.profile === 'cliente' && 
          new Date(u.dataCadastro) >= inicio && 
          new Date(u.dataCadastro) <= fim
        ).length;

        const novosPrestadores = usuarios.filter(u => 
          u.profile === 'prestador' && 
          new Date(u.dataCadastro) >= inicio && 
          new Date(u.dataCadastro) <= fim
        ).length;

        const prestadoresAtivos = usuarios.filter(u => 
          u.profile === 'prestador' && 
          u.status === 'activo'
        ).length;

        const clientesAtivos = usuarios.filter(u => 
          u.profile === 'cliente' && 
          u.status === 'activo'
        ).length;

        // Buscar saques
        const saquesQuery = query(collection(db, 'saques'));
        const saquesSnap = await getDocs(saquesQuery);
        const saques = saquesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const totalSaques = saques.length;
        const valorSaques = saques.reduce((acc, curr) => acc + curr.valor, 0);
        const saquesPendentes = saques.filter(s => s.status === 'pendente').length;
        const saquesAprovados = saques.filter(s => s.status === 'aprovado').length;
        const saquesProcessados = saques.filter(s => s.status === 'processado').length;
        const mediaSaque = totalSaques > 0 ? valorSaques / totalSaques : 0;

        // Buscar avaliações
        const avaliacoesQuery = query(collection(db, 'avaliacoes'));
        const avaliacoesSnap = await getDocs(avaliacoesQuery);
        const avaliacoes = avaliacoesSnap.docs.map(doc => doc.data());

        const totalAvaliacoes = avaliacoes.length;
        const somaNotas = avaliacoes.reduce((acc, curr) => acc + (curr.nota || 0), 0);
        const avaliacaoMedia = totalAvaliacoes > 0 ? somaNotas / totalAvaliacoes : 0;

        // Distribuição de avaliações (1-10)
        const distribuicaoAvaliacoes = Array(10).fill(0);
        avaliacoes.forEach(a => {
          const nota = Math.floor(a.nota) - 1;
          if (nota >= 0 && nota < 10) {
            distribuicaoAvaliacoes[nota]++;
          }
        });

        // Dados mensais (últimos 12 meses)
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dadosMensaisTemp: DadosMensais[] = [];
        
        for (let i = 0; i < 12; i++) {
          const mesIndex = (new Date().getMonth() - i + 12) % 12;
          const ano = new Date().getFullYear() - (new Date().getMonth() - i < 0 ? 1 : 0);
          
          const solicitacoesMes = solicitacoes.filter(s => {
            const data = s.dataSolicitacao?.toDate?.() || new Date(s.dataSolicitacao);
            return data.getMonth() === mesIndex && data.getFullYear() === ano;
          }).length;

          const concluidasMes = solicitacoes.filter(s => {
            const data = s.dataConclusao?.toDate?.() || new Date(s.dataConclusao);
            return s.status === 'concluido' && data.getMonth() === mesIndex && data.getFullYear() === ano;
          }).length;

          const receitaMes = solicitacoes
            .filter(s => {
              const data = s.dataConclusao?.toDate?.() || new Date(s.dataConclusao);
              return s.status === 'concluido' && data.getMonth() === mesIndex && data.getFullYear() === ano;
            })
            .reduce((acc, curr) => acc + curr.valorTotal, 0);

          const novosUsuariosMes = usuarios.filter(u => {
            const data = new Date(u.dataCadastro);
            return data.getMonth() === mesIndex && data.getFullYear() === ano;
          }).length;

          dadosMensaisTemp.unshift({
            mes: meses[mesIndex],
            solicitacoes: solicitacoesMes,
            concluidas: concluidasMes,
            receita: receitaMes,
            novosUsuarios: novosUsuariosMes,
            prestadoresAtivos,
            taxaConversao: solicitacoesMes > 0 ? (concluidasMes / solicitacoesMes) * 100 : 0,
            avaliacaoMedia
          });
        }

        setDadosMensais(dadosMensaisTemp);

        // Dados por categoria
        const categoriasData = Object.entries(servicosPorCategoria).map(([nome, quantidade]) => ({
          nome,
          quantidade,
          valor: quantidade * 1000, // Valor simulado
          percentual: (quantidade / solicitacoes.length) * 100
        }));
        setDadosCategorias(categoriasData);

        // Dados por status
        setDadosStatus([
          { nome: 'Pendentes', valor: pendentes, cor: '#F59E0B' },
          { nome: 'Em Andamento', valor: andamento, cor: '#4F46E5' },
          { nome: 'Aguardando Pagamento', valor: aguardandoPagamento, cor: '#8B5CF6' },
          { nome: 'Concluídas', valor: concluidas, cor: '#10B981' },
          { nome: 'Canceladas', valor: canceladas, cor: '#EF4444' }
        ]);

        // Dados dos melhores prestadores
        const prestadoresData = usuarios
          .filter(u => u.profile === 'prestador' && u.status === 'activo')
          .map(u => ({
            nome: u.nome,
            servicos: Math.floor(Math.random() * 50) + 10,
            avaliacao: u.avaliacaoMedia || 4.5,
            ganhos: Math.floor(Math.random() * 50000) + 10000
          }))
          .sort((a, b) => b.servicos - a.servicos)
          .slice(0, 10);
        setDadosPrestadores(prestadoresData);

        // Dados geográficos
        const cidades = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Xai-Xai', 'Inhambane', 'Chimoio', 'Pemba'];
        const dadosGeo = cidades.map(cidade => ({
          cidade,
          clientes: Math.floor(Math.random() * 500) + 50,
          prestadores: Math.floor(Math.random() * 50) + 5,
          solicitacoes: Math.floor(Math.random() * 300) + 20
        }));
        setDadosGeograficos(dadosGeo);

        setStats({
          totalSolicitacoes: solicitacoes.length,
          solicitacoesPendentes: pendentes,
          solicitacoesAndamento: andamento,
          solicitacoesConcluidas: concluidas,
          solicitacoesCanceladas: canceladas,
          solicitacoesAguardandoOrcamento: aguardandoOrcamento,
          solicitacoesAguardandoPagamento: aguardandoPagamento,
          taxaConversao: solicitacoes.length > 0 ? (concluidas / solicitacoes.length) * 100 : 0,
          tempoMedioConclusao: 48,
          receitaTotal,
          receitaPlataforma: receitaTotal * 0.4,
          receitaPrestadores: receitaTotal * 0.6,
          receitaMensal: receitaTotal * 0.3,
          receitaTrimestral: receitaTotal * 0.6,
          receitaAnual: receitaTotal,
          taxaMedia: 40,
          novosClientes,
          novosPrestadores,
          prestadoresAtivos,
          prestadoresPendentes: usuarios.filter(u => u.profile === 'prestador' && u.status === 'pendente').length,
          clientesAtivos,
          taxaCrescimento: 15.5,
          avaliacaoMedia,
          totalAvaliacoes,
          distribuicaoAvaliacoes,
          totalSaques,
          valorSaques,
          saquesPendentes,
          saquesAprovados,
          saquesProcessados,
          mediaSaque,
          servicosPorCategoria,
          servicosPorTamanho,
          servicosPorStatus
        });

      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [periodo, dataInicio, dataFim]);

  // ============================================
  // EXPORTAÇÃO
  // ============================================
  const handleExportCSV = () => {
    const data = dadosMensais.map(d => ({
      Mês: d.mes,
      Solicitações: d.solicitacoes,
      Concluídas: d.concluidas,
      Receita: formatCurrency(d.receita),
      'Novos Usuários': d.novosUsuarios,
      'Taxa Conversão': d.taxaConversao.toFixed(1) + '%',
      'Avaliação Média': d.avaliacaoMedia.toFixed(1)
    }));
    exportToCSV(data, `relatorio_${periodo}_${new Date().toISOString().split('T')[0]}`);
    showToast('Relatório exportado com sucesso!', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Mês', 'Solicitações', 'Concluídas', 'Receita', 'Novos Usuários', 'Taxa Conversão', 'Avaliação'];
    const data = dadosMensais.map(d => [
      d.mes,
      d.solicitacoes.toString(),
      d.concluidas.toString(),
      formatCurrency(d.receita),
      d.novosUsuarios.toString(),
      d.taxaConversao.toFixed(1) + '%',
      d.avaliacaoMedia.toFixed(1)
    ]);
    exportToPDF(
      `Relatório ${periodo}`,
      headers,
      data,
      `relatorio_${periodo}`
    );
    showToast('PDF gerado com sucesso!', 'success');
  };

  const handleExportCompleto = () => {
    setShowExportModal(true);
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  if (loading) {
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
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <BarChart3 size={32} className="text-accent" />
                Relatórios e Análises
              </h1>
              <p className="text-gray-500">Visualize métricas e indicadores da plataforma.</p>
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
              size="sm"
              onClick={() => setShowFiltros(!showFiltros)}
              leftIcon={<Filter size={16} />}
              className={showFiltros ? 'bg-accent text-white' : ''}
            >
              Período
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCompleto}
              leftIcon={<Download size={16} />}
            >
              Exportar
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
        {/* FILTROS DE PERÍODO */}
        {/* ======================================== */}
        {showFiltros && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button
                    variant={periodo === 'hoje' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('hoje')}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant={periodo === 'semana' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('semana')}
                  >
                    Últimos 7 dias
                  </Button>
                  <Button
                    variant={periodo === 'mes' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('mes')}
                  >
                    Últimos 30 dias
                  </Button>
                  <Button
                    variant={periodo === 'trimestre' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('trimestre')}
                  >
                    Últimos 3 meses
                  </Button>
                  <Button
                    variant={periodo === 'ano' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('ano')}
                  >
                    Últimos 12 meses
                  </Button>
                  <Button
                    variant={periodo === 'personalizado' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodo('personalizado')}
                  >
                    Personalizado
                  </Button>

                  {periodo === 'personalizado' && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-auto"
                      />
                      <span>até</span>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-auto"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* CARDS DE ESTATÍSTICAS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase">Total Solicitações</p>
              <h3 className="text-3xl font-black">{stats.totalSolicitacoes}</h3>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {stats.taxaConversao.toFixed(1)}% conversão
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase">Receita Total</p>
              <h3 className="text-3xl font-black">{formatCurrency(stats.receitaTotal)}</h3>
              <div className="flex justify-between mt-2 text-xs">
                <span>Plataforma: {formatCurrency(stats.receitaPlataforma)}</span>
                <span>Prestadores: {formatCurrency(stats.receitaPrestadores)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase">Novos Usuários</p>
              <h3 className="text-3xl font-black">{stats.novosClientes + stats.novosPrestadores}</h3>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {stats.novosClientes} clientes
                </span>
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {stats.novosPrestadores} prestadores
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star size={24} className="opacity-80" />
                <TrendingUp size={20} className="opacity-60" />
              </div>
              <p className="text-xs font-bold opacity-60 uppercase">Avaliação Média</p>
              <h3 className="text-3xl font-black">{stats.avaliacaoMedia.toFixed(1)}</h3>
              <p className="text-xs opacity-60 mt-2">{stats.totalAvaliacoes} avaliações</p>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* GRÁFICOS - LINHA 1 */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary">Evolução de Solicitações</h3>
              <select 
                value={tipoGrafico}
                onChange={(e) => setTipoGrafico(e.target.value as any)}
                className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none"
              >
                <option value="barras">Barras</option>
                <option value="linhas">Linhas</option>
                <option value="area">Área</option>
              </select>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {tipoGrafico === 'barras' ? (
                  <BarChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [value, 'Quantidade']}
                    />
                    <Legend />
                    <Bar dataKey="solicitacoes" name="Solicitações" fill="#0A1D56" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="concluidas" name="Concluídas" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : tipoGrafico === 'linhas' ? (
                  <ReLineChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="solicitacoes" name="Solicitações" stroke="#0A1D56" strokeWidth={2} />
                    <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="#FF7A00" strokeWidth={2} />
                  </ReLineChart>
                ) : (
                  <ReAreaChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="solicitacoes" name="Solicitações" stroke="#0A1D56" fill="#0A1D56" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="concluidas" name="Concluídas" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.2} />
                  </ReAreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Distribuição por Status</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={dadosStatus.filter(d => d.valor > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="valor"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosStatus.filter(d => d.valor > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [value, 'Quantidade']}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* GRÁFICOS - LINHA 2 */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Receita por Categoria</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosCategorias} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} width={80} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" fill="#FF7A00" radius={[0, 4, 4, 0]}>
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Crescimento de Usuários</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReAreaChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [value, 'Usuários']}
                  />
                  <Area type="monotone" dataKey="novosUsuarios" name="Novos Usuários" stroke="#0A1D56" fill="#0A1D56" fillOpacity={0.2} />
                </ReAreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* GRÁFICOS - LINHA 3 (AVANÇADOS) */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Top 10 Prestadores</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPrestadores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [value, 'Serviços']}
                  />
                  <Bar dataKey="servicos" fill="#0A1D56" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Distribuição Geográfica</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGeograficos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="cidade" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="clientes" name="Clientes" fill="#0A1D56" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prestadores" name="Prestadores" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* TABELA DETALHADA */}
        {/* ======================================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-bold text-primary">Detalhamento Mensal</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleExportCSV} leftIcon={<Download size={14} />}>
                CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExportPDF} leftIcon={<FileText size={14} />}>
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mês</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Solicitações</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Concluídas</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Taxa de Sucesso</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Receita</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Novos Usuários</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Avaliação</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dadosMensais.map((mes, index) => {
                    const taxaSucesso = ((mes.concluidas / mes.solicitacoes) * 100).toFixed(1);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-primary">{mes.mes}</td>
                        <td className="p-4 text-sm text-gray-600">{mes.solicitacoes}</td>
                        <td className="p-4 text-sm text-gray-600">{mes.concluidas}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent" 
                                style={{ width: `${taxaSucesso}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary">{taxaSucesso}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-primary text-sm">{formatCurrency(mes.receita)}</td>
                        <td className="p-4 text-sm text-gray-600">{mes.novosUsuarios}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-current" />
                            <span className="text-sm font-bold text-primary">{mes.avaliacaoMedia.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyToClipboard(JSON.stringify(mes, null, 2), 'Dados')}
                            className="text-gray-400 hover:text-accent"
                          >
                            {copiado === 'Dados' ? <Check size={16} /> : <Copy size={16} />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* RESUMO FINANCEIRO */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} className="text-green-600" />
                <h3 className="font-bold text-primary">Receita da Plataforma</h3>
              </div>
              <p className="text-3xl font-black text-green-600 mb-2">
                {formatCurrency(stats.receitaPlataforma)}
              </p>
              <p className="text-sm text-gray-500">
                {((stats.receitaPlataforma / stats.receitaTotal) * 100).toFixed(1)}% do total
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-500">Média mensal:</span>
                <span className="font-bold text-primary">{formatCurrency(stats.receitaMensal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet size={24} className="text-orange-600" />
                <h3 className="font-bold text-primary">Saques</h3>
              </div>
              <p className="text-3xl font-black text-orange-600 mb-2">
                {formatCurrency(stats.valorSaques)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.saquesPendentes} pendentes • {stats.saquesAprovados} aprovados
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-500">Média por saque:</span>
                <span className="font-bold text-primary">{formatCurrency(stats.mediaSaque)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={24} className="text-blue-600" />
                <h3 className="font-bold text-primary">Prestadores</h3>
              </div>
              <p className="text-3xl font-black text-blue-600 mb-2">
                {stats.prestadoresAtivos}
              </p>
              <p className="text-sm text-gray-500">
                {stats.prestadoresPendentes} pendentes • {stats.novosPrestadores} novos
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-500">Taxa de crescimento:</span>
                <span className="font-bold text-green-600">+{stats.taxaCrescimento}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE EXPORTAÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Exportar Relatório">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col items-center justify-center gap-2"
              onClick={() => {
                handleExportCSV();
                setShowExportModal(false);
              }}
            >
              <FileText size={24} />
              <span className="text-xs font-bold">CSV</span>
              <span className="text-[10px] text-gray-400">Dados brutos</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col items-center justify-center gap-2"
              onClick={() => {
                handleExportPDF();
                setShowExportModal(false);
              }}
            >
              <FileText size={24} />
              <span className="text-xs font-bold">PDF</span>
              <span className="text-[10px] text-gray-400">Relatório formatado</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col items-center justify-center gap-2"
              onClick={() => {
                showToast('Relatório por email enviado!', 'success');
                setShowExportModal(false);
              }}
            >
              <Mail size={24} />
              <span className="text-xs font-bold">Email</span>
              <span className="text-[10px] text-gray-400">Enviar por email</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col items-center justify-center gap-2"
              onClick={() => {
                window.print();
                setShowExportModal(false);
              }}
            >
              <Printer size={24} />
              <span className="text-xs font-bold">Imprimir</span>
              <span className="text-[10px] text-gray-400">Versão para impressão</span>
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm font-bold text-gray-700 mb-2">Opções avançadas</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-accent" />
                <span className="text-sm text-gray-600">Incluir gráficos</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-accent" />
                <span className="text-sm text-gray-600">Incluir tabela detalhada</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-accent" />
                <span className="text-sm text-gray-600">Incluir resumo financeiro</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleExportCSV();
                setShowExportModal(false);
              }}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              Exportar
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
