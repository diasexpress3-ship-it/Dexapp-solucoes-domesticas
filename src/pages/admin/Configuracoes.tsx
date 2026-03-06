import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Config } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Settings, 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard,
  Percent,
  Mail,
  Home,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'platform'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as Config);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'config', 'platform'), config as any);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = (key: string) => {
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notificacoes: {
          ...prev.notificacoes,
          [key]: !prev.notificacoes?.[key]
        }
      } as Config;
    });
  };

  const handleConfigureSMTP = () => {
    showToast('Configuração SMTP será implementada em breve', 'info');
  };

  const handleMaintenanceMode = () => {
    showToast('Modo de manutenção será implementado em breve', 'info');
  };

  if (isLoading) return null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1 hover:text-accent transition-colors"
          >
            <Home className="w-4 h-4" /> Início
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="hover:text-accent transition-colors"
          >
            Admin
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Configurações</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <Settings size={32} className="text-accent" />
              Configurações do Sistema
            </h1>
            <p className="text-gray-500">Gerencie as taxas, limites e preferências da plataforma.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Financial Settings */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Percent size={20} className="text-primary" />
                  <h3 className="font-bold text-primary">Taxas e Comissões</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Comissão da Plataforma (%)"
                      type="number"
                      value={config?.configuracoes?.taxaPlataforma || 20}
                      onChange={(e) => setConfig({ 
                        ...config!, 
                        configuracoes: { ...config!.configuracoes, taxaPlataforma: Number(e.target.value) } 
                      })}
                    />
                    <Input
                      label="Taxa de Saque (MT)"
                      type="number"
                      value={config?.configuracoes?.taxaSaque || 50}
                      onChange={(e) => setConfig({ 
                        ...config!, 
                        configuracoes: { ...config!.configuracoes, taxaSaque: Number(e.target.value) } 
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Valor Mínimo de Saque (MT)"
                      type="number"
                      value={config?.configuracoes?.minSaque || 500}
                      onChange={(e) => setConfig({ 
                        ...config!, 
                        configuracoes: { ...config!.configuracoes, minSaque: Number(e.target.value) } 
                      })}
                    />
                    <Input
                      label="Percentual de Adiantamento (%)"
                      type="number"
                      value={80}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  <h3 className="font-bold text-primary">Notificações e Alertas</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleToggleNotification('novosCadastros')}
                  >
                    <div>
                      <p className="text-sm font-bold text-primary">Notificar novos cadastros</p>
                      <p className="text-xs text-gray-500">Receber alerta quando um prestador se cadastrar.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${
                      config?.notificacoes?.novosCadastros ? 'bg-accent' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        config?.notificacoes?.novosCadastros ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleToggleNotification('pagamentosPendentes')}
                  >
                    <div>
                      <p className="text-sm font-bold text-primary">Alertas de pagamentos pendentes</p>
                      <p className="text-xs text-gray-500">Notificar quando houver saques aguardando.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${
                      config?.notificacoes?.pagamentosPendentes ? 'bg-accent' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        config?.notificacoes?.pagamentosPendentes ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Security & Maintenance */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  <h3 className="font-bold text-primary">Segurança</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-500 border-red-100 hover:bg-red-50" 
                    leftIcon={<Globe size={18} />}
                    onClick={handleMaintenanceMode}
                  >
                    Modo Manutenção
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    leftIcon={<Mail size={18} />}
                    onClick={handleConfigureSMTP}
                  >
                    Configurar SMTP
                  </Button>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card className="bg-accent text-white">
                <CardContent className="p-6">
                  <p className="text-sm font-bold mb-4">Lembre-se de salvar as alterações para que elas entrem em vigor imediatamente.</p>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-accent hover:bg-gray-100" 
                    isLoading={isSaving}
                    leftIcon={<Save size={18} />}
                  >
                    Salvar Tudo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
