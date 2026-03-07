import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft, 
  Home, 
  Calendar, 
  Clock, 
  MapPin, 
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CreditCard,
  Smartphone,
  Building,
  Mail,
  MessageSquare,
  Printer,
  Download,
  Share2,
  Star,
  User,
  Phone,
  Copy,
  Check,
  Ruler,
  Info,
  Percent,
  ShoppingBag,
  Package,
  Box,
  Layers,
  Wrench,
  Brush,
  Zap,
  Droplets,
  Hammer,
  Flower2,
  Paintbrush,
  Users,
  Shield,
  Award,
  TrendingUp,
  Calendar as CalendarIcon,
  Map,
  Navigation,
  Home as HomeIcon,
  Building2,
  Landmark,
  Locate,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Save,
  Send,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { SERVICE_CATEGORIES, getEspecialidadesByCategoria, Especialidade, calcularPrecoTotalMultiplas, getTamanhoDescricao } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ============================================
// INTERFACES
// ============================================
interface SolicitacaoForm {
  categoria: string;
  especialidades: string[];
  descricao: string;
  tamanho: 'pequeno' | 'medio' | 'grande';
  dataAgendada: string;
  horaAgendada: string;
  endereco: {
    bairro: string;
    quarteirao?: string;
    casa?: string;
    complemento?: string;
    referencia?: string;
    latitude?: number;
    longitude?: number;
  };
  imagens: string[];
  prestadorId?: string;
  prestadorNome?: string;
  valorTotal: number;
  valorInicial70: number;
  valorFinal30: number;
  metodoPagamento?: string;
  referenciaPagamento?: string;
}

interface Prestador {
  id: string;
  nome: string;
  especialidade: string;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  valorHora: number;
  distancia?: string;
  foto?: string;
  disponivel: boolean;
  telefone?: string;
  descricao?: string;
  tempoExperiencia?: string;
}

interface MetodoPagamento {
  id: string;
  nome: string;
  icon: any;
  cor: string;
  campos: CampoPagamento[];
  instrucoes: string[];
  taxa: number;
  tempo: string;
}

interface CampoPagamento {
  id: string;
  label: string;
  placeholder: string;
  tipo: 'text' | 'tel' | 'email' | 'number';
}

interface Recibo {
  id: string;
  data: Date;
  servico: string;
  especialidades: string[];
  prestador: string;
  prestadorId: string;
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
  metodo: string;
  referencia: string;
  status: 'pago_parcial' | 'pago_total' | 'pendente' | 'cancelado';
  clienteNome: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  dataAgendada: string;
  endereco: string;
  tamanho: string;
  qrCode?: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
}

// ============================================
// CONSTANTES
// ============================================
const METODOS_PAGAMENTO: MetodoPagamento[] = [
  {
    id: 'mpesa',
    nome: 'M-Pesa',
    icon: Smartphone,
    cor: 'from-green-500 to-green-600',
    taxa: 1.5,
    tempo: 'Imediato',
    campos: [
      { id: 'telefone', label: 'Número de Telefone M-Pesa', placeholder: '84 123 4567', tipo: 'tel' },
      { id: 'codigo', label: 'Código de Confirmação', placeholder: 'Digite o código recebido por SMS', tipo: 'text' }
    ],
    instrucoes: [
      'Acesse o menu M-Pesa no seu telefone',
      'Selecione "Pagamento de Serviços"',
      'Digite o código da DEXAPP: 123456',
      'Confirme o valor e digite seu PIN',
      'Insira o código de confirmação recebido'
    ]
  },
  {
    id: 'mkesh',
    nome: 'Mkesh',
    icon: Smartphone,
    cor: 'from-blue-500 to-blue-600',
    taxa: 1.0,
    tempo: 'Imediato',
    campos: [
      { id: 'telefone', label: 'Número de Telefone Mkesh', placeholder: '84 123 4567', tipo: 'tel' },
      { id: 'codigo', label: 'Código de Confirmação', placeholder: 'Digite o código recebido por SMS', tipo: 'text' }
    ],
    instrucoes: [
      'Acesse sua carteira Mkesh',
      'Selecione "Pagar Serviço"',
      'Digite o ID da DEXAPP: DEX001',
      'Confirme o pagamento com seu PIN',
      'Insira o código de confirmação'
    ]
  },
  {
    id: 'emola',
    nome: 'E-Mola',
    icon: Smartphone,
    cor: 'from-red-500 to-red-600',
    taxa: 1.0,
    tempo: 'Imediato',
    campos: [
      { id: 'telefone', label: 'Número de Telefone E-Mola', placeholder: '84 123 4567', tipo: 'tel' },
      { id: 'codigo', label: 'Código de Confirmação', placeholder: 'Digite o código recebido por SMS', tipo: 'text' }
    ],
    instrucoes: [
      'Acesse o menu E-Mola',
      'Escolha "Pagamentos"',
      'Selecione "Pagar Serviço"',
      'Digite o código da DEXAPP: 789012',
      'Confirme e insira o código SMS'
    ]
  },
  {
    id: 'transferencia',
    nome: 'Transferência Bancária',
    icon: Building,
    cor: 'from-purple-500 to-purple-600',
    taxa: 2.0,
    tempo: '1-2 dias úteis',
    campos: [
      { id: 'banco', label: 'Banco', placeholder: 'Ex: BIM, Millennium, Standard Bank', tipo: 'text' },
      { id: 'conta', label: 'Número de Conta', placeholder: '123456789', tipo: 'text' },
      { id: 'titular', label: 'Titular da Conta', placeholder: 'Nome completo', tipo: 'text' },
      { id: 'comprovativo', label: 'Nº Comprovativo', placeholder: 'Número da transferência', tipo: 'text' }
    ],
    instrucoes: [
      'Dados Bancários da DEXAPP:',
      'Banco: BIM',
      'NIB: 12345678901234567890',
      'Nome: DEXAPP, LDA',
      'Realize a transferência e insira o comprovativo'
    ]
  }
];

const TAMANHOS = [
  { id: 'pequeno', label: 'Pequeno', desc: '1-6 horas', icone: Package, cor: 'green' },
  { id: 'medio', label: 'Médio', desc: '24-48 horas', icone: Box, cor: 'yellow' },
  { id: 'grande', label: 'Grande', desc: '+48 horas', icone: Layers, cor: 'red' }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function NovaSolicitacao() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reciboRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [loading, setLoading] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState<string[]>([]);
  const [showCategorias, setShowCategorias] = useState(false);
  const [prestadoresDisponiveis, setPrestadoresDisponiveis] = useState<Prestador[]>([]);
  const [metodoSelecionado, setMetodoSelecionado] = useState<string>('');
  const [camposPagamento, setCamposPagamento] = useState<Record<string, string>>({});
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<'pequeno' | 'medio' | 'grande'>('pequeno');
  const [precos, setPrecos] = useState({ total: 0, inicial70: 0, final30: 0 });
  const [usarLocalizacao, setUsarLocalizacao] = useState(false);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);
  
  const [form, setForm] = useState<SolicitacaoForm>({
    categoria: '',
    especialidades: [],
    descricao: '',
    tamanho: 'pequeno',
    dataAgendada: '',
    horaAgendada: '',
    endereco: {
      bairro: user?.cidade || '',
      quarteirao: '',
      casa: '',
      complemento: '',
      referencia: ''
    },
    imagens: [],
    valorTotal: 0,
    valorInicial70: 0,
    valorFinal30: 0
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Logout efetuado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao fazer logout', 'error');
    }
  };

  // ============================================
  // ATUALIZAR VALORES ESTIMADOS
  // ============================================
  useEffect(() => {
    if (form.especialidades.length > 0) {
      const precosCalculados = calcularPrecoTotalMultiplas(form.especialidades, form.tamanho);
      setPrecos(precosCalculados);
      setForm(prev => ({ 
        ...prev, 
        valorTotal: precosCalculados.total,
        valorInicial70: precosCalculados.inicial70,
        valorFinal30: precosCalculados.final30
      }));
    }
  }, [form.especialidades, form.tamanho]);

  // ============================================
  // HANDLERS DE SELEÇÃO DE ESPECIALIDADES
  // ============================================
  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidades: [] }));
    setEspecialidadesSelecionadas([]);
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

  const handleEspecialidadeToggle = (especialidadeId: string) => {
    setEspecialidadesSelecionadas(prev => {
      if (prev.includes(especialidadeId)) {
        return prev.filter(id => id !== especialidadeId);
      } else {
        return [...prev, especialidadeId];
      }
    });
    
    setForm(prev => {
      if (prev.especialidades.includes(especialidadeId)) {
        return { ...prev, especialidades: prev.especialidades.filter(id => id !== especialidadeId) };
      } else {
        return { ...prev, especialidades: [...prev.especialidades, especialidadeId] };
      }
    });
  };

  const handleSelectAllEspecialidades = () => {
    const todasIds = especialidades.map(e => e.id);
    setEspecialidadesSelecionadas(todasIds);
    setForm(prev => ({ ...prev, especialidades: todasIds }));
  };

  const handleClearAllEspecialidades = () => {
    setEspecialidadesSelecionadas([]);
    setForm(prev => ({ ...prev, especialidades: [] }));
  };

  // ============================================
  // OBTER LOCALIZAÇÃO
  // ============================================
  const obterLocalizacao = () => {
    setObtendoLocalizacao(true);
    
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada pelo navegador', 'error');
      setObtendoLocalizacao(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        setUsarLocalizacao(true);
        setObtendoLocalizacao(false);
        showToast('Localização obtida com sucesso!', 'success');
        
        // Simular preenchimento do bairro baseado na localização
        // Em produção, usaria uma API de geocoding reverso
        setTimeout(() => {
          setForm(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              bairro: 'Sommerschield'
            }
          }));
        }, 1000);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        showToast('Erro ao obter localização. Preencha manualmente.', 'error');
        setObtendoLocalizacao(false);
      }
    );
  };

  // ============================================
  // BUSCAR PRESTADORES DISPONÍVEIS
  // ============================================
  useEffect(() => {
    const buscarPrestadores = async () => {
      if (form.especialidades.length === 0) return;

      try {
        // Buscar prestadores que tenham pelo menos uma das especialidades selecionadas
        const prestadoresQuery = query(
          collection(db, 'users'),
          where('profile', '==', 'prestador'),
          where('status', '==', 'activo'),
          where('especialidade', 'in', form.especialidades.slice(0, 10))
        );

        const snapshot = await getDocs(prestadoresQuery);
        const prestadores = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome,
            especialidade: data.especialidade,
            avaliacaoMedia: data.avaliacaoMedia || 4.5,
            totalAvaliacoes: data.totalAvaliacoes || 0,
            valorHora: data.valorHora || 500,
            disponivel: true,
            distancia: Math.random() * 5 + 1 + ' km', // Simulado
            telefone: data.telefone,
            descricao: data.descricao,
            tempoExperiencia: data.experiencia || '3-5 anos'
          } as Prestador;
        });

        // Ordenar por avaliação e disponibilidade
        prestadores.sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia);
        
        setPrestadoresDisponiveis(prestadores);
      } catch (error) {
        console.error('Erro ao buscar prestadores:', error);
      }
    };

    if (step === 3) {
      buscarPrestadores();
    }
  }, [form.especialidades, step]);

  // ============================================
  // HANDLERS DE UPLOAD DE IMAGEM
  // ============================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Apenas imagens são permitidas', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Imagem muito grande. Máximo 5MB', 'error');
        return;
      }

      const preview = URL.createObjectURL(file);
      
      setFiles(prev => [...prev, {
        file,
        preview,
        uploading: false
      }]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  // ============================================
  // HANDLERS DE SELEÇÃO
  // ============================================
  const handlePrestadorSelect = (prestador: Prestador) => {
    setForm(prev => ({
      ...prev,
      prestadorId: prestador.id,
      prestadorNome: prestador.nome
    }));
    showToast(`Prestador ${prestador.nome} selecionado!`, 'success');
  };

  const handleMetodoPagamentoSelect = (metodoId: string) => {
    setMetodoSelecionado(metodoId);
    setCamposPagamento({});
  };

  const handleCampoChange = (campoId: string, valor: string) => {
    setCamposPagamento(prev => ({ ...prev, [campoId]: valor }));
  };

  // ============================================
  // FUNÇÕES DE RECIBO
  // ============================================
  const handleCopyToClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
    showToast(`${tipo} copiado!`, 'success');
  };

  const handleDownloadPDF = async () => {
    if (!reciboRef.current || !recibo) return;

    try {
      showToast('A gerar PDF...', 'info');
      
      const canvas = await html2canvas(reciboRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`recibo-${recibo.id}.pdf`);
      
      showToast('PDF baixado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao gerar PDF', 'error');
    }
  };

  // ============================================
  // VALIDAÇÃO DE PAGAMENTO
  // ============================================
  const handleValidarPagamento = () => {
    const metodo = METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado);
    if (!metodo) return;

    const camposPreenchidos = metodo.campos.every(campo => camposPagamento[campo.id]);

    if (!camposPreenchidos) {
      showToast('Preencha todos os campos de pagamento', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setPagamentoConfirmado(true);

      // Gerar QR Code simulado
      const qrCodeSimulado = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEX-${Date.now()}`;

      const novoRecibo: Recibo = {
        id: `DEX-${Date.now().toString().slice(-8)}`,
        data: new Date(),
        servico: getServicoNome(form.categoria, form.especialidades),
        especialidades: form.especialidades,
        prestador: form.prestadorNome || 'Aguardando prestador',
        prestadorId: form.prestadorId || '',
        valorTotal: form.valorTotal,
        valorPago: form.valorInicial70,
        valorRestante: form.valorFinal30,
        metodo: metodo.nome,
        referencia: metodo.id === 'transferencia' 
          ? `TRF-${camposPagamento.comprovativo?.slice(-6) || Date.now().toString().slice(-6)}` 
          : `MP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'pago_parcial',
        clienteNome: user?.nome || 'Cliente',
        clienteEmail: user?.email,
        clienteTelefone: user?.telefone,
        dataAgendada: `${form.dataAgendada} às ${form.horaAgendada}`,
        endereco: `${form.endereco.bairro}${form.endereco.quarteirao ? `, Q. ${form.endereco.quarteirao}` : ''}${form.endereco.casa ? `, Casa ${form.endereco.casa}` : ''}`,
        tamanho: getTamanhoDescricao(form.tamanho),
        qrCode: qrCodeSimulado
      };

      setRecibo(novoRecibo);
      showToast('✅ Pagamento inicial de 70% confirmado!', 'success');
      
      setTimeout(() => setStep(6), 1500);
    }, 2000);
  };

  // ============================================
  // FINALIZAR SOLICITAÇÃO
  // ============================================
  const handleFinalizar = async () => {
    setLoading(true);

    try {
      // Upload das imagens (simulado)
      const imagensUrls = files.map(f => f.preview);

      const solicitacaoData = {
        clienteId: user?.id,
        clienteNome: user?.nome,
        telefoneCliente: user?.telefone,
        emailCliente: user?.email,
        categoria: form.categoria,
        especialidades: form.especialidades,
        servico: getServicoNome(form.categoria, form.especialidades),
        descricao: form.descricao,
        tamanho: form.tamanho,
        dataSolicitacao: new Date(),
        dataAgendada: new Date(`${form.dataAgendada}T${form.horaAgendada}`),
        endereco: form.endereco,
        imagens: imagensUrls,
        prestadorId: form.prestadorId,
        prestadorNome: form.prestadorNome,
        status: form.tamanho === 'grande' ? 'aguardando_orcamento' : 'pagamento_parcial',
        valorTotal: form.valorTotal,
        valorInicial70: form.valorInicial70,
        valorFinal30: form.valorFinal30,
        valorPago: form.valorInicial70,
        valorRestante: form.valorFinal30,
        percentualPago: 70,
        metodoPagamento: metodoSelecionado,
        referenciaPagamento: recibo?.referencia,
        pagamentoConfirmado: true,
        dataPagamento: new Date(),
        recibo: recibo,
        precisaOrcamentoCentral: form.tamanho === 'grande',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'solicitacoes'), solicitacaoData);
      
      showToast('✅ Solicitação criada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      showToast('Erro ao criar solicitação. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const getServicoNome = (categoriaId: string, especialidadesIds: string[]): string => {
    const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
    if (!categoria) return 'Serviço';
    
    if (especialidadesIds.length === 1) {
      const esp = categoria.especialidades.find(e => e.id === especialidadesIds[0]);
      return esp?.nome || categoria.nome;
    }
    
    return `${categoria.nome} (${especialidadesIds.length} especialidades)`;
  };

  const formatarData = (data: string, hora: string) => {
    const dataObj = new Date(`${data}T${hora}`);
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const podeAvancarPasso1 = form.categoria && especialidadesSelecionadas.length > 0;
  const podeAvancarPasso2 = form.descricao.length >= 10 && form.dataAgendada && form.horaAgendada && form.endereco.bairro && form.endereco.referencia;
  const podeAvancarPasso3 = form.tamanho === 'grande' || form.prestadorId || prestadoresDisponiveis.length === 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => step > 1 ? setStep(step - 1 as any) : navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <ShoppingBag size={32} className="text-accent" />
                {step === 6 ? 'Recibo de Pagamento' : 'Nova Solicitação'}
              </h1>
              <p className="text-gray-500">
                {step === 1 && 'Escolha a categoria e as especialidades do serviço'}
                {step === 2 && 'Descreva o serviço, local e agendamento'}
                {step === 3 && form.tamanho === 'grande' && 'Aguardando orçamento da central'}
                {step === 3 && form.tamanho !== 'grande' && 'Escolha o prestador para o serviço'}
                {step === 4 && 'Selecione o método de pagamento'}
                {step === 5 && 'Confirme os dados e realize o pagamento inicial (70%)'}
                {step === 6 && 'Pagamento inicial confirmado! Guarde seu recibo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              leftIcon={<Home size={16} />}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Início
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* ======================================== */}
        {/* PROGRESSO */}
        {/* ======================================== */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {[
              { num: 1, label: 'Serviços' },
              { num: 2, label: 'Detalhes' },
              { num: 3, label: form.tamanho === 'grande' ? 'Central' : 'Prestador' },
              { num: 4, label: 'Pagamento' },
              { num: 5, label: 'Confirmar' }
            ].map((i) => (
              <React.Fragment key={i.num}>
                <div className="flex items-center shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= i.num ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > i.num ? <CheckCircle2 size={20} /> : i.num}
                  </div>
                  <span className={`ml-2 text-sm font-bold hidden sm:block ${
                    step >= i.num ? 'text-accent' : 'text-gray-400'
                  }`}>
                    {i.label}
                  </span>
                </div>
                {i.num < 5 && (
                  <div className={`flex-1 h-1 mx-4 min-w-[30px] ${
                    step > i.num ? 'bg-accent' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ======================================== */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ======================================== */}
        <Card>
          <CardContent className="p-6 md:p-8">
            {/* ======================================== */}
            {/* PASSO 1: CATEGORIA E ESPECIALIDADES */}
            {/* ======================================== */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-primary mb-6">
                  Selecione os <span className="text-accent">Serviços</span>
                </h2>

                {/* Dropdown de Categorias */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Categoria do Serviço *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategorias(!showCategorias)}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between bg-white"
                    >
                      <span className={form.categoria ? 'text-primary font-bold' : 'text-gray-400'}>
                        {form.categoria 
                          ? SERVICE_CATEGORIES.find(c => c.id === form.categoria)?.nome 
                          : 'Escolha uma categoria'}
                      </span>
                      {showCategorias ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                      {showCategorias && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto"
                        >
                          {SERVICE_CATEGORIES.map((cat) => {
                            const IconComponent = 
                              cat.id === 'limpeza' ? Brush :
                              cat.id === 'empregadas' ? Users :
                              cat.id === 'eletrica' ? Zap :
                              cat.id === 'canalizacao' ? Droplets :
                              cat.id === 'carpintaria' ? Hammer :
                              cat.id === 'construcao' ? Building2 :
                              cat.id === 'jardinagem' ? Flower2 :
                              cat.id === 'pintura' ? Paintbrush :
                              Wrench;

                            return (
                              <button
                                key={cat.id}
                                onClick={() => handleCategoriaSelect(cat.id)}
                                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                                  form.categoria === cat.id ? 'bg-accent/5 border-l-4 border-accent' : ''
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                                  <IconComponent size={16} />
                                </div>
                                <span className="font-bold text-primary">{cat.nome}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Especialidades (seleção múltipla) */}
                {categoriaSelecionada && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Especialidades * (pode selecionar várias)
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSelectAllEspecialidades}
                          className="text-xs font-bold text-accent hover:underline"
                        >
                          Selecionar todas
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={handleClearAllEspecialidades}
                          className="text-xs font-bold text-gray-500 hover:underline"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {especialidades.map((esp) => (
                        <button
                          key={esp.id}
                          onClick={() => handleEspecialidadeToggle(esp.id)}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            especialidadesSelecionadas.includes(esp.id)
                              ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                              : 'border-gray-200 hover:border-accent/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              especialidadesSelecionadas.includes(esp.id)
                                ? 'border-accent bg-accent text-white'
                                : 'border-gray-300'
                            }`}>
                              {especialidadesSelecionadas.includes(esp.id) && <Check size={12} />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-primary mb-1">{esp.nome}</h3>
                              <p className="text-xs text-gray-500 mb-2">{esp.descricao}</p>
                              <div className="flex items-center gap-2">
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
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {especialidadesSelecionadas.length > 0 && (
                      <div className="mt-4 p-4 bg-accent/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-600">
                            {especialidadesSelecionadas.length} especialidade(s) selecionada(s)
                          </span>
                          <span className="text-lg font-black text-primary">
                            {precos.total.toLocaleString()} MT
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Percent size={14} className="text-accent" />
                            70% inicial:
                          </span>
                          <span className="font-bold text-accent">{precos.inicial70.toLocaleString()} MT</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Percent size={14} className="text-orange-500" />
                            30% final:
                          </span>
                          <span className="font-bold text-orange-500">{precos.final30.toLocaleString()} MT</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!podeAvancarPasso1}
                    className="bg-accent hover:bg-accent/90 text-white px-8"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 2: DETALHES, LOCAL E AGENDAMENTO */}
            {/* ======================================== */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-primary mb-6">
                  Detalhes do <span className="text-accent">Serviço</span>
                </h2>

                {/* Tamanho do Serviço */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tamanho do Serviço *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TAMANHOS.map((opcao) => {
                      const IconComponent = opcao.icone;
                      return (
                        <button
                          key={opcao.id}
                          onClick={() => {
                            setTamanhoSelecionado(opcao.id as any);
                            setForm(prev => ({ ...prev, tamanho: opcao.id as any }));
                          }}
                          className={`p-4 border-2 rounded-xl text-center transition-all ${
                            form.tamanho === opcao.id
                              ? `border-${opcao.cor}-500 bg-${opcao.cor}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent size={24} className={`mx-auto mb-2 ${
                            form.tamanho === opcao.id ? `text-${opcao.cor}-600` : 'text-gray-400'
                          }`} />
                          <p className={`font-bold ${
                            form.tamanho === opcao.id ? `text-${opcao.cor}-700` : 'text-primary'
                          }`}>
                            {opcao.label}
                          </p>
                          <p className={`text-xs ${
                            form.tamanho === opcao.id ? `text-${opcao.cor}-600` : 'text-gray-400'
                          }`}>
                            {opcao.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {form.tamanho === 'grande' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                      <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Serviços grandes requerem orçamento da central. Após a solicitação, 
                        nossa equipa entrará em contato para definir o valor final.
                      </p>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descreva o serviço que precisa *
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva detalhadamente o serviço que precisa. Quanto mais detalhes, melhor será o atendimento."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none min-h-[120px]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.descricao.length} caracteres (mínimo 10)
                  </p>
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Data do Serviço *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={form.dataAgendada}
                        onChange={(e) => setForm(prev => ({ ...prev, dataAgendada: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Hora do Serviço *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="time"
                        value={form.horaAgendada}
                        onChange={(e) => setForm(prev => ({ ...prev, horaAgendada: e.target.value }))}
                        className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-700">
                      Local do Serviço *
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={obterLocalizacao}
                      disabled={obtendoLocalizacao}
                      className="text-accent"
                      leftIcon={obtendoLocalizacao ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                    >
                      {obtendoLocalizacao ? 'Obtendo...' : 'Usar minha localização'}
                    </Button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.endereco.bairro}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, bairro: e.target.value }
                        }))}
                        placeholder="Ex: Sommerschield"
                        className="w-full pl-9 p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Quarteirão
                      </label>
                      <input
                        type="text"
                        value={form.endereco.quarteirao}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, quarteirao: e.target.value }
                        }))}
                        placeholder="Ex: Q. 45"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nº da Casa
                      </label>
                      <input
                        type="text"
                        value={form.endereco.casa}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, casa: e.target.value }
                        }))}
                        placeholder="Ex: 123"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Referência da Residência *
                    </label>
                    <input
                      type="text"
                      value={form.endereco.referencia}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, referencia: e.target.value }
                      }))}
                      placeholder="Ex: Próximo ao supermercado, casa de portão azul"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Complemento (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.endereco.complemento}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, complemento: e.target.value }
                      }))}
                      placeholder="Ex: Atrás do mercado, bloco C"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload de Imagens */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fotos da área (opcional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Tire fotos ou faça upload para ajudar o prestador a entender melhor o serviço.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-accent"
                    >
                      <Camera size={32} />
                      <span className="text-xs font-bold">Tirar Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-accent"
                    >
                      <Upload size={32} />
                      <span className="text-xs font-bold">Upload</span>
                    </button>

                    {files.map((file, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulação de Preço */}
                {form.especialidades.length > 0 && (
                  <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <DollarSign size={24} className="text-accent" />
                          <div>
                            <p className="text-sm font-bold text-gray-600">Valor Total Estimado</p>
                            <p className="text-2xl font-black text-primary">
                              {precos.total.toLocaleString()} MT
                            </p>
                            <p className="text-xs text-gray-500">
                              {getTamanhoDescricao(form.tamanho)}
                            </p>
                          </div>
                        </div>
                        {form.tamanho === 'grande' && (
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Orçamento via Central
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Percent size={12} className="text-accent" />
                            70% Inicial
                          </p>
                          <p className="text-lg font-bold text-accent">{precos.inicial70.toLocaleString()} MT</p>
                          <p className="text-[10px] text-gray-400">Pagar agora</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Percent size={12} className="text-orange-500" />
                            30% Final
                          </p>
                          <p className="text-lg font-bold text-orange-500">{precos.final30.toLocaleString()} MT</p>
                          <p className="text-[10px] text-gray-400">Pagar após conclusão</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!podeAvancarPasso2}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 3: PRESTADOR OU CENTRAL */}
            {/* ======================================== */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {form.tamanho === 'grande' ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Info size={40} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-primary mb-4">
                      Orçamento via <span className="text-accent">Central</span>
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Por ser um serviço de grande porte, nossa central fará um orçamento personalizado 
                      e entrará em contato em até 24 horas.
                    </p>
                    <Card className="bg-gray-50 border-none max-w-md mx-auto">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-primary mb-4">Contatos da Central:</h3>
                        <div className="space-y-3">
                          <a
                            href="https://wa.me/258871425316"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                              <MessageSquare size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500">WhatsApp</p>
                              <p className="font-bold text-primary">+258 87 142 5316</p>
                            </div>
                          </a>
                          <a
                            href="tel:+258871425316"
                            className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
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
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-primary mb-6">
                      Escolha o <span className="text-accent">Prestador</span>
                    </h2>

                    {prestadoresDisponiveis.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {prestadoresDisponiveis.map((prestador) => (
                          <button
                            key={prestador.id}
                            onClick={() => handlePrestadorSelect(prestador)}
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                              form.prestadorId === prestador.id
                                ? 'border-accent bg-accent/5'
                                : 'border-gray-200 hover:border-accent/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white text-xl font-black">
                                {prestador.nome.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-black text-primary">{prestador.nome}</h3>
                                  <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-500 fill-current" />
                                    <span className="text-sm font-bold">{prestador.avaliacaoMedia.toFixed(1)}</span>
                                    <span className="text-xs text-gray-400">({prestador.totalAvaliacoes})</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{prestador.especialidade}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="font-bold text-accent">{prestador.valorHora} MT/hora</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">{prestador.distancia}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">{prestador.tempoExperiencia}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-yellow-50 border-yellow-200 mb-6">
                        <CardContent className="p-4">
                          <p className="text-sm text-yellow-700">
                            Nenhum prestador disponível no momento para esta especialidade.
                            Sua solicitação ficará em lista de espera e a central entrará em contato.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!podeAvancarPasso3}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    {form.tamanho === 'grande' ? 'Continuar para Pagamento' : 'Continuar'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 4: MÉTODO DE PAGAMENTO */}
            {/* ======================================== */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-primary mb-6">
                  <span className="text-accent">Pagamento</span> Inicial (70%)
                </h2>

                <Card className="bg-gradient-to-r from-primary to-blue-900 text-white mb-6">
                  <CardContent className="p-6">
                    <p className="text-sm opacity-80 mb-1">Total do Serviço</p>
                    <p className="text-4xl font-black mb-2">{precos.total.toLocaleString()} MT</p>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                      <div>
                        <p className="text-xs opacity-60">70% Inicial</p>
                        <p className="text-2xl font-bold text-accent">{precos.inicial70.toLocaleString()} MT</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-60">30% Final</p>
                        <p className="text-2xl font-bold text-orange-300">{precos.final30.toLocaleString()} MT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Selecione o método de pagamento *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {METODOS_PAGAMENTO.map((metodo) => (
                      <button
                        key={metodo.id}
                        onClick={() => handleMetodoPagamentoSelect(metodo.id)}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          metodoSelecionado === metodo.id
                            ? `border-accent bg-gradient-to-r ${metodo.cor} text-white`
                            : 'border-gray-200 hover:border-accent/50'
                        }`}
                      >
                        <metodo.icon size={24} className={metodoSelecionado === metodo.id ? 'text-white' : 'text-gray-600'} />
                        <p className={`font-bold mt-2 ${metodoSelecionado === metodo.id ? 'text-white' : 'text-primary'}`}>
                          {metodo.nome}
                        </p>
                        <p className={`text-xs mt-1 ${metodoSelecionado === metodo.id ? 'text-white/80' : 'text-gray-400'}`}>
                          Taxa: {metodo.taxa}% • {metodo.tempo}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={!metodoSelecionado}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 5: CONFIRMAÇÃO E PAGAMENTO (70%) */}
            {/* ======================================== */}
            {step === 5 && metodoSelecionado && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-primary mb-6">
                  <span className="text-accent">Confirmar</span> Pagamento Inicial
                </h2>

                <Card className="bg-gradient-to-r from-accent to-orange-600 text-white mb-6">
                  <CardContent className="p-6">
                    <p className="text-sm opacity-80 mb-1">Valor a pagar agora (70%)</p>
                    <p className="text-4xl font-black mb-2">{precos.inicial70.toLocaleString()} MT</p>
                    <p className="text-xs opacity-60">Restante: {precos.final30.toLocaleString()} MT (após conclusão)</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200 mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-blue-700 mb-2">Instruções:</h3>
                    <ul className="space-y-2">
                      {METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.instrucoes.map((inst, idx) => (
                        <li key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                          <span className="font-bold">{idx + 1}.</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="mb-6 space-y-4">
                  {METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado)?.campos.map((campo) => (
                    <div key={campo.id}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {campo.label} *
                      </label>
                      <input
                        type={campo.tipo}
                        value={camposPagamento[campo.id] || ''}
                        onChange={(e) => handleCampoChange(campo.id, e.target.value)}
                        placeholder={campo.placeholder}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <Card className="bg-gray-50 border-none mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-primary mb-3">Resumo da Solicitação</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold text-gray-600">Serviço:</span> {getServicoNome(form.categoria, form.especialidades)}</p>
                      <p><span className="font-bold text-gray-600">Tamanho:</span> {getTamanhoDescricao(form.tamanho)}</p>
                      <p><span className="font-bold text-gray-600">Prestador:</span> {form.prestadorNome || 'Aguardando'}</p>
                      <p><span className="font-bold text-gray-600">Data:</span> {formatarData(form.dataAgendada, form.horaAgendada)}</p>
                      <p><span className="font-bold text-gray-600">Local:</span> {form.endereco.bairro}{form.endereco.quarteirao ? `, Q. ${form.endereco.quarteirao}` : ''}{form.endereco.casa ? `, Casa ${form.endereco.casa}` : ''}</p>
                      {form.endereco.referencia && (
                        <p><span className="font-bold text-gray-600">Referência:</span> {form.endereco.referencia}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleValidarPagamento}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-white mb-4 py-4 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Processando pagamento...
                    </>
                  ) : (
                    `Pagar ${precos.inicial70.toLocaleString()} MT (70%)`
                  )}
                </Button>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                  >
                    Voltar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ======================================== */}
            {/* PASSO 6: RECIBO (70% PAGO) */}
            {/* ======================================== */}
            {step === 6 && recibo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div ref={reciboRef}>
                  <Card className="border-2 border-accent/20 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-primary to-blue-900 text-white p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-black">DEXAPP</h2>
                            <p className="text-xs opacity-80">Soluções Domésticas</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">RECIBO</p>
                            <p className="text-xs opacity-80">{recibo.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="opacity-80">Data</p>
                            <p className="font-bold">{recibo.data.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="opacity-80">Status</p>
                            <p className="font-bold text-yellow-400">PAGO PARCIAL (70%)</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Cliente</p>
                            <p className="font-bold text-primary">{recibo.clienteNome}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Prestador</p>
                            <p className="font-bold text-primary">{recibo.prestador}</p>
                          </div>
                        </div>

                        <div className="border-t border-b border-gray-100 py-4">
                          <p className="font-bold text-primary mb-2">{recibo.servico}</p>
                          <p className="text-xs text-gray-500 mb-2">Tamanho: {recibo.tamanho}</p>
                          <p className="text-xs text-gray-500">Agendado para: {recibo.dataAgendada}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Local</p>
                          <p className="text-sm text-primary">{recibo.endereco}</p>
                        </div>

                        {recibo.qrCode && (
                          <div className="flex justify-center py-2">
                            <img src={recibo.qrCode} alt="QR Code" className="w-24 h-24" />
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Valor Total</p>
                              <p className="font-bold text-primary">{recibo.valorTotal.toLocaleString()} MT</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Método</p>
                              <p className="font-bold text-accent">{recibo.metodo}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Pago (70%)</p>
                              <p className="font-bold text-green-600">{recibo.valorPago.toLocaleString()} MT</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Restante (30%)</p>
                              <p className="font-bold text-orange-500">{recibo.valorRestante.toLocaleString()} MT</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Referência: {recibo.referencia}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-center py-4 h-auto"
                  >
                    <Download size={24} className="mb-2" />
                    <span className="text-xs">PDF</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex flex-col items-center py-4 h-auto"
                  >
                    <Printer size={24} className="mb-2" />
                    <span className="text-xs">Imprimir</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleCopyToClipboard(recibo.id, 'ID')}
                    className="flex flex-col items-center py-4 h-auto"
                  >
                    {copiado === 'ID' ? <Check size={24} className="mb-2" /> : <Copy size={24} className="mb-2" />}
                    <span className="text-xs">Copiar ID</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/cliente/dashboard')}
                    className="flex flex-col items-center py-4 h-auto"
                  >
                    <Home size={24} className="mb-2" />
                    <span className="text-xs">Dashboard</span>
                  </Button>
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-700 mb-1">Pagamento Inicial Confirmado!</p>
                      <p className="text-sm text-green-600">
                        Você pagou 70% do valor total ({recibo.valorPago.toLocaleString()} MT). 
                        Os 30% restantes ({recibo.valorRestante.toLocaleString()} MT) deverão ser pagos após a conclusão do serviço.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
