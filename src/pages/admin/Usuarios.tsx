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
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Star,
  Award,
  Wrench,
  FileText,
  Building,
  Calendar,
  TrendingUp,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Copy,
  Check,
  UserCog,
  UserPlus,
  UserMinus,
  Briefcase,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/utils';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  profile: 'cliente' | 'prestador' | 'central' | 'admin';
  status: 'activo' | 'inactivo' | 'pendente' | 'pendente_documentos' | 'rejeitado';
  dataCadastro: Date;
  ultimoAcesso?: Date;
  // Cliente
  endereco?: string;
  cidade?: string;
  // Prestador
  especialidade?: string;
  categoria?: string;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  valorHora?: number;
  // Central/Admin
  nivel?: string;
  departamento?: string;
}

interface UsuarioStats {
  total: number;
  clientes: number;
  prestadores: number;
  central: number;
  admin: number;
  ativos: number;
  pendentes: number;
  inativos: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Usuarios() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Usuario>>({});
  
  const [stats, setStats] = useState<UsuarioStats>({
    total: 0,
    clientes: 0,
    prestadores: 0,
    central: 0,
    admin: 0,
    ativos: 0,
    pendentes: 0,
    inativos: 0
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
  // BUSCAR USUÁRIOS
  // ============================================
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('dataCadastro', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate?.() || new Date(doc.data().dataCadastro),
        ultimoAcesso: doc.data().ultimoAcesso?.toDate?.() || null
      } as Usuario));
      
      setUsuarios(docs);
      
      // Calcular estatísticas
      const clientes = docs.filter(u => u.profile === 'cliente').length;
      const prestadores = docs.filter(u => u.profile === 'prestador').length;
      const central = docs.filter(u => u.profile === 'central').length;
      const admin = docs.filter(u => u.profile === 'admin').length;
      const ativos = docs.filter(u => u.status === 'activo').length;
      const pendentes = docs.filter(u => ['pendente', 'pendente_documentos'].includes(u.status)).length;
      const inativos = docs.filter(u => u.status === 'inactivo').length;

      setStats({
        total: docs.length,
        clientes,
        prestadores,
        central,
        admin,
        ativos,
        pendentes,
        inativos
      });

      filterUsuarios(filterProfile, filterStatus, docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // FILTRAR USUÁRIOS
  // ============================================
  useEffect(() => {
    filterUsuarios(filterProfile, filterStatus, usuarios);
  }, [searchTerm, usuarios, filterProfile, filterStatus]);

  const filterUsuarios = (profile: string, status: string, docs = usuarios) => {
    let filtered = docs;

    // Filtro por perfil
    if (profile !== 'todos') {
      filtered = filtered.filter(u => u.profile === profile);
    }

    // Filtro por status
    if (status !== 'todos') {
      if (status === 'pendentes') {
        filtered = filtered.filter(u => ['pendente', 'pendente_documentos'].includes(u.status));
      } else {
        filtered = filtered.filter(u => u.status === status);
      }
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.telefone.includes(searchTerm) ||
        u.profile.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsuarios(filtered);
  };

  const handleProfileChange = (profile: string) => {
    setFilterProfile(profile);
    filterUsuarios(profile, filterStatus);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    filterUsuarios(filterProfile, status);
  };

  // ============================================
  // FUNÇÕES CRUD
  // ============================================
  const handleViewDetails = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowDetailsModal(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditForm({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      status: usuario.status,
      ...(usuario.profile === 'cliente' && {
        endereco: usuario.endereco,
        cidade: usuario.cidade
      }),
      ...(usuario.profile === 'prestador' && {
        especialidade: usuario.especialidade,
        valorHora: usuario.valorHora
      }),
      ...(usuario.profile === 'central' && {
        nivel: usuario.nivel,
        departamento: usuario.departamento
      })
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUsuario) return;
    
    setActionLoading(selectedUsuario.id);
    try {
      await updateDoc(doc(db, 'users', selectedUsuario.id), editForm);
      showToast('Usuário atualizado com sucesso!', 'success');
      setShowEditModal(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToast('Erro ao atualizar usuário', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    if (!window.confirm(`Tem certeza que deseja ${newStatus === 'activo' ? 'ativar' : 'desativar'} este usuário?`)) return;
    
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), {
        status: newStatus
      });
      showToast(`Usuário ${newStatus === 'activo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showToast('Erro ao alterar status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este usuário?')) return;
    
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      showToast('Usuário excluído', 'success');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showToast('Erro ao excluir usuário', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleExportCSV = () => {
    const data = filteredUsuarios.map(u => ({
      Nome: u.nome,
      Email: u.email,
      Telefone: u.telefone,
      Perfil: u.profile,
      Status: u.status,
      'Data Cadastro': formatDate(u.dataCadastro),
      'Último Acesso': u.ultimoAcesso ? formatDate(u.ultimoAcesso) : 'Nunca',
      Cidade: u.cidade || 'N/A',
      ...(u.profile === 'prestador' && {
        Especialidade: u.especialidade || 'N/A',
        Avaliação: u.avaliacaoMedia?.toFixed(1) || 'N/A'
      })
    }));
    exportToCSV(data, `usuarios_${new Date().toISOString().split('T')[0]}`);
    showToast('Lista exportada com sucesso!', 'success');
  };

  const [copiado, setCopiado] = useState<string | null>(null);

  // ============================================
  // HELPERS
  // ============================================
  const getProfileIcon = (profile: string) => {
    switch (profile) {
      case 'cliente': return <UserCheck size={14} className="mr-1" />;
      case 'prestador': return <Wrench size={14} className="mr-1" />;
      case 'central': return <Building size={14} className="mr-1" />;
      case 'admin': return <Shield size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'cliente': return 'bg-blue-100 text-blue-700';
      case 'prestador': return 'bg-accent/10 text-accent';
      case 'central': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      case 'pendente':
      case 'pendente_documentos': return 'bg-yellow-100 text-yellow-700';
      case 'rejeitado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ============================================
  // RENDER
  // ============================================
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
                <Users size={32} className="text-accent" />
                Gestão de Usuários
              </h1>
              <p className="text-gray-500">Gerencie todos os usuários da plataforma.</p>
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
        {/* STATS CARDS */}
        {/* ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <Card className="bg-primary text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Total</p>
              <h3 className="text-2xl font-black">{stats.total}</h3>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Clientes</p>
              <h3 className="text-2xl font-black">{stats.clientes}</h3>
            </CardContent>
          </Card>

          <Card className="bg-accent text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Prestadores</p>
              <h3 className="text-2xl font-black">{stats.prestadores}</h3>
            </CardContent>
          </Card>

          <Card className="bg-purple-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Central</p>
              <h3 className="text-2xl font-black">{stats.central}</h3>
            </CardContent>
          </Card>

          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Admin</p>
              <h3 className="text-2xl font-black">{stats.admin}</h3>
            </CardContent>
          </Card>

          <Card className="bg-green-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Ativos</p>
              <h3 className="text-2xl font-black">{stats.ativos}</h3>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Pendentes</p>
              <h3 className="text-2xl font-black">{stats.pendentes}</h3>
            </CardContent>
          </Card>

          <Card className="bg-gray-600 text-white">
            <CardContent className="p-4">
              <p className="text-xs font-bold opacity-60 uppercase">Inativos</p>
              <h3 className="text-2xl font-black">{stats.inativos}</h3>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* FILTROS */}
        {/* ======================================== */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por nome, email, telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterProfile}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
                >
                  <option value="todos">Todos perfis</option>
                  <option value="cliente">Clientes</option>
                  <option value="prestador">Prestadores</option>
                  <option value="central">Central</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
                >
                  <option value="todos">Todos status</option>
                  <option value="activo">Ativos</option>
                  <option value="pendentes">Pendentes</option>
                  <option value="inactivo">Inativos</option>
                  <option value="rejeitado">Rejeitados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================== */}
        {/* LISTA DE USUÁRIOS */}
        {/* ======================================== */}
        <div className="space-y-4">
          {filteredUsuarios.length > 0 ? (
            filteredUsuarios.map((usuario) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleViewDetails(usuario)}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          usuario.profile === 'cliente' ? 'bg-blue-100 text-blue-600' :
                          usuario.profile === 'prestador' ? 'bg-accent/10 text-accent' :
                          usuario.profile === 'central' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {usuario.profile === 'cliente' && <UserCheck size={24} />}
                          {usuario.profile === 'prestador' && <Wrench size={24} />}
                          {usuario.profile === 'central' && <Building size={24} />}
                          {usuario.profile === 'admin' && <Shield size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-primary">{usuario.nome}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center ${getProfileColor(usuario.profile)}`}>
                              {getProfileIcon(usuario.profile)}
                              {usuario.profile === 'cliente' ? 'Cliente' :
                               usuario.profile === 'prestador' ? 'Prestador' :
                               usuario.profile === 'central' ? 'Central' : 'Admin'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(usuario.status)}`}>
                              {usuario.status === 'activo' ? 'Ativo' :
                               usuario.status === 'inactivo' ? 'Inativo' :
                               usuario.status === 'pendente' ? 'Pendente' :
                               usuario.status === 'pendente_documentos' ? 'Docs Pend' : 'Rejeitado'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {usuario.email}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {usuario.telefone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-gray-500">Cadastro: {formatDate(usuario.dataCadastro)}</span>
                            {usuario.ultimoAcesso && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-gray-500">Último acesso: {formatDate(usuario.ultimoAcesso)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(usuario);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(usuario);
                          }}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Edit size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(usuario.id, usuario.status);
                          }}
                          disabled={actionLoading === usuario.id}
                          className={usuario.status === 'activo' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
                        >
                          {actionLoading === usuario.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : usuario.status === 'activo' ? (
                            <UserMinus size={18} />
                          ) : (
                            <UserPlus size={18} />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Tem certeza que deseja excluir permanentemente este usuário?')) {
                              handleDelete(usuario.id);
                            }
                          }}
                          disabled={actionLoading === usuario.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === usuario.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </Button>
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
                  <Users size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm 
                    ? 'Tente ajustar seus filtros ou termos de busca.'
                    : 'Nenhum usuário cadastrado até o momento.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ======================================== */}
      {/* MODAL DE DETALHES */}
      {/* ======================================== */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalhes do Usuário" size="lg">
        {selectedUsuario && (
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedUsuario.profile === 'cliente' ? 'bg-blue-100 text-blue-600' :
                  selectedUsuario.profile === 'prestador' ? 'bg-accent/10 text-accent' :
                  selectedUsuario.profile === 'central' ? 'bg-purple-100 text-purple-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {selectedUsuario.profile === 'cliente' && <UserCheck size={32} />}
                  {selectedUsuario.profile === 'prestador' && <Wrench size={32} />}
                  {selectedUsuario.profile === 'central' && <Building size={32} />}
                  {selectedUsuario.profile === 'admin' && <Shield size={32} />}
                </div>
                <div>
                  <h3 className="font-bold text-primary text-xl">{selectedUsuario.nome}</h3>
                  <p className="text-sm text-gray-500">{selectedUsuario.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${getProfileColor(selectedUsuario.profile)}`}>
                  {getProfileIcon(selectedUsuario.profile)}
                  {selectedUsuario.profile === 'cliente' ? 'Cliente' :
                   selectedUsuario.profile === 'prestador' ? 'Prestador' :
                   selectedUsuario.profile === 'central' ? 'Central' : 'Admin'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(selectedUsuario.status)}`}>
                  {selectedUsuario.status === 'activo' ? 'Ativo' :
                   selectedUsuario.status === 'inactivo' ? 'Inativo' :
                   selectedUsuario.status === 'pendente' ? 'Pendente' :
                   selectedUsuario.status === 'pendente_documentos' ? 'Docs Pendentes' : 'Rejeitado'}
                </span>
              </div>
            </div>

            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="font-bold text-primary">{selectedUsuario.telefone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Cadastro</p>
                <p className="font-bold text-primary">{formatDate(selectedUsuario.dataCadastro)}</p>
              </div>
              {selectedUsuario.ultimoAcesso && (
                <div>
                  <p className="text-xs text-gray-500">Último Acesso</p>
                  <p className="font-bold text-primary">{formatDate(selectedUsuario.ultimoAcesso)}</p>
                </div>
              )}
            </div>

            {/* Informações específicas por perfil */}
            {selectedUsuario.profile === 'cliente' && (
              <div>
                <h4 className="font-bold text-primary mb-3">Dados do Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Endereço</p>
                    <p className="font-bold text-primary">{selectedUsuario.endereco || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cidade</p>
                    <p className="font-bold text-primary">{selectedUsuario.cidade || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedUsuario.profile === 'prestador' && (
              <div>
                <h4 className="font-bold text-primary mb-3">Dados do Prestador</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Especialidade</p>
                    <p className="font-bold text-primary">{selectedUsuario.especialidade || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="font-bold text-primary">{selectedUsuario.categoria || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor Hora</p>
                    <p className="font-bold text-primary">{selectedUsuario.valorHora ? formatCurrency(selectedUsuario.valorHora) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avaliação</p>
                    <p className="font-bold text-primary">{selectedUsuario.avaliacaoMedia?.toFixed(1) || 'N/A'} ({selectedUsuario.totalAvaliacoes || 0})</p>
                  </div>
                </div>
              </div>
            )}

            {(selectedUsuario.profile === 'central' || selectedUsuario.profile === 'admin') && (
              <div>
                <h4 className="font-bold text-primary mb-3">Dados de Acesso</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nível</p>
                    <p className="font-bold text-primary">{selectedUsuario.nivel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Departamento</p>
                    <p className="font-bold text-primary">{selectedUsuario.departamento || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedUsuario);
                }}
                className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
              >
                Editar
              </Button>
              <Button
                onClick={() => {
                  handleToggleStatus(selectedUsuario.id, selectedUsuario.status);
                  setShowDetailsModal(false);
                }}
                className={`flex-1 ${
                  selectedUsuario.status === 'activo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {selectedUsuario.status === 'activo' ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE EDIÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Usuário" size="lg">
        {selectedUsuario && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Nome</label>
                <Input
                  value={editForm.nome || ''}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Telefone</label>
                <Input
                  value={editForm.telefone || ''}
                  onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                  placeholder="84 123 4567"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                >
                  <option value="activo">Ativo</option>
                  <option value="inactivo">Inativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="pendente_documentos">Documentos Pendentes</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>

              {selectedUsuario.profile === 'cliente' && (
                <>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Endereço</label>
                    <Input
                      value={editForm.endereco || ''}
                      onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })}
                      placeholder="Bairro, Quarteirão, Casa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Cidade</label>
                    <Input
                      value={editForm.cidade || ''}
                      onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })}
                      placeholder="Cidade"
                    />
                  </div>
                </>
              )}

              {selectedUsuario.profile === 'prestador' && (
                <>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Especialidade</label>
                    <Input
                      value={editForm.especialidade || ''}
                      onChange={(e) => setEditForm({ ...editForm, especialidade: e.target.value })}
                      placeholder="Especialidade"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Valor Hora (MT)</label>
                    <Input
                      type="number"
                      value={editForm.valorHora || ''}
                      onChange={(e) => setEditForm({ ...editForm, valorHora: Number(e.target.value) })}
                      placeholder="500"
                    />
                  </div>
                </>
              )}

              {selectedUsuario.profile === 'central' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Nível</label>
                    <Input
                      value={editForm.nivel || ''}
                      onChange={(e) => setEditForm({ ...editForm, nivel: e.target.value })}
                      placeholder="Operador, Supervisor, etc"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Departamento</label>
                    <Input
                      value={editForm.departamento || ''}
                      onChange={(e) => setEditForm({ ...editForm, departamento: e.target.value })}
                      placeholder="Atendimento, Financeiro, etc"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={actionLoading === selectedUsuario.id}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                {actionLoading === selectedUsuario.id ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
