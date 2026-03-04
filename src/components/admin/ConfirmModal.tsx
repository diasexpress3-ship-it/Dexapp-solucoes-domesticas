import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'success';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
}: ConfirmModalProps) => {
  const icons = {
    danger: <AlertTriangle className="text-red-500" size={48} />,
    warning: <AlertTriangle className="text-yellow-500" size={48} />,
    success: <CheckCircle className="text-green-500" size={48} />,
  };

  const buttonVariants: Record<string, "danger" | "success" | "primary"> = {
    danger: "danger",
    warning: "primary",
    success: "success"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-gray-50 rounded-full">
          {icons[confirmVariant]}
        </div>
        <p className="text-gray-600">{message}</p>
        <div className="flex items-center gap-3 w-full pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={buttonVariants[confirmVariant]} className="flex-1" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
