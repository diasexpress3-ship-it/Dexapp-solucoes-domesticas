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
  Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface NovoAdminForm {
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
  nivel: 'master' | 'supervisor' | 'operador';
  departamento: string;
  permissoes: {
    usuarios: boolean;
    prestadores: boolean;
    solicitacoes: boolean;
    pagamentos: boolean;
    relatorios: boolean;
    configuracoes: boolean;
  };
}

// ============================================
// COMPONENTE PRINCIPAL (EXPORTADO COMO NOMEADO)
// ============================================
export function NovoAdmin() {
  const navigate = useNavigate();
  const { user, logout, register } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<NovoAdminForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    nivel: 'operador',
    departamento: 'Administração',
    permissoes: {
      usuarios: true,
      prestadores: true,
      solicitacoes: true,
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
  // HANDLERS
  // ============================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissaoChange = (permissao: keyof typeof form.permissoes) => {
    setForm(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes[permissao]
      }
    }));
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

  const handleSubmit = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    setLoading(true);

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
        password: form.password,
        profile: 'admin',
        nivel: form.nivel,
        departamento: form.departamento,
        permissoes: form.permissoes,
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
                Novo Administrador
              </h1>
              <p className="text-gray-500">Crie uma nova conta de administrador.</p>
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
              2
            </div>
            <span className={`ml-2 text-sm font-bold ${step >= 2 ? 'text-accent' : 'text-gray-400'}`}>
              Permissões
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
                <h2 className="text-xl font-black text-primary mb-4">Dados do Administrador</h2>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nível de Acesso
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
            {/* PASSO 2: PERMISSÕES */}
            {/* ======================================== */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Permissões do Administrador</h2>

                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Selecione quais módulos este administrador poderá acessar:
                  </p>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={20} />
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
                        <p className="text-xs text-gray-500">Aprovar, rejeitar e gerenciar prestadores</p>
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
                        <Building size={20} />
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
                        <Lock size={20} />
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
                        <Building size={20} />
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
                        <Lock size={20} />
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
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        Resumo de Permissões
                      </p>
                      <p className="text-xs text-blue-600">
                        Nível: <span className="font-bold">{form.nivel === 'master' ? 'Master' : form.nivel === 'supervisor' ? 'Supervisor' : 'Operador'}</span> • 
                        Departamento: <span className="font-bold">{form.departamento}</span>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Acesso a {Object.values(form.permissoes).filter(Boolean).length} de 6 módulos
                      </p>
                    </div>
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
    </AppLayout>
  );
}

// Também exportar como default para compatibilidade
export default NovoAdmin;
