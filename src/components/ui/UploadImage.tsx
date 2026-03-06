import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Loader2, Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, RefreshCw, Download } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// INTERFACES E TIPOS
// ============================================
interface UploadImageProps {
  /** URL atual da imagem (se existir) */
  currentImageUrl?: string | null;
  
  /** Callback chamado quando upload é concluído */
  onUpload?: (url: string) => void;
  
  /** Texto do botão/label */
  label?: string;
  
  /** Caminho da coleção no Firestore */
  collectionPath?: string;
  
  /** ID do documento no Firestore */
  docId?: string;
  
  /** Campo específico no documento */
  field?: string;
  
  /** Se apenas admin pode fazer upload */
  isAdminOnly?: boolean;
  
  /** Classes CSS adicionais */
  className?: string;
  
  /** Classes para estado de loading */
  loadingClassName?: string;
  
  /** Tamanho máximo do arquivo em MB */
  maxSizeMB?: number;
  
  /** Tipos de arquivo permitidos */
  acceptedTypes?: string[];
  
  /** Se deve comprimir imagem antes do upload */
  compress?: boolean;
  
  /** Qualidade da compressão (0-1) */
  compressionQuality?: number;
  
  /** Largura máxima para redimensionamento */
  maxWidth?: number;
  
  /** Altura máxima para redimensionamento */
  maxHeight?: number;
  
  /** Texto alternativo para a imagem */
  alt?: string;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  url?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export const UploadImage: React.FC<UploadImageProps> = ({
  currentImageUrl,
  onUpload,
  label = "Carregar Imagem",
  collectionPath,
  docId,
  field,
  isAdminOnly = true,
  className = "",
  loadingClassName = "",
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  compress = true,
  compressionQuality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  alt = "Imagem"
}) => {
  // Hooks
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ============================================
  const isAdmin = user?.role === 'admin'; // CORRIGIDO: era profile, agora é role
  const canUpload = !isAdminOnly || isAdmin;

  // ============================================
  // ATUALIZAR QUANDO CURRENTIMAGEMUDAR
  // ============================================
  useEffect(() => {
    setImageUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  // ============================================
  // BUSCAR IMAGEM DO FIRESTORE
  // ============================================
  useEffect(() => {
    const fetchImage = async () => {
      if (!collectionPath || !docId || !field) return;

      try {
        const docRef = doc(db, collectionPath, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data[field]) {
            setImageUrl(data[field]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar imagem:", error);
      }
    };

    if (docId && collectionPath && field) {
      fetchImage();
    }
  }, [docId, collectionPath, field]);

  // ============================================
  // COMPRESSÃO DE IMAGEM (Web Worker simulado)
  // ============================================
  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!compress) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calcular novas dimensões mantendo proporção
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          // Criar canvas para compressão
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto 2D'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falha na compressão da imagem'));
                return;
              }
              
              // Criar novo arquivo com nome original
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp', // Converter para webp para melhor compressão
                lastModified: Date.now()
              });
              
              resolve(compressedFile);
            },
            'image/webp',
            compressionQuality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem para compressão'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
    });
  }, [compress, maxWidth, maxHeight, compressionQuality]);

  // ============================================
  // UPLOAD PARA IMGBB
  // ============================================
  const uploadToImgBB = useCallback(async (file: File): Promise<string> => {
    const apiKey = import.meta.env.VITE_IMGBB_KEY;
    
    if (!apiKey) {
      throw new Error('Chave da API ImgBB não configurada');
    }

    const formData = new FormData();
    formData.append('image', file);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setUploadState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }));
    }, 200);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}&expiration=0`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUploadState(prev => ({ ...prev, progress: 100 }));
        return result.data.url;
      } else {
        throw new Error(result.error?.message || 'Falha no upload para ImgBB');
      }
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }, []);

  // ============================================
  // SALVAR NO FIRESTORE
  // ============================================
  const saveToFirestore = useCallback(async (url: string) => {
    if (!collectionPath || !docId || !field) return;

    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      const data = {
        [field]: url,
        [`${field}_updatedAt`]: new Date().toISOString(),
        [`${field}_updatedBy`]: user?.email || 'unknown'
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, {
          id: docId,
          ...data,
          createdAt: new Date().toISOString(),
          createdBy: user?.email || 'unknown'
        });
      }
      
      console.log(`✅ Imagem ${field} salva no Firestore`);
    } catch (error) {
      console.error('Erro ao salvar no Firestore:', error);
      // Não lançar erro - upload já foi bem sucedido no ImgBB
    }
  }, [collectionPath, docId, field, user?.email]);

  // ============================================
  // HANDLER PRINCIPAL DE UPLOAD
  // ============================================
  const handleUpload = useCallback(async (file: File) => {
    // Validações
    if (!acceptedTypes.includes(file.type)) {
      showToast(`Tipo de arquivo não permitido. Use: ${acceptedTypes.join(', ')}`, 'error');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`Imagem muito grande. Máximo ${maxSizeMB}MB`, 'error');
      return;
    }

    // Criar preview
    const previewObjectUrl = URL.createObjectURL(file);
    setPreviewUrl(previewObjectUrl);
    setShowPreview(true);

    try {
      setUploadState({ status: 'uploading', progress: 0, message: 'Preparando imagem...' });

      // 1. Comprimir imagem
      const compressedFile = await compressImage(file);
      setUploadState(prev => ({ ...prev, progress: 20, message: 'Imagem otimizada' }));

      // 2. Upload para ImgBB
      setUploadState(prev => ({ ...prev, message: 'Enviando para servidor...' }));
      const url = await uploadToImgBB(compressedFile);
      
      // 3. Atualizar estado local
      setImageUrl(url);
      setUploadState({ status: 'success', progress: 100, url });

      // 4. Salvar no Firestore
      await saveToFirestore(url);

      // 5. Callback
      if (onUpload) onUpload(url);
      
      showToast('✨ Imagem carregada com sucesso!', 'success');

      // Esconder preview após 2 segundos
      setTimeout(() => setShowPreview(false), 2000);

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadState({ 
        status: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      showToast('Erro ao carregar imagem. Tente novamente.', 'error');
    } finally {
      // Limpar preview object URL
      URL.revokeObjectURL(previewObjectUrl);
    }
  }, [acceptedTypes, maxSizeMB, compressImage, uploadToImgBB, saveToFirestore, onUpload, showToast]);

  // ============================================
  // HANDLERS DE DRAG & DROP
  // ============================================
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canUpload) return;
    setIsDragging(true);
  }, [canUpload]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!canUpload) {
      showToast('Apenas administradores podem fazer upload', 'error');
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  }, [canUpload, handleUpload, showToast]);

  // ============================================
  // HANDLER DE REMOÇÃO
  // ============================================
  const handleRemoveImage = useCallback(async () => {
    if (!canUpload) return;

    try {
      setImageUrl(null);
      
      if (collectionPath && docId && field) {
        const docRef = doc(db, collectionPath, docId);
        await updateDoc(docRef, { 
          [field]: null,
          [`${field}_removedAt`]: new Date().toISOString()
        });
      }
      
      showToast('Imagem removida com sucesso', 'info');
      if (onUpload) onUpload('');
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      showToast('Erro ao remover imagem', 'error');
    }
  }, [canUpload, collectionPath, docId, field, onUpload, showToast]);

  // ============================================
  // HANDLER DE CLICK NO INPUT
  // ============================================
  const handleButtonClick = useCallback(() => {
    if (!canUpload) {
      showToast('Apenas administradores podem fazer upload', 'error');
      return;
    }
    fileInputRef.current?.click();
  }, [canUpload, showToast]);

  // ============================================
  // HANDLER DE MUDANÇA NO INPUT
  // ============================================
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUpload(file);
  }, [handleUpload]);

  // ============================================
  // RENDERIZAÇÃO PARA NÃO-ADMIN
  // ============================================
  if (isAdminOnly && !isAdmin) {
    return imageUrl ? (
      <img 
        src={imageUrl} 
        alt={alt} 
        className={`w-full h-full object-cover ${className}`}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    ) : null;
  }

  // ============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================
  return (
    <div className="relative">
      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center p-4"
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-64 rounded-xl shadow-2xl"
              />
              
              {/* Status overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-xl">
                <div className="flex items-center gap-2 text-white">
                  {uploadState.status === 'uploading' && (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <span className="text-sm font-bold">{uploadState.message || 'Enviando...'}</span>
                    </>
                  )}
                  {uploadState.status === 'success' && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-bold">Upload concluído!</span>
                    </>
                  )}
                  {uploadState.status === 'error' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-bold">{uploadState.message || 'Erro no upload'}</span>
                    </>
                  )}
                </div>
                
                {/* Progress bar */}
                {uploadState.status === 'uploading' && (
                  <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadState.progress}%` }}
                      className="h-full bg-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container principal */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer transition-all duration-300 overflow-hidden ${className}`}
        onClick={handleButtonClick}
      >
        {/* Conteúdo da imagem */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => {
              console.log("Erro ao carregar imagem, removendo referência");
              setImageUrl(null);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-blue-900/10 flex flex-col items-center justify-center text-primary/50 gap-2">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              {label}
            </span>
            <span className="text-[10px] opacity-50">
              Clique ou arraste
            </span>
          </div>
        )}

        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Botões de ação */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          {/* Botão upload */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            disabled={uploadState.status === 'uploading'}
            className="bg-white text-primary p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={label}
          >
            {uploadState.status === 'uploading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </motion.button>

          {/* Botão remover (só aparece se tem imagem) */}
          {imageUrl && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="bg-white text-rose-600 p-3 rounded-xl shadow-xl hover:shadow-2xl transition-all"
              title="Remover imagem"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && canUpload && (
          <div className="absolute inset-0 bg-accent/20 backdrop-blur-sm border-4 border-dashed border-white rounded-2xl flex items-center justify-center">
            <div className="bg-white text-primary p-4 rounded-2xl shadow-2xl">
              <Upload className="w-8 h-8" />
              <p className="font-bold mt-2">Solte para enviar</p>
            </div>
          </div>
        )}

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={uploadState.status === 'uploading'}
        />
      </div>

      {/* Informações de upload (opcional) */}
      {uploadState.status === 'uploading' && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs font-bold text-accent animate-pulse">
            {uploadState.message || 'Enviando...'} {uploadState.progress}%
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// EXPORTAÇÕES
// ============================================
export default UploadImage;
