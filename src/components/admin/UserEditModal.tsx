import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const UserEditModal = ({ isOpen, onClose, user, onSuccess }: UserEditModalProps) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    telefone: '',
    status: '',
    role: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        telefone: user.telefone || '',
        status: user.status,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), formData);
      showToast('Usuário atualizado com sucesso!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast('Erro ao atualizar usuário', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
        <Input
          label="Telefone"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          required
        />
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Perfil</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="cliente">Cliente</option>
            <option value="prestador">Prestador</option>
            <option value="central">Central</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="blocked">Bloqueado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
};
