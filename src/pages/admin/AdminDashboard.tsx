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
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
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
  Area
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeServices: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPayments, setRecentPayments] = useState<Pagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Users stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        totalProviders: users.filter(u => u.role === 'prestador').length
      }));
      setRecentUsers(users.sort((a, b) => {
        const da = a.dataCadastro instanceof Date ? a.dataCadastro : (a.dataCadastro as any)?.toDate?.() || new Date((a.dataCadastro as any).seconds * 1000);
        const db = b.dataCadastro instanceof Date ? b.dataCadastro : (b.dataCadastro as any)?.toDate?.() || new Date((b.dataCadastro as any).seconds * 1000);
        return db.getTime() - da.getTime();
      }).slice(0, 5));
    });

    // Payments stats
    const unsubPayments = onSnapshot(collection(db, 'pagamentos'), (snap) => {
      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() } as Pagamento));
      setStats(prev => ({
        ...prev,
        totalRevenue: payments.filter(p => p.status === 'confirmado').reduce((acc, curr) => acc + curr.valor, 0),
        pendingPayments: payments.filter(p => p.status === 'pendente').length
      }));
      setRecentPayments(payments.sort((a, b) => {
        const da = a.data instanceof Date ? a.data : (a.data as any)?.toDate?.() || new Date((a.data as any).seconds * 1000);
        const db = b.data instanceof Date ? b.data : (b.data as any)?.toDate?.() || new Date((b.data as any).seconds * 1000);
        return db.getTime() - da.getTime();
      }).slice(0, 5));
    });

    // Services stats
    const unsubServices = onSnapshot(collection(db, 'solicitacoes'), (snap) => {
      const services = snap.docs.map(d => ({ id: d.id, ...d.data() } as Solicitacao));
      setStats(prev => ({
        ...prev,
        activeServices: services.filter(s => s.status === 'em_andamento').length
      }));
      setIsLoading(false);
    });

    return () => {
      unsubUsers();
      unsubPayments();
      unsubServices();
    };
  }, []);

  const chartData = [
    { name: 'Seg', revenue: 4000 },
    { name: 'Ter', revenue: 3000 },
    { name: 'Qua', revenue: 2000 },
    { name: 'Qui', revenue: 2780 },
    { name: 'Sex', revenue: 1890 },
    { name: 'Sáb', revenue: 2390 },
    { name: 'Dom', revenue: 3490 },
  ];

  const handleExportCSV = () => {
    const data = recentUsers.map(u => ({
      Nome: u.nome,
      Email: u.email,
      Telefone: u.telefone,
      Perfil: u.role,
      Status: u.status
    }));
    exportToCSV(data, 'usuarios_recentes');
    showToast('Exportação iniciada!', 'success');
  };

  const handleExportRelatorio = () => {
    showToast('A gerar relatório semanal...', 'info');
    setTimeout(() => {
      showToast('Relatório gerado com sucesso!', 'success');
    }, 1500);
  };

  const handleGoToLanding = () => {
    navigate('/'); // Vai para Landing Page
  };

  const handleNewAdmin = () => {
    navigate('/admin/usuarios/novo'); // Vai para o formulário de novo admin
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation com botão Início funcional */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={handleGoToLanding}
            className="flex items-center gap-1 hover:text-accent transition-colors"
            title="Ir para Landing Page"
          >
            <Home className="w-4 h-4" /> Início
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Admin Dashboard</span>
        </div>

        {/* Header com botões de navegação e ação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voltar à página anterior"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={handleGoToLanding}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ir para Landing Page"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <TrendingUp size={32} className="text-accent" />
                Painel Administrativo
              </h1>
              <p className="text-gray-500">Visão geral do desempenho da plataforma.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              leftIcon={<Settings className="w-5 h-5" />} 
              onClick={() => navigate('/admin/configuracoes')}
            >
              Configurações
            </Button>
            <Button 
              leftIcon={<UserPlus className="w-5 h-5" />} 
              onClick={handleNewAdmin}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              Novo Admin
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
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
                  <ArrowUpRight size={14} /> +5%
                </span>
              </div>
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Prestadores</p>
              <h3 className="text-3xl font-black">{stats.totalProviders}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden relative border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <ArrowUpRight size={14} /> +20%
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Receita Total</p>
              <h3 className="text-3xl font-black text-primary">{formatCurrency(stats.totalRevenue)}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white overflow-hidden relative border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {stats.pendingPayments} pendentes
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Serviços Ativos</p>
              <h3 className="text-3xl font-black text-primary">{stats.activeServices}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
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
              Confirmar Pagamentos
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-black text-primary">Volume de Transações</h3>
              <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }}
                      tickFormatter={(value) => `MT ${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#FF7A00" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-black text-primary">Novos Utilizadores</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-accent font-bold"
                onClick={() => navigate('/admin/usuarios')}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/usuarios')}>
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className="w-full h-full rounded-xl object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.nome.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{u.nome}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{u.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold">{formatDate(u.dataCadastro)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-black text-primary">Últimas Transações</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/pagamentos')}
            >
              Ver Histórico Completo
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID / Data</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/pagamentos')}>
                      <td className="p-4">
                        <p className="text-xs font-bold text-primary">#{p.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(p.data)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-primary">{p.clienteNome || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400">{p.metodo}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-black text-primary">{formatCurrency(p.valor)}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          p.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                          p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-accent font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin/pagamentos');
                          }}
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Botão flutuante para Landing Page */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={handleGoToLanding}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Ir para Landing Page"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
