import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, ArrowRight, 
  ShieldCheck, Eye, EyeOff, Home, ArrowLeft,
  Save, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { db, auth } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const NovoAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.nome || !formData.email || !formData.password) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return false;
    }

    if (formData.password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Email inválido', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Preparar dados do admin para o Firestore
      const novoAdmin = {
        id: user.uid,
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || '',
        profile: 'admin',
        status: 'ativo',
        dataCadastro: new Date().toISOString(),
        ultimoAcesso: null,
        permissoes: ['full_access']
      };

      // 3. Salvar no Firestore
      await setDoc(doc(db, 'users', user.uid), novoAdmin);
      
      showToast('Administrador criado com sucesso!', 'success');
      navigate('/admin/usuarios');
      
    } catch (error: any) {
      console.error("Erro ao criar admin:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        showToast('Este email já está em uso', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('A senha é muito fraca', 'error');
      } else {
        showToast('Erro ao criar administrador: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-accent">
            <Home className="w-4 h-4" /> Início
          </button>
          <span>/</span>
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-accent">
            Admin
          </button>
          <span>/</span>
          <button onClick={() => navigate('/admin/usuarios')} className="hover:text-accent">
            Utilizadores
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Novo Administrador</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-primary">Novo Administrador</h1>
            <p className="text-sm text-slate-500">Crie uma nova conta de administrador</p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="p-6 md:p-8 border-none shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-primary">Acesso Total</p>
                <p className="text-xs text-slate-500">Administradores têm permissão para gerir toda a plataforma</p>
              </div>
            </div>

            <Input 
              label="Nome Completo *" 
              name="nome"
              placeholder="Ex: João Silva" 
              icon={<User className="w-5 h-5 text-slate-400" />}
              required
              value={formData.nome}
              onChange={handleChange}
            />
            
            <Input 
              label="Email *" 
              name="email"
              type="email" 
              placeholder="admin@dex.co.mz" 
              icon={<Mail className="w-5 h-5 text-slate-400" />}
              required
              value={formData.email}
              onChange={handleChange}
            />
            
            <Input 
              label="Telefone (opcional)" 
              name="telefone"
              placeholder="Ex: 84 000 0000" 
              icon={<Phone className="w-5 h-5 text-slate-400" />}
              value={formData.telefone}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha *</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  icon={<Lock className="w-5 h-5 text-slate-400" />}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Senha *</label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  icon={<Lock className="w-5 h-5 text-slate-400" />}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600 leading-relaxed">
                Este administrador terá acesso completo a todas as funcionalidades da plataforma, 
                incluindo gestão de utilizadores, prestadores, pagamentos e configurações.
              </p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/usuarios')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                leftIcon={<Save className="w-5 h-5" />}
                loading={loading}
              >
                Criar Administrador
              </Button>
            </div>
          </form>
        </Card>

        {/* Botão Voltar flutuante */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
