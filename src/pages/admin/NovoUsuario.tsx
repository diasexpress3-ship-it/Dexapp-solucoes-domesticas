import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  Calendar
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
  profile: 'cliente' | 'prestador' | 'central';
  
  // Cliente
  endereco?: string;
  cidade?: string;
  
  // Prestador
  categoria?: string;
  especialidade?: string;
  descricao?: string;
  experiencia?: string;
  valorHora?: number;
  
  // Central
  nivel?: string;
  departamento?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function NovoUsuario() {
  const navigate = useNavigate();
  const { user, logout, register } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategorias, setShowCategorias] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  
  const [form, setForm] = useState<NovoUsuarioForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    profile: 'cliente',
    endereco: '',
    cidade: 'Maputo',
    nivel: 'operador',
    departamento: 'Atendimento',
    valorHora: 500
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
  // HANDLERS
  // ============================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileChange = (profile: 'cliente' | 'prestador' | 'central') => {
    setForm(prev => ({ ...prev, profile }));
    setStep(1);
  };

  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidade: '' }));
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

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

    if (form.profile === 'central') {
      if (!form.nivel) {
        newErrors.nivel = 'Nível é obrigatório';
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
      }

      if (form.profile === 'prestador') {
        userData.categoria = form.categoria;
        userData.especialidade = form.especialidade;
        userData.descricao = form.descricao;
        userData.experiencia = form.experiencia;
        userData.valorHora = form.valorHora;
        userData.avaliacaoMedia = 0;
        userData.totalAvaliacoes = 0;
      }

      if (form.profile === 'central') {
        userData.nivel = form.nivel;
        userData.departamento = form.departamento;
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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

        {/* ======================================== */}
        {/* SELEÇÃO DE PERFIL */}
        {/* ======================================== */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
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
               form.profile === 'prestador' ? 'Profissão' : 'Acesso'}
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step > 2 ? 'bg-accent' : 'bg-gray-200'}`} />
          <div className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 3 ? 'text-accent' : 'text-gray-400'}`}>
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
                <h2 className="text-xl font-black text-primary mb-4">
                  Dados do {form.profile === 'cliente' ? 'Cliente' : 
                            form.profile === 'prestador' ? 'Prestador' : 'Operador'}
                </h2>

                <div className="space-y-4">
                  <div>
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

                  <div className="grid grid-cols-2 gap-4">
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
                <h2 className="text-xl font-black text-primary mb-4">
                  {form.profile === 'cliente' && 'Endereço do Cliente'}
                  {form.profile === 'prestador' && 'Dados Profissionais'}
                  {form.profile === 'central' && 'Dados de Acesso'}
                </h2>

                {/* Cliente */}
                {form.profile === 'cliente' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Prestador */}
                {form.profile === 'prestador' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Categoria <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategorias(!showCategorias)}
                          className="w-full p-3 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between"
                        >
                          <span className={form.categoria ? 'text-primary font-bold' : 'text-gray-400'}>
                            {form.categoria 
                              ? SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome 
                              : 'Selecione uma categoria'}
                          </span>
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

                    {categoriaSelecionada && (
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
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Descrição <span className="text-accent">*</span>
                      </label>
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleInputChange}
                        placeholder="Descreva a experiência e serviços oferecidos..."
                        rows={4}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
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
                          <option value="">Selecione</option>
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
                      </select>
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
            {/* PASSO 3: CONFIRMAÇÃO */}
            {/* ======================================== */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Confirmar Dados</h2>

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

                  {form.profile === 'central' && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Nível</p>
                        <p className="font-bold text-primary capitalize">{form.nivel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Departamento</p>
                        <p className="font-bold text-primary">{form.departamento}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
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
