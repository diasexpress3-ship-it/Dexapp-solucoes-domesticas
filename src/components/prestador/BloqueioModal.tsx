import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface BloqueioModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const BloqueioModal = ({ isOpen, onClose, reason }: BloqueioModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conta Bloqueada">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-primary">Acesso Restrito</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Sua conta foi temporariamente bloqueada por nossa equipe de segurança.
          </p>
          {reason && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left mt-4">
              <AlertTriangle className="text-red-500 shrink-0" size={18} />
              <p className="text-xs text-red-700 font-medium">Motivo: {reason}</p>
            </div>
          )}
        </div>
        <div className="space-y-3 pt-4">
          <Button className="w-full" onClick={() => window.location.href = 'mailto:suporte@dexapp.co.mz'}>
            Contactar Suporte
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </div>
    </Modal>
  );
};
