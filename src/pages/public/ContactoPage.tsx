import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  CheckCircle,
  Headphones,
  HelpCircle,
  Globe,
  Sparkles,
  MessageCircle,
  Share2,
  Linkedin,
  Youtube
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Função para enviar email via mailto com os dados do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);

    // Construir o corpo do email com os dados do formulário
    const assunto = encodeURIComponent(formData.assunto);
    const corpo = encodeURIComponent(
      `Nome: ${formData.nome}\n` +
      `Email: ${formData.email}\n` +
      `Telefone: ${formData.telefone || 'Não informado'}\n\n` +
      `Mensagem:\n${formData.mensagem}`
    );

    // Criar link mailto
    const mailtoLink = `mailto:diasexpress3@gmail.com?subject=${assunto}&body=${corpo}`;

    // Usar window.location.href para navegação direta
    window.location.href = mailtoLink;

    // Feedback para o usuário
    showToast('Abrindo seu cliente de email...', 'info');
    
    // Limpar formulário
    setTimeout(() => {
      setFormData({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
      setIsLoading(false);
    }, 2000);
  };

  // Função para lidar com links externos
  const handleExternalLink = (url: string, tipo: string) => {
    showToast(`Abrindo ${tipo}...`, 'info');
    
    if (url.startsWith('mailto:')) {
      // Para mailto, usar window.location.href
      window.location.href = url;
    } else {
      // Para outros links, abrir em nova aba
      window.open(url, '_blank');
    }
  };

  // Informações de contacto reais
  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone / WhatsApp',
      details: ['+258 87 142 5316'],
      description: 'Segunda a Sábado, 08h - 20h',
      action: 'https://wa.me/258871425316',
      actionLabel: 'Chamar no WhatsApp',
      tipo: 'WhatsApp'
    },
    {
      icon: Mail,
      title: 'E-mail Principal',
      details: ['diasexpress3@gmail.com'],
      description: 'Respondemos em até 2h',
      action: 'mailto:diasexpress3@gmail.com?subject=Contacto%20via%20DEXAPP&body=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20serviços%20da%20DEXAPP.',
      actionLabel: 'Enviar E-mail Agora',
      highlight: true,
      tipo: 'cliente de email'
    },
    {
      icon: Globe,
      title: 'Site Oficial',
      details: ['dex-diasexpress.vercel.app'],
      description: 'Conheça nossos outros serviços',
      action: 'https://dex-diasexpress.vercel.app/#/',
      actionLabel: 'Visitar Site',
      tipo: 'site'
    },
    {
      icon: MapPin,
      title: 'Escritório',
      details: ['Maputo, Moçambique'],
      description: 'Atendimento presencial sob agendamento',
      action: 'https://maps.google.com',
      actionLabel: 'Ver no Mapa',
      tipo: 'Google Maps'
    }
  ];

  // Redes Sociais com links reais
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://web.facebook.com/people/DEX-Diasexpress/61587829764999/', bg: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Instagram, label: 'Instagram', url: 'https://www.instagram.com/dex_diasexpress/', bg: 'bg-pink-50', text: 'text-pink-600' },
    { icon: MessageCircle, label: 'WhatsApp', url: 'https://wa.me/258871425316', bg: 'bg-green-50', text: 'text-green-600' },
    { icon: Twitter, label: 'Twitter', url: '#', bg: 'bg-blue-50', text: 'text-blue-400' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/vicente-dias', bg: 'bg-blue-50', text: 'text-blue-700' },
    { icon: Youtube, label: 'YouTube', url: '#', bg: 'bg-red-50', text: 'text-red-600' }
  ];

  const faqs = [
    {
      question: 'Como faço para contratar um serviço?',
      answer: 'Basta criar uma conta, escolher a categoria desejada e selecionar o prestador. Você pode agendar diretamente pela plataforma.'
    },
    {
      question: 'Os prestadores são verificados?',
      answer: 'Sim, todos os prestadores passam por um rigoroso processo de verificação de documentos e antecedentes antes de serem aprovados.'
    },
    {
      question: 'Qual a política de pagamento?',
      answer: 'O pagamento é dividido em 80% no início do serviço e 20% após a conclusão, garantindo segurança para ambas as partes.'
    },
    {
      question: 'Como funciona o suporte?',
      answer: 'Nosso suporte está disponível 24/7 por WhatsApp, telefone e email. Para emergências, temos atendimento prioritário.'
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wider">Estamos Aqui para Ajudar</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Entre em <span className="text-accent">Contacto</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Escolha o canal de sua preferência. Respondemos em até 2 horas durante o horário comercial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards - Email em destaque */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-none shadow-lg hover:shadow-xl transition-all group ${info.highlight ? 'ring-2 ring-accent transform hover:scale-105' : ''}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110 ${
                      info.highlight ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
                    }`}>
                      <info.icon size={28} />
                    </div>
                    <h3 className="text-lg font-black text-primary mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-sm font-bold text-gray-600 mb-1">{detail}</p>
                    ))}
                    <p className="text-xs text-gray-400 mt-2 mb-4">{info.description}</p>
                    
                    <button
                      onClick={() => handleExternalLink(info.action, info.tipo)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all w-full justify-center ${
                        info.highlight 
                          ? 'bg-accent text-white hover:bg-accent/90 shadow-lg' 
                          : 'bg-gray-100 text-primary hover:bg-gray-200'
                      }`}
                    >
                      {info.actionLabel}
                      <ChevronRight size={16} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Banner */}
      <section className="relative -mt-8 mb-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Share2 size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-primary mb-1">Siga a DEX nas Redes Sociais</h3>
                  <p className="text-gray-500">Fique por dentro de novidades, promoções e dicas exclusivas</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {socialLinks.map((social, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExternalLink(social.url, social.label)}
                    className={`group relative w-14 h-14 rounded-xl bg-gray-50 hover:bg-gray-200 flex items-center justify-center transition-all shadow-md hover:shadow-xl ${social.bg}`}
                    title={social.label}
                  >
                    <social.icon className={`w-6 h-6 ${social.text}`} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {social.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <MessageSquare size={20} />
                </div>
                Envie uma Mensagem
              </h2>
              <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nome Completo *"
                        placeholder="Ex: João Silva"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="Ex: joao@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Telefone"
                      placeholder="Ex: 84 000 0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                    <Input
                      label="Assunto *"
                      placeholder="Como podemos ajudar?"
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Mensagem *</label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                        rows={6}
                        placeholder="Escreva sua mensagem aqui..."
                        value={formData.mensagem}
                        onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="px-8" 
                        isLoading={isLoading}
                        leftIcon={<Send size={18} />}
                      >
                        {isLoading ? 'A enviar...' : 'Enviar Mensagem'}
                      </Button>
                      <p className="text-xs text-gray-400">
                        * Campos obrigatórios
                      </p>
                    </div>
                  </form>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Ao enviar, seu cliente de email padrão será aberto com os dados preenchidos.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Localização e Info Adicional */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <MapPin size={20} />
                </div>
                Nossa Localização
              </h2>
              
              <Card className="border-none shadow-xl overflow-hidden mb-6">
                <div className="relative h-[300px] bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
                    alt="Mapa de Maputo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-accent shrink-0" size={24} />
                      <div>
                        <p className="font-bold text-primary mb-1">Maputo, Moçambique</p>
                        <p className="text-sm text-gray-500">Atendimento presencial sob agendamento</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 w-full"
                          onClick={() => handleExternalLink('https://maps.google.com', 'Google Maps')}
                        >
                          Abrir no Google Maps
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Horário de Funcionamento */}
              <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-blue-900 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-2">Horário de Funcionamento</h4>
                      <div className="space-y-1 text-white/80">
                        <p>Segunda a Sexta: 08:00 - 18:00</p>
                        <p>Sábado: 09:00 - 13:00</p>
                        <p className="text-sm text-accent mt-2">Suporte de emergência 24/7 via WhatsApp</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-6 py-2 rounded-full mb-4">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent uppercase tracking-wider">Dúvidas Frequentes</span>
            </div>
            <h2 className="text-3xl font-black text-primary mb-4">Perguntas Frequentes</h2>
            <p className="text-gray-500">Encontre respostas para as dúvidas mais comuns sobre nossos serviços</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-primary">{faq.question}</span>
                  <ChevronRight 
                    className={`text-accent transition-transform duration-300 ${openFaq === idx ? 'rotate-90' : ''}`} 
                    size={20}
                  />
                </button>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 text-gray-500 border-t border-gray-100 pt-4"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <button
        onClick={() => handleExternalLink('https://wa.me/258871425316', 'WhatsApp')}
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 animate-bounce"
        title="Fale connosco no WhatsApp"
      >
        <MessageCircle size={32} />
      </button>
    </AppLayout>
  );
}
