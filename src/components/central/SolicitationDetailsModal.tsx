import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Wrench, MapPin, Calendar, Clock, 
  DollarSign, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, MessageSquare, FileText
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatTime, formatPhone, translateStatus } from '../../utils/utils';

interface SolicitationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitation: any;
  onUpdateStatus?: (id: string, status: string) => void;
}

export const SolicitationDetailsModal: React.FC<SolicitationDetailsModalProps> = ({
  isOpen,
  onClose,
  solicitation,
  onUpdateStatus
}) => {
  if (!isOpen || !solicitation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'buscando_prestador': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle };
      case 'prestador_atribuido': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock };
      case 'em_andamento': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: AlertCircle };
      case 'concluido': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle };
      case 'cancelado': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle };
    }
  };

  const status = getStatusColor(solicitation.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl"
      >
        <Card className="border-none shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${status.bg} flex items-center justify-center`}>
                <status.icon className={`w-7 h-7 ${status.text}`} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">Detalhes da Solicitação</h3>
                <p className="text-sm text-slate-500">ID: {solicitation.id?.slice(0, 12)}...</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
            {/* Status e Valores */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg}`}>
                <status.icon className={`w-4 h-4 ${status.text}`} />
                <span className={`font-black uppercase text-sm ${status.text}`}>
                  {translateStatus(solicitation.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary">{formatCurrency(solicitation.valorTotal)}</p>
                <p className="text-xs text-slate-400">Valor Total</p>
              </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Cliente</span>
                </div>
                <p className="font-bold text-primary">{solicitation.clienteNome || 'N/A'}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-3 h-3" />
                  {formatPhone(solicitation.clienteTelefone)}
                </div>
                {solicitation.clienteEmail && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-3 h-3" />
                    {solicitation.clienteEmail}
                  </div>
                )}
              </div>

              {/* Serviço */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Serviço</span>
                </div>
                <p className="font-bold text-primary">{solicitation.servico || 'N/A'}</p>
                <p className="text-sm text-slate-500">{solicitation.categoria || ''}</p>
                {solicitation.tamanho && (
                  <p className="text-sm text-slate-500">Tamanho: {solicitation.tamanho}</p>
                )}
              </div>

              {/* Localização */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Local</span>
                </div>
                <p className="font-bold text-primary">{solicitation.endereco?.bairro || 'N/A'}</p>
                {solicitation.endereco?.quarteirao && (
                  <p className="text-sm text-slate-500">Quarteirão: {solicitation.endereco.quarteirao}</p>
                )}
                {solicitation.endereco?.casa && (
                  <p className="text-sm text-slate-500">Casa: {solicitation.endereco.casa}</p>
                )}
              </div>

              {/* Data/Hora */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Agendamento</span>
                </div>
                <p className="font-bold text-primary">{formatDate(solicitation.dataAgendamento || solicitation.dataSolicitacao)}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-3 h-3" />
                  {formatTime(solicitation.dataAgendamento || solicitation.dataSolicitacao)}
                </div>
              </div>
            </div>

            {/* Prestador (se atribuído) */}
            {solicitation.prestadorNome && (
              <div className="p-4 bg-primary/5 rounded-xl">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                  Prestador Atribuído
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">{solicitation.prestadorNome}</p>
                      {solicitation.prestadorTelefone && (
                        <p className="text-sm text-slate-500">{formatPhone(solicitation.prestadorTelefone)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Atribuído em</p>
                    <p className="font-bold text-primary">{formatDate(solicitation.dataAceite)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detalhes Financeiros */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sinal (80%)</p>
                <p className="text-lg font-black text-primary">{formatCurrency(solicitation.valor80 || 0)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Restante (20%)</p>
                <p className="text-lg font-black text-primary">{formatCurrency(solicitation.valor20 || 0)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-lg font-black text-primary">{formatCurrency(solicitation.valorTotal || 0)}</p>
              </div>
            </div>

            {/* Histórico de Status */}
            {solicitation.historico && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Histórico
                </p>
                <div className="space-y-3">
                  {solicitation.historico.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-bold text-primary">{item.status}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(item.data)}</p>
                        {item.observacao && (
                          <p className="text-sm text-slate-500 mt-1">{item.observacao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="border-t border-slate-100">
            <Button fullWidth variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// Função auxiliar
const formatDateTime = (date: any) => {
  if (!date) return '---';
  const d = date.toDate ? date.toDate() : new Date(date);
  return `${formatDate(d)} às ${formatTime(d)}`;
};
