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
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  Wrench,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin,
  Briefcase,
  Star,
  Clock,
  MessageCircle,
  IdCard,
  Home,
  Smartphone,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICE_CATEGORIES, getEspecialidadesByCategoria, Especialidade } from '../../constants/categories';

// ============================================
// INTERFACES
// ============================================
interface PrestadorForm {
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
  categoria: string;
  especialidade: string;
  descricao: string;
  experiencia: string;
  endereco: string;
  cidade: string;
  valorHora: number;
  documentos: {
    bi: File | null;           // Bilhete de Identidade (opcional)
    declaracaoBairro: File | null; // Declaração do Bairro (opcional)
  };
}

interface FileWithPreview {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

interface DocumentoRequerido {
  id: keyof PrestadorForm['documentos'];
  label: string;
  descricao: string;
  aceitos: string;
  obrigatorio: boolean;
  icon: any;
}

// ============================================
// CONSTANTES
// ============================================
const DOCUMENTOS_REQUERIDOS: DocumentoRequerido[] = [
  {
    id: 'bi',
    label: 'Bilhete de Identidade',
    descricao: 'Frente e verso do seu BI (PDF ou imagem)',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: false, // AGORA É OPCIONAL
    icon: IdCard
  },
  {
    id: 'declaracaoBairro',
    label: 'Declaração do Bairro',
    descricao: 'Comprovativo de residência emitido pelo bairro',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: false, // AGORA É OPCIONAL
    icon: Home
  }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function RegisterPrestador() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  
  // Estados
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileWithPreview>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentosAlert, setDocumentosAlert] = useState(false);
  
  const [form, setForm] = useState<PrestadorForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    categoria: '',
    especialidade: '',
    descricao: '',
    experiencia: '',
    endereco: '',
    cidade: 'Maputo',
    valorHora: 500,
    documentos: {
      bi: null,
      declaracaoBairro: null
    }
  });

  // ============================================
  // HANDLERS DE FORMULÁRIO
  // ============================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidade: '' }));
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

  const handleEspecialidadeSelect = (especialidadeId: string) => {
    setForm(prev => ({ ...prev, especialidade: especialidadeId }));
    if (errors.especialidade) {
      setErrors(prev => ({ ...prev, especialidade: '' }));
    }
  };

  // ============================================
  // HANDLERS DE UPLOAD DE DOCUMENTOS
  // ============================================
  const handleFileUpload = (tipo: keyof PrestadorForm['documentos'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      showToast('Formato não permitido. Use PDF, JPG ou PNG', 'error');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 5MB', 'error');
      return;
    }

    // Criar preview para imagens
    let preview = '';
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setUploadedFiles(prev => ({
      ...prev,
      [tipo]: {
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type
      }
    }));

    setForm(prev => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        [tipo]: file
      }
    }));

    showToast(`${DOCUMENTOS_REQUERIDOS.find(d => d.id === tipo)?.label} carregado!`, 'success');
    
    // Verificar se ainda faltam documentos
    const temBi = !!uploadedFiles['bi'] || tipo === 'bi';
    const temDeclaracao = !!uploadedFiles['declaracaoBairro'] || tipo === 'declaracaoBairro';
    setDocumentosAlert(!temBi || !temDeclaracao);
  };

  const handleRemoveFile = (tipo: keyof PrestadorForm['documentos']) => {
    if (uploadedFiles[tipo]?.preview) {
      URL.revokeObjectURL(uploadedFiles[tipo].preview);
    }

    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[tipo];
      return newFiles;
    });

    setForm(prev => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        [tipo]: null
      }
    }));

    // Atualizar alerta
    const temBi = tipo !== 'bi' ? !!uploadedFiles['bi'] : false;
    const temDeclaracao = tipo !== 'declaracaoBairro' ? !!uploadedFiles['declaracaoBairro'] : false;
    setDocumentosAlert(!temBi || !temDeclaracao);
  };

  // ============================================
  // VALIDAÇÕES
  // ============================================
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
    
    if (!form.categoria) {
      newErrors.categoria = 'Selecione uma categoria';
    }
    if (!form.especialidade) {
      newErrors.especialidade = 'Selecione uma especialidade';
    }
    if (!form.descricao.trim() || form.descricao.length < 20) {
      newErrors.descricao = 'Descreva sua experiência (mínimo 20 caracteres)';
    }
    if (!form.experiencia) {
      newErrors.experiencia = 'Informe seus anos de experiência';
    }
    if (!form.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // SUBMISSÃO
  // ============================================
  const handleSubmit = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
      return;
    }

    // PASSO 3: Documentos (opcionais) - pode prosseguir mesmo sem documentos
    setLoading(true);

    try {
      // Verificar quais documentos foram carregados para o alerta
      const temBi = !!uploadedFiles['bi'];
      const temDeclaracao = !!uploadedFiles['declaracaoBairro'];
      const documentosPendentes = !temBi || !temDeclaracao;
      
      // Se email não foi preenchido, usar o telefone como identificador
      const userData = {
        nome: form.nome,
        email: form.email || `${form.telefone.replace(/\D/g, '')}@prestador.dexapp.co.mz`,
        telefone: form.telefone,
        password: form.password,
        profile: 'prestador',
        especialidade: form.especialidade,
        categoria: form.categoria,
        descricao: form.descricao,
        experiencia: form.experiencia,
        endereco: form.endereco,
        cidade: form.cidade,
        valorHora: form.valorHora,
        status: documentosPendentes ? 'pendente_documentos' : 'pendente',
        documentosAlert: documentosPendentes,
        documentos: Object.keys(uploadedFiles).reduce((acc, key) => {
          acc[key] = {
            nome: uploadedFiles[key].name,
            tipo: uploadedFiles[key].type,
            dataUpload: new Date()
          };
          return acc;
        }, {} as any)
      };

      const result = await register(userData);

      if (result.success) {
        setStep(4);
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* ======================================== */}
          {/* HEADER */}
          {/* ======================================== */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl hover:scale-105 transition-transform">
                D
              </div>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">
              Registro de <span className="text-accent">Prestador</span>
            </h1>
            <p className="text-gray-500">
              Preencha seus dados para começar a oferecer serviços
            </p>
          </div>

          {/* ======================================== */}
          {/* PROGRESSO */}
          {/* ======================================== */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Dados Básicos' },
              { num: 2, label: 'Profissão' },
              { num: 3, label: 'Documentos' },
              { num: 4, label: 'Confirmação' }
            ].map((i) => (
              <React.Fragment key={i.num}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= i.num 
                      ? 'bg-accent text-white' 
                      : step === i.num - 1 ? 'bg-accent/20 text-accent' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > i.num ? <CheckCircle2 size={16} /> : i.num}
                  </div>
                  <span className={`ml-2 text-xs font-bold hidden md:block ${
                    step >= i.num ? 'text-accent' : 'text-gray-400'
                  }`}>
                    {i.label}
                  </span>
                </div>
                {i.num < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > i.num ? 'bg-accent' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-6 md:p-8">
              {/* ======================================== */}
              {/* PASSO 1: DADOS BÁSICOS */}
              {/* ======================================== */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-black text-primary mb-6">
                    Dados <span className="text-accent">Pessoais</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Nome (obrigatório) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nome Completo <span className="text-accent">*</span>
                      </label>
                      <Input
                        name="nome"
                        value={form.nome}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        className={errors.nome ? 'border-red-500' : ''}
                        leftIcon={<User size={16} />}
                      />
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
                      <Input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleInputChange}
                        placeholder="84 123 4567"
                        className={errors.telefone ? 'border-red-500' : ''}
                        leftIcon={<Smartphone size={16} />}
                      />
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
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className={errors.email ? 'border-red-500' : ''}
                        leftIcon={<Mail size={16} />}
                      />
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
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                          leftIcon={<Lock size={16} />}
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
                        <Input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          leftIcon={<Lock size={16} />}
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
                        <Info size={14} className="shrink-0 mt-0.5" />
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

              {/* ======================================== */}
              {/* PASSO 2: PROFISSÃO */}
              {/* ======================================== */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-black text-primary mb-6">
                    Dados <span className="text-accent">Profissionais</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Categoria */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Categoria de Serviço <span className="text-accent">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategorias(!showCategorias)}
                          className="w-full p-3 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between text-sm"
                        >
                          <span className={form.categoria ? 'text-primary font-bold' : 'text-gray-400'}>
                            {form.categoria 
                              ? SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome 
                              : 'Selecione sua categoria'}
                          </span>
                          {showCategorias ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        <AnimatePresence>
                          {showCategorias && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                            >
                              {SERVICE_CATEGORIES.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoriaSelect(cat.id)}
                                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                                    form.categoria === cat.id ? 'bg-accent/5 border-l-4 border-accent' : ''
                                  }`}
                                >
                                  <span className="font-bold text-primary">{cat.nome}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {errors.categoria && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.categoria}
                        </p>
                      )}
                    </div>

                    {/* Especialidade */}
                    {categoriaSelecionada && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Especialidade <span className="text-accent">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {especialidades.map((esp) => (
                            <button
                              key={esp.id}
                              onClick={() => handleEspecialidadeSelect(esp.id)}
                              className={`p-3 border-2 rounded-xl text-left transition-all text-sm ${
                                form.especialidade === esp.id
                                  ? 'border-accent bg-accent/5'
                                  : 'border-gray-200 hover:border-accent/50'
                              }`}
                            >
                              <h3 className="font-bold text-primary">{esp.nome}</h3>
                              <p className="text-xs text-gray-500">{esp.descricao}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  esp.tamanho === 'pequeno' ? 'bg-green-100 text-green-700' :
                                  esp.tamanho === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {esp.tamanho === 'pequeno' ? 'Pequeno' : 
                                   esp.tamanho === 'medio' ? 'Médio' : 'Grande'}
                                </span>
                                <span className="text-xs font-bold text-primary">
                                  {esp.precoBase.toLocaleString()} MT base
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.especialidade && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.especialidade}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Descrição */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Sobre você e sua experiência <span className="text-accent">*</span>
                      </label>
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleInputChange}
                        placeholder="Descreva sua experiência, formação e serviços que oferece..."
                        className={`w-full p-3 border-2 rounded-xl focus:border-accent focus:outline-none min-h-[100px] text-sm ${
                          errors.descricao ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {form.descricao.length} caracteres (mínimo 20)
                      </p>
                      {errors.descricao && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.descricao}
                        </p>
                      )}
                    </div>

                    {/* Anos de Experiência */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Anos de Experiência <span className="text-accent">*</span>
                      </label>
                      <select
                        name="experiencia"
                        value={form.experiencia}
                        onChange={handleInputChange}
                        className={`w-full p-3 border-2 rounded-xl focus:border-accent focus:outline-none text-sm ${
                          errors.experiencia ? 'border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Selecione</option>
                        <option value="menos-1">Menos de 1 ano</option>
                        <option value="1-3">1 a 3 anos</option>
                        <option value="3-5">3 a 5 anos</option>
                        <option value="5-10">5 a 10 anos</option>
                        <option value="mais-10">Mais de 10 anos</option>
                      </select>
                      {errors.experiencia && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.experiencia}
                        </p>
                      )}
                    </div>

                    {/* Valor por Hora */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Valor por Hora (MT) <span className="text-accent">*</span>
                      </label>
                      <Input
                        name="valorHora"
                        type="number"
                        value={form.valorHora}
                        onChange={handleInputChange}
                        placeholder="500"
                        leftIcon={<Briefcase size={16} />}
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Defina seu valor por hora de trabalho
                      </p>
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Endereço <span className="text-accent">*</span>
                      </label>
                      <Input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleInputChange}
                        placeholder="Bairro, Quarteirão, Casa"
                        leftIcon={<MapPin size={16} />}
                        className={`text-sm ${errors.endereco ? 'border-red-500' : ''}`}
                      />
                      {errors.endereco && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.endereco}
                        </p>
                      )}
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Cidade <span className="text-accent">*</span>
                      </label>
                      <select
                        name="cidade"
                        value={form.cidade}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
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

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      leftIcon={<ArrowLeft size={16} />}
                      className="py-2.5 text-sm"
                    >
                      Voltar
                    </Button>
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

              {/* ======================================== */}
              {/* PASSO 3: DOCUMENTOS (OPCIONAIS) */}
              {/* ======================================== */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-black text-primary mb-6">
                    <span className="text-accent">Documentos</span> (Opcionais)
                  </h2>

                  <div className="space-y-6">
                    {DOCUMENTOS_REQUERIDOS.map((doc) => {
                      const uploaded = uploadedFiles[doc.id];
                      const Icon = doc.icon;

                      return (
                        <div key={doc.id} className="border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                                <Icon size={20} />
                              </div>
                              <div>
                                <h3 className="font-bold text-primary text-sm">
                                  {doc.label}
                                  <span className="text-gray-400 font-normal ml-2">(opcional)</span>
                                </h3>
                                <p className="text-xs text-gray-500">{doc.descricao}</p>
                              </div>
                            </div>
                            {uploaded && (
                              <CheckCircle2 size={20} className="text-green-500" />
                            )}
                          </div>

                          {!uploaded ? (
                            <div className="mt-3">
                              <input
                                type="file"
                                id={`file-${doc.id}`}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(doc.id, e)}
                                className="hidden"
                              />
                              <label
                                htmlFor={`file-${doc.id}`}
                                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-accent transition-colors cursor-pointer text-sm"
                              >
                                <Upload size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-600">Carregar {doc.label}</span>
                                <span className="text-xs text-gray-400 ml-2">{doc.aceitos}</span>
                              </label>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                {uploaded.type.startsWith('image/') && uploaded.preview ? (
                                  <img src={uploaded.preview} alt={doc.label} className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <FileText size={20} className="text-green-600" />
                                )}
                                <div className="overflow-hidden">
                                  <p className="text-sm font-bold text-green-700 truncate">{uploaded.name}</p>
                                  <p className="text-xs text-green-600">
                                    {(uploaded.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(doc.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Alerta de documentos pendentes */}
                    {(!uploadedFiles['bi'] || !uploadedFiles['declaracaoBairro']) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-yellow-700 mb-1">
                              Documentos pendentes
                            </p>
                            <p className="text-xs text-yellow-600">
                              Pode prosseguir sem os documentos, mas seu perfil ficará com status 
                              <span className="font-bold"> "pendente_documentos"</span> até que os envie.
                              A central entrará em contato para regularizar.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-700 mb-1">
                            Documentos são opcionais no registro
                          </p>
                          <p className="text-xs text-blue-600">
                            Pode completar seu cadastro agora e enviar os documentos depois.
                            Recomendamos enviar para agilizar a aprovação do seu perfil.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      leftIcon={<ArrowLeft size={16} />}
                      className="py-2.5 text-sm"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-accent hover:bg-accent/90 text-white py-2.5 text-sm px-6"
                      rightIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    >
                      {loading ? 'Registrando...' : 'Finalizar Registro'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ======================================== */}
              {/* PASSO 4: CONFIRMAÇÃO */}
              {/* ======================================== */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>

                  <h2 className="text-3xl font-black text-primary mb-3">
                    Registro <span className="text-accent">Enviado!</span>
                  </h2>

                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Seu cadastro foi recebido com sucesso!
                  </p>

                  {(!uploadedFiles['bi'] || !uploadedFiles['declaracaoBairro']) && (
                    <Card className="bg-yellow-50 border-yellow-200 mb-8 text-left">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-yellow-700 mb-2">
                              Atenção: Documentos pendentes
                            </p>
                            <p className="text-sm text-yellow-600 mb-3">
                              Seu perfil está com status <span className="font-bold">"pendente_documentos"</span>.
                              Para ativação completa, envie os documentos através do seu dashboard ou entre em contato com a central.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-50 border-none mb-8 text-left">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-primary mb-4">Próximos Passos:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">1</div>
                          <div>
                            <p className="font-bold text-primary">Análise de Documentos</p>
                            <p className="text-xs text-gray-500">
                              {uploadedFiles['bi'] && uploadedFiles['declaracaoBairro'] 
                                ? 'Documentos recebidos, aguardando verificação.' 
                                : 'Envie seus documentos para agilizar a aprovação.'}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">2</div>
                          <div>
                            <p className="font-bold text-primary">Verificação de Antecedentes</p>
                            <p className="text-xs text-gray-500">Nossa equipa verificará suas informações.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">3</div>
                          <div>
                            <p className="font-bold text-primary">Ativação do Perfil</p>
                            <p className="text-xs text-gray-500">Após aprovação, seu perfil estará ativo.</p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-accent/5 border-accent/20 mb-8">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <MessageCircle size={18} className="text-accent" />
                        Contatos da Central
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="https://wa.me/258871425316"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <MessageCircle size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500">WhatsApp</p>
                            <p className="font-bold text-primary">+258 87 142 5316</p>
                          </div>
                        </a>

                        <a
                          href="mailto:central@dexapp.co.mz"
                          className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <Mail size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500">Email</p>
                            <p className="font-bold text-primary">central@dexapp.co.mz</p>
                          </div>
                        </a>

                        <a
                          href="tel:+258871425316"
                          className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500">Telefone</p>
                            <p className="font-bold text-primary">+258 87 142 5316</p>
                          </div>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Ir para Início
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    >
                      Ir para Login
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
