import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft,
  Home,
  LogOut,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Lock,
  UserCog,
  Building,
  Wallet,
  TrendingUp,
  Award,
  Star,
  FileText,
  Image,
  Upload,
  Trash2,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Repeat,
  CalendarRange,
  Timer
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================
interface Configuracoes {
  // Gerais
  nomePlataforma: string;
  emailContato: string;
  telefoneContato: string;
  whatsapp: string;
  endereco: string;
  site: string;
  
  // Financeiro
  taxaPlataforma: number; // %
  percentualPrestador: number; // %
  percentualInicial: number; // %
  percentualFinal: number; // %
  valorMinimoSaque: number;
  diasLiberacaoSaque: number;
  
  // REGRAS DE PERIODICIDADE DE SAQUE
  periodicidadeSaque: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'personalizado';
  diaSemanaSaque?: number; // 0-6 (domingo a sábado) para saques semanais
  diaMesSaque?: number; // 1-31 para saques mensais
  intervaloDiasSaque?: number; // para periodicidade personalizada
  limiteSaquesPorPeriodo: number; // máximo de saques no período
  valorMaximoSaque?: number; // máximo por saque (opcional)
  exigirAprovacaoCentral: boolean; // se saques precisam de aprovação
  diasRetencaoSeguranca: number; // dias de retenção por segurança
  
  // Serviços
  tempoCancelamentoCliente: number; // horas
  tempoCancelamentoPrestador: number; // horas
  tempoMaximoExecucao: number; // dias
  tempoOrcamentoGrande: number; // horas
  
  // Avaliações
  avaliacaoMinima: number;
  permitirAvaliacaoAnonima: boolean;
  
  // Notificações
  emailNotificacoes: boolean;
  smsNotificacoes: boolean;
  whatsappNotificacoes: boolean;
  
  // Segurança
  doisFatores: boolean;
  tempoSessao: number; // minutos
  tentativasLogin: number;
  
  // Manutenção
  modoManutencao: boolean;
  mensagemManutencao: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Configuracoes() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'gerais' | 'financeiro' | 'servicos' | 'notificacoes' | 'seguranca'>('gerais');
  const [config, setConfig] = useState<Configuracoes>({
    // Gerais
    nomePlataforma: 'DEX-app',
    emailContato: 'suporte@dexapp.co.mz',
    telefoneContato: '+258 87 142 5316',
    whatsapp: '+258 87 142 5316',
    endereco: 'Maputo, Moçambique',
    site: 'https://dexapp.co.mz',
    
    // Financeiro
    taxaPlataforma: 40,
    percentualPrestador: 60,
    percentualInicial: 70,
    percentualFinal: 30,
    valorMinimoSaque: 500,
    diasLiberacaoSaque: 7,
    
    // Regras de Periodicidade de Saque
    periodicidadeSaque: 'semanal',
    diaSemanaSaque: 1, // segunda-feira
    diaMesSaque: 5,
    intervaloDiasSaque: 15,
    limiteSaquesPorPeriodo: 1,
    valorMaximoSaque: 50000,
    exigirAprovacaoCentral: true,
    diasRetencaoSeguranca: 3,
    
    // Serviços
    tempoCancelamentoCliente: 2,
    tempoCancelamentoPrestador: 24,
    tempoMaximoExecucao: 30,
    tempoOrcamentoGrande: 24,
    
    // Avaliações
    avaliacaoMinima: 1,
    permitirAvaliacaoAnonima: false,
    
    // Notificações
    emailNotificacoes: true,
    smsNotificacoes: true,
    whatsappNotificacoes: true,
    
    // Segurança
    doisFatores: false,
    tempoSessao: 120,
    tentativasLogin: 5,
    
    // Manutenção
    modoManutencao: false,
    mensagemManutencao: 'Sistema em manutenção. Voltaremos em breve!'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

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
  // CARREGAR CONFIGURAÇÕES
  // ============================================
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'sistema'));
        if (configDoc.exists()) {
          setConfig(configDoc.data() as Configuracoes);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        showToast('Erro ao carregar configurações', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // ============================================
  // SALVAR CONFIGURAÇÕES
  // ============================================
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'sistema'), config);
      setHasChanges(false);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setShowResetModal(false);
    // Recarregar configurações do Firebase
    try {
      const configDoc = await getDoc(doc(db, 'config', 'sistema'));
      if (configDoc.exists()) {
        setConfig(configDoc.data() as Configuracoes);
      }
      setHasChanges(false);
      showToast('Configurações restauradas', 'success');
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      showToast('Erro ao restaurar configurações', 'error');
    }
  };

  const handleToggleMaintenance = () => {
    setMaintenanceMessage(config.mensagemManutencao);
    setShowMaintenanceModal(true);
  };

  const handleConfirmMaintenance = async () => {
    setShowMaintenanceModal(false);
    setConfig({
      ...config,
      modoManutencao: !config.modoManutencao,
      mensagemManutencao: maintenanceMessage
    });
    setHasChanges(true);
    showToast(
      config.modoManutencao 
        ? 'Site saiu do modo de manutenção' 
        : 'Site entrou em modo de manutenção',
      'info'
    );
  };

  // ============================================
  // HELPERS
  // ============================================
  const handleChange = (field: keyof Configuracoes, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const diasSemana = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <SettingsIcon size={32} className="text-accent" />
                Configurações do Sistema
              </h1>
              <p className="text-gray-500">Gerencie todas as configurações da plataforma.</p>
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
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Descartar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent hover:bg-accent/90 text-white"
                  leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ======================================== */}
        {/* STATUS BAR */}
        {/* ======================================== */}
        {config.modoManutencao && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-yellow-600" />
                  <div>
                    <p className="font-bold text-yellow-700">Modo de Manutenção Ativo</p>
                    <p className="text-sm text-yellow-600">{config.mensagemManutencao}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleMaintenance}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Desativar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ======================================== */}
        {/* TABS */}
        {/* ======================================== */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'gerais' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('gerais')}
            className={activeTab === 'gerais' ? 'bg-accent text-white' : ''}
          >
            Gerais
          </Button>
          <Button
            variant={activeTab === 'financeiro' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('financeiro')}
            className={activeTab === 'financeiro' ? 'bg-accent text-white' : ''}
          >
            Financeiro
          </Button>
          <Button
            variant={activeTab === 'servicos' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('servicos')}
            className={activeTab === 'servicos' ? 'bg-accent text-white' : ''}
          >
            Serviços
          </Button>
          <Button
            variant={activeTab === 'notificacoes' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('notificacoes')}
            className={activeTab === 'notificacoes' ? 'bg-accent text-white' : ''}
          >
            Notificações
          </Button>
          <Button
            variant={activeTab === 'seguranca' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('seguranca')}
            className={activeTab === 'seguranca' ? 'bg-accent text-white' : ''}
          >
            Segurança
          </Button>
        </div>

        {/* ======================================== */}
        {/* CONTEÚDO */}
        {/* ======================================== */}
        <Card>
          <CardContent className="p-6">
            {/* GERAL */}
            {activeTab === 'gerais' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Informações Gerais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome da Plataforma
                    </label>
                    <Input
                      value={config.nomePlataforma}
                      onChange={(e) => handleChange('nomePlataforma', e.target.value)}
                      placeholder="DEX-app"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email de Contato
                    </label>
                    <Input
                      value={config.emailContato}
                      onChange={(e) => handleChange('emailContato', e.target.value)}
                      placeholder="suporte@dexapp.co.mz"
                      leftIcon={<Mail size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Telefone de Contato
                    </label>
                    <Input
                      value={config.telefoneContato}
                      onChange={(e) => handleChange('telefoneContato', e.target.value)}
                      placeholder="+258 87 142 5316"
                      leftIcon={<Phone size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <Input
                      value={config.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="+258 87 142 5316"
                      leftIcon={<MessageSquare size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Endereço
                    </label>
                    <Input
                      value={config.endereco}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      placeholder="Maputo, Moçambique"
                      leftIcon={<Building size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Site
                    </label>
                    <Input
                      value={config.site}
                      onChange={(e) => handleChange('site', e.target.value)}
                      placeholder="https://dexapp.co.mz"
                      leftIcon={<Globe size={16} />}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-bold text-primary mb-4">Modo de Manutenção</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={config.modoManutencao ? 'primary' : 'outline'}
                      onClick={handleToggleMaintenance}
                      className={config.modoManutencao ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                    >
                      {config.modoManutencao ? 'Desativar Manutenção' : 'Ativar Manutenção'}
                    </Button>
                    {config.modoManutencao && (
                      <Input
                        value={config.mensagemManutencao}
                        onChange={(e) => handleChange('mensagemManutencao', e.target.value)}
                        placeholder="Mensagem de manutenção"
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* FINANCEIRO */}
            {activeTab === 'financeiro' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Configurações Financeiras</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Taxa da Plataforma (%)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.taxaPlataforma}
                        onChange={(e) => handleChange('taxaPlataforma', Number(e.target.value))}
                        min={0}
                        max={100}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Percentual Prestador (%)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.percentualPrestador}
                        onChange={(e) => handleChange('percentualPrestador', Number(e.target.value))}
                        min={0}
                        max={100}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pagamento Inicial (%)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.percentualInicial}
                        onChange={(e) => handleChange('percentualInicial', Number(e.target.value))}
                        min={0}
                        max={100}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pagamento Final (%)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.percentualFinal}
                        onChange={(e) => handleChange('percentualFinal', Number(e.target.value))}
                        min={0}
                        max={100}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Valor Mínimo para Saque (MT)
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.valorMinimoSaque}
                        onChange={(e) => handleChange('valorMinimoSaque', Number(e.target.value))}
                        min={100}
                        step={100}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Dias para Liberação de Saque
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.diasLiberacaoSaque}
                        onChange={(e) => handleChange('diasLiberacaoSaque', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* REGRAS DE PERIODICIDADE DE SAQUE */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <Repeat size={20} className="text-accent" />
                    Regras de Periodicidade de Saque
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Periodicidade de Saque
                      </label>
                      <select
                        value={config.periodicidadeSaque}
                        onChange={(e) => handleChange('periodicidadeSaque', e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      >
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </div>

                    {config.periodicidadeSaque === 'semanal' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Dia da Semana para Saque
                        </label>
                        <select
                          value={config.diaSemanaSaque}
                          onChange={(e) => handleChange('diaSemanaSaque', Number(e.target.value))}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                        >
                          {diasSemana.map((dia, index) => (
                            <option key={index} value={index}>{dia}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {config.periodicidadeSaque === 'mensal' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Dia do Mês para Saque
                        </label>
                        <Input
                          type="number"
                          value={config.diaMesSaque}
                          onChange={(e) => handleChange('diaMesSaque', Number(e.target.value))}
                          min={1}
                          max={31}
                          placeholder="5"
                        />
                      </div>
                    )}

                    {config.periodicidadeSaque === 'personalizado' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Intervalo em Dias
                        </label>
                        <Input
                          type="number"
                          value={config.intervaloDiasSaque}
                          onChange={(e) => handleChange('intervaloDiasSaque', Number(e.target.value))}
                          min={1}
                          placeholder="15"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Limite de Saques por Período
                      </label>
                      <Input
                        type="number"
                        value={config.limiteSaquesPorPeriodo}
                        onChange={(e) => handleChange('limiteSaquesPorPeriodo', Number(e.target.value))}
                        min={1}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valor Máximo por Saque (MT)
                      </label>
                      <Input
                        type="number"
                        value={config.valorMaximoSaque}
                        onChange={(e) => handleChange('valorMaximoSaque', Number(e.target.value))}
                        min={0}
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Dias de Retenção de Segurança
                      </label>
                      <Input
                        type="number"
                        value={config.diasRetencaoSeguranca}
                        onChange={(e) => handleChange('diasRetencaoSeguranca', Number(e.target.value))}
                        min={0}
                        placeholder="3"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.exigirAprovacaoCentral}
                          onChange={(e) => handleChange('exigirAprovacaoCentral', e.target.checked)}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-sm font-bold text-gray-700">
                          Exigir aprovação da central para saques
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-700 mb-1">
                          Resumo das Regras de Saque
                        </p>
                        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                          <li>Periodicidade: {config.periodicidadeSaque}</li>
                          {config.periodicidadeSaque === 'semanal' && (
                            <li>Dia da semana: {diasSemana[config.diaSemanaSaque || 1]}</li>
                          )}
                          {config.periodicidadeSaque === 'mensal' && (
                            <li>Dia do mês: {config.diaMesSaque}</li>
                          )}
                          {config.periodicidadeSaque === 'personalizado' && (
                            <li>A cada {config.intervaloDiasSaque} dias</li>
                          )}
                          <li>Limite: {config.limiteSaquesPorPeriodo} saque(s) por período</li>
                          <li>Valor mínimo: {config.valorMinimoSaque} MT</li>
                          {config.valorMaximoSaque && (
                            <li>Valor máximo: {config.valorMaximoSaque} MT</li>
                          )}
                          <li>Retenção de segurança: {config.diasRetencaoSeguranca} dias</li>
                          <li>Aprovação central: {config.exigirAprovacaoCentral ? 'Sim' : 'Não'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        Distribuição de Valores
                      </p>
                      <p className="text-xs text-blue-600">
                        O cliente paga 100% do serviço. O prestador recebe {config.percentualPrestador}% e a plataforma fica com {config.taxaPlataforma}%. 
                        Pagamento: {config.percentualInicial}% inicial e {config.percentualFinal}% final.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SERVIÇOS */}
            {activeTab === 'servicos' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Configurações de Serviços</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo para Cliente Cancelar (horas)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tempoCancelamentoCliente}
                        onChange={(e) => handleChange('tempoCancelamentoCliente', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo para Prestador Cancelar (horas)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tempoCancelamentoPrestador}
                        onChange={(e) => handleChange('tempoCancelamentoPrestador', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo Máximo de Execução (dias)
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tempoMaximoExecucao}
                        onChange={(e) => handleChange('tempoMaximoExecucao', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo para Orçamento (horas)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tempoOrcamentoGrande}
                        onChange={(e) => handleChange('tempoOrcamentoGrande', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Avaliação Mínima
                    </label>
                    <div className="relative">
                      <Star size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.avaliacaoMinima}
                        onChange={(e) => handleChange('avaliacaoMinima', Number(e.target.value))}
                        min={1}
                        max={10}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.permitirAvaliacaoAnonima}
                        onChange={(e) => handleChange('permitirAvaliacaoAnonima', e.target.checked)}
                        className="w-4 h-4 text-accent"
                      />
                      <span className="text-sm font-bold text-gray-700">Permitir avaliações anônimas</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICAÇÕES */}
            {activeTab === 'notificacoes' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Configurações de Notificações</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-gray-600" />
                      <div>
                        <p className="font-bold text-primary">Notificações por Email</p>
                        <p className="text-xs text-gray-500">Receber alertas e confirmações por email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.emailNotificacoes}
                      onChange={(e) => handleChange('emailNotificacoes', e.target.checked)}
                      className="w-5 h-5 text-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-gray-600" />
                      <div>
                        <p className="font-bold text-primary">Notificações por SMS</p>
                        <p className="text-xs text-gray-500">Receber alertas e confirmações por SMS</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.smsNotificacoes}
                      onChange={(e) => handleChange('smsNotificacoes', e.target.checked)}
                      className="w-5 h-5 text-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={20} className="text-gray-600" />
                      <div>
                        <p className="font-bold text-primary">Notificações por WhatsApp</p>
                        <p className="text-xs text-gray-500">Receber alertas e confirmações por WhatsApp</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.whatsappNotificacoes}
                      onChange={(e) => handleChange('whatsappNotificacoes', e.target.checked)}
                      className="w-5 h-5 text-accent"
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {/* SEGURANÇA */}
            {activeTab === 'seguranca' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-primary mb-4">Configurações de Segurança</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo de Sessão (minutos)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tempoSessao}
                        onChange={(e) => handleChange('tempoSessao', Number(e.target.value))}
                        min={5}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tentativas de Login
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        value={config.tentativasLogin}
                        onChange={(e) => handleChange('tentativasLogin', Number(e.target.value))}
                        min={1}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-600" />
                    <div>
                      <p className="font-bold text-primary">Autenticação de Dois Fatores</p>
                      <p className="text-xs text-gray-500">Exigir 2FA para administradores</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.doisFatores}
                    onChange={(e) => handleChange('doisFatores', e.target.checked)}
                    className="w-5 h-5 text-accent"
                  />
                </label>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================== */}
      {/* MODAL DE RESET */}
      {/* ======================================== */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Descartar Alterações">
        <div className="space-y-6">
          <p className="text-gray-600">
            Tem certeza que deseja descartar todas as alterações não salvas?
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReset}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Descartar Alterações
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================== */}
      {/* MODAL DE MANUTENÇÃO */}
      {/* ======================================== */}
      <Modal isOpen={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)} title="Modo de Manutenção">
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-700">
              {config.modoManutencao 
                ? 'Ao desativar o modo de manutenção, o site voltará ao funcionamento normal.'
                : 'Ao ativar o modo de manutenção, apenas administradores poderão acessar o site.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mensagem de Manutenção
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Sistema em manutenção. Voltaremos em breve!"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowMaintenanceModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmMaintenance}
              className={`flex-1 ${
                config.modoManutencao 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white`}
            >
              {config.modoManutencao ? 'Desativar Manutenção' : 'Ativar Manutenção'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
