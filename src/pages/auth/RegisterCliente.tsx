import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useToast } from '../../contexts/ToastContext';
import { 
  User, Phone, Mail, Lock, MapPin, Home, 
  Hash, Eye, EyeOff, ArrowRight, Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterCliente() {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    bairro: '',
    quarteirao: '',
    numeroCasa: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados Pessoais, 2: Endereço, 3: Senha
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.nome?.trim()) {
      showToast('Nome completo é obrigatório', 'error');
      return false;
    }
    if (!formData.telefone?.trim()) {
      showToast('Contacto telefónico é obrigatório', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.bairro?.trim()) {
      showToast('Bairro é obrigatório', 'error');
      return false;
    }
    if (!formData.quarteirao?.trim()) {
      showToast('Quarteirão é obrigatório', 'error');
      return false;
    }
    if (!formData.numeroCasa?.trim()) {
      showToast('Número da casa é obrigatório', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.password) {
      showToast('Senha é obrigatória', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setIsLoading(true);
    
    try {
      // Gerar email temporário se não foi fornecido
      const emailParaAuth = formData.email?.trim() || `${formData.telefone.replace(/\s+/g, '')}@cliente.temp.dex.co.mz`;
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailParaAuth, formData.password);
      const user = userCredential.user;

      // Preparar endereço completo
      const endereco = {
        bairro: formData.bairro.trim(),
        quarteirao: formData.quarteirao.trim(),
        numeroCasa: formData.numeroCasa.trim(),
        completo: `${formData.bairro.trim()}, Q. ${formData.quarteirao.trim()}, Casa ${formData.numeroCasa.trim()}`
      };

      // Salvar dados no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        nome: formData.nome.trim(),
        email: formData.email?.trim() || null,
        telefone: formData.telefone.trim(),
        endereco: endereco,
        profile: 'cliente',
        status: 'ativo',
        dataCadastro: serverTimestamp(),
        ultimoAcesso: null,
        preferencias: {
          notificacoes: true,
          emailPromocoes: false
        }
      });

      showToast('Conta criada com sucesso!', 'success');
      
      // Redirecionar para o dashboard do cliente
      navigate('/cliente/dashboard', { 
        state: { 
          bemVindo: true,
          nome: formData.nome.split(' ')[0]
        } 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Dados Pessoais', icon: User },
    { number: 2, title: 'Endereço', icon: MapPin },
    { number: 3, title: 'Segurança', icon: Lock }
  ];

  return (
    <AppLayout hideHeader hideFooter>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-primary to-blue-900 p-8 text-white">
              <Link to="/" className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xs">D</div>
                <span className="text-sm font-bold">Voltar ao Início</span>
              </Link>
              
              <h1 className="text-3xl font-black mb-2">Criar conta de Cliente</h1>
              <p className="text-white/80">Preencha seus dados para começar a solicitar serviços</p>
            </div>

            {/* Progress Steps */}
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <React.Fragment key={s.number}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                        step >= s.number 
                          ? 'bg-accent text-white shadow-lg shadow-orange-500/20' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <s.icon size={18} />
                      </div>
                      <span className={`text-sm font-bold hidden md:block ${
                        step >= s.number ? 'text-primary' : 'text-gray-400'
                      }`}>
                        {s.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className={`w-5 h-5 ${
                        step > s.number ? 'text-accent' : 'text-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <CardContent className="p-8">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Passo 1: Dados Pessoais */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-black text-primary mb-4">Informações Pessoais</h3>
                    
                    <Input
                      label="Nome Completo *"
                      name="nome"
                      placeholder="Ex: João Silva"
                      value={formData.nome}
                      onChange={handleChange}
                      leftIcon={<User size={18} className="text-gray-400" />}
                      required
                    />
                    
                    <Input
                      label="Contacto Telefónico *"
                      name="telefone"
                      placeholder="Ex: 84 000 0000"
                      value={formData.telefone}
                      onChange={handleChange}
                      leftIcon={<Phone size={18} className="text-gray-400" />}
                      required
                    />
                    
                    <Input
                      label="Email (opcional)"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      leftIcon={<Mail size={18} className="text-gray-400" />}
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="button" 
                        onClick={handleNext}
                        rightIcon={<ArrowRight size={18} />}
                        className="px-8"
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
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-black text-primary mb-4">Endereço de Residência</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Bairro *"
                        name="bairro"
                        placeholder="Ex: Polana"
                        value={formData.bairro}
                        onChange={handleChange}
                        leftIcon={<MapPin size={18} className="text-gray-400" />}
                        required
                      />
                      
                      <Input
                        label="Quarteirão *"
                        name="quarteirao"
                        placeholder="Ex: 123"
                        value={formData.quarteirao}
                        onChange={handleChange}
                        leftIcon={<Hash size={18} className="text-gray-400" />}
                        required
                      />
                    </div>
                    
                    <Input
                      label="Número da Casa *"
                      name="numeroCasa"
                      placeholder="Ex: 45"
                      value={formData.numeroCasa}
                      onChange={handleChange}
                      leftIcon={<Home size={18} className="text-gray-400" />}
                      required
                    />

                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBack}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleNext}
                        rightIcon={<ArrowRight size={18} />}
                        className="px-8"
                      >
                        Continuar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Passo 3: Senha */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-black text-primary mb-4">Segurança da Conta</h3>
                    
                    <div className="relative">
                      <Input
                        label="Senha *"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        leftIcon={<Lock size={18} className="text-gray-400" />}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirmar Senha *"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        leftIcon={<Lock size={18} className="text-gray-400" />}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Dicas de senha */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                      <p className="text-xs text-blue-600 font-medium">
                        <Sparkles className="inline w-3 h-3 mr-1" />
                        Sua senha deve ter pelo menos 6 caracteres. Use letras e números para maior segurança.
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBack}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-accent hover:bg-accent/90 text-white px-8"
                        isLoading={isLoading}
                      >
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-accent font-bold hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  © 2026 DEXAPP - Soluções Domésticas
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
