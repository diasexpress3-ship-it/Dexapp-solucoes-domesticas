import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Bem-vindo de volta!', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Erro ao entrar. Verifique suas credenciais.';
      if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado.';
      if (error.code === 'auth/wrong-password') message = 'Senha incorreta.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 rounded-2xl mb-6">
              <span className="text-3xl font-black text-[#0A1D56]">D</span>
            </div>
            <h1 className="text-4xl font-black text-[#0A1D56] tracking-tight mb-2">DEXAPP</h1>
            <h2 className="text-xl font-bold text-[#0A1D56] mb-1">Bem-vindo de volta</h2>
            <p className="text-gray-400 font-medium">Aceda à sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={20} className="text-gray-400" />}
              className="rounded-2xl border-gray-100 focus:border-accent"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} className="text-gray-400" />}
              className="rounded-2xl border-gray-100 focus:border-accent"
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" title="Esqueceu a senha?" className="text-sm font-bold text-accent hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight size={20} />}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-10 space-y-4">
            <p className="text-center text-sm font-bold text-gray-500">
              Não tem uma conta?{' '}
              <Link to="/register-cliente" className="text-[#FF7A00] hover:underline">
                Registe-se como Cliente
              </Link>
            </p>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-300 text-xs font-bold uppercase tracking-widest">ou</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
            <p className="text-center text-sm font-bold text-gray-500">
              Quer trabalhar connosco?{' '}
              <Link to="/register-prestador" className="text-[#FF7A00] hover:underline">
                Seja um Prestador
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            © 2026 DEXAPP - Soluções Domésticas
          </p>
        </div>
      </motion.div>
    </div>
  );
}
