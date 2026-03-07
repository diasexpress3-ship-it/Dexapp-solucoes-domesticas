import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showToast('Login efetuado com sucesso!', 'success');
      } else {
        showToast(result.error || 'Erro ao fazer login', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showToast('Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
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
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Faça login para acessar sua conta
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="seu@email.com"
                      className={`pl-9 py-2 text-sm ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="••••••"
                      className={`pl-9 py-2 text-sm ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={loading}
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

                {/* Lembrar-me e Esqueci senha */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-3 h-3 text-accent border-gray-300 rounded focus:ring-accent"
                    />
                    <span className="ml-2 text-xs text-gray-600">Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-2.5 text-sm"
                  rightIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                {/* Link para registro */}
                <div className="text-center pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    Não tem uma conta?{' '}
                    <Link to="/register-cliente" className="font-bold text-accent hover:underline">
                      Criar conta
                    </Link>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ou{' '}
                    <Link to="/register-prestador" className="text-accent hover:underline">
                      registre-se como prestador
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informações de contato */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Precisa de ajuda?{' '}
              <a href="mailto:suporte@dexapp.co.mz" className="text-accent hover:underline">
                suporte@dexapp.co.mz
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
