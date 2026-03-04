import React from 'react';
import { MessageCircle, Headphones } from 'lucide-react';

export const SuporteButton = () => {
  const handleSupport = () => {
    const message = encodeURIComponent('Olá Suporte DEXAPP, sou prestador e preciso de ajuda.');
    window.open(`https://wa.me/258840000000?text=${message}`, '_blank');
  };

  return (
    <button 
      onClick={handleSupport}
      className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40 group"
      title="Falar com Suporte"
    >
      <Headphones size={24} className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-4 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        Suporte 24h
      </span>
    </button>
  );
};
