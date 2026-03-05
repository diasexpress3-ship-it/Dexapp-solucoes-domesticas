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
  Mail, Lock, User, Phone, Briefcase, FileText, 
  ChevronRight, ChevronLeft, Upload, X, Loader2,
  Camera, CheckCircle, ShieldCheck, AlertCircle,
  MessageCircle, Headphones
} from 'lucide-react';
import { SERVICE_CATEGORIES, ESPECIALIDADES_POR_CATEGORIA } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Estados para upload de documentos
  const [isUploading, setIsUploading] = useState({
    bi: false,
    declaracao: false,
    certificado: false,
    profile: false
  });
  
  const [documentos, setDocumentos] = useState({
    biUrl: '',
    declaracaoUrl: '',
    certificadoUrl: '',
    profileUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  // Função de upload para ImgBB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'bi' | 'declaracao' | 'certificado' | 'profile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificações de segurança
    if (!file.name || !file.type) {
      showToast('Arquivo inválido', 'error');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 5MB', 'error');
      return;
    }

    // Verificar formato
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Formato não permitido. Use JPG, PNG ou PDF', 'error');
      return;
    }

    setIsUploading(prev => ({ ...prev, [tipo]: true }));
    
    const data = new FormData();
    data.append('image', file);

    const apiKey = import.meta.env.VITE_PUBLIC_IMGBB_KEY;
    if (!apiKey) {
      showToast('Chave da API ImgBB não configurada', 'error');
      setIsUploading(prev => ({ ...prev, [tipo]: false }));
      return;
    }
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        throw new Error('Erro na resposta do servidor');
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.url) {
        setDocumentos(prev => ({ ...prev, [`${tipo}Url`]: result.data.url }));
        showToast('Documento carregado com sucesso!', 'success');
      } else {
        throw new Error('Falha no upload - resposta inválida');
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showToast('Erro ao carregar documento. Tente novamente.', 'error');
    } finally {
      setIsUploading(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData.nome?.trim()) {
      showToast('Nome completo é obrigatório', 'error');
      return false;
    }
    if (!formData.telefone?.trim()) {
      showToast('Contacto telefónico é obrigatório', 'error');
      return false;
    }
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
    // Email é opcional
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.categoria) {
      showToast('Selecione uma categoria', 'error');
      return false;
    }
    if (formData.especialidades.length === 0) {
      showToast('Selecione pelo menos uma especialidade', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!documentos.biUrl) {
      showToast('Por favor, carregue o Bilhete de Identidade', 'error');
      return false;
    }
    if (!documentos.declaracaoUrl) {
      showToast('Por favor, carregue a Declaração do Bairro', 'error');
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
      const emailParaAuth = formData.email?.trim() || `${formData.telefone.replace(/\s+/g, '')}@prestador.temp.dex.co.mz`;
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailParaAuth, formData.password);
      const user = userCredential.user;

      if (!user || !user.uid) {
        throw new Error('Erro ao criar usuário');
      }

      // Salvar no Firestore com as URLs dos documentos
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        nome: formData.nome.trim(),
        email: formData.email?.trim() || null,
        telefone: formData.telefone.trim(),
        profile: 'prestador',
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        ultimoAcesso: null,
        prestadorData: {
          categoria: formData.categoria,
          especialidades: formData.especialidades,
          biografia: formData.biografia,
          biUrl: documentos.biUrl,
          declaracaoUrl: documentos.declaracaoUrl,
          certificadoUrl: documentos.certificadoUrl || null,
          profileUrl: documentos.profileUrl || null,
          rating: 5.0,
          trabalhos: 0,
          disponivel: true,
          agenda: []
        }
      });

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
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
              {/* Passo 1: Dados Pessoais */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <User size={20} className="text-accent" />
                    Dados Pessoais
                  </h3>
                  
                  <Input
                    label="Nome Completo *"
                    name="nome"
                    placeholder="Ex: João Silva"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Contacto Telefónico *"
                    name="telefone"
                    placeholder="Ex: 84 000 0000"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Email (opcional)"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Senha *"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Confirmar Senha *"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleNext} rightIcon={<ChevronRight size={18} />}>
                      Próximo
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Passo 2: Categoria e Especialidades */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <Briefcase size={20} className="text-accent" />
                    Categoria e Especialidades
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Categoria Principal *</label>
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <label className="text-sm font-semibold text-gray-700 ml-1">Especialidades *</label>
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
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Biografia / Experiência</label>
                    <textarea
                      name="biografia"
                      value={formData.biografia}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Conte um pouco sobre sua experiência profissional..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack} leftIcon={<ChevronLeft size={18} />}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={handleNext} rightIcon={<ChevronRight size={18} />}>
                      Próximo
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Passo 3: Documentos */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <FileText size={20} className="text-accent" />
                    Documentos
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Carregue seus documentos para validação. Formatos aceitos: JPG, PNG, PDF (máx. 5MB cada)
                  </p>

                  {/* Bilhete de Identidade */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Bilhete de Identidade * <span className="text-xs text-gray-400">(Frente e Verso)</span>
                    </label>
                    <label className="relative block w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group overflow-hidden">
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'bi')}
                      />
                      {documentos.biUrl ? (
                        <>
                          {documentos.biUrl.includes('.pdf') ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
                              <FileText className="w-10 h-10 text-green-500 mb-2" />
                              <p className="text-sm font-bold text-green-600">PDF Carregado</p>
                            </div>
                          ) : (
                            <img src={documentos.biUrl} alt="BI" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setDocumentos(prev => ({ ...prev, biUrl: '' }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {isUploading.bi ? (
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-accent transition-colors" />
                              <p className="text-xs font-bold text-gray-400">Clique para enviar</p>
                            </>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Declaração do Bairro */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Declaração do Bairro *</label>
                    <label className="relative block w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group overflow-hidden">
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'declaracao')}
                      />
                      {documentos.declaracaoUrl ? (
                        <>
                          {documentos.declaracaoUrl.includes('.pdf') ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
                              <FileText className="w-10 h-10 text-green-500 mb-2" />
                              <p className="text-sm font-bold text-green-600">PDF Carregado</p>
                            </div>
                          ) : (
                            <img src={documentos.declaracaoUrl} alt="Declaração" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setDocumentos(prev => ({ ...prev, declaracaoUrl: '' }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {isUploading.declaracao ? (
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-accent transition-colors" />
                              <p className="text-xs font-bold text-gray-400">Clique para enviar</p>
                            </>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Certificado (opcional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Certificado Profissional <span className="text-xs text-gray-400">(opcional)</span>
                    </label>
                    <label className="relative block w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group overflow-hidden">
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'certificado')}
                      />
                      {documentos.certificadoUrl ? (
                        <>
                          {documentos.certificadoUrl.includes('.pdf') ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
                              <FileText className="w-10 h-10 text-green-500 mb-2" />
                              <p className="text-sm font-bold text-green-600">PDF Carregado</p>
                            </div>
                          ) : (
                            <img src={documentos.certificadoUrl} alt="Certificado" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setDocumentos(prev => ({ ...prev, certificadoUrl: '' }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {isUploading.certificado ? (
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-accent transition-colors" />
                              <p className="text-xs font-bold text-gray-400">Clique para enviar</p>
                            </>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Foto de Perfil (opcional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Foto de Perfil <span className="text-xs text-gray-400">(opcional)</span>
                    </label>
                    <label className="relative block w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group overflow-hidden">
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'profile')}
                      />
                      {documentos.profileUrl ? (
                        <>
                          <img src={documentos.profileUrl} alt="Perfil" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setDocumentos(prev => ({ ...prev, profileUrl: '' }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isUploading.profile ? (
                            <Loader2 className="w-6 h-6 text-accent animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Camera className="w-5 h-5 text-gray-300" />
                              <p className="text-sm text-gray-400">Adicionar foto</p>
                            </div>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Aviso */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-600 font-medium leading-relaxed">
                      Seus documentos serão analisados pela central. A validação pode levar até 24 horas. 
                      Você receberá uma notificação quando sua conta for ativada.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack} leftIcon={<ChevronLeft size={18} />}>
                      Voltar
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                      {isLoading ? 'Enviando...' : 'Enviar para Validação'}
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
          </CardContent>
        </Card>
      </div>

      {/* Modal de Sucesso */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary">Registo Enviado!</h3>
                  <p className="text-gray-600">
                    Seu pedido foi recebido e será analisado pela central.
                  </p>
                  <p className="font-bold text-accent">
                    Sua conta será ativada em até 24 horas.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                  <p className="font-bold text-primary">Caso não receba retorno:</p>
                  
                  <a
                    href="https://wa.me/258871425316"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold">WhatsApp: +258 87 142 5316</span>
                  </a>

                  <a
                    href="mailto:central@dex.co.mz"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-bold">central@dex.co.mz</span>
                  </a>

                  <a
                    href="tel:+258841425316"
                    className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Headphones className="w-5 h-5" />
                    <span className="font-bold">+258 84 142 5316</span>
                  </a>
                </div>

                <Button onClick={() => { setShowSuccessModal(false); navigate('/'); }} fullWidth>
                  Voltar para o Início
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
