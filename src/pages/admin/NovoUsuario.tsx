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
  MapPin,
  Briefcase,
  Wrench,
  Star,
  DollarSign,
  Calendar,
  Award,
  Users,
  UserCheck,
  UserX,
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
  Calendar as CalendarIcon,
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
import { SERVICE_CATEGORIES, getEspecialidadesByCategoria } from '../../constants/categories';

// ============================================
// INTERFACES
// ============================================
interface NovoUsuarioForm {
  // Dados básicos
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
  profile: 'cliente' | 'prestador' | 'central' | 'admin';
  
  // Cliente
  endereco?: string;
  cidade?: string;
  dataNascimento?: string;
  genero?: 'masculino' | 'feminino' | 'outro';
  documentoIdentidade?: string;
  
  // Prestador
  categoria?: string;
  especialidade?: string;
  descricao?: string;
  experiencia?: string;
  valorHora?: number;
  disponibilidade?: {
    segunda?: boolean;
    terca?: boolean;
    quarta?: boolean;
    quinta?: boolean;
    sexta?: boolean;
    sabado?: boolean;
    domingo?: boolean;
  };
  horarioInicio?: string;
  horarioFim?: string;
  certificacoes?: string[];
  
  // Central/Admin
  nivel?: string;
  departamento?: string;
  permissoes?: {
    usuarios?: boolean;
    prestadores?: boolean;
    solicitacoes?: boolean;
    pagamentos?: boolean;
    relatorios?: boolean;
    configuracoes?: boolean;
  };
  cargo?: string;
  supervisor?: string;
  
  // Documentos
  documentos?: {
    bi?: File;
    certificado?: File;
    foto?: File;
  };
}

interface FileWithPreview {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function NovoUsuario() {
  const navigate = useNavigate();
  const { user, logout, register } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategorias, setShowCategorias] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileWithPreview>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [form, setForm] = useState<NovoUsuarioForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    profile: 'cliente',
    endereco: '',
    cidade: 'Maputo',
    dataNascimento: '',
    genero: 'masculino',
    documentoIdentidade: '',
    nivel: 'operador',
    departamento: 'Atendimento',
    cargo: 'Assistente',
    supervisor: '',
    valorHora: 500,
    experiencia: '1-3',
    disponibilidade: {
      segunda: true,
      terca: true,
      quarta: true,
      quinta: true,
      sexta: true,
      sabado: false,
      domingo: false
    },
    horarioInicio: '08:00',
    horarioFim: '17:00',
    certificacoes: [],
    permissoes: {
      usuarios: false,
      prestadores: false,
      solicitacoes: false,
      pagamentos: false,
      relatorios: false,
      configuracoes: false
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

  const handleProfileChange = (profile: 'cliente' | 'prestador' | 'central' | 'admin') => {
    setForm(prev => ({ ...prev, profile }));
    setStep(1);
  };

  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidade: '' }));
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

  const handlePermissaoChange = (permissao: keyof NonNullable<NovoUsuarioForm['permissoes']>) => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes?.[permissao]
      }
    }));
  };

  const handleDisponibilidadeChange = (dia: keyof NonNullable<NovoUsuarioForm['disponibilidade']>) => {
    setForm(prev => ({
      ...prev,
      disponibilidade: {
        ...prev.disponibilidade,
        [dia]: !prev.disponibilidade?.[dia]
      }
    }));
  };

  // ============================================
  // HANDLERS DE UPLOAD
  // ============================================
  const handleFileUpload = (tipo: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      showToast('Formato não permitido. Use PDF, JPG ou PNG', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 5MB', 'error');
      return;
    }

    let preview = '';
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setUploadedFiles(prev => ({
      ...prev,
      [tipo]: {
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type
      }
    }));

    showToast(`${tipo} carregado com sucesso!`, 'success');
  };

  const handleRemoveFile = (tipo: string) => {
    if (uploadedFiles[tipo]?.preview) {
      URL.revokeObjectURL(uploadedFiles[tipo].preview);
    }

    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[tipo];
      return newFiles;
    });
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

    if (form.profile === 'cliente') {
      if (!form.endereco?.trim()) {
        newErrors.endereco = 'Endereço é obrigatório';
      }
      if (!form.dataNascimento) {
        newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      }
    }

    if (form.profile === 'prestador') {
      if (!form.categoria) {
        newErrors.categoria = 'Categoria é obrigatória';
      }
      if (!form.especialidade) {
        newErrors.especialidade = 'Especialidade é obrigatória';
      }
      if (!form.descricao?.trim() || form.descricao.length < 20) {
        newErrors.descricao = 'Descrição deve ter pelo menos 20 caracteres';
      }
      if (!form.experiencia) {
        newErrors.experiencia = 'Experiência é obrigatória';
      }
    }

    if (form.profile === 'central' || form.profile === 'admin') {
      if (!form.nivel) {
        newErrors.nivel = 'Nível é obrigatório';
      }
      if (!form.cargo) {
        newErrors.cargo = 'Cargo é obrigatório';
      }
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

    setLoading(true);

    try {
      // Verificar se já existe usuário com este email
      const q = query(collection(db, 'users'), where('email', '==', form.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        showToast('Email já está em uso', 'error');
        setLoading(false);
        return;
      }

      // Preparar dados específicos por perfil
      const userData: any = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        password: form.password,
        profile: form.profile,
        status: 'activo',
        dataCadastro: new Date(),
        criadoPor: user?.id,
        criadoPorNome: user?.nome
      };

      if (form.profile === 'cliente') {
        userData.endereco = form.endereco;
        userData.cidade = form.cidade;
        userData.dataNascimento = form.dataNascimento;
        userData.genero = form.genero;
        userData.documentoIdentidade = form.documentoIdentidade;
      }

      if (form.profile === 'prestador') {
        userData.categoria = form.categoria;
        userData.especialidade = form.especialidade;
        userData.descricao = form.descricao;
        userData.experiencia = form.experiencia;
        userData.valorHora = form.valorHora;
        userData.disponibilidade = form.disponibilidade;
        userData.horarioInicio = form.horarioInicio;
        userData.horarioFim = form.horarioFim;
        userData.certificacoes = form.certificacoes;
        userData.avaliacaoMedia = 0;
        userData.totalAvaliacoes = 0;
      }

      if (form.profile === 'central') {
        userData.nivel = form.nivel;
        userData.departamento = form.departamento;
        userData.cargo = form.cargo;
        userData.supervisor = form.supervisor;
      }

      if (form.profile === 'admin') {
        userData.nivel = form.nivel || 'master';
        userData.departamento = form.departamento || 'Administração';
        userData.cargo = form.cargo || 'Administrador';
        userData.permissoes = form.permissoes || {
          usuarios: true,
          prestadores: true,
          solicitacoes: true,
          pagamentos: true,
          relatorios: true,
          configuracoes: true
        };
      }

      // Upload de documentos (simulado)
      if (Object.keys(uploadedFiles).length > 0) {
        userData.documentos = Object.keys(uploadedFiles).reduce((acc, key) => {
          acc[key] = {
            nome: uploadedFiles[key].name,
            tipo: uploadedFiles[key].type,
            dataUpload: new Date()
          };
          return acc;
        }, {} as any);
      }

      const result = await register(userData);

      if (result.success) {
        showToast('Usuário criado com sucesso!', 'success');
        navigate('/admin/usuarios');
      } else {
        showToast(result.error || 'Erro ao criar usuário', 'error');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showToast('Erro ao criar usuário', 'error');
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
                Novo Usuário
              </h1>
              <p className="text-gray-500">Crie uma nova conta de usuário na plataforma.</p>
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
        {/* SELEÇÃO DE PERFIL */}
        {/* ======================================== */}
        {step === 1 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => handleProfileChange('cliente')}
              className={`p-6 border-2 rounded-xl text-center transition-all ${
                form.profile === 'cliente' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-gray-200 hover:border-accent/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                <User size={24} />
              </div>
              <p className="font-bold text-primary">Cliente</p>
              <p className="text-xs text-gray-500">Contrata serviços</p>
            </button>

            <button
              onClick={() => handleProfileChange('prestador')}
              className={`p-6 border-2 rounded-xl text-center transition-all ${
                form.profile === 'prestador' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-gray-200 hover:border-accent/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-3">
                <Wrench size={24} />
              </div>
              <p className="font-bold text-primary">Prestador</p>
              <p className="text-xs text-gray-500">Oferece serviços</p>
            </button>

            <button
              onClick={() => handleProfileChange('central')}
              className={`p-6 border-2 rounded-xl text-center transition-all ${
                form.profile === 'central' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-gray-200 hover:border-accent/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-3">
                <Building size={24} />
              </div>
              <p className="font-bold text-primary">Central</p>
              <p className="text-xs text-gray-500">Atendimento</p>
            </button>

            <button
              onClick={() => handleProfileChange('admin')}
              className={`p-6 border-2 rounded-xl text-center transition-all ${
                form.profile === 'admin' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-gray-200 hover:border-accent/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
                <Shield size={24} />
              </div>
              <p className="font-bold text-primary">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </button>
          </div>
        )}

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
              Dados Básicos
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
              {form.profile === 'cliente' ? 'Endereço' : 
               form.profile === 'prestador' ? 'Profissão' : 
               form.profile === 'central' ? 'Acesso' : 'Permissões'}
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
              Documentos
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
            {/* PASSO 1: DADOS BÁSICOS */}
            {/* ======================================== */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">
                  Dados do {form.profile === 'cliente' ? 'Cliente' : 
                            form.profile === 'prestador' ? 'Prestador' : 
                            form.profile === 'central' ? 'Operador' : 'Administrador'}
                </h2>

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
                      placeholder="email@exemplo.com"
                      leftIcon={<Mail size={16} />}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.email}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Será usado para login
                    </p>
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
            {/* PASSO 2: DADOS ESPECÍFICOS */}
            {/* ======================================== */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">
                  {form.profile === 'cliente' && 'Dados do Cliente'}
                  {form.profile === 'prestador' && 'Dados Profissionais'}
                  {form.profile === 'central' && 'Dados de Acesso'}
                  {form.profile === 'admin' && 'Permissões do Administrador'}
                </h2>

                {/* Cliente */}
                {form.profile === 'cliente' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Data de Nascimento <span className="text-accent">*</span>
                        </label>
                        <Input
                          name="dataNascimento"
                          type="date"
                          value={form.dataNascimento}
                          onChange={handleInputChange}
                          className={errors.dataNascimento ? 'border-red-500' : ''}
                        />
                        {errors.dataNascimento && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.dataNascimento}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Gênero
                        </label>
                        <select
                          name="genero"
                          value={form.genero}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Endereço <span className="text-accent">*</span>
                      </label>
                      <Input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleInputChange}
                        placeholder="Bairro, Quarteirão, Casa"
                        leftIcon={<MapPin size={16} />}
                        className={errors.endereco ? 'border-red-500' : ''}
                      />
                      {errors.endereco && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.endereco}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>
                )}

                {/* Prestador */}
                {form.profile === 'prestador' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Categoria <span className="text-accent">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCategorias(!showCategorias)}
                            className="w-full p-3 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between bg-white"
                          >
                            <span className={form.categoria ? 'text-primary font-bold' : 'text-gray-400'}>
                              {form.categoria 
                                ? SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome 
                                : 'Selecione uma categoria'}
                            </span>
                            {showCategorias ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>

                          {showCategorias && (
                            <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                              {SERVICE_CATEGORIES.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoriaSelect(cat.id)}
                                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                                    form.categoria === cat.id ? 'bg-accent/5 border-l-4 border-accent' : ''
                                  }`}
                                >
                                  <span className="font-bold text-primary">{cat.nome}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {errors.categoria && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.categoria}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Especialidade <span className="text-accent">*</span>
                        </label>
                        <select
                          name="especialidade"
                          value={form.especialidade}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                        >
                          <option value="">Selecione</option>
                          {especialidades.map((esp) => (
                            <option key={esp.id} value={esp.id}>{esp.nome}</option>
                          ))}
                        </select>
                        {errors.especialidade && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.especialidade}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Descrição <span className="text-accent">*</span>
                      </label>
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleInputChange}
                        placeholder="Descreva sua experiência, formação e serviços oferecidos..."
                        rows={4}
                        className={`w-full p-3 border-2 rounded-xl focus:border-accent focus:outline-none ${
                          errors.descricao ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {errors.descricao && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.descricao}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Experiência <span className="text-accent">*</span>
                        </label>
                        <select
                          name="experiencia"
                          value={form.experiencia}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                        >
                          <option value="menos-1">Menos de 1 ano</option>
                          <option value="1-3">1 a 3 anos</option>
                          <option value="3-5">3 a 5 anos</option>
                          <option value="5-10">5 a 10 anos</option>
                          <option value="mais-10">Mais de 10 anos</option>
                        </select>
                        {errors.experiencia && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.experiencia}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Valor por Hora (MT)
                        </label>
                        <Input
                          name="valorHora"
                          type="number"
                          value={form.valorHora}
                          onChange={handleInputChange}
                          placeholder="500"
                          leftIcon={<DollarSign size={16} />}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Disponibilidade
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => (
                          <label key={dia} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.disponibilidade?.[dia as keyof typeof form.disponibilidade]}
                              onChange={() => handleDisponibilidadeChange(dia as any)}
                              className="w-4 h-4 text-accent"
                            />
                            <span className="text-xs capitalize">{dia.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Horário Início
                        </label>
                        <Input
                          name="horarioInicio"
                          type="time"
                          value={form.horarioInicio}
                          onChange={handleInputChange}
                          leftIcon={<Clock size={16} />}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Horário Fim
                        </label>
                        <Input
                          name="horarioFim"
                          type="time"
                          value={form.horarioFim}
                          onChange={handleInputChange}
                          leftIcon={<Clock size={16} />}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Central */}
                {form.profile === 'central' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nível <span className="text-accent">*</span>
                      </label>
                      <select
                        name="nivel"
                        value={form.nivel}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      >
                        <option value="operador">Operador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="gerente">Gerente</option>
                        <option value="coordenador">Coordenador</option>
                      </select>
                      {errors.nivel && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.nivel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Departamento
                      </label>
                      <select
                        name="departamento"
                        value={form.departamento}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      >
                        <option value="Atendimento">Atendimento</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Operações">Operações</option>
                        <option value="Suporte">Suporte</option>
                        <option value="Comercial">Comercial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cargo
                      </label>
                      <Input
                        name="cargo"
                        value={form.cargo}
                        onChange={handleInputChange}
                        placeholder="Ex: Assistente de Atendimento"
                        leftIcon={<Briefcase size={16} />}
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
                        leftIcon={<User size={16} />}
                      />
                    </div>
                  </div>
                )}

                {/* Admin */}
                {form.profile === 'admin' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Nível
                        </label>
                        <select
                          name="nivel"
                          value={form.nivel}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                        >
                          <option value="operador">Operador</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="master">Master</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Departamento
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
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Cargo
                        </label>
                        <Input
                          name="cargo"
                          value={form.cargo}
                          onChange={handleInputChange}
                          placeholder="Ex: Administrador de Sistemas"
                          leftIcon={<Briefcase size={16} />}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-primary mb-3">Permissões</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.usuarios}
                            onChange={() => handlePermissaoChange('usuarios')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Usuários</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.prestadores}
                            onChange={() => handlePermissaoChange('prestadores')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Prestadores</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.solicitacoes}
                            onChange={() => handlePermissaoChange('solicitacoes')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Solicitações</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.pagamentos}
                            onChange={() => handlePermissaoChange('pagamentos')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Pagamentos</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.relatorios}
                            onChange={() => handlePermissaoChange('relatorios')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Relatórios</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={form.permissoes?.configuracoes}
                            onChange={() => handlePermissaoChange('configuracoes')}
                            className="w-4 h-4 text-accent"
                          />
                          <span className="text-sm font-bold text-primary">Configurações</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

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
            {/* PASSO 3: DOCUMENTOS */}
            {/* ======================================== */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-primary mb-4">
                  Documentos (opcionais)
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* BI */}
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <IdCard size={24} className="text-gray-600" />
                      <div>
                        <h3 className="font-bold text-primary">Bilhete de Identidade</h3>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                      </div>
                    </div>

                    {!uploadedFiles['bi'] ? (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('bi', e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {uploadedFiles.bi.type.startsWith('image/') && uploadedFiles.bi.preview ? (
                            <img src={uploadedFiles.bi.preview} alt="BI" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <FileText size={20} className="text-green-600" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-green-700 truncate">{uploadedFiles.bi.name}</p>
                            <p className="text-xs text-green-600">
                              {(uploadedFiles.bi.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile('bi')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Certificado */}
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Award size={24} className="text-gray-600" />
                      <div>
                        <h3 className="font-bold text-primary">Certificado/Diploma</h3>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                      </div>
                    </div>

                    {!uploadedFiles['certificado'] ? (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('certificado', e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {uploadedFiles.certificado.type.startsWith('image/') && uploadedFiles.certificado.preview ? (
                            <img src={uploadedFiles.certificado.preview} alt="Certificado" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <FileText size={20} className="text-green-600" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-green-700 truncate">{uploadedFiles.certificado.name}</p>
                            <p className="text-xs text-green-600">
                              {(uploadedFiles.certificado.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile('certificado')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Foto */}
                  <div className="col-span-2 border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Camera size={24} className="text-gray-600" />
                      <div>
                        <h3 className="font-bold text-primary">Foto de Perfil</h3>
                        <p className="text-xs text-gray-500">JPG, PNG (max 2MB)</p>
                      </div>
                    </div>

                    {!uploadedFiles['foto'] ? (
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('foto', e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {uploadedFiles.foto.type.startsWith('image/') && uploadedFiles.foto.preview ? (
                            <img src={uploadedFiles.foto.preview} alt="Foto" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <Camera size={20} className="text-green-600" />
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-green-700 truncate">{uploadedFiles.foto.name}</p>
                            <p className="text-xs text-green-600">
                              {(uploadedFiles.foto.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile('foto')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        Documentos são opcionais
                      </p>
                      <p className="text-xs text-blue-600">
                        Os documentos podem ser carregados agora ou posteriormente através do perfil do usuário.
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
                    <div>
                      <p className="text-xs text-gray-500">Perfil</p>
                      <p className="font-bold text-primary capitalize">{form.profile}</p>
                    </div>
                  </div>

                  {form.profile === 'cliente' && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Data Nascimento</p>
                        <p className="font-bold text-primary">{form.dataNascimento}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gênero</p>
                        <p className="font-bold text-primary capitalize">{form.genero}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Endereço</p>
                        <p className="font-bold text-primary">{form.endereco}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cidade</p>
                        <p className="font-bold text-primary">{form.cidade}</p>
                      </div>
                    </div>
                  )}

                  {form.profile === 'prestador' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Categoria</p>
                          <p className="font-bold text-primary">
                            {SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Especialidade</p>
                          <p className="font-bold text-primary">{form.especialidade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Experiência</p>
                          <p className="font-bold text-primary">{form.experiencia}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valor/Hora</p>
                          <p className="font-bold text-primary">{form.valorHora} MT</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Descrição</p>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-xl">
                          {form.descricao}
                        </p>
                      </div>
                    </div>
                  )}

                  {(form.profile === 'central' || form.profile === 'admin') && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
                    </div>
                  )}

                  {Object.keys(uploadedFiles).length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Documentos carregados</p>
                      <div className="flex gap-2">
                        {Object.keys(uploadedFiles).map((key) => (
                          <span key={key} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {key === 'bi' ? 'BI' : key === 'certificado' ? 'Certificado' : 'Foto'} ✓
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
