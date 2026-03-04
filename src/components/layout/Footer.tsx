import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                D
              </div>
              <span className="text-2xl font-black tracking-tight">DEXAPP</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Conectando lares moçambicanos aos melhores profissionais de serviços domésticos. Qualidade, segurança e confiança em cada serviço.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
              <li><Link to="/servicos" className="hover:text-accent transition-colors">Nossos Serviços</Link></li>
              <li><Link to="/sobre" className="hover:text-accent transition-colors">Sobre Nós</Link></li>
              <li><Link to="/contacto" className="hover:text-accent transition-colors">Contacto</Link></li>
              <li><Link to="/register-prestador" className="hover:text-accent transition-colors">Seja um Prestador</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Serviços Populares</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li><Link to="/servicos?cat=limpeza" className="hover:text-accent transition-colors">Limpeza Doméstica</Link></li>
              <li><Link to="/servicos?cat=eletrica" className="hover:text-accent transition-colors">Manutenção Elétrica</Link></li>
              <li><Link to="/servicos?cat=canalizacao" className="hover:text-accent transition-colors">Canalização</Link></li>
              <li><Link to="/servicos?cat=empregadas" className="hover:text-accent transition-colors">Babás & Empregadas</Link></li>
              <li><Link to="/servicos?cat=pintura" className="hover:text-accent transition-colors">Pintura</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contacto</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent shrink-0" />
                <span>Maputo, Moçambique</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <span>+258 84 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <span>contacto@dexapp.co.mz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2024 DEXAPP - Soluções Domésticas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
