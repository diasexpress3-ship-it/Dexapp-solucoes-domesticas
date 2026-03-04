import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useToast } from '../../contexts/ToastContext';

interface MapaComponenteProps {
  address: string;
  latitude?: number;
  longitude?: number;
  height?: string;
  className?: string;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export const MapaComponente: React.FC<MapaComponenteProps> = ({
  address,
  latitude,
  longitude,
  height = '400px',
  className = '',
  interactive = false,
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [mapError, setMapError] = React.useState(false);

  useEffect(() => {
    // Simular carregamento do mapa (fallback para imagem estática)
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Função para abrir no Google Maps
  const openInGoogleMaps = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  // Função para abrir no Waze
  const openInWaze = () => {
    if (latitude && longitude) {
      window.open(`https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, '_blank');
    } else {
      window.open(`https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`, '_blank');
    }
  };

  // Função para compartilhar localização
  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Localização do Serviço',
        text: address,
        url: latitude && longitude 
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      }).catch(() => {
        showToast('Não foi possível compartilhar', 'error');
      });
    } else {
      navigator.clipboard.writeText(address);
      showToast('Endereço copiado!', 'success');
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative" style={{ height }}>
        {/* Fallback / Simulação de Mapa */}
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary mb-1">{address}</p>
              <p className="text-sm text-slate-500">
                {latitude && longitude 
                  ? `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : 'Localização aproximada'}
              </p>
            </div>

            {/* Grid de ações */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MapPin className="w-4 h-4" />}
                onClick={openInGoogleMaps}
                fullWidth
              >
                Google Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Navigation className="w-4 h-4" />}
                onClick={openInWaze}
                fullWidth
              >
                Waze
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={shareLocation}
                fullWidth
              >
                Compartilhar
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                <span className="font-bold">Endereço completo:</span> {address}
              </p>
            </div>
          </div>
        </div>

        {/* Overlay de interatividade */}
        {interactive && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => showToast('Clique no mapa para selecionar local', 'info')}
              className="p-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <MapPin className="w-5 h-5 text-primary" />
            </button>
          </div>
        )}
      </div>

      {/* Rodapé com endereço */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-primary">{address}</p>
            {latitude && longitude && (
              <p className="text-xs text-slate-400 mt-1">
                Lat: {latitude.toFixed(6)} • Lng: {longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
