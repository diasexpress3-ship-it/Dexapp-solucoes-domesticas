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
  HelpCircle
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de envio - em produção, integrar com API de email
    setTimeout(() => {
      showToast('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success');
      setFormData({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
      setIsLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      details: ['+258 84 000 0000', '+258 82 000 0000'],
      description: 'Segunda a Sexta, 08h - 18h'
    },
    {
      icon: Mail,
      title: 'E-mail',
      details: ['geral@dex.co.mz', 'suporte@dex.co.mz'],
      description: 'Respondemos em até 24h'
    },
    {
      icon: MapPin,
      title: 'Escritório',
      details: ['Av. 24 de Julho, nº 123', 'Maputo, Moçambique'],
      description: 'Agende uma visita'
    },
    {
      icon: Headphones,
      title: 'Suporte 24/7',
      details: ['+258 87 142 5316', 'emergencias@dex.co.mz'],
      description: 'Atendimento de emergência'
    }
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
      <section className="relative bg-gradient-to-br from-primary to-blue-900 py-20 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Entre em <span className="text-accent">Contacto</span>
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Estamos aqui para ajudar. Escolha o canal de sua preferência ou preencha o formulário abaixo.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, idx) => (
              <Card key={idx} className="border-none shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4">
                    <info.icon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-primary mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm font-bold text-gray-600 mb-1">{detail}</p>
                  ))}
                  <p className="text-xs text-gray-400 mt-2">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <div>
              <h2 className="text-2xl font-black text-primary mb-8">Envie uma Mensagem</h2>
              <Card className="border-none shadow-lg">
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
                    <div className="flex items-center gap-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="px-8" 
                        isLoading={isLoading}
                        leftIcon={<Send size={18} />}
                      >
                        Enviar Mensagem
                      </Button>
                      <p className="text-xs text-gray-400">
                        * Campos obrigatórios
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Mapa Interativo */}
            <div>
              <h2 className="text-2xl font-black text-primary mb-8">Nossa Localização</h2>
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="relative h-[400px] bg-gray-100">
                  {/* Imagem do mapa - em produção, usar Google Maps ou similar */}
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
                    alt="Mapa de Maputo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs">
                      <MapPin className="text-accent mb-2" size={32} />
                      <p className="font-bold text-primary">Av. 24 de Julho, nº 123</p>
                      <p className="text-sm text-gray-500">Maputo, Moçambique</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={() => window.open('https://maps.google.com', '_blank')}
                      >
                        Abrir no Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-primary mb-4">Perguntas Frequentes</h2>
            <p className="text-gray-500">Encontre respostas para as dúvidas mais comuns</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-none shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-primary">{faq.question}</span>
                  <ChevronRight 
                    className={`text-accent transition-transform ${openFaq === idx ? 'rotate-90' : ''}`} 
                    size={20}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-gray-500 border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-black text-primary mb-6">Siga-nos nas Redes Sociais</h3>
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: Facebook, label: 'Facebook', url: '#' },
              { icon: Instagram, label: 'Instagram', url: '#' },
              { icon: Twitter, label: 'Twitter', url: '#' },
              { icon: MessageSquare, label: 'WhatsApp', url: 'https://wa.me/258840000000' }
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-accent hover:text-white flex items-center justify-center text-primary transition-all shadow-sm hover:shadow-lg"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
