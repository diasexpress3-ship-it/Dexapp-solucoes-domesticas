import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, User, Wrench, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickAccessVisible, setQuickAccessVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Admin credentials pré-configuradas
  const adminCredentials = {
    email: 'startbusiness26@gmail.com',
    password: 'Sahombe13'
  };

  // Verificar se admin já existe no Firebase
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Esta é apenas uma verificação opcional
        console.log('Verificando acesso admin...');
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
      }
    };
    checkAdminExists();
  }, []);

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
      if (error.code === 'auth/too-many-requests') message = 'Muitas tentativas. Tente novamente mais tarde.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: string, creds: { email: string; password: string }) => {
    setEmail(creds.email);
    setPassword(creds.password);
    
    // Pequeno delay para mostrar o preenchimento
    setTimeout(async () => {
      setIsLoading(true);
      try {
        await login(creds.email, creds.password);
        showToast(`Bem-vindo, ${role}!`, 'success');
        navigate('/');
      } catch (error) {
        showToast(`Erro ao entrar como ${role}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  // Credenciais de teste (apenas para demonstração - não usar em produção)
  const testAccounts = {
    cliente: { email: 'cliente@teste.com', password: '123456' },
    prestador: { email: 'prestador@teste.com', password: '123456' },
    central: { email: 'central@teste.com', password: '123456' },
    admin: { email: adminCredentials.email, password: adminCredentials.password }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1D56]/5 to-[#FF7A00]/5 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card Principal */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/10 p-8 md:p-10 border border-gray-100">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0A1D56] to-[#1a2f70] rounded-3xl mb-6 shadow-lg shadow-primary/20">
              <span className="text-4xl font-black text-white">D</span>
            </div>
            <h1 className="text-4xl font-black text-[#0A1D56] tracking-tight mb-2">DEXAPP</h1>
            <h2 className="text-xl font-bold text-[#0A1D56] mb-1">Bem-vindo de volta</h2>
            <p className="text-gray-400 font-medium">Aceda à sua conta para continuar</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={20} className="text-gray-400" />}
              className="rounded-2xl border-gray-100 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 h-12"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={20} className="text-gray-400" />}
              className="rounded-2xl border-gray-100 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 h-12"
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-bold text-[#FF7A00] hover:underline transition-all">
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

          {/* Links de Registo */}
          <div className="mt-8 space-y-4">
            <p className="text-center text-sm font-bold text-gray-500">
              Não tem uma conta?{' '}
              <Link to="/register-cliente" className="text-[#FF7A00] hover:underline font-black">
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
              <Link to="/register-prestador" className="text-[#FF7A00] hover:underline font-black">
                Seja um Prestador
              </Link>
            </p>
          </div>

          {/* Botão para mostrar/esconder acesso rápido */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setQuickAccessVisible(!quickAccessVisible)}
              className="text-xs font-bold text-gray-300 hover:text-[#FF7A00] transition-colors uppercase tracking-widest"
            >
              {quickAccessVisible ? '▼ Ocultar Acesso Rápido' : '▶ Mostrar Acesso Rápido'}
            </button>
          </div>

          {/* Acesso Rápido por Perfil */}
          <motion.div
            initial={false}
            animate={{ height: quickAccessVisible ? 'auto' : 0, opacity: quickAccessVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-xs font-black text-gray-300 uppercase tracking-widest mb-4">
                Acesso Rápido por Perfil
              </p>
              <div className="grid grid-cols-4 gap-3">
                {/* Cliente */}
                <button
                  onClick={() => quickLogin('Cliente', testAccounts.cliente)}
                  className="group relative p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                  title="Acesso Cliente"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                      <User size={20} />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Cliente</span>
                  </div>
                </button>

                {/* Prestador */}
                <button
                  onClick={() => quickLogin('Prestador', testAccounts.prestador)}
                  className="group relative p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all"
                  title="Acesso Prestador"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-[#FF7A00] rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                      <Wrench size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#FF7A00] uppercase tracking-wider">Prestador</span>
                  </div>
                </button>

                {/* Central */}
                <button
                  onClick={() => quickLogin('Central', testAccounts.central)}
                  className="group relative p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
                  title="Acesso Central"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                      <Shield size={20} />
                    </div>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Central</span>
                  </div>
                </button>

                {/* Admin - Um pouco escondido, com tom mais suave */}
                <button
                  onClick={() => quickLogin('Admin', testAccounts.admin)}
                  className="group relative p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all opacity-70 hover:opacity-100"
                  title="Acesso Administrador"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Admin</span>
                  </div>
                </button>
              </div>

              {/* Admin Credentials Hint */}
              {quickAccessVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-3 bg-gray-50 rounded-xl text-center"
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Acesso Administrador
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    startbusiness26@gmail.com
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    ••••••••
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            © 2026 DEXAPP - Soluções Domésticas
          </p>
        </div>
      </motion.div>
    </div>
  );
}
