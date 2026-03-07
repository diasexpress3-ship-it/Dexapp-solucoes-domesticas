import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft,
  Home,
  LogOut,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  Building,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Briefcase,
  Award,
  Users,
  UserCheck,
  UserCog,
  UserMinus,
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  Camera,
  Image,
  FileText,
  IdCard,
  Home as HomeIcon,
  Building2,
  Landmark,
  Globe,
  Map,
  Navigation,
  Locate,
  Plus,
  Minus,
  Trash2,
  X,
  Info,
  Percent,
  TrendingUp,
  Wallet,
  CreditCard,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Printer,
  Scanner,
  Watch,
  Clock,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  Video,
  Mic,
  Headphones,
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
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Permissoes {
  usuarios: boolean;
  prestadores: boolean;
  solicitacoes: boolean;
  pagamentos: boolean;
  relatorios: boolean;
  configuracoes: boolean;
  logs: boolean;
  backups: boolean;
  metricas: boolean;
}

interface NovoAdminForm {
  // Dados básicos
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
  
  // Dados profissionais
  nivel: 'master' | 'supervisor' | 'operador' | 'analista' | 'gerente';
  departamento: string;
  cargo: string;
  supervisor?: string;
  dataContratacao?: string;
  
  // Contato
  telefoneAlternativo?: string;
  ramal?: string;
  
  // Endereço
  endereco?: string;
  cidade?: string;
  
  // Documentos
  documentoIdentidade?: string;
  
  // Permissões
  permissoes: Permissoes;
  
  // Configurações
  doisFatores?: boolean;
  ipRestrito?: string[];
  horarioAcessoInicio?: string;
  horarioAcessoFim?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function NovoAdmin() {
  const navigate = useNavigate();
  const { user, logout, register } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [form, setForm] = useState<NovoAdminForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    nivel: 'operador',
    departamento: 'Administração',
    cargo: 'Administrador de Sistemas',
    supervisor: '',
    dataContratacao: '',
    telefoneAlternativo: '',
    ramal: '',
    endereco: '',
    cidade: 'Maputo',
    documentoIdentidade: '',
    doisFatores: false,
    ipRestrito: [],
    horarioAcessoInicio: '08:00',
    horarioAcessoFim: '18:00',
    permissoes: {
      usuarios: true,
      prestadores: true,
      solicitacoes: true,
      pagamentos: true,
      relatorios: false,
      configuracoes: false,
      logs: false,
      backups: false,
      metricas: false
    }
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
  // HANDLERS DE FORMULÁRIO
  // ============================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissaoChange = (permissao: keyof Permissoes) => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes[permissao]
      }
    }));
  };

  const handleSelectAllPermissoes = () => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        usuarios: true,
        prestadores: true,
        solicitacoes: true,
        pagamentos: true,
        relatorios: true,
        configuracoes: true,
        logs: true,
        backups: true,
        metricas: true
      }
    }));
  };

  const handleClearAllPermissoes = () => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        usuarios: false,
        prestadores: false,
        solicitacoes: false,
        pagamentos: false,
        relatorios: false,
        configuracoes: false,
        logs: false,
        backups: false,
        metricas: false
      }
    }));
  };

  // ============================================
  // VALIDAÇÕES
  // ============================================
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!form.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    if (!form.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const telefoneLimpo = form.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 9) {
        newErrors.telefone = 'Telefone deve ter 9 dígitos';
      }
    }
    
    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.nivel) {
      newErrors.nivel = 'Nível é obrigatório';
    }
    
    if (!form.departamento) {
      newErrors.departamento = 'Departamento é obrigatório';
    }
    
    if (!form.cargo) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    try {
      // Verificar se já existe admin com este email
      const q = query(collection(db, 'users'), where('email', '==', form.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        showToast('Email já está em uso', 'error');
        setLoading(false);
        return;
      }

      // Registrar novo admin
      const userData = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        telefoneAlternativo: form.telefoneAlternativo,
        ramal: form.ramal,
        password: form.password,
        profile: 'admin',
        nivel: form.nivel,
        departamento: form.departamento,
        cargo: form.cargo,
        supervisor: form.supervisor,
        dataContratacao: form.dataContratacao || new Date(),
        endereco: form.endereco,
        cidade: form.cidade,
        documentoIdentidade: form.documentoIdentidade,
        permissoes: form.permissoes,
        doisFatores: form.doisFatores,
        ipRestrito: form.ipRestrito,
        horarioAcessoInicio: form.horarioAcessoInicio,
        horarioAcessoFim: form.horarioAcessoFim,
        status: 'activo',
        dataCadastro: new Date(),
        criadoPor: user?.id,
        criadoPorNome: user?.nome
      };

      const result = await register(userData);

      if (result.success) {
        showToast('Administrador criado com sucesso!', 'success');
        navigate('/admin/usuarios');
      } else {
        showToast(result.error || 'Erro ao criar administrador', 'error');
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      showToast('Erro ao criar administrador', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const getNivelDescricao = (nivel: string) => {
    switch (nivel) {
      case 'master': return 'Acesso total a todas as funcionalidades';
      case 'supervisor': return 'Pode aprovar e supervisionar operações';
      case 'gerente': return 'Gerencia equipes e relatórios';
      case 'analista': return 'Análise de dados e relatórios';
      case 'operador': return 'Operações básicas do dia a dia';
      default: return '';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex items-center justify-between mb-8">
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
                <UserPlus size={32} className="text-accent" />
                Novo Administrador
              </h1>
              <p className="text-gray-500">Crie uma nova conta de administrador com permissões específicas.</p>
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
          </div>
        </div>

        {/* ======================================== */}
        {/* PROGRESSO */}
        {/* ======================================== */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 1 ? <CheckCircle2 size={20} /> : '1'}
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 1 ? 'text-accent' : 'text-gray-400'}`}>
              Dados Pessoais
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step > 1 ? 'bg-accent' : 'bg-gray-200'}`} />
          
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 2 ? <CheckCircle2 size={20} /> : '2'}
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 2 ? 'text-accent' : 'text-gray-400'}`}>
              Dados Profissionais
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step > 2 ? 'bg-accent' : 'bg-gray-200'}`} />
          
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 3 ? <CheckCircle2 size={20} /> : '3'}
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 3 ? 'text-accent' : 'text-gray-400'}`}>
              Permissões
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step > 3 ? 'bg-accent' : 'bg-gray-200'}`} />
          
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 4 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              4
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 4 ? 'text-accent' : 'text-gray-400'}`}>
              Confirmação
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            {/* ======================================== */}
            {/* PASSO 1: DADOS PESSOAIS */}
            {/* ======================================== */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">Dados do Administrador</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome Completo <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="nome"
                      value={form.nome}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      leftIcon={<User size={16} />}
                      className={errors.nome ? 'border-red-500' : ''}
                    />
                    {errors.nome && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="admin@dexapp.co.mz"
                      leftIcon={<Mail size={16} />}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Telefone <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="telefone"
                      value={form.telefone}
                      onChange={handleInputChange}
                      placeholder="84 123 4567"
                      leftIcon={<Phone size={16} />}
                      className={errors.telefone ? 'border-red-500' : ''}
                    />
                    {errors.telefone && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.telefone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Telefone Alternativo
                    </label>
                    <Input
                      name="telefoneAlternativo"
                      value={form.telefoneAlternativo}
                      onChange={handleInputChange}
                      placeholder="84 987 6543"
                      leftIcon={<Phone size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ramal
                    </label>
                    <Input
                      name="ramal"
                      value={form.ramal}
                      onChange={handleInputChange}
                      placeholder="123"
                      leftIcon={<PhoneCall size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Documento de Identidade
                    </label>
                    <Input
                      name="documentoIdentidade"
                      value={form.documentoIdentidade}
                      onChange={handleInputChange}
                      placeholder="Nº do BI/Passaporte"
                      leftIcon={<IdCard size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Senha <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="••••••"
                        leftIcon={<Lock size={16} />}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Confirmar Senha <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••"
                        leftIcon={<Lock size={16} />}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        Informações de Segurança
                      </p>
                      <p className="text-xs text-blue-600">
                        Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, 
                        minúsculas, números e símbolos para maior segurança.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-accent hover:bg-accent/90 text-white px-8"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 2: DADOS PROFISSIONAIS */}
            {/* ======================================== */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">Dados Profissionais</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nível de Acesso <span className="text-accent">*</span>
                    </label>
                    <select
                      name="nivel"
                      value={form.nivel}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                    >
                      <option value="operador">Operador</option>
                      <option value="analista">Analista</option>
                      <option value="gerente">Gerente</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="master">Master</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{getNivelDescricao(form.nivel)}</p>
                    {errors.nivel && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.nivel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Departamento <span className="text-accent">*</span>
                    </label>
                    <select
                      name="departamento"
                      value={form.departamento}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                    >
                      <option value="Administração">Administração</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Suporte">Suporte</option>
                      <option value="Operações">Operações</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Marketing">Marketing</option>
                      <option value="RH">Recursos Humanos</option>
                      <option value="TI">Tecnologia da Informação</option>
                    </select>
                    {errors.departamento && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.departamento}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cargo <span className="text-accent">*</span>
                    </label>
                    <Input
                      name="cargo"
                      value={form.cargo}
                      onChange={handleInputChange}
                      placeholder="Ex: Administrador de Sistemas"
                      leftIcon={<Briefcase size={16} />}
                      className={errors.cargo ? 'border-red-500' : ''}
                    />
                    {errors.cargo && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.cargo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Supervisor
                    </label>
                    <Input
                      name="supervisor"
                      value={form.supervisor}
                      onChange={handleInputChange}
                      placeholder="Nome do supervisor"
                      leftIcon={<UserCog size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Data de Contratação
                    </label>
                    <Input
                      name="dataContratacao"
                      type="date"
                      value={form.dataContratacao}
                      onChange={handleInputChange}
                      leftIcon={<Calendar size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cidade
                    </label>
                    <select
                      name="cidade"
                      value={form.cidade}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                    >
                      <option value="Maputo">Maputo</option>
                      <option value="Matola">Matola</option>
                      <option value="Beira">Beira</option>
                      <option value="Nampula">Nampula</option>
                      <option value="Quelimane">Quelimane</option>
                      <option value="Tete">Tete</option>
                      <option value="Xai-Xai">Xai-Xai</option>
                      <option value="Inhambane">Inhambane</option>
                      <option value="Chimoio">Chimoio</option>
                      <option value="Pemba">Pemba</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Endereço
                    </label>
                    <Input
                      name="endereco"
                      value={form.endereco}
                      onChange={handleInputChange}
                      placeholder="Bairro, Quarteirão, Casa"
                      leftIcon={<Map size={16} />}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-accent hover:bg-accent/90 text-white px-8"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 3: PERMISSÕES */}
            {/* ======================================== */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">Permissões do Administrador</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                      Selecione quais módulos este administrador poderá acessar:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllPermissoes}
                        className="text-accent"
                      >
                        Selecionar todas
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllPermissoes}
                        className="text-gray-500"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Gestão de Usuários</p>
                          <p className="text-xs text-gray-500">Criar, editar e excluir usuários</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.usuarios}
                        onChange={() => handlePermissaoChange('usuarios')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Gestão de Prestadores</p>
                          <p className="text-xs text-gray-500">Aprovar, rejeitar e gerenciar</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.prestadores}
                        onChange={() => handlePermissaoChange('prestadores')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Gestão de Solicitações</p>
                          <p className="text-xs text-gray-500">Acompanhar e gerenciar serviços</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.solicitacoes}
                        onChange={() => handlePermissaoChange('solicitacoes')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Gestão de Pagamentos</p>
                          <p className="text-xs text-gray-500">Aprovar saques e ver transações</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.pagamentos}
                        onChange={() => handlePermissaoChange('pagamentos')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <BarChart3 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Relatórios</p>
                          <p className="text-xs text-gray-500">Acessar relatórios e análises</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.relatorios}
                        onChange={() => handlePermissaoChange('relatorios')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <Settings size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Configurações</p>
                          <p className="text-xs text-gray-500">Alterar configurações do sistema</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.configuracoes}
                        onChange={() => handlePermissaoChange('configuracoes')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Logs do Sistema</p>
                          <p className="text-xs text-gray-500">Visualizar logs e auditoria</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.logs}
                        onChange={() => handlePermissaoChange('logs')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Backups</p>
                          <p className="text-xs text-gray-500">Gerenciar backups do sistema</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.backups}
                        onChange={() => handlePermissaoChange('backups')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>

                    <label className="col-span-2 flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Métricas Avançadas</p>
                          <p className="text-xs text-gray-500">Acessar métricas detalhadas e KPIs</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.permissoes.metricas}
                        onChange={() => handlePermissaoChange('metricas')}
                        className="w-5 h-5 text-accent"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        Resumo de Permissões
                      </p>
                      <p className="text-xs text-blue-600">
                        Nível: <span className="font-bold">{form.nivel === 'master' ? 'Master' : 
                                 form.nivel === 'supervisor' ? 'Supervisor' :
                                 form.nivel === 'gerente' ? 'Gerente' :
                                 form.nivel === 'analista' ? 'Analista' : 'Operador'}</span> • 
                        Departamento: <span className="font-bold">{form.departamento}</span>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Acesso a {Object.values(form.permissoes).filter(Boolean).length} de 9 módulos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-accent hover:bg-accent/90 text-white px-8"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 4: CONFIRMAÇÃO */}
            {/* ======================================== */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">Confirmar Dados</h2>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {/* Dados Pessoais */}
                  <div>
                    <h3 className="font-bold text-primary mb-3">Dados Pessoais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nome</p>
                        <p className="font-bold text-primary">{form.nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-bold text-primary">{form.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Telefone</p>
                        <p className="font-bold text-primary">{form.telefone}</p>
                      </div>
                      {form.telefoneAlternativo && (
                        <div>
                          <p className="text-xs text-gray-500">Telefone Alternativo</p>
                          <p className="font-bold text-primary">{form.telefoneAlternativo}</p>
                        </div>
                      )}
                      {form.documentoIdentidade && (
                        <div>
                          <p className="text-xs text-gray-500">Documento</p>
                          <p className="font-bold text-primary">{form.documentoIdentidade}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dados Profissionais */}
                  <div className="pt-4 border-t">
                    <h3 className="font-bold text-primary mb-3">Dados Profissionais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nível</p>
                        <p className="font-bold text-primary capitalize">{form.nivel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Departamento</p>
                        <p className="font-bold text-primary">{form.departamento}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cargo</p>
                        <p className="font-bold text-primary">{form.cargo}</p>
                      </div>
                      {form.supervisor && (
                        <div>
                          <p className="text-xs text-gray-500">Supervisor</p>
                          <p className="font-bold text-primary">{form.supervisor}</p>
                        </div>
                      )}
                      {form.dataContratacao && (
                        <div>
                          <p className="text-xs text-gray-500">Data Contratação</p>
                          <p className="font-bold text-primary">{form.dataContratacao}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  {(form.endereco || form.cidade) && (
                    <div className="pt-4 border-t">
                      <h3 className="font-bold text-primary mb-3">Endereço</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {form.endereco && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Endereço</p>
                            <p className="font-bold text-primary">{form.endereco}</p>
                          </div>
                        )}
                        {form.cidade && (
                          <div>
                            <p className="text-xs text-gray-500">Cidade</p>
                            <p className="font-bold text-primary">{form.cidade}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Permissões */}
                  <div className="pt-4 border-t">
                    <h3 className="font-bold text-primary mb-3">Permissões</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(form.permissoes).map(([key, value]) => (
                        value && (
                          <span key={key} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {key === 'usuarios' ? 'Usuários' :
                             key === 'prestadores' ? 'Prestadores' :
                             key === 'solicitacoes' ? 'Solicitações' :
                             key === 'pagamentos' ? 'Pagamentos' :
                             key === 'relatorios' ? 'Relatórios' :
                             key === 'configuracoes' ? 'Configurações' :
                             key === 'logs' ? 'Logs' :
                             key === 'backups' ? 'Backups' : 'Métricas'}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 text-white px-8"
                    leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  >
                    {loading ? 'Criando...' : 'Criar Administrador'}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================== */}
      {/* MODAL DE CONFIRMAÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar Criação">
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-700">
              Tem certeza que deseja criar este administrador?
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              O administrador terá acesso às permissões selecionadas.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSubmit}
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? 'Criando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

export default NovoAdmin;
