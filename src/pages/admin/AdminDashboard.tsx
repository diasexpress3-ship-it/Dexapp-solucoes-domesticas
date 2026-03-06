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
    { name: 'Jan', receita: 4000 },
    { name: 'Fev', receita: 3000 },
    { name: 'Mar', receita: 2000 },
    { name: 'Abr', receita: 1500 },
    { name: 'Mai', receita: 1000 },
    { name: 'Jun', receita: 500 },
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation com botão Início */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
            title="Ir para Landing Page"
          >
            <Home className="w-4 h-4" /> Início
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Admin Dashboard</span>
        </div>

        {/* Header com saudação e botões */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Voltar à página anterior"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Ir para Landing Page"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary">
                Olá, {user?.nome?.split(' ')[0] || 'Administrador'}!
              </h1>
              <p className="text-gray-500">Bem-vindo ao seu painel de controle.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              leftIcon={<Settings className="w-5 h-5" />} 
              onClick={() => navigate('/admin/configuracoes')}
              className="cursor-pointer"
            >
              Configurações
            </Button>
            <Button 
              leftIcon={<UserPlus className="w-5 h-5" />} 
              onClick={() => navigate('/admin/usuarios/novo')}
              className="bg-accent hover:bg-accent/90 text-white cursor-pointer"
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
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent cursor-pointer" 
              leftIcon={<Users className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/usuarios')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Gerir Utilizadores
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent cursor-pointer" 
              leftIcon={<ShieldAlert className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/prestadores')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Validar Prestadores
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent cursor-pointer" 
              leftIcon={<Wallet className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/pagamentos')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Confirmar Pagamentos
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start h-16 px-6 hover:bg-gray-50 hover:border-accent cursor-pointer" 
              leftIcon={<FileText className="w-5 h-5 text-accent" />} 
              onClick={() => navigate('/admin/relatorios')}
              rightIcon={<ChevronRight size={16} className="text-gray-400" />}
            >
              Relatórios Mensais
            </Button>
          </div>
        </div>

        {/* Desempenho Financeiro */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-black text-primary">Desempenho Financeiro</h3>
            <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none">
              <option>Últimos 6 meses</option>
              <option>Últimos 12 meses</option>
            </select>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `MT ${value}`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="receita" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Botão flutuante para Landing Page */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
            title="Ir para Landing Page"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
