import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bell, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'message';
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const notifications: Notification[] = [
    { id: '1', title: 'Novo Serviço', message: 'Você tem uma nova solicitação de Limpeza Residencial.', time: '5 min atrás', type: 'info', read: false },
    { id: '2', title: 'Pagamento Recebido', message: 'O adiantamento de MT 800,00 foi creditado em sua carteira.', time: '1 hora atrás', type: 'success', read: true },
    { id: '3', title: 'Mensagem do Cliente', message: 'João Silva enviou uma mensagem sobre o serviço de amanhã.', time: '2 horas atrás', type: 'message', read: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={18} />;
      case 'message': return <MessageSquare className="text-blue-500" size={18} />;
      default: return <Bell className="text-primary" size={18} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificações">
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:bg-gray-50 ${
                n.read ? 'bg-white border-gray-100' : 'bg-primary/5 border-primary/10'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.read ? 'bg-gray-50' : 'bg-white shadow-sm'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-primary">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <Clock size={10} />
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Bell size={40} className="mx-auto mb-4 opacity-20" />
            <p>Nenhuma notificação por enquanto.</p>
          </div>
        )}
        <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-wider">
          Marcar todas como lidas
        </Button>
      </div>
    </Modal>
  );
};
