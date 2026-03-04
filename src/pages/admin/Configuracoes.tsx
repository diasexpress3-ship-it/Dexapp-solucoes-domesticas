import React, { useEffect, useState } from 'react';
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
  Mail
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function Configuracoes() {
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

  if (isLoading) return null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-primary flex items-center gap-3">
            <Settings size={32} className="text-accent" />
            Configurações do Sistema
          </h1>
          <p className="text-gray-500">Gerencie as taxas, limites e preferências da plataforma.</p>
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
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-primary">Notificar novos cadastros</p>
                      <p className="text-xs text-gray-500">Receber alerta quando um prestador se cadastrar.</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-primary">Alertas de pagamentos pendentes</p>
                      <p className="text-xs text-gray-500">Notificar quando houver saques aguardando.</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
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
                  <Button variant="outline" className="w-full text-red-500 border-red-100" leftIcon={<Globe size={18} />}>
                    Modo Manutenção
                  </Button>
                  <Button variant="outline" className="w-full" leftIcon={<Mail size={18} />}>
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
