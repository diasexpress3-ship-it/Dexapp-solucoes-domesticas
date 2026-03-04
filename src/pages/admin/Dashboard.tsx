import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { collection, query, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrestadores: 0,
    totalSolicitacoes: 0,
    totalRevenue: 0,
    pendingPrestadores: 0,
    activeServices: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time listeners for counts
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        totalUsers: snap.size,
        totalPrestadores: users.filter(u => u.profile === 'prestador').length,
        pendingPrestadores: users.filter(u => u.profile === 'prestador' && u.status === 'pending').length,
      }));
    });

    const unsubSolicitacoes = onSnapshot(collection(db, 'solicitacoes'), (snap) => {
      const docs = snap.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        totalSolicitacoes: snap.size,
        activeServices: docs.filter(d => d.status === 'in_progress' || d.status === 'accepted').length,
        totalRevenue: docs.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0),
      }));
    });

    // Mock chart data
    setChartData([
      { name: 'Jan', value: 4000 },
      { name: 'Fev', value: 3000 },
      { name: 'Mar', value: 2000 },
      { name: 'Abr', value: 2780 },
      { name: 'Mai', value: 1890 },
      { name: 'Jun', value: 2390 },
      { name: 'Jul', value: 3490 },
    ]);

    setIsLoading(false);

    return () => {
      unsubUsers();
      unsubSolicitacoes();
    };
  }, []);

  const statCards = [
    { label: 'Total Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', up: true },
    { label: 'Solicitações', value: stats.totalSolicitacoes, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+5%', up: true },
    { label: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+18%', up: true },
    { label: 'Prestadores Pendentes', value: stats.pendingPrestadores, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', trend: '-2%', up: false },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-primary">Painel Administrativo</h1>
          <p className="text-gray-500">Visão geral do desempenho da plataforma DEXAPP.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-primary">Crescimento de Receita</h3>
              <select className="text-xs font-bold bg-gray-50 border-none rounded-lg px-2 py-1 outline-none">
                <option>Últimos 7 meses</option>
                <option>Último ano</option>
              </select>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A1D56" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0A1D56" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0A1D56" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions / Alerts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-bold text-primary">Alertas do Sistema</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {stats.pendingPrestadores > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-bold text-red-700">{stats.pendingPrestadores} Prestadores Pendentes</p>
                      <p className="text-xs text-red-600/70">Novos cadastros aguardando aprovação.</p>
                      <button className="text-xs font-black uppercase text-red-700 mt-2 hover:underline">Ver Todos</button>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <Clock className="text-blue-500 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-blue-700">{stats.activeServices} Serviços Ativos</p>
                    <p className="text-xs text-blue-600/70">Trabalhos sendo realizados agora.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold text-primary">Atalhos Rápidos</h3>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-3">
                <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-all group">
                  <Users size={20} className="text-primary group-hover:text-white" />
                  <span className="text-[10px] font-bold uppercase">Usuários</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-all group">
                  <DollarSign size={20} className="text-primary group-hover:text-white" />
                  <span className="text-[10px] font-bold uppercase">Financeiro</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-all group">
                  <TrendingUp size={20} className="text-primary group-hover:text-white" />
                  <span className="text-[10px] font-bold uppercase">Relatórios</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-all group">
                  <CheckCircle2 size={20} className="text-primary group-hover:text-white" />
                  <span className="text-[10px] font-bold uppercase">Aprovações</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
