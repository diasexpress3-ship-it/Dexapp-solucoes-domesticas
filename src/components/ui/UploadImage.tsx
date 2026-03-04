import React, { useState } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../../contexts/ToastContext';

interface UploadImageProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export const UploadImage = ({
  currentImageUrl,
  onUploadSuccess,
  label,
  className = '',
}: UploadImageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida.', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const apiKey = import.meta.env.VITE_PUBLIC_IMGBB_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API Key not found');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const url = result.data.url;
        setPreviewUrl(url);
        onUploadSuccess(url);
        showToast('Imagem enviada com sucesso!', 'success');
      } else {
        throw new Error(result.error?.message || 'Erro ao enviar imagem');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Erro ao enviar imagem para o servidor.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUploadSuccess('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-bold text-primary">{label}</label>}
      
      <div className="relative group">
        <div className={`
          relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center
          ${previewUrl ? 'border-transparent' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}
        `}>
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer p-2 bg-white rounded-full text-primary hover:bg-gray-100 transition-colors">
                  <Camera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                </label>
                <button 
                  onClick={handleRemove}
                  className="p-2 bg-white rounded-full text-red-500 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-primary transition-colors">
              <Upload size={32} />
              <span className="text-xs font-bold uppercase tracking-wider">Carregar Imagem</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
            </label>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 size={32} className="text-accent animate-spin" />
              <span className="text-xs font-bold text-primary uppercase">Enviando...</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-400 font-medium">Formatos aceites: JPG, PNG. Máx 5MB.</p>
    </div>
  );
};
