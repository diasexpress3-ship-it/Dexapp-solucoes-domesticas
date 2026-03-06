import React, { useState, useRef } from 'react';
import { Camera, Loader2, Upload, X, User } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onUpload?: (url: string) => void;
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onUpload,
  userId,
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificações de segurança
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem muito grande. Máximo 5MB', 'error');
      return;
    }

    // Preview local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    // ✅ Usando VITE_IMGBB_KEY conforme solicitado
    const apiKey = import.meta.env.VITE_IMGBB_KEY;
    
    if (!apiKey) {
      showToast('Chave da API ImgBB não configurada', 'error');
      setIsUploading(false);
      setPreviewUrl(currentImageUrl || null);
      URL.revokeObjectURL(localPreview);
      return;
    }

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.url) {
        const url = result.data.url;
        setPreviewUrl(url);
        
        // Salvar no Firestore
        const targetUserId = userId || user?.id;
        if (targetUserId) {
          try {
            const userRef = doc(db, 'users', targetUserId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              await updateDoc(userRef, { 
                profileImageUrl: url 
              });
            } else {
              await setDoc(userRef, { 
                profileImageUrl: url,
                id: targetUserId,
                nome: user?.nome || 'Usuário',
                email: user?.email || '',
                profile: user?.profile || 'cliente',
                status: 'ativo'
              });
            }
          } catch (firestoreError) {
            console.error("Erro ao salvar no Firestore:", firestoreError);
            showToast('Imagem carregada, mas erro ao salvar no perfil', 'warning');
          }
        }

        if (onUpload) onUpload(url);
        showToast('Imagem carregada com sucesso!', 'success');
      } else {
        throw new Error('Falha no upload - resposta inválida');
      }
    } catch (error) {
      console.error("Erro detalhado no upload:", error);
      showToast('Erro ao carregar imagem. Tente novamente.', 'error');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
      setShowMenu(false);
    }
  };

  const handleRemoveImage = async () => {
    setPreviewUrl(null);
    const targetUserId = userId || user?.id;
    
    if (targetUserId) {
      try {
        const userRef = doc(db, 'users', targetUserId);
        await updateDoc(userRef, { profileImageUrl: null });
        showToast('Imagem removida com sucesso', 'info');
      } catch (error) {
        console.error("Erro ao remover imagem:", error);
        showToast('Erro ao remover imagem', 'error');
      }
    }
    
    if (onUpload) onUpload('');
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`relative ${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-900 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all group border-2 border-white/20 hover:border-accent/50`}
        title="Alterar foto de perfil"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Perfil" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} className="text-accent" />
              {isUploading ? 'Carregando...' : 'Upload imagem'}
            </button>
            
            {previewUrl && (
              <button
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100"
              >
                <X size={16} />
                Remover imagem
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
