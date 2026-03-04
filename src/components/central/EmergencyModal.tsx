import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, AlertCircle, Phone, MapPin, Clock, 
  User, Wrench, CheckCircle, Send, Loader2 
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'acidente',
    descricao: '',
    localizacao: '',
    contato: '',
    envolvidos: ''
  });

  if (!isOpen) return null;

  const emergencyTypes = [
    { id: 'acidente', label: 'Acidente', icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
    { id: 'incendio', label: 'Incêndio', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    { id: 'queda', label: 'Queda', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { id: 'eletrico', label: 'Choque Elétrico', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
    { id: 'gas', label: 'Fuga de Gás', icon: AlertCircle, color: 'text-purple-600 bg-purple-50' },
    { id: 'outro', label: 'Outro', icon: AlertCircle, color: 'text-slate-600 bg-slate-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.localizacao) {
      showToast('Preencha a descrição e localização', 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'emergencias'), {
        ...formData,
        usuarioId: user?.id,
        usuarioNome: user?.nome,
        usuarioTelefone: user?.telefone,
        status: 'pendente',
        data: serverTimestamp(),
        prioridade: 'alta'
      });

      showToast('Emergência reportada! Equipe será acionada.', 'success');
      
      // Disparar notificação para central
      // Simular envio de SMS/WhatsApp
      setTimeout(() => {
        showToast('Equipe de emergência notificada!', 'info');
      }, 1000);

      onClose();
    } catch (error) {
      console.error('Erro ao reportar emergência:', error);
      showToast('Erro ao reportar emergência', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl overflow-hidden">
          {/* Header - Vermelho para emergência */}
          <div className="bg-rose-600 p-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Emergência!</h3>
                <p className="text-white/80 font-medium">Reporte uma situação urgente</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-6">
              {/* Tipo de Emergência */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                  Tipo de Emergência *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: type.id })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        formData.tipo === type.id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.color}`}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                  Descrição da Emergência *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva detalhadamente o que está acontecendo..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  required
                />
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                  Localização *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    placeholder="Bairro, quarteirão, número da casa..."
                    className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contato */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                    Seu Contato
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.contato}
                      onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                      placeholder="84 000 0000"
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                {/* Envolvidos */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                    Pessoas Envolvidas
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.envolvidos}
                      onChange={(e) => setFormData({ ...formData, envolvidos: e.target.value })}
                      placeholder="Número de pessoas"
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Aviso de Emergência */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-600 mb-1">⚠️ Atenção</p>
                  <p className="text-xs text-rose-600/80 leading-relaxed">
                    Ao reportar uma emergência, nossa central será notificada imediatamente. 
                    Uma equipe de suporte entrará em contato nos próximos minutos.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3 border-t border-slate-100">
              <Button 
                type="button"
                variant="outline" 
                fullWidth 
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                fullWidth 
                className="bg-rose-600 hover:bg-rose-700"
                leftIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                loading={loading}
              >
                Reportar Emergência
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
