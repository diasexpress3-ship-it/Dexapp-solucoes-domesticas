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
  MessageCircle
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
    bi: File | null;
    declaracaoRendimento: File | null;
    declaracaoBairro: File | null;
    certificado?: File | null;
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
    descricao: 'Frente e verso do seu BI',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: true,
    icon: FileText
  },
  {
    id: 'declaracaoRendimento',
    label: 'Declaração de Rendimento',
    descricao: 'Comprovativo de rendimento ou atividade',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: true,
    icon: FileText
  },
  {
    id: 'declaracaoBairro',
    label: 'Declaração do Bairro',
    descricao: 'Comprovativo de residência emitido pelo bairro',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: true,
    icon: FileText
  },
  {
    id: 'certificado',
    label: 'Certificado/Diploma (opcional)',
    descricao: 'Comprovativo de formação na área',
    aceitos: 'PDF, JPG, PNG (max 5MB)',
    obrigatorio: false,
    icon: FileText
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
      declaracaoRendimento: null,
      declaracaoBairro: null,
      certificado: null
    }
  });

  // ============================================
  // HANDLERS DE FORMULÁRIO
  // ============================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidade: '' }));
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

  const handleEspecialidadeSelect = (especialidadeId: string) => {
    setForm(prev => ({ ...prev, especialidade: especialidadeId }));
  };

  // ============================================
  // HANDLERS DE UPLOAD DE DOCUMENTOS
  // ============================================
  const handleFileUpload = (tipo: keyof PrestadorForm['documentos'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
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
  };

  // ============================================
  // VALIDAÇÕES
  // ============================================
  const validateStep1 = (): boolean => {
    if (!form.nome.trim()) {
      showToast('Nome é obrigatório', 'error');
      return false;
    }
    if (!form.email.trim()) {
      showToast('Email é obrigatório', 'error');
      return false;
    }
    if (!form.email.includes('@')) {
      showToast('Email inválido', 'error');
      return false;
    }
    if (!form.telefone.trim()) {
      showToast('Telefone é obrigatório', 'error');
      return false;
    }
    if (form.telefone.replace(/\D/g, '').length < 9) {
      showToast('Telefone deve ter 9 dígitos', 'error');
      return false;
    }
    if (!form.password) {
      showToast('Senha é obrigatória', 'error');
      return false;
    }
    if (form.password.length < 6) {
      showToast('Senha deve ter pelo menos 6 caracteres', 'error');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Senhas não coincidem', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!form.categoria) {
      showToast('Selecione uma categoria', 'error');
      return false;
    }
    if (!form.especialidade) {
      showToast('Selecione uma especialidade', 'error');
      return false;
    }
    if (!form.descricao.trim() || form.descricao.length < 20) {
      showToast('Descreva sua experiência (mínimo 20 caracteres)', 'error');
      return false;
    }
    if (!form.experiencia) {
      showToast('Informe seus anos de experiência', 'error');
      return false;
    }
    if (!form.endereco.trim()) {
      showToast('Endereço é obrigatório', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const documentosObrigatorios = DOCUMENTOS_REQUERIDOS.filter(d => d.obrigatorio);
    const faltando = documentosObrigatorios.filter(d => !uploadedFiles[d.id]);

    if (faltando.length > 0) {
      showToast(`Carregue todos os documentos obrigatórios`, 'error');
      return false;
    }
    return true;
  };

  // ============================================
  // SUBMISSÃO
  // ============================================
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Preparar dados para registro
      const userData = {
        nome: form.nome,
        email: form.email,
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
        status: 'pendente', // Prestador começa como pendente
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
        // Avançar para passo de confirmação
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto">
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= i.num 
                      ? 'bg-accent text-white' 
                      : step === i.num - 1 ? 'bg-accent/20 text-accent' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > i.num ? <CheckCircle2 size={20} /> : i.num}
                  </div>
                  <span className={`ml-2 text-sm font-bold hidden md:block ${
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
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        name="nome"
                        value={form.nome}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        leftIcon={<User size={18} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        leftIcon={<Mail size={18} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <Input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleInputChange}
                        placeholder="84 123 4567"
                        leftIcon={<Phone size={18} />}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Senha *
                        </label>
                        <Input
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          leftIcon={<Lock size={18} />}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Confirmar Senha *
                        </label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••"
                          leftIcon={<Lock size={18} />}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setStep(2)}
                      className="bg-accent hover:bg-accent/90 text-white"
                      rightIcon={<ArrowRight size={18} />}
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Categoria de Serviço *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategorias(!showCategorias)}
                          className="w-full p-3 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between"
                        >
                          <span className={form.categoria ? 'text-primary font-bold' : 'text-gray-400'}>
                            {form.categoria 
                              ? SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome 
                              : 'Selecione sua categoria'}
                          </span>
                          {showCategorias ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
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
                    </div>

                    {/* Especialidade */}
                    {categoriaSelecionada && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Especialidade *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {especialidades.map((esp) => (
                            <button
                              key={esp.id}
                              onClick={() => handleEspecialidadeSelect(esp.id)}
                              className={`p-3 border-2 rounded-xl text-left transition-all ${
                                form.especialidade === esp.id
                                  ? 'border-accent bg-accent/5'
                                  : 'border-gray-200 hover:border-accent/50'
                              }`}
                            >
                              <h3 className="font-bold text-primary">{esp.nome}</h3>
                              <p className="text-xs text-gray-500">{esp.descricao}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Sobre você e sua experiência *
                      </label>
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleInputChange}
                        placeholder="Descreva sua experiência, formação e serviços que oferece..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none min-h-[100px]"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {form.descricao.length} caracteres (mínimo 20)
                      </p>
                    </div>

                    {/* Anos de Experiência */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Anos de Experiência *
                      </label>
                      <select
                        name="experiencia"
                        value={form.experiencia}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      >
                        <option value="">Selecione</option>
                        <option value="menos-1">Menos de 1 ano</option>
                        <option value="1-3">1 a 3 anos</option>
                        <option value="3-5">3 a 5 anos</option>
                        <option value="5-10">5 a 10 anos</option>
                        <option value="mais-10">Mais de 10 anos</option>
                      </select>
                    </div>

                    {/* Valor por Hora */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valor por Hora (MT) *
                      </label>
                      <Input
                        name="valorHora"
                        type="number"
                        value={form.valorHora}
                        onChange={handleInputChange}
                        placeholder="500"
                        leftIcon={<Briefcase size={18} />}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Defina seu valor por hora de trabalho
                      </p>
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Endereço *
                      </label>
                      <Input
                        name="endereco"
                        value={form.endereco}
                        onChange={handleInputChange}
                        placeholder="Bairro, Quarteirão, Casa"
                        leftIcon={<MapPin size={18} />}
                      />
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <select
                        name="cidade"
                        value={form.cidade}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
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
                      leftIcon={<ArrowLeft size={18} />}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-accent hover:bg-accent/90 text-white"
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ======================================== */}
              {/* PASSO 3: DOCUMENTOS */}
              {/* ======================================== */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-black text-primary mb-6">
                    <span className="text-accent">Documentos</span> Obrigatórios
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
                                <h3 className="font-bold text-primary">
                                  {doc.label}
                                  {doc.obrigatorio && <span className="text-accent ml-1">*</span>}
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
                                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-accent transition-colors cursor-pointer"
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

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-700 mb-1">
                            Por que precisamos destes documentos?
                          </p>
                          <p className="text-xs text-blue-600">
                            A verificação de documentos garante mais segurança para você e para os clientes.
                            Seus dados estão protegidos e só serão usados para validação.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      leftIcon={<ArrowLeft size={18} />}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={() => {
                        if (validateStep3()) {
                          handleSubmit();
                        }
                      }}
                      disabled={loading}
                      className="bg-accent hover:bg-accent/90 text-white min-w-[150px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Registrando...
                        </>
                      ) : (
                        'Finalizar Registro'
                      )}
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
                    Seu cadastro foi recebido e está em análise pela nossa central.
                    Você receberá uma notificação em até 48 horas.
                  </p>

                  <Card className="bg-gray-50 border-none mb-8 text-left">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-primary mb-4">Próximos Passos:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">1</div>
                          <div>
                            <p className="font-bold text-primary">Análise de Documentos</p>
                            <p className="text-xs text-gray-500">Nossa equipa verificará seus documentos.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">2</div>
                          <div>
                            <p className="font-bold text-primary">Entrevista (se necessário)</p>
                            <p className="text-xs text-gray-500">Podemos entrar em contato para uma breve entrevista.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">3</div>
                          <div>
                            <p className="font-bold text-primary">Ativação do Perfil</p>
                            <p className="text-xs text-gray-500">Após aprovação, seu perfil estará ativo no marketplace.</p>
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
