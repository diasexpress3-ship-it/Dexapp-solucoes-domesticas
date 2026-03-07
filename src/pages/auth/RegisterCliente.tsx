import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  MapPin,
  Home,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

export default function RegisterCliente() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    cidade: 'Maputo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Nome é obrigatório
    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    // Telefone é obrigatório
    if (!form.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const telefoneLimpo = form.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 9) {
        newErrors.telefone = 'Telefone deve ter 9 dígitos';
      } else if (telefoneLimpo.length > 9) {
        newErrors.telefone = 'Telefone deve ter apenas 9 dígitos';
      }
    }
    
    // Email é opcional, mas se preenchido deve ser válido
    if (form.email && !form.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    // Senha é obrigatória
    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    // Confirmar senha deve coincidir
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
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

    if (!validateStep2()) return;

    setLoading(true);

    try {
      // Se email não foi preenchido, usar o telefone como identificador
      const userData = {
        ...form,
        email: form.email || `${form.telefone.replace(/\D/g, '')}@cliente.dexapp.co.mz`, // Email gerado automaticamente
        profile: 'cliente'
      };

      const result = await register(userData);

      if (result.success) {
        showToast('Conta criada com sucesso!', 'success');
        navigate('/login');
      } else {
        showToast(result.error || 'Erro ao criar conta', 'error');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      showToast('Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-150px)] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-2 shadow-xl hover:scale-105 transition-transform">
                D
              </div>
            </Link>
            <h2 className="text-2xl font-black text-primary">
              Criar conta de <span className="text-accent">Cliente</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Preencha seus dados para começar
            </p>
          </div>

          {/* Progresso */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <span className={`ml-2 text-xs font-bold ${
                step >= 1 ? 'text-accent' : 'text-gray-400'
              }`}>
                Dados Pessoais
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${
              step > 1 ? 'bg-accent' : 'bg-gray-200'
            }`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className={`ml-2 text-xs font-bold ${
                step >= 2 ? 'text-accent' : 'text-gray-400'
              }`}>
                Endereço
              </span>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              {/* Passo 1: Dados Pessoais */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-4">
                    {/* Nome (obrigatório) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nome Completo <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="nome"
                          value={form.nome}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                          className={`pl-9 py-2 text-sm ${errors.nome ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.nome && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.nome}
                        </p>
                      )}
                    </div>

                    {/* Telefone (obrigatório) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Telefone <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="telefone"
                          value={form.telefone}
                          onChange={handleInputChange}
                          placeholder="84 123 4567"
                          className={`pl-9 py-2 text-sm ${errors.telefone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.telefone && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.telefone}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Digite os 9 dígitos do seu número</p>
                    </div>

                    {/* Email (opcional) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          className={`pl-9 py-2 text-sm ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Senha (obrigatória) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Senha <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          className={`pl-9 py-2 text-sm ${errors.password ? 'border-red-500' : ''}`}
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

                    {/* Confirmar Senha (obrigatória) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Confirmar Senha <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          className={`pl-9 py-2 text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
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

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-2">
                      <p className="text-xs text-blue-700 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>
                          <span className="font-bold">Email é opcional.</span> Se não fornecer, usaremos seu telefone para comunicações.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => handleSubmit()}
                      className="bg-accent hover:bg-accent/90 text-white py-2.5 text-sm px-6"
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Passo 2: Endereço */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-4">
                    {/* Endereço (obrigatório) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Endereço <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          name="endereco"
                          value={form.endereco}
                          onChange={handleInputChange}
                          placeholder="Bairro, Quarteirão, Casa"
                          className={`pl-9 py-2 text-sm ${errors.endereco ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.endereco && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.endereco}
                        </p>
                      )}
                    </div>

                    {/* Cidade (obrigatória) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Cidade <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                          name="cidade"
                          value={form.cidade}
                          onChange={handleInputChange}
                          className="w-full pl-9 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none appearance-none bg-white"
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

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
                      <p className="text-xs text-blue-700 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>
                          Seus dados estão seguros e serão usados apenas para 
                          facilitar a comunicação com os prestadores.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="py-2.5 text-sm px-6"
                      leftIcon={<ArrowLeft size={16} />}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-accent hover:bg-accent/90 text-white py-2.5 text-sm px-6"
                      rightIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    >
                      {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Link para login */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-accent hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
