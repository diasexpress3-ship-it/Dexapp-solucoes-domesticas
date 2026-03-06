import React, { useState, useRef } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface UploadImageProps {
  currentImageUrl?: string;
  onUpload?: (url: string) => void;
  label?: string;
  collectionPath?: string;
  docId?: string;
  field?: string;
  isAdminOnly?: boolean;
  className?: string;
}

export const UploadImage: React.FC<UploadImageProps> = ({
  currentImageUrl,
  onUpload,
  label = "Carregar Imagem",
  collectionPath,
  docId,
  field,
  isAdminOnly = true,
  className = ""
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.profile === 'admin';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem muito grande. Máximo 5MB', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = import.meta.env.VITE_IMGBB_KEY;
    if (!apiKey) {
      showToast('Chave da API ImgBB não configurada', 'error');
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const url = result.data.url;
        
        if (collectionPath && docId && field) {
          const docRef = doc(db, collectionPath, docId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            await updateDoc(docRef, { [field]: url });
          } else {
            await setDoc(docRef, { [field]: url });
          }
        }

        if (onUpload) onUpload(url);
        showToast('Imagem carregada com sucesso!', 'success');
      } else {
        throw new Error('Falha no upload');
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showToast('Erro ao carregar imagem. Tente novamente.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (isAdminOnly && !isAdmin) {
    return currentImageUrl ? (
      <img src={currentImageUrl} alt="Preview" className={`w-full h-full object-cover ${className}`} referrerPolicy="no-referrer" />
    ) : null;
  }

  return (
    <div className={`relative group ${className}`}>
      {currentImageUrl ? (
        <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold uppercase">{label}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-white text-primary p-3 rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
