import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { SERVICE_CATEGORIES, getEspecialidadesByCategoria, Especialidade } from '../../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ============================================
// INTERFACES
// ============================================
interface SolicitacaoForm {
  categoria: string;
  especialidade: string;
  descricao: string;
  dataAgendada: string;
  horaAgendada: string;
  endereco: {
    bairro: string;
    quarteirao?: string;
    casa?: string;
    complemento?: string;
  };
  imagens: string[];
  prestadorId?: string;
  prestadorNome?: string;
  valorEstimado: number;
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
}

interface MetodoPagamento {
  id: string;
  nome: string;
  icon: any;
  cor: string;
  campos: CampoPagamento[];
  instrucoes: string[];
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
  especialidade: string;
  prestador: string;
  prestadorId: string;
  valor: number;
  metodo: string;
  referencia: string;
  status: 'pago' | 'pendente' | 'cancelado';
  clienteNome: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  dataAgendada: string;
  endereco: string;
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

const PRECOS_ESPECIALIDADES: Record<string, number> = {
  // Limpeza
  'limpeza-geral': 1500,
  'limpeza-pesada': 2500,
  'limpeza-escritorio': 1800,
  'limpeza-tapetes': 2000,
  'limpeza-estofados': 2200,
  'limpeza-vidros': 1200,
  
  // Elétrica
  'eletricista-geral': 2000,
  'instalacao-lampadas': 800,
  'reparo-tomadas': 1000,
  'quadro-distribuicao': 3500,
  'interruptores': 800,
  'curto-circuito': 1800,
  
  // Canalização
  'canalizador-geral': 1800,
  'desentupimento': 1500,
  'torneiras': 800,
  'caixas-agua': 2500,
  'esgoto': 3000,
  'aquecedores': 2200,
  
  // Default
  'default': 1500
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function NovaSolicitacao() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reciboRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [loading, setLoading] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [showCategorias, setShowCategorias] = useState(false);
  const [prestadoresDisponiveis, setPrestadoresDisponiveis] = useState<Prestador[]>([]);
  const [metodoSelecionado, setMetodoSelecionado] = useState<string>('');
  const [camposPagamento, setCamposPagamento] = useState<Record<string, string>>({});
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const [form, setForm] = useState<SolicitacaoForm>({
    categoria: '',
    especialidade: '',
    descricao: '',
    dataAgendada: '',
    horaAgendada: '',
    endereco: {
      bairro: user?.cidade || '',
      quarteirao: '',
      casa: '',
      complemento: ''
    },
    imagens: [],
    valorEstimado: 0
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);

  // ============================================
  // ATUALIZAR VALOR ESTIMADO QUANDO ESPECIALIDADE MUDA
  // ============================================
  useEffect(() => {
    if (form.especialidade) {
      const valorBase = PRECOS_ESPECIALIDADES[form.especialidade] || PRECOS_ESPECIALIDADES.default;
      // Adicionar custo adicional baseado na descrição (simples simulação)
      const palavras = form.descricao.split(' ').length;
      const adicional = Math.floor(palavras / 10) * 100;
      setForm(prev => ({ ...prev, valorEstimado: valorBase + adicional }));
    }
  }, [form.especialidade, form.descricao]);

  // ============================================
  // BUSCAR PRESTADORES DISPONÍVEIS
  // ============================================
  useEffect(() => {
    const buscarPrestadores = async () => {
      if (!form.especialidade) return;

      try {
        const prestadoresQuery = query(
          collection(db, 'users'),
          where('profile', '==', 'prestador'),
          where('status', '==', 'activo'),
          where('especialidade', '==', form.especialidade)
        );

        const snapshot = await getDocs(prestadoresQuery);
        const prestadores = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          especialidade: doc.data().especialidade,
          avaliacaoMedia: doc.data().avaliacaoMedia || 4.5,
          totalAvaliacoes: doc.data().totalAvaliacoes || 0,
          valorHora: doc.data().valorHora || 500,
          disponivel: true,
          distancia: '2.5 km', // Simulado
          telefone: doc.data().telefone,
          descricao: doc.data().descricao
        }));

        setPrestadoresDisponiveis(prestadores);
      } catch (error) {
        console.error('Erro ao buscar prestadores:', error);
      }
    };

    if (step === 3) {
      buscarPrestadores();
    }
  }, [form.especialidade, step]);

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
  const handleCategoriaSelect = (categoriaId: string) => {
    setCategoriaSelecionada(categoriaId);
    setForm(prev => ({ ...prev, categoria: categoriaId, especialidade: '' }));
    setEspecialidades(getEspecialidadesByCategoria(categoriaId));
    setShowCategorias(false);
  };

  const handleEspecialidadeSelect = (especialidadeId: string) => {
    setForm(prev => ({ ...prev, especialidade: especialidadeId }));
  };

  const handlePrestadorSelect = (prestador: Prestador) => {
    setForm(prev => ({
      ...prev,
      prestadorId: prestador.id,
      prestadorNome: prestador.nome,
      valorEstimado: prestador.valorHora * 4 // Simulação de 4 horas de serviço
    }));
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

  const handlePrint = () => {
    if (!reciboRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Permita pop-ups para imprimir', 'error');
      return;
    }

    const html = reciboRef.current.outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo DEXAPP</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .recibo { max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = async () => {
    if (!recibo) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Recibo DEXAPP',
          text: `Pagamento confirmado: ${recibo.servico} - ${recibo.valor} MT`,
          url: window.location.href
        });
        showToast('Compartilhado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      handleCopyToClipboard(window.location.href, 'Link');
    }
  };

  // ============================================
  // VALIDAÇÃO DE PAGAMENTO
  // ============================================
  const handleValidarPagamento = () => {
    const metodo = METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado);
    if (!metodo) return;

    // Validar se todos os campos foram preenchidos
    const camposPreenchidos = metodo.campos.every(campo => camposPagamento[campo.id]);

    if (!camposPreenchidos) {
      showToast('Preencha todos os campos de pagamento', 'error');
      return;
    }

    setLoading(true);

    // Simular validação de pagamento
    setTimeout(() => {
      setLoading(false);
      setPagamentoConfirmado(true);

      // Gerar recibo
      const novoRecibo: Recibo = {
        id: `DEX-${Date.now().toString().slice(-8)}`,
        data: new Date(),
        servico: getServicoNome(form.categoria, form.especialidade),
        especialidade: form.especialidade,
        prestador: form.prestadorNome || 'Aguardando prestador',
        prestadorId: form.prestadorId || '',
        valor: form.valorEstimado,
        metodo: metodo.nome,
        referencia: metodo.id === 'transferencia' 
          ? `TRF-${camposPagamento.comprovativo?.slice(-6) || Date.now().toString().slice(-6)}` 
          : `MP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'pago',
        clienteNome: user?.nome || 'Cliente',
        clienteEmail: user?.email,
        clienteTelefone: user?.telefone,
        dataAgendada: `${form.dataAgendada} às ${form.horaAgendada}`,
        endereco: `${form.endereco.bairro}${form.endereco.quarteirao ? `, Q. ${form.endereco.quarteirao}` : ''}${form.endereco.casa ? `, Casa ${form.endereco.casa}` : ''}`
      };

      setRecibo(novoRecibo);

      // Simular envio de SMS e Email
      showToast('✅ Pagamento confirmado! Recibo enviado por SMS e Email.', 'success');
      
      // Avançar para o passo do recibo
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

      // Criar solicitação no Firestore
      const solicitacaoData = {
        clienteId: user?.id,
        clienteNome: user?.nome,
        telefoneCliente: user?.telefone,
        emailCliente: user?.email,
        categoria: form.categoria,
        especialidade: form.especialidade,
        servico: getServicoNome(form.categoria, form.especialidade),
        descricao: form.descricao,
        dataSolicitacao: new Date(),
        dataAgendada: new Date(`${form.dataAgendada}T${form.horaAgendada}`),
        endereco: form.endereco,
        imagens: imagensUrls,
        prestadorId: form.prestadorId,
        prestadorNome: form.prestadorNome,
        status: 'pagamento_confirmado',
        valorTotal: form.valorEstimado,
        metodoPagamento: metodoSelecionado,
        referenciaPagamento: recibo?.referencia,
        pagamentoConfirmado: true,
        dataPagamento: new Date(),
        recibo: recibo,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'solicitacoes'), solicitacaoData);
      
      showToast('✅ Solicitação criada com sucesso!', 'success');
      
      // Avançar para o passo do recibo (já deve estar no passo 6)
      
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      showToast('Erro ao criar solicitação. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper para obter nome do serviço
  const getServicoNome = (categoriaId: string, especialidadeId: string): string => {
    const categoria = SERVICE_CATEGORIES.find(c => c.id === categoriaId);
    if (!categoria) return 'Serviço';
    
    const especialidade = categoria.especialidades.find(e => e.id === especialidadeId);
    return especialidade?.nome || categoria.nome;
  };

  // Formatar data para exibição
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => step > 1 ? setStep(step - 1 as any) : navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <Briefcase size={32} className="text-accent" />
              {step === 6 ? 'Recibo de Pagamento' : 'Nova Solicitação'}
            </h1>
            <p className="text-gray-500">
              {step === 1 && 'Escolha a categoria e especialidade do serviço'}
              {step === 2 && 'Descreva o serviço e adicione fotos'}
              {step === 3 && 'Escolha o prestador para o serviço'}
              {step === 4 && 'Selecione o método de pagamento'}
              {step === 5 && 'Confirme os dados e realize o pagamento'}
              {step === 6 && 'Pagamento confirmado! Guarde seu recibo'}
            </p>
          </div>
        </div>

        {/* ======================================== */}
        {/* PROGRESSO (só mostrar até passo 5) */}
        {/* ======================================== */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {[
              { num: 1, label: 'Categoria' },
              { num: 2, label: 'Detalhes' },
              { num: 3, label: 'Prestador' },
              { num: 4, label: 'Pagamento' },
              { num: 5, label: 'Confirmação' }
            ].map((i) => (
              <React.Fragment key={i.num}>
                <div className="flex items-center shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= i.num 
                      ? 'bg-accent text-white' 
                      : 'bg-gray-100 text-gray-400'
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
        {/* PASSO 6: RECIBO */}
        {/* ======================================== */}
        {step === 6 && recibo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Recibo Visual */}
            <div ref={reciboRef}>
              <Card className="border-2 border-accent/20 overflow-hidden">
                <CardContent className="p-0">
                  {/* Cabeçalho do Recibo */}
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
                        <p className="font-bold text-green-400">PAGO</p>
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Recibo */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="font-bold text-primary">{recibo.clienteNome}</p>
                        {recibo.clienteTelefone && (
                          <p className="text-xs text-gray-600">{recibo.clienteTelefone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Prestador</p>
                        <p className="font-bold text-primary">{recibo.prestador}</p>
                        {recibo.prestadorId && (
                          <p className="text-xs text-gray-600">ID: {recibo.prestadorId.slice(-6)}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Serviço</p>
                          <p className="font-bold text-primary">{recibo.servico}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Agendado para</p>
                          <p className="font-bold text-primary">{recibo.dataAgendada}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Local</p>
                      <p className="text-sm text-primary">{recibo.endereco}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Método de Pagamento</p>
                        <p className="font-bold text-accent">{recibo.metodo}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Referência</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">{recibo.referencia}</p>
                          <button
                            onClick={() => handleCopyToClipboard(recibo.referencia, 'Referência')}
                            className="text-gray-400 hover:text-accent"
                          >
                            {copiado === 'Referência' ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-lg font-black text-primary">Total Pago</p>
                      <p className="text-3xl font-black text-accent">{recibo.valor.toLocaleString()} MT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações do Recibo */}
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
                onClick={handlePrint}
                className="flex flex-col items-center py-4 h-auto"
              >
                <Printer size={24} className="mb-2" />
                <span className="text-xs">Imprimir</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex flex-col items-center py-4 h-auto"
              >
                <Share2 size={24} className="mb-2" />
                <span className="text-xs">Compartilhar</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  handleCopyToClipboard(recibo.id, 'ID');
                }}
                className="flex flex-col items-center py-4 h-auto"
              >
                {copiado === 'ID' ? <Check size={24} className="mb-2" /> : <Copy size={24} className="mb-2" />}
                <span className="text-xs">Copiar ID</span>
              </Button>
            </div>

            {/* Mensagem de Confirmação */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-700 mb-1">Pagamento Confirmado!</p>
                  <p className="text-sm text-green-600">
                    Um recibo foi enviado para {user?.email || 'seu email'} e 
                    {user?.telefone ? ` ${user.telefone}` : ' SMS'}.
                    Você pode acompanhar o status do serviço no dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botões Finais */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/cliente/dashboard')}
                className="flex-1"
              >
                Ir para Dashboard
              </Button>
              <Button
                onClick={() => navigate('/cliente/nova-solicitacao')}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                Nova Solicitação
              </Button>
            </div>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* PASSO 1: CATEGORIA E ESPECIALIDADE */}
        {/* ======================================== */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-primary mb-6">
                  Selecione a <span className="text-accent">Categoria</span>
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
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none flex items-center justify-between"
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
                          {SERVICE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategoriaSelect(cat.id)}
                              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
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

                {/* Especialidades */}
                {categoriaSelecionada && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Especialidade *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {especialidades.map((esp) => (
                        <button
                          key={esp.id}
                          onClick={() => handleEspecialidadeSelect(esp.id)}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            form.especialidade === esp.id
                              ? 'border-accent bg-accent/5'
                              : 'border-gray-200 hover:border-accent/50'
                          }`}
                        >
                          <h3 className="font-bold text-primary mb-1">{esp.nome}</h3>
                          <p className="text-xs text-gray-500">{esp.descricao}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!form.categoria || !form.especialidade}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* PASSO 2: DETALHES E FOTOS */}
        {/* ======================================== */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-primary mb-6">
                  Detalhes do <span className="text-accent">Serviço</span>
                </h2>

                {/* Descrição */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descreva o serviço que precisa *
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: Preciso de limpeza geral na sala e cozinha, com foco em armários e eletrodomésticos."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none min-h-[120px]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.descricao.length} caracteres (mínimo 10)
                  </p>
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
                {form.especialidade && (
                  <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign size={24} className="text-accent" />
                          <div>
                            <p className="text-sm font-bold text-gray-600">Valor Estimado</p>
                            <p className="text-2xl font-black text-primary">
                              {form.valorEstimado.toLocaleString()} MT
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">*Valor aproximado</p>
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
                    disabled={!form.descricao || form.descricao.length < 10}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* PASSO 3: SELEÇÃO DE PRESTADOR */}
        {/* ======================================== */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
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
                            </div>
                            {prestador.descricao && (
                              <p className="text-xs text-gray-400 mt-2">{prestador.descricao}</p>
                            )}
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
                        Sua solicitação ficará em lista de espera.
                      </p>
                    </CardContent>
                  </Card>
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
                    disabled={!form.prestadorId && prestadoresDisponiveis.length > 0}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    {prestadoresDisponiveis.length === 0 ? 'Continuar sem prestador' : 'Continuar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-primary mb-6">
                  <span className="text-accent">Pagamento</span>
                </h2>

                {/* Resumo do Valor */}
                <Card className="bg-gradient-to-r from-primary to-blue-900 text-white mb-6">
                  <CardContent className="p-6">
                    <p className="text-sm opacity-80 mb-1">Total a Pagar</p>
                    <p className="text-4xl font-black mb-2">{form.valorEstimado.toLocaleString()} MT</p>
                    <p className="text-xs opacity-60">Inclui taxas de serviço</p>
                  </CardContent>
                </Card>

                {/* Métodos de Pagamento */}
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
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================================== */}
        {/* PASSO 5: CONFIRMAÇÃO E PAGAMENTO */}
        {/* ======================================== */}
        {step === 5 && metodoSelecionado && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-primary mb-6">
                  <span className="text-accent">Confirmar</span> Pagamento
                </h2>

                {/* Instruções do Método */}
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

                {/* Campos do Método Selecionado */}
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

                {/* Resumo da Solicitação */}
                <Card className="bg-gray-50 border-none mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-primary mb-3">Resumo da Solicitação</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold text-gray-600">Serviço:</span> {getServicoNome(form.categoria, form.especialidade)}</p>
                      <p><span className="font-bold text-gray-600">Prestador:</span> {form.prestadorNome || 'Aguardando'}</p>
                      <p><span className="font-bold text-gray-600">Data:</span> {formatarData(form.dataAgendada, form.horaAgendada)}</p>
                      <p><span className="font-bold text-gray-600">Local:</span> {form.endereco.bairro}{form.endereco.quarteirao ? `, Q. ${form.endereco.quarteirao}` : ''}{form.endereco.casa ? `, Casa ${form.endereco.casa}` : ''}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Validação */}
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
                    'Confirmar Pagamento'
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
