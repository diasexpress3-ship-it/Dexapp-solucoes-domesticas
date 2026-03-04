import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, 
  Play, Pause, SkipForward, SkipBack,
  Loader2, Sparkles, Headphones
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../../contexts/ToastContext';

interface VoiceSimulationProps {
  onCommand?: (command: string) => void;
  language?: 'pt' | 'en';
  autoStart?: boolean;
}

export const VoiceSimulation: React.FC<VoiceSimulationProps> = ({
  onCommand,
  language = 'pt',
  autoStart = false
}) => {
  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(autoStart);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Comandos disponíveis
  const commands = {
    pt: [
      { command: 'criar solicitação', action: () => onCommand?.('nova-solicitacao') },
      { command: 'ver agenda', action: () => onCommand?.('agenda') },
      { command: 'meus serviços', action: () => onCommand?.('servicos') },
      { command: 'ajuda', action: () => showHelp() },
      { command: 'silêncio', action: () => stopListening() }
    ],
    en: [
      { command: 'create request', action: () => onCommand?.('nova-solicitacao') },
      { command: 'view schedule', action: () => onCommand?.('agenda') },
      { command: 'my services', action: () => onCommand?.('servicos') },
      { command: 'help', action: () => showHelp() },
      { command: 'silence', action: () => stopListening() }
    ]
  };

  useEffect(() => {
    // Simular reconhecimento de voz
    if (isListening) {
      const interval = setInterval(() => {
        if (!isProcessing) {
          simulateRecognition();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isListening, isProcessing]);

  const simulateRecognition = () => {
    setIsProcessing(true);
    setTranscript('Processando...');

    setTimeout(() => {
      const randomResponse = getRandomResponse();
      setTranscript(randomResponse);
      setResponses(prev => [randomResponse, ...prev].slice(0, 5));
      
      if (!isMuted) {
        speak(randomResponse);
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const getRandomResponse = () => {
    const responses = {
      pt: [
        'Cliente solicitou serviço de limpeza',
        'Prestador disponível na sua região',
        'Pagamento confirmado com sucesso',
        'Nova solicitação recebida',
        'Serviço agendado para amanhã',
        'Prestador a caminho do local',
        'Serviço concluído com sucesso'
      ],
      en: [
        'Client requested cleaning service',
        'Provider available in your area',
        'Payment confirmed successfully',
        'New request received',
        'Service scheduled for tomorrow',
        'Provider on the way',
        'Service completed successfully'
      ]
    };
    
    const list = language === 'pt' ? responses.pt : responses.en;
    return list[Math.floor(Math.random() * list.length)];
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      showToast('Navegador não suporta síntese de voz', 'error');
      return;
    }

    if (isMuted) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'pt' ? 'pt-BR' : 'en-US';
    utterance.volume = volume;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    window.speechSynthesis.cancel(); // Cancelar qualquer fala anterior
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    showToast('Assistente de voz ativado', 'success');
  };

  const stopListening = () => {
    setIsListening(false);
    stopSpeaking();
    showToast('Assistente de voz desativado', 'info');
  };

  const showHelp = () => {
    const helpText = language === 'pt' 
      ? 'Comandos disponíveis: criar solicitação, ver agenda, meus serviços, ajuda, silêncio'
      : 'Available commands: create request, view schedule, my services, help, silence';
    
    setTranscript(helpText);
    if (!isMuted) {
      speak(helpText);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  <span className="font-black">Assistente de Voz</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={stopListening}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <MicOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Volume Control */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-white"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-slate-600">Ouvindo...</span>
                </div>
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-primary">Falando</span>
                    <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div className="p-3 bg-slate-50 rounded-xl min-h-[60px]">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processando...</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-primary">{transcript || 'Aguardando comando...'}</p>
                )}
              </div>

              {/* Recent Responses */}
              {responses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Últimas notificações
                  </p>
                  {responses.map((resp, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                      {resp}
                    </div>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => {/* Previous */}}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-12 h-12 rounded-full p-0"
                  onClick={isSpeaking ? stopSpeaking : () => speak(transcript)}
                >
                  {isSpeaking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => {/* Next */}}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isListening 
            ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' 
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </motion.button>
    </div>
  );
};
