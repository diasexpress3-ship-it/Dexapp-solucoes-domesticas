import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Wallet, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';

interface SaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: () => void;
}

export const SaqueModal = ({ isOpen, onClose, balance, onSuccess }: SaqueModalProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > balance) {
      showToast('Saldo insuficiente', 'error');
      return;
    }
    if (Number(amount) < 500) {
      showToast('Valor mínimo de saque é MT 500,00', 'warning');
      return;
    }

    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setStep(2);
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Solicitar Saque" : "Solicitação Enviada"}>
      {step === 1 ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-primary text-white rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-70">Saldo Disponível</p>
              <h4 className="text-xl font-black">{formatCurrency(balance)}</h4>
            </div>
            <Wallet size={24} className="opacity-50" />
          </div>

          <Input
            label="Valor do Saque (MT)"
            type="number"
            placeholder="Mínimo MT 500,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={500}
            max={balance}
          />

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 ml-1">Método de Recebimento</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setMethod('mpesa')}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  method === 'mpesa' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xs font-bold">M-Pesa</span>
              </button>
              <button 
                type="button"
                onClick={() => setMethod('emola')}
                className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  method === 'emola' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <span className="text-xs font-bold">e-Mola</span>
              </button>
            </div>
          </div>

          <Input
            label={`Número ${method === 'mpesa' ? 'M-Pesa' : 'e-Mola'}`}
            placeholder="84XXXXXXX ou 82XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" size={18} />
            <p className="text-[10px] text-yellow-700 font-medium leading-relaxed">
              O processamento do saque pode levar até 24 horas úteis. Uma taxa de MT 50,00 será descontada do valor solicitado.
            </p>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
            Confirmar Saque
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-primary">Sucesso!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sua solicitação de saque de <span className="font-bold text-primary">{formatCurrency(Number(amount))}</span> foi enviada com sucesso e está em processamento.
            </p>
          </div>
          <Button className="w-full" onClick={onClose}>
            Concluir
          </Button>
        </div>
      )}
    </Modal>
  );
};
