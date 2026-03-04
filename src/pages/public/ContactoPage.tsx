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
  Twitter
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      showToast('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success');
      setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-6">Entre em <span className="text-accent">Contacto</span></h1>
            <p className="text-lg text-gray-500">Estamos aqui para ajudar. Escolha o canal de sua preferência ou preencha o formulário abaixo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Telefone</h3>
                      <p className="text-sm text-gray-500">+258 84 000 0000</p>
                      <p className="text-sm text-gray-500">+258 82 000 0000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">E-mail</h3>
                      <p className="text-sm text-gray-500">suporte@dexapp.co.mz</p>
                      <p className="text-sm text-gray-500">geral@dexapp.co.mz</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Escritório</h3>
                      <p className="text-sm text-gray-500">Av. 24 de Julho, Maputo</p>
                      <p className="text-sm text-gray-500">Moçambique</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Horário</h3>
                      <p className="text-sm text-gray-500">Seg - Sex: 08:00 - 18:00</p>
                      <p className="text-sm text-gray-500">Sáb: 09:00 - 13:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center lg:justify-start">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Seu Nome"
                        placeholder="Ex: João Silva"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                      <Input
                        label="Seu E-mail"
                        type="email"
                        placeholder="Ex: joao@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Assunto"
                      placeholder="Como podemos ajudar?"
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Mensagem</label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        rows={6}
                        placeholder="Escreva sua mensagem aqui..."
                        value={formData.mensagem}
                        onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto px-12" 
                      isLoading={isLoading}
                      leftIcon={<Send size={18} />}
                    >
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">
          [ Mapa Interativo Aqui ]
        </div>
      </section>
    </AppLayout>
  );
}
