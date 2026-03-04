import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Mail, Phone, Shield, Calendar, 
  Star, Award, MapPin, FileText, Camera, 
  Edit2, Save, XCircle, CheckCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatDate, formatPhone, translateStatus } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate?: (updatedUser: any) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    profile: user?.profile || '',
    status: user?.status || ''
  });

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, formData);
      showToast('Utilizador atualizado!', 'success');
      if (onUpdate) {
        onUpdate({ ...user, ...formData });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      showToast('Erro ao atualizar utilizador', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'admin': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'prestador': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'central': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle };
      case 'pendente': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle };
      case 'bloqueado': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle };
    }
  };

  const statusBadge = getStatusBadge(user.status);

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
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.prestadorData?.profileUrl ? (
                  <img 
                    src={user.prestadorData.profileUrl} 
                    alt={user.nome} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">{user.nome}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getProfileColor(user.profile)}`}>
                    {user.profile}
                  </span>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                    <statusBadge.icon className="w-3 h-3" />
                    {translateStatus(user.status)}
                  </span>
                </div>
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
          <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Nome Completo"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Perfil</label>
                  <select
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.profile}
                    onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="prestador">Prestador</option>
                    <option value="central">Central</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Status</label>
                  <select
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Email</span>
                    </div>
                    <p className="font-bold text-primary break-all">{user.email || 'Não informado'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Telefone</span>
                    </div>
                    <p className="font-bold text-primary">{formatPhone(user.telefone) || 'Não informado'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Cadastro</span>
                    </div>
                    <p className="font-bold text-primary">{formatDate(user.dataCadastro)}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Último Acesso</span>
                    </div>
                    <p className="font-bold text-primary">{user.ultimoAcesso ? formatDate(user.ultimoAcesso) : 'Nunca'}</p>
                  </div>
                </div>

                {/* Dados de Prestador (se aplicável) */}
                {user.profile === 'prestador' && user.prestadorData && (
                  <>
                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Dados Profissionais
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Especialidades</p>
                          <div className="flex flex-wrap gap-2">
                            {user.prestadorData.especialidades?.map((esp: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                                {esp}
                              </span>
                            )) || 'Não informado'}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                          <p className="font-bold text-primary">{user.prestadorData.categoria || 'Geral'}</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avaliação</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            <span className="text-xl font-black text-primary">
                              {user.prestadorData.rating?.toFixed(1) || '5.0'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trabalhos</p>
                          <p className="text-xl font-black text-primary">{user.prestadorData.trabalhos || 0}</p>
                        </div>
                      </div>

                      {/* Documentos */}
                      {(user.prestadorData.biUrl || user.prestadorData.profileUrl) && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Documentos</p>
                          <div className="flex flex-wrap gap-4">
                            {user.prestadorData.biUrl && (
                              <a 
                                href={user.prestadorData.biUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:shadow-sm transition-all"
                              >
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-bold">Ver BI</span>
                              </a>
                            )}
                            {user.prestadorData.profileUrl && (
                              <a 
                                href={user.prestadorData.profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:shadow-sm transition-all"
                              >
                                <Camera className="w-4 h-4 text-primary" />
                                <span className="font-bold">Ver Foto</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex gap-3 border-t border-slate-100">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  leftIcon={<Save className="w-4 h-4" />}
                  loading={loading}
                  onClick={handleSave}
                >
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Fechar
                </Button>
                <Button 
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
