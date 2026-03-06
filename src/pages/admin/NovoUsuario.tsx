import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { db, auth } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  User, Mail, Lock, Phone, Shield, 
  Eye, EyeOff, Home, ArrowLeft, Save,
  AlertCircle
} from 'lucide-react';

export default function NovoUsuario() {
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
    confirmPassword: '',
    role: 'cliente',
    status: 'ativo'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      const novoUsuario = {
        id: user.uid,
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || '',
        role: formData.role,
        status: formData.status,
        dataCadastro: new Date().toISOString(),
        ultimoAcesso: null
      };

      await setDoc(doc(db, 'users', user.uid), novoUsuario);
      
      showToast('Utilizador criado com sucesso!', 'success');
      navigate('/admin/usuarios');
      
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        showToast('Este email já está em uso', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('A senha é muito fraca', 'error');
      } else {
        showToast('Erro ao criar utilizador: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
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
          <span className="text-primary font-bold">Novo Utilizador</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-primary">Novo Utilizador</h1>
            <p className="text-sm text-gray-500">Crie uma nova conta na plataforma</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nome Completo *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                icon={<User size={18} className="text-gray-400" />}
                required
              />

              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="joao@email.com"
                icon={<Mail size={18} className="text-gray-400" />}
                required
              />

              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="+258 84 000 0000"
                icon={<Phone size={18} className="text-gray-400" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Senha *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    icon={<Lock size={18} className="text-gray-400" />}
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    icon={<Lock size={18} className="text-gray-400" />}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Perfil</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="prestador">Prestador</option>
                    <option value="central">Central</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 leading-relaxed">
                  O utilizador terá acesso à plataforma de acordo com o perfil selecionado.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save size={18} />}
                  loading={loading}
                >
                  Criar Utilizador
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Botão Voltar flutuante */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
