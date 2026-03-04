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
import { Mail, Lock, User, Phone, Briefcase, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { SERVICE_CATEGORIES, ESPECIALIDADES_POR_CATEGORIA } from '../../constants/categories';

export default function RegisterPrestador() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    categoria: '',
    especialidades: [] as string[],
    biografia: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEspecialidade = (esp: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp]
    }));
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
        profile: 'prestador',
        status: 'pending',
        dataCadastro: serverTimestamp(),
        prestadorData: {
          categoria: formData.categoria,
          especialidades: formData.especialidades,
          biografia: formData.biografia,
          rating: 5,
          totalServicos: 0,
          documentos: [], // To be uploaded later
        }
      });

      showToast('Cadastro realizado! Aguarde a aprovação da nossa central.', 'success');
      navigate('/prestador/dashboard');
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
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
              <span className="text-2xl font-black text-primary">DEXAPP</span>
            </Link>
            <h1 className="text-2xl font-bold text-primary">Seja um Prestador</h1>
            <p className="text-gray-500 text-sm">Passo {step} de 3</p>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <User size={20} className="text-accent" />
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome Completo"
                      name="nome"
                      placeholder="Ex: João Silva"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Telefone"
                      name="telefone"
                      placeholder="+258 84 000 0000"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Senha"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Confirmar Senha"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)} rightIcon={<ChevronRight size={18} />}>
                      Próximo
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <Briefcase size={20} className="text-accent" />
                    Categoria e Especialidades
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Categoria Principal</label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.categoria && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Especialidades</label>
                      <div className="flex flex-wrap gap-2">
                        {ESPECIALIDADES_POR_CATEGORIA[formData.categoria]?.map(esp => (
                          <button
                            key={esp}
                            type="button"
                            onClick={() => toggleEspecialidade(esp)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                              formData.especialidades.includes(esp)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                            }`}
                          >
                            {esp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} leftIcon={<ChevronLeft size={18} />}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} rightIcon={<ChevronRight size={18} />}>
                      Próximo
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <FileText size={20} className="text-accent" />
                    Biografia e Finalização
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Fale um pouco sobre você e sua experiência</label>
                    <textarea
                      name="biografia"
                      value={formData.biografia}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Descreva suas habilidades, anos de experiência, etc..."
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong>Nota:</strong> Após o cadastro, você precisará enviar seus documentos (BI, Certificados) através do dashboard para que nossa central possa validar seu perfil.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} leftIcon={<ChevronLeft size={18} />}>
                      Voltar
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                      Finalizar Cadastro
                    </Button>
                  </div>
                </div>
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
