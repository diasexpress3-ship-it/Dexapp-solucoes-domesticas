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
  Check
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
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
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
  
  // Financeiro
  receitaTotal: number;
  receitaPlataforma: number;
  receitaPrestadores: number;
  taxaMedia: number;
  
  // Usuários
  novosClientes: number;
  novosPrestadores: number;
  prestadoresAtivos: number;
  
  // Avaliações
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  
  // Saques
  totalSaques: number;
  valorSaques: number;
  saquesPendentes: number;
}

interface DadosMensais {
  mes: string;
  solicitacoes: number;
  concluidas: number;
  receita: number;
  novosUsuarios: number;
}

interface DadosCategoria {
  nome: string;
  valor: number;
  quantidade: number;
}

interface DadosStatus {
  nome: string;
  valor: number;
  cor: string;
}

const CORES_GRAFICO = ['#0A1D56', '#FF7A00', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [stats, setStats] = useState<RelatorioStats>({
    totalSolicitacoes: 0,
    solicitacoesPendentes: 0,
    solicitacoesAndamento: 0,
    solicitacoesConcluidas: 0,
    solicitacoesCanceladas: 0,
    receitaTotal: 0,
    receitaPlataforma: 0,
    receitaPrestadores: 0,
    taxaMedia: 40,
    novosClientes: 0,
    novosPrestadores: 0,
    prestadoresAtivos: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    totalSaques: 0,
    valorSaques: 0,
    saquesPendentes: 0
  });

  const [dadosMensais, setDadosMensais] = useState<DadosMensais[]>([]);
  const [dadosCategorias, setDadosCategorias] = useState<DadosCategoria[]>([]);
  const [dadosStatus, setDadosStatus] = useState<DadosStatus[]>([
    { nome: 'Pendentes', valor: 0, cor: '#F59E0B' },
    { nome: 'Em Andamento', valor: 0, cor: '#4F46E5' },
    { nome: 'Concluídas', valor: 0, cor: '#10B981' },
    { nome: 'Canceladas', valor: 0, cor: '#EF4444' }
  ]);

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
        const concluidas = solicitacoes.filter(s => s.status === 'concluido').length;
        const canceladas = solicitacoes.filter(s => s.status === 'cancelado').length;

        const receitaTotal = solicitacoes
          .filter(s => s.status === 'concluido')
          .reduce((acc, curr) => acc + curr.valorTotal, 0);

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

        // Buscar saques
        const saquesQuery = query(collection(db, 'saques'));
        const saquesSnap = await getDocs(saquesQuery);
        const saques = saquesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const totalSaques = saques.length;
        const valorSaques = saques.reduce((acc, curr) => acc + curr.valor, 0);
        const saquesPendentes = saques.filter(s => s.status === 'pendente').length;

        setStats({
          totalSolicitacoes: solicitacoes.length,
          solicitacoesPendentes: pendentes,
          solicitacoesAndamento: andamento,
          solicitacoesConcluidas: concluidas,
          solicitacoesCanceladas: canceladas,
          receitaTotal,
          receitaPlataforma: receitaTotal * 0.4,
          receitaPrestadores: receitaTotal * 0.6,
          taxaMedia: 40,
          novosClientes,
          novosPrestadores,
          prestadoresAtivos,
          avaliacaoMedia: 4.8,
          totalAvaliacoes: 1250,
          totalSaques,
          valorSaques,
          saquesPendentes
        });

        setDadosStatus([
          { nome: 'Pendentes', valor: pendentes, cor: '#F59E0B' },
          { nome: 'Em Andamento', valor: andamento, cor: '#4F46E5' },
          { nome: 'Concluídas', valor: concluidas, cor: '#10B981' },
          { nome: 'Canceladas', valor: canceladas, cor: '#EF4444' }
        ]);

        // Dados mensais (simulados)
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dadosMensaisTemp: DadosMensais[] = [];
        for (let i = 0; i < 6; i++) {
          dadosMensaisTemp.push({
            mes: meses[new Date().getMonth() - i],
            solicitacoes: Math.floor(Math.random() * 100) + 50,
            concluidas: Math.floor(Math.random() * 80) + 30,
            receita: Math.floor(Math.random() * 50000) + 20000,
            novosUsuarios: Math.floor(Math.random() * 20) + 5
          });
        }
        setDadosMensais(dadosMensaisTemp.reverse());

        // Dados por categoria
        setDadosCategorias([
          { nome: 'Limpeza', valor: 45000, quantidade: 45 },
          { nome: 'Elétrica', valor: 25000, quantidade: 25 },
          { nome: 'Canalização', valor: 15000, quantidade: 15 },
          { nome: 'Carpintaria', valor: 10000, quantidade: 10 },
          { nome: 'Outros', valor: 5000, quantidade: 5 }
        ]);

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
      'Novos Usuários': d.novosUsuarios
    }));
    exportToCSV(data, `relatorio_${periodo}_${new Date().toISOString().split('T')[0]}`);
    showToast('Relatório exportado com sucesso!', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Mês', 'Solicitações', 'Concluídas', 'Receita', 'Novos Usuários'];
    const data = dadosMensais.map(d => [
      d.mes,
      d.solicitacoes.toString(),
      d.concluidas.toString(),
      formatCurrency(d.receita),
      d.novosUsuarios.toString()
    ]);
    exportToPDF(
      `Relatório ${periodo}`,
      headers,
      data,
      `relatorio_${periodo}`
    );
    showToast('PDF gerado com sucesso!', 'success');
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
              onClick={handleExportCSV}
              leftIcon={<Download size={16} />}
            >
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              leftIcon={<FileText size={16} />}
            >
              PDF
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
              </div>
              <p className="text-xs font-bold opacity-60 uppercase">Total Solicitações</p>
              <h3 className="text-3xl font-black">{stats.totalSolicitacoes}</h3>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  +{stats.solicitacoesConcluidas} concluídas
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="opacity-80" />
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
              <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none">
                <option>Últimos 6 meses</option>
                <option>Últimos 12 meses</option>
              </select>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="solicitacoes" name="Solicitações" stroke="#0A1D56" strokeWidth={2} />
                  <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="#FF7A00" strokeWidth={2} />
                </LineChart>
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
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="valor"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
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
                  <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
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
                <AreaChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="novosUsuarios" name="Novos Usuários" stroke="#0A1D56" fill="#0A1D56" fillOpacity={0.2} />
                </AreaChart>
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
                Exportar
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
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet size={24} className="text-orange-600" />
                <h3 className="font-bold text-primary">Saques Pendentes</h3>
              </div>
              <p className="text-3xl font-black text-orange-600 mb-2">
                {formatCurrency(stats.valorSaques)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.saquesPendentes} saques aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={24} className="text-blue-600" />
                <h3 className="font-bold text-primary">Prestadores Ativos</h3>
              </div>
              <p className="text-3xl font-black text-blue-600 mb-2">
                {stats.prestadoresAtivos}
              </p>
              <p className="text-sm text-gray-500">
                {stats.novosPrestadores} novos no período
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
