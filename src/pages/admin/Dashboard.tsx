import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Home,
  ArrowLeft,
  ChevronRight,
  Settings,
  UserPlus,
  FileText,
  ShieldAlert,
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  LogOut,
  Star,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { collection, query, onSnapshot, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User, Solicitacao, Pagamento } from '../../types';
import { formatCurrency, formatDate, exportToCSV, exportToPDF } from '../../utils/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdminStats {
  // Usuários
  totalUsers: number;
  totalClientes: number;
  totalPrestadores: number;
  prestadoresPendentes: number;
  prestadoresAtivos: number;
  prestadoresDocumentosPendentes: number;
  totalCentral: number;
  totalAdmin: number;

  // Solicitações
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesEmAndamento: number;
  solicitacoesConcluidas: number;
  solicitacoesCanceladas: number;
  solicitacoesAguardandoOrcamento: number;
  solicitacoesAguardandoPagamento: number;

  // Financeiro
  valorTotalMovimentado: number;
  valorPlataforma: number; // 40%
  valorPrestadores: number; // 60%
  saquesPendentes: number;
  saquesAprovados: number;
  valorSaquesPendentes: number;
}

interface MonthlyData {
  name: string;
  solicitacoes: number;
  concluidas: number;
  receita: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#0A1D56', '#FF7A00', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClientes: 0,
    totalPrestadores: 0,
    prestadoresPendentes: 0,
    prestadoresAtivos: 0,
    prestadoresDocumentosPendentes: 0,
    totalCentral: 0,
    totalAdmin: 0,
    totalSolicitacoes: 0,
    solicitacoesPendentes: 0,
    solicitacoesEmAndamento: 0,
    solicitacoesConcluidas: 0,
    solicitacoesCanceladas: 0,
    solicitacoesAguardandoOrcamento: 0,
    solicitacoesAguardandoPagamento: 0,
    valorTotalMovimentado: 0,
    valorPlataforma: 0,
    valorPrestadores: 0,
    saquesPendentes: 0,
    saquesAprovados: 0,
    valorSaquesPendentes: 0
  });

  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentSolicitacoes, setRecentSolicitacoes] = useState<Solicitacao[]>([]);
  const [recentSaques, setRecentSaques] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // Buscar estatísticas de usuários
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      
      const totalUsers = users.length;
      const totalClientes = users.filter(u => u.profile === 'cliente').length;
      const totalPrestadores = users.filter(u => u.profile === 'prestador').length;
      const prestadoresPendentes = users.filter(u => u.profile === 'prestador' && u.status === 'pendente').length;
      const prestadoresAtivos = users.filter(u => u.profile === 'prestador' && u.status === 'activo').length;
      const prestadoresDocumentosPendentes = users.filter(u => u.profile === 'prestador' && u.status === 'pendente_documentos').length;
      const totalCentral = users.filter(u => u.profile === 'central').length;
      const totalAdmin = users.filter(u => u.profile === 'admin').length;

      setStats(prev => ({
        ...prev,
        totalUsers,
        totalClientes,
        totalPrestadores,
        prestadoresPendentes,
        prestadoresAtivos,
        prestadoresDocumentosPendentes,
        totalCentral,
        totalAdmin
      }));

      setRecentUsers(users.sort((a, b) => {
        const da = a.dataCadastro instanceof Date ? a.dataCadastro : (a.dataCadastro as any)?.toDate?.() || new Date((a.dataCadastro as any).seconds * 1000);
        const db = b.dataCadastro instanceof Date ? b.dataCadastro : (b.dataCadastro as any)?.toDate?.() || new Date((b.dataCadastro as any).seconds * 1000);
        return db.getTime() - da.getTime();
      }).slice(0, 5));
    });

    // Buscar estatísticas de solicitações
    const unsubSolicitacoes = onSnapshot(collection(db, 'solicitacoes'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Solicitacao));
      
      const total = docs.length;
      const pendentes = docs.filter(s => s.status === 'buscando_prestador').length;
      const emAndamento = docs.filter(s => ['prestador_atribuido', 'em_andamento'].includes(s.status)).length;
      const concluidas = docs.filter(s => s.status === 'concluido').length;
      const canceladas = docs.filter(s => s.status === 'cancelado').length;
      const aguardandoOrcamento = docs.filter(s => s.tamanho === 'grande' && s.status === 'aguardando_orcamento').length;
      const aguardandoPagamento = docs.filter(s => s.status === 'aguardando_pagamento_final').length;

      // Valor total movimentado (apenas concluídas)
      const valorTotal = docs.filter(s => s.status === 'concluido').reduce((acc, curr) => acc + curr.valorTotal, 0);
      
      // Distribuição (40% plataforma, 60% prestadores)
      const valorPlataforma = Math.round(valorTotal * 0.4);
      const valorPrestadores = Math.round(valorTotal * 0.6);

      setStats(prev => ({
        ...prev,
        totalSolicitacoes: total,
        solicitacoesPendentes: pendentes,
        solicitacoesEmAndamento: emAndamento,
        solicitacoesConcluidas: concluidas,
        solicitacoesCanceladas: canceladas,
        solicitacoesAguardandoOrcamento: aguardandoOrcamento,
        solicitacoesAguardandoPagamento: aguardandoPagamento,
        valorTotalMovimentado: valorTotal,
        valorPlataforma,
        valorPrestadores
      }));

      setRecentSolicitacoes(docs.sort((a, b) => {
        const da = a.dataSolicitacao instanceof Date ? a.dataSolicitacao : (a.dataSolicitacao as any)?.toDate?.() || new Date((a.dataSolicitacao as any).seconds * 1000);
        const db = b.dataSolicitacao instanceof Date ? b.dataSolicitacao : (b.dataSolicitacao as any)?.toDate?.() || new Date((b.dataSolicitacao as any).seconds * 1000);
        return db.getTime() - da.getTime();
      }).slice(0, 5));

      // Dados mensais para gráfico
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthly: MonthlyData[] = meses.map((mes, index) => {
        const mesAtual = index + 1;
        const solicitacoesMes = docs.filter(s => {
          const data = s.dataSolicitacao instanceof Date ? s.dataSolicitacao : (s.dataSolicitacao as any)?.toDate?.();
          return data && data.getMonth() + 1 === mesAtual && data.getFullYear() === new Date().getFullYear();
        }).length;
        
        const concluidasMes = docs.filter(s => {
          const data = s.dataConclusao instanceof Date ? s.dataConclusao : (s.dataConclusao as any)?.toDate?.();
          return s.status === 'concluido' && data && data.getMonth() + 1 === mesAtual && data.getFullYear() === new Date().getFullYear();
        }).length;

        const receitaMes = docs.filter(s => {
          const data = s.dataConclusao instanceof Date ? s.dataConclusao : (s.dataConclusao as any)?.toDate?.();
          return s.status === 'concluido' && data && data.getMonth() + 1 === mesAtual && data.getFullYear() === new Date().getFullYear();
        }).reduce((acc, curr) => acc + curr.valorTotal, 0);

        return {
          name: mes,
          solicitacoes: solicitacoesMes,
          concluidas: concluidasMes,
          receita: receitaMes
        };
      });
      setMonthlyData(monthly);

      // Dados por categoria (simulado)
      setCategoryData([
        { name: 'Limpeza', value: 45 },
        { name: 'Elétrica', value: 25 },
        { name: 'Canalização', value: 15 },
        { name: 'Carpintaria', value: 10 },
        { name: 'Outros', value: 5 }
      ]);

      setIsLoading(false);
    });

    // Buscar estatísticas de saques
    const unsubSaques = onSnapshot(collection(db, 'saques'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const pendentes = docs.filter(s => s.status === 'pendente').length;
      const aprovados = docs.filter(s => s.status === 'aprovado').length;
      const valorPendente = docs.filter(s => s.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0);

      setStats(prev => ({
        ...prev,
        saquesPendentes: pendentes,
        saquesAprovados: aprovados,
        valorSaquesPendentes: valorPendente
      }));

      setRecentSaques(docs.sort((a, b) => {
        const da = a.dataSolicitacao?.toDate?.() || new Date(a.dataSolicitacao);
        const db = b.dataSolicitacao?.toDate?.() || new Date(b.dataSolicitacao);
        return db.getTime() - da.getTime();
      }).slice(0, 5));
    });

    return () => {
      unsubUsers();
      unsubSolicitacoes();
      unsubSaques();
    };
  }, []);

  const handleExportCSV = () => {
    const data = recentSolicitacoes.map(s => ({
      ID: s.id,
      Serviço: s.servico,
      Cliente: s.clienteNome,
      Prestador: s.prestadorNome || 'N/A',
      Status: s.status,
      Valor: formatCurrency(s.valorTotal),
      Data: formatDate(s.dataSolicitacao)
    }));
    exportToCSV(data, 'relatorio_geral');
    showToast('Relatório exportado!', 'success');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
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
                Painel Administrativo
              </h1>
              <p className="text-gray-500">Visão geral da plataforma e métricas de negócio.</p>
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
              onClick={handleExportCSV}
              leftIcon={<Download size={16} />}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* STATS CARDS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Users size={20} />
                </div>
                <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                  <ArrowUpRight size={14} /> +12%
                </span>
              </div>
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Total Utilizadores</p>
              <h3 className="text-3xl font-black">{stats.totalUsers}</h3>
              <div className="flex gap-4 mt-2 text-xs">
                <span>👤 {stats.totalClientes} clientes</span>
                <span>🔧 {stats.totalPrestadores} prestadores</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Briefcase size={20} />
                </div>
                <span className="text-xs font-bold text-white/80 flex items-center gap-1">
                  <ArrowUpRight size={14} /> +8%
                </span>
              </div>
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Solicitações</p>
              <h3 className="text-3xl font-black">{stats.totalSolicitacoes}</h3>
              <div className="flex gap-4 mt-2 text-xs">
                <span>⏳ {stats.solicitacoesPendentes} pendentes</span>
                <span>✅ {stats.solicitacoesConcluidas} concluídas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden relative border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <ArrowUpRight size={14} /> +15%
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Valor Movimentado</p>
              <h3 className="text-3xl font-black text-primary">{formatCurrency(stats.valorTotalMovimentado)}</h3>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-accent">💰 Plataforma: {formatCurrency(stats.valorPlataforma)}</span>
                <span className="text-green-600">👷 Prestadores: {formatCurrency(stats.valorPrestadores)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden relative border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Wallet size={20} />
                </div>
                <span className="text-xs font-bold text-purple-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {stats.saquesPendentes} pendentes
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Saques Pendentes</p>
              <h3 className="text-3xl font-black text-primary">{formatCurrency(stats.valorSaquesPendentes)}</h3>
              <div className="flex gap-4 mt-2 text-xs">
                <span>📤 {stats.saquesPendentes} aguardando</span>
                <span>✅ {stats.saquesAprovados} aprovados</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* GRÁFICOS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary">Desempenho Mensal</h3>
              <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none">
                <option>2026</option>
                <option>2025</option>
              </select>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="solicitacoes" name="Solicitações" fill="#0A1D56" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="concluidas" name="Concluídas" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="receita" name="Receita (MT)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Distribuição por Categoria</h3>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        {/* PRESTADORES PENDENTES */}
        {/* ======================================== */}
        {(stats.prestadoresPendentes > 0 || stats.prestadoresDocumentosPendentes > 0) && (
          <Card className="mb-8 border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ShieldAlert size={20} className="text-accent" />
                Prestadores Pendentes
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/prestadores')}>
                Ver todos <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.prestadoresPendentes > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-yellow-700">Aguardando Aprovação</span>
                      <span className="text-2xl font-black text-yellow-700">{stats.prestadoresPendentes}</span>
                    </div>
                    <p className="text-sm text-yellow-600 mb-3">
                      Prestadores aguardando análise da central.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/admin/prestadores?status=pendente')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Analisar Agora
                    </Button>
                  </div>
                )}

                {stats.prestadoresDocumentosPendentes > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-orange-700">Documentos Pendentes</span>
                      <span className="text-2xl font-black text-orange-700">{stats.prestadoresDocumentosPendentes}</span>
                    </div>
                    <p className="text-sm text-orange-600 mb-3">
                      Prestadores que precisam enviar documentos.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/admin/prestadores?status=documentos')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Verificar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ======================================== */}
        {/* TABELAS RECENTES */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitações Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary">Solicitações Recentes</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/relatorios')}>
                Ver todos <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentSolicitacoes.map((sol) => (
                  <div key={sol.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        sol.status === 'concluido' ? 'bg-green-500' :
                        sol.status === 'em_andamento' ? 'bg-blue-500' :
                        sol.status === 'buscando_prestador' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-primary">{sol.servico}</p>
                        <p className="text-xs text-gray-500">{sol.clienteNome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatCurrency(sol.valorTotal)}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(sol.dataSolicitacao)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saques Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary">Saques Recentes</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pagamentos')}>
                Ver todos <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentSaques.map((saque) => (
                  <div key={saque.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        saque.status === 'aprovado' ? 'bg-green-500' :
                        saque.status === 'pendente' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-primary">{saque.prestadorNome}</p>
                        <p className="text-xs text-gray-500">
                          {saque.status === 'aprovado' ? 'Aprovado' :
                           saque.status === 'pendente' ? 'Pendente' : 'Rejeitado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatCurrency(saque.valor)}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(saque.dataSolicitacao)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* AÇÕES RÁPIDAS */}
        {/* ======================================== */}
        <div className="mt-8">
          <h3 className="text-xl font-black text-primary mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent" 
              leftIcon={<Users className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/usuarios')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Gerir Utilizadores
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent" 
              leftIcon={<ShieldAlert className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/prestadores')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Validar Prestadores
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent" 
              leftIcon={<Wallet className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/pagamentos')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Saques Pendentes ({stats.saquesPendentes})
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent" 
              leftIcon={<FileText className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/relatorios')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Relatórios Mensais
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
