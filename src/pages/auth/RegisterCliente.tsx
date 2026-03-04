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
import { Mail, Lock, User, Phone } from 'lucide-react';

export default function RegisterCliente() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        profile: 'cliente',
        status: 'active',
        dataCadastro: serverTimestamp(),
      });

      showToast('Conta criada com sucesso!', 'success');
      navigate('/cliente/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error.message || 'Erro ao criar conta.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout hideHeader hideFooter>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
              <span className="text-2xl font-black text-primary">DEXAPP</span>
            </Link>
            <h1 className="text-2xl font-bold text-primary">Criar conta de Cliente</h1>
            <p className="text-gray-500 text-sm">Registe-se para começar a solicitar serviços</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nome Completo"
                name="nome"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={handleChange}
                leftIcon={<User size={18} />}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                required
              />
              <Input
                label="Telefone"
                name="telefone"
                placeholder="+258 84 000 0000"
                value={formData.telefone}
                onChange={handleChange}
                leftIcon={<Phone size={18} />}
                required
              />
              <Input
                label="Senha"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                required
              />
              <Input
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Criar Conta
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-accent font-bold hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
