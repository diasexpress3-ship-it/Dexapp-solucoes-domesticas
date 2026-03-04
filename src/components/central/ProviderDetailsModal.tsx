import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Star, FileText, Camera, Phone, 
  Mail, MapPin, Award, Calendar, CheckCircle, 
  XCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate, formatPhone, translateStatus } from '../../utils/utils';

interface ProviderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  isOpen,
  onClose,
  provider,
  onApprove,
  onReject
}) => {
  if (!isOpen || !provider) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-100 text-emerald-700';
      case 'pendente': return 'bg-amber-100 text-amber-700';
      case 'bloqueado': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden">
                {provider.prestadorData?.profileUrl ? (
                  <img 
                    src={provider.prestadorData.profileUrl} 
                    alt={provider.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">{provider.nome}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase">
                    Prestador
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(provider.status)}`}>
                    {translateStatus(provider.status)}
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
          <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
            {/* Informações Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Email</span>
                </div>
                <p className="font-bold text-primary break-all">{provider.email || 'Não informado'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Telefone</span>
                </div>
                <p className="font-bold text-primary">{formatPhone(provider.telefone) || 'Não informado'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Cadastro</span>
                </div>
                <p className="font-bold text-primary">{formatDate(provider.dataCadastro)}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Avaliação</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-black text-primary">
                    {provider.prestadorData?.rating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({provider.prestadorData?.trabalhos || 0} trabalhos)
                  </span>
                </div>
              </div>
            </div>

            {/* Especialidades */}
            {provider.prestadorData?.especialidades && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Especialidades
                </p>
                <div className="flex flex-wrap gap-2">
                  {provider.prestadorData.especialidades.map((esp: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-white text-primary rounded-xl font-bold text-sm shadow-sm"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos */}
            <div className="space-y-4">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Documentos Enviados
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BI */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Bilhete de Identidade</p>
                      <p className="text-xs text-slate-400">Frente e Verso</p>
                    </div>
                  </div>
                  {provider.prestadorData?.biUrl ? (
                    <a
                      href={provider.prestadorData.biUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                    >
                      <span className="text-sm font-bold text-primary">Visualizar Documento</span>
                      <Camera className="w-4 h-4 text-primary" />
                    </a>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600 text-sm font-bold text-center">
                      Documento não enviado
                    </div>
                  )}
                </div>

                {/* Selfie/Profile */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Foto de Perfil</p>
                      <p className="text-xs text-slate-400">Selfie Clara</p>
                    </div>
                  </div>
                  {provider.prestadorData?.profileUrl ? (
                    <a
                      href={provider.prestadorData.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                    >
                      <span className="text-sm font-bold text-primary">Visualizar Foto</span>
                      <Camera className="w-4 h-4 text-primary" />
                    </a>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600 text-sm font-bold text-center">
                      Foto não enviada
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certificados Adicionais */}
            {provider.prestadorData?.certificadoUrl && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Certificados
                </p>
                <a
                  href={provider.prestadorData.certificadoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">Ver Certificado</span>
                </a>
              </div>
            )}

            {/* Nota de Verificação */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-600 mb-1">Verificação de Antecedentes</p>
                <p className="text-xs text-amber-600/80 leading-relaxed">
                  Os documentos apresentados serão verificados pela nossa equipe. 
                  A aprovação concede acesso à plataforma como prestador verificado.
                </p>
              </div>
            </div>
          </CardContent>

          {/* Footer - Ações */}
          {provider.status === 'pendente' && (
            <CardFooter className="flex gap-3 border-t border-slate-100">
              {onReject && (
                <Button
                  fullWidth
                  variant="danger"
                  leftIcon={<XCircle className="w-5 h-5" />}
                  onClick={() => onReject(provider.id)}
                >
                  Recusar Prestador
                </Button>
              )}
              {onApprove && (
                <Button
                  fullWidth
                  variant="success"
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                  onClick={() => onApprove(provider.id)}
                >
                  Aprovar Prestador
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
