import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Wallet, User, Calendar, CreditCard, 
  CheckCircle, XCircle, Clock, FileText, Copy,
  Building2, Phone, Mail
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatTime, formatPhone } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
  onConfirm,
  onReject
}) => {
  const { showToast } = useToast();

  if (!isOpen || !payment) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(payment.id || '');
    showToast('ID copiado!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle };
      case 'pendente': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock };
      case 'falhou': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock };
    }
  };

  const status = getStatusColor(payment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${status.bg} flex items-center justify-center`}>
                <status.icon className={`w-7 h-7 ${status.text}`} />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">Detalhes do Pagamento</h3>
                <p className="text-sm text-slate-500">ID: {payment.id?.slice(0, 12)}...</p>
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
            {/* Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg}`}>
              <status.icon className={`w-4 h-4 ${status.text}`} />
              <span className={`font-black uppercase text-sm ${status.text}`}>
                {payment.status}
              </span>
            </div>

            {/* Valor */}
            <div className="bg-gradient-to-br from-primary to-blue-900 text-white p-6 rounded-2xl">
              <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">
                Valor da Transação
              </p>
              <p className="text-4xl font-black">
                {formatCurrency(payment.valor || 0)}
              </p>
              {payment.tipo && (
                <p className="text-sm text-white/80 mt-2">
                  {payment.tipo === 'sinal_80' ? 'Sinal (80%)' : 'Pagamento Final (20%)'}
                </p>
              )}
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Cliente</span>
                </div>
                <p className="font-bold text-primary">{payment.clienteNome || 'N/A'}</p>
                {payment.clienteEmail && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-3 h-3" />
                    {payment.clienteEmail}
                  </div>
                )}
                {payment.clienteTelefone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-3 h-3" />
                    {formatPhone(payment.clienteTelefone)}
                  </div>
                )}
              </div>

              {/* Método */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Método</span>
                </div>
                <p className="font-bold text-primary">{payment.metodo || 'M-Pesa'}</p>
                {payment.dados && (
                  <p className="text-sm text-slate-500">Ref: {payment.dados}</p>
                )}
              </div>

              {/* Data/Hora */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Data</span>
                </div>
                <p className="font-bold text-primary">{formatDate(payment.data)}</p>
                <p className="text-sm text-slate-500">{formatTime(payment.data)}</p>
              </div>

              {/* Prestador (se houver) */}
              {payment.prestadorNome && (
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Prestador</span>
                  </div>
                  <p className="font-bold text-primary">{payment.prestadorNome}</p>
                </div>
              )}
            </div>

            {/* Detalhes da Transação */}
            <div className="p-4 bg-primary/5 rounded-xl space-y-3">
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                Detalhes da Transação
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ID da Transação:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{payment.id}</span>
                    <button 
                      onClick={handleCopyId}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                      title="Copiar ID"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                {payment.solicitacaoId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Solicitação:</span>
                    <span className="font-mono text-primary">{payment.solicitacaoId}</span>
                  </div>
                )}
                
                {payment.dataConfirmacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Confirmado em:</span>
                    <span className="text-primary">{formatDateTime(payment.dataConfirmacao)}</span>
                  </div>
                )}

                {payment.confirmadoPor && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Confirmado por:</span>
                    <span className="text-primary">{payment.confirmadoPor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comprovante (se houver) */}
            {payment.comprovanteUrl && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Comprovante
                </p>
                <a 
                  href={payment.comprovanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">Ver Comprovante</span>
                </a>
              </div>
            )}
          </CardContent>

          {/* Footer - Apenas para pendentes */}
          {payment.status === 'pendente' && (onConfirm || onReject) && (
            <CardFooter className="flex gap-3 border-t border-slate-100">
              {onReject && (
                <Button
                  fullWidth
                  variant="danger"
                  leftIcon={<XCircle className="w-5 h-5" />}
                  onClick={() => onReject(payment.id)}
                >
                  Rejeitar
                </Button>
              )}
              {onConfirm && (
                <Button
                  fullWidth
                  variant="success"
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                  onClick={() => onConfirm(payment.id)}
                >
                  Confirmar
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Função auxiliar para formatar data/hora completa
const formatDateTime = (date: any) => {
  if (!date) return '---';
  const d = date.toDate ? date.toDate() : new Date(date);
  return `${formatDate(d)} às ${formatTime(d)}`;
};
