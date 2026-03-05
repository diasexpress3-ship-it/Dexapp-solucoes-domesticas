import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Wrench, Wallet, ShieldAlert,
  TrendingUp, UserPlus, Settings, FileText,
  Search, Filter, Edit, Ban, CheckCircle, Download, RefreshCw,
  Home, ArrowLeft
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton, ListSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { UserEditModal } from '../../components/admin/UserEditModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSolicitacoes: 0,
    faturamento: 0,
    pendentes: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<{ id: string; action: 'ban' | 'delete' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // Dados do gráfico
  const chartData = [
    { name: 'Jan', receita: 4000 },
    { name: 'Fev', receita: 3000 },
    { name: 'Mar', receita: 2000 },
    { name: 'Abr', receita: 2780 },
    { name: 'Mai', receita: 1890 },
    { name: 'Jun', receita: 2390 },
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(recentUsers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(recentUsers.filter(u =>
        u.nome?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, recentUsers]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const solicitacoesSnap = await getDocs(collection(db, 'solicitacoes'));
      const pagamentosSnap = await getDocs(query(collection(db, 'pagamentos'), where('status', '==', 'confirmado')));
      const pendentesSnap = await getDocs(query(collection(db, 'users'), where('profile', '==', 'prestador'), where('status', '==', 'pendente')));

      let totalFaturamento = 0;
      pagamentosSnap.forEach(doc => totalFaturamento += doc.data().valor || 0);

      setStats({
        totalUsers: usersSnap.size,
        totalSolicitacoes: solicitacoesSnap.size,
        faturamento: totalFaturamento,
        pendentes: pendentesSnap.size
      });

      const recentQuery = query(collection(db, 'users'), orderBy('dataCadastro', 'desc'), limit(5));
      const recentSnap = await getDocs(recentQuery);
      setRecentUsers(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error fetching admin data:", error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!userToAction) return;
    try {
      await updateDoc(doc(db, 'users', userToAction.id), { status: 'bloqueado' });
      setRecentUsers(prev => prev.map(u => u.id === userToAction.id ? { ...u, status: 'bloqueado' } : u));
      showToast('Utilizador bloqueado com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao bloquear utilizador', 'error');
    } finally {
      setConfirmModalOpen(false);
      setUserToAction(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToAction) return;
    try {
      await deleteDoc(doc(db, 'users', userToAction.id));
      setRecentUsers(prev => prev.filter(u => u.id !== userToAction.id));
      showToast('Utilizador removido com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao remover utilizador', 'error');
    } finally {
      setConfirmModalOpen(false);
      setUserToAction(null);
    }
  };

  const handleExportUsers = () => {
    try {
      const csvContent = [
        ['Nome', 'Email', 'Perfil', 'Status', 'Data Cadastro'],
        ...recentUsers.map(u => [u.nome || '', u.email || '', u.profile || '', u.status || '', u.dataCadastro || ''])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Exportação iniciada', 'success');
    } catch (error) {
      showToast('Erro ao exportar dados', 'error');
    }
  };

  const statCards = [
    { label: 'Total Utilizadores', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Solicitações', value: stats.totalSolicitacoes, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Faturamento', value: formatCurrency(stats.faturamento), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Prestadores Pendentes', value: stats.pendentes, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-accent">
          <Home className="w-4 h-4" /> Início
        </button>
        <span>/</span>
        <span className="text-primary font-bold">Admin Dashboard</span>
      </div>

      {/* Header com saudação personalizada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar ao Início"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-primary">
              Olá, {user?.nome?.split(' ')[0] || 'Administrador'}! 🛡️
            </h1>
            <p className="text-gray-500 font-medium">Bem-vindo ao seu painel de controle.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Settings className="w-5 h-5" />} onClick={() => navigate('/admin/configuracoes')}>
            Configurações
          </Button>
          <Button leftIcon={<UserPlus className="w-5 h-5" />} onClick={() => navigate('/admin/usuarios/novo')}>
            Novo Admin
          </Button>
          <Button variant="outline" leftIcon={<RefreshCw className="w-5 h-5" />} onClick={fetchAdminData}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-primary">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráfico e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-primary">Desempenho Financeiro</h3>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este Ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="receita" fill="#FF7A00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ações Rápidas */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-primary">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-4">
            <Button fullWidth variant="outline" className="justify-start h-16 px-6" leftIcon={<Users className="w-5 h-5" />} onClick={() => navigate('/admin/usuarios')}>
              Gerir Utilizadores
            </Button>
            <Button fullWidth variant="outline" className="justify-start h-16 px-6" leftIcon={<ShieldAlert className="w-5 h-5" />} onClick={() => navigate('/admin/prestadores')}>
              Validar Prestadores
            </Button>
            <Button fullWidth variant="outline" className="justify-start h-16 px-6" leftIcon={<Wallet className="w-5 h-5" />} onClick={() => navigate('/admin/pagamentos')}>
              Confirmar Pagamentos
            </Button>
            <Button fullWidth variant="outline" className="justify-start h-16 px-6" leftIcon={<FileText className="w-5 h-5" />} onClick={() => navigate('/admin/relatorios')}>
              Relatórios Mensais
            </Button>
          </div>
        </div>
      </div>

      {/* Últimos Utilizadores */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-xl font-black text-primary">Últimos Utilizadores</h3>
          <div className="flex gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportUsers}>
              Exportar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/usuarios')}>
              Ver Todos
            </Button>
          </div>
        </div>

        {/* Tabela de usuários recentes */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nome</th>
                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Perfil</th>
                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-4">
                    <ListSkeleton count={5} />
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-primary">
                        {u.nome?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">{u.nome}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.profile === 'admin' ? 'bg-purple-50 text-purple-600' :
                      u.profile === 'prestador' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {u.profile}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === 'ativo' ? 'bg-emerald-500' : u.status === 'bloqueado' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-bold text-gray-600 capitalize">{u.status}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 hover:bg-white rounded-lg shadow-sm text-blue-600"
                        onClick={() => setSelectedUser(u)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-white rounded-lg shadow-sm text-amber-600"
                        onClick={() => {
                          setUserToAction({ id: u.id, action: 'ban' });
                          setConfirmModalOpen(true);
                        }}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-white rounded-lg shadow-sm text-rose-600"
                        onClick={() => {
                          setUserToAction({ id: u.id, action: 'delete' });
                          setConfirmModalOpen(true);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modais */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={userToAction?.action === 'ban' ? handleBanUser : handleDeleteUser}
        title={userToAction?.action === 'ban' ? 'Bloquear Utilizador' : 'Remover Utilizador'}
        message={`Tem certeza que deseja ${userToAction?.action === 'ban' ? 'bloquear' : 'remover'} este utilizador?`}
        confirmText={userToAction?.action === 'ban' ? 'Bloquear' : 'Remover'}
        confirmVariant={userToAction?.action === 'ban' ? 'warning' : 'danger'}
      />

      <UserEditModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onUpdate={(updated) => {
          setRecentUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
