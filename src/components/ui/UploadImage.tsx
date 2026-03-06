import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface UploadImageProps {
  currentImageUrl?: string | null;
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
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CORREÇÃO: usar profile em vez de role
  const isAdmin = user?.profile === 'admin';
  
  // DEBUG
  console.log('📸 UploadImage - user:', user);
  console.log('📸 UploadImage - profile:', user?.profile);
  console.log('📸 UploadImage - isAdmin:', isAdmin);

  // Atualizar estado quando currentImageUrl mudar
  useEffect(() => {
    setImageUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  // Buscar imagem do Firestore
  useEffect(() => {
    const fetchImage = async () => {
      if (!collectionPath || !docId || !field) return;
      try {
        const docRef = doc(db, collectionPath, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()[field]) {
          setImageUrl(docSnap.data()[field]);
        }
      } catch (error) {
        console.error("Erro ao buscar imagem:", error);
      }
    };
    fetchImage();
  }, [collectionPath, docId, field]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = import.meta.env.VITE_IMGBB_KEY;
    if (!apiKey) {
      alert('Chave da API ImgBB não configurada');
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
        setImageUrl(url);
        
        // Salvar no Firestore
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
        alert('Imagem carregada com sucesso!');
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageUrl(null);
    if (collectionPath && docId && field) {
      try {
        const docRef = doc(db, collectionPath, docId);
        await updateDoc(docRef, { [field]: null });
        if (onUpload) onUpload('');
      } catch (error) {
        console.error("Erro ao remover imagem:", error);
      }
    }
  };

  // Se for adminOnly e não for admin, mostra apenas a imagem
  if (isAdminOnly && !isAdmin) {
    return imageUrl ? (
      <img src={imageUrl} alt="Preview" className={`w-full h-full object-cover ${className}`} />
    ) : null;
  }

  // Se for admin, mostra com botões de upload
  return (
    <div className={`relative group ${className}`}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-900/20 flex items-center justify-center">
          <Upload className="w-8 h-8 opacity-50" />
        </div>
      )}

      {/* Overlay com botões - APARECE NO HOVER */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-white text-primary p-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
          title={label}
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        </button>
        
        {imageUrl && (
          <button
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="bg-white text-rose-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
            title="Remover imagem"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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

export default UploadImage;
