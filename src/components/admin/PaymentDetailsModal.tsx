import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Wallet, User, Calendar, CreditCard, 
  CheckCircle, XCircle, Clock, FileText, Copy 
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, formatTime, translateStatus } from '../../utils/utils';
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
      case 'confirmado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'falhou': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-5 h-5" />;
      case 'pendente': return <Clock className="w-5 h-5" />;
      case 'falhou': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

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
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">Detalhes do Pagamento</h3>
                <p className="text-sm text-slate-500">ID: {payment.id?.slice(0, 8)}...</p>
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
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(payment.status)}`}>
              {getStatusIcon(payment.status)}
              <span className="font-black uppercase text-sm">
                {translateStatus(payment.status)}
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
                <p className="text-sm text-slate-500">{payment.clienteEmail || ''}</p>
                <p className="text-sm text-slate-500">{payment.clienteTelefone || ''}</p>
              </div>

              {/* Método de Pagamento */}
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

              {/* Data e Hora */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Data</span>
                </div>
                <p className="font-bold text-primary">{formatDate(payment.data)}</p>
                <p className="text-sm text-slate-500">{formatTime(payment.data)}</p>
              </div>

              {/* Tipo */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Tipo</span>
                </div>
                <p className="font-bold text-primary capitalize">
                  {payment.tipo === 'sinal_80' ? 'Sinal (80%)' : 
                   payment.tipo === 'restante_20' ? 'Restante (20%)' : 
                   payment.tipo || 'Pagamento'}
                </p>
              </div>
            </div>

            {/* Detalhes da Transação */}
            <div className="p-4 bg-primary/5 rounded-xl space-y-3">
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                Detalhes da Transação
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">ID da Transação:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">{payment.id}</span>
                  <button 
                    onClick={handleCopyId}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                {payment.solicitacaoId && (
                  <>
                    <span className="text-slate-500">Solicitação:</span>
                    <span className="font-mono text-primary">{payment.solicitacaoId}</span>
                  </>
                )}
                
                {payment.dataConfirmacao && (
                  <>
                    <span className="text-slate-500">Confirmado em:</span>
                    <span className="text-primary">{formatDate(payment.dataConfirmacao)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {payment.status === 'pendente' && (onConfirm || onReject) && (
            <CardFooter className="flex gap-3 border-t border-slate-100">
              {onReject && (
                <Button
                  fullWidth
                  variant="danger"
                  leftIcon={<XCircle className="w-5 h-5" />}
                  onClick={() => onReject(payment.id)}
                >
                  Rejeitar Pagamento
                </Button>
              )}
              {onConfirm && (
                <Button
                  fullWidth
                  variant="success"
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                  onClick={() => onConfirm(payment.id)}
                >
                  Confirmar Pagamento
                </Button>
              )}
            </CardFooter>
          )}

          {payment.status !== 'pendente' && (
            <CardFooter className="border-t border-slate-100">
              <Button fullWidth variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
