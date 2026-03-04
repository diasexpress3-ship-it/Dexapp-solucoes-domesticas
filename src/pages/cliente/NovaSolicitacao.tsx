import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User, Solicitacao } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SERVICE_CATEGORIES } from '../../constants/categories';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle,
  User as UserIcon,
  Star,
  Briefcase
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/utils';

export default function NovaSolicitacao() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedService, setSelectedService] = useState('');
  const [details, setDetails] = useState({
    endereco: '',
    data: '',
    hora: '',
    descricao: '',
  });
  const [prestadores, setPrestadores] = useState<User[]>([]);
  const [selectedPrestador, setSelectedPrestador] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 3 && selectedCategory) {
      fetchPrestadores();
    }
  }, [step, selectedCategory]);

  const fetchPrestadores = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('profile', '==', 'prestador'),
        where('status', '==', 'active'),
        where('prestadorData.categoria', '==', selectedCategory.name)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setPrestadores(docs);
    } catch (error) {
      showToast('Erro ao buscar prestadores', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedPrestador) return;

    setIsLoading(true);
    try {
      const valorBase = 1000; // Placeholder value logic
      const valorTotal = valorBase;
      const valor80 = valorTotal * 0.8;
      const valor20 = valorTotal * 0.2;

      const dataAgendada = new Date(`${details.data}T${details.hora}`);

      const solicitacaoData = {
        clienteId: user.id,
        clienteNome: user.nome,
        prestadorId: selectedPrestador.id,
        prestadorNome: selectedPrestador.nome,
        servico: selectedService,
        categoria: selectedCategory.name,
        status: 'buscando_prestador',
        valorTotal,
        valor80,
        valor20,
        endereco: details.endereco,
        dataSolicitacao: serverTimestamp(),
        dataAgendada,
        descricao: details.descricao,
      };

      const docRef = await addDoc(collection(db, 'solicitacoes'), solicitacaoData);
      showToast('Solicitação enviada com sucesso!', 'success');
      navigate(`/cliente/acompanhamento/${docRef.id}`);
    } catch (error) {
      showToast('Erro ao enviar solicitação', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-primary">Nova Solicitação</h1>
            <p className="text-gray-500">Siga os passos para contratar um serviço.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? 'bg-primary text-white' : 'bg-white border-2 border-gray-100 text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
            ))}
          </div>

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary">Selecione a Categoria</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {SERVICE_CATEGORIES.map((cat) => (
                  <Card 
                    key={cat.id} 
                    hoverable 
                    className={`cursor-pointer ${selectedCategory?.id === cat.id ? 'border-primary ring-2 ring-primary/10' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setStep(2);
                    }}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-4`}>
                        <cat.icon size={24} />
                      </div>
                      <span className="text-sm font-bold text-primary">{cat.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary">Detalhes do Serviço</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <Input
                    label="Endereço de Execução"
                    placeholder="Rua, Bairro, Cidade..."
                    value={details.endereco}
                    onChange={(e) => setDetails({ ...details, endereco: e.target.value })}
                    leftIcon={<MapPin size={18} />}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Data"
                      type="date"
                      value={details.data}
                      onChange={(e) => setDetails({ ...details, data: e.target.value })}
                      leftIcon={<Calendar size={18} />}
                    />
                    <Input
                      label="Hora"
                      type="time"
                      value={details.hora}
                      onChange={(e) => setDetails({ ...details, hora: e.target.value })}
                      leftIcon={<Clock size={18} />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Descrição Adicional</label>
                    <textarea
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      rows={4}
                      placeholder="Descreva o que precisa ser feito..."
                      value={details.descricao}
                      onChange={(e) => setDetails({ ...details, descricao: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ChevronLeft size={18} />}>Voltar</Button>
                <Button onClick={() => setStep(3)} rightIcon={<ChevronRight size={18} />} disabled={!details.endereco || !details.data || !details.hora}>Próximo</Button>
              </div>
            </div>
          )}

          {/* Step 3: Prestador */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary">Escolha um Prestador</h2>
              {isLoading ? (
                <div className="py-12 flex justify-center"><Clock className="animate-spin text-primary" size={32} /></div>
              ) : prestadores.length > 0 ? (
                <div className="space-y-4">
                  {prestadores.map((p) => (
                    <Card 
                      key={p.id} 
                      hoverable 
                      className={`cursor-pointer ${selectedPrestador?.id === p.id ? 'border-primary ring-2 ring-primary/10' : ''}`}
                      onClick={() => setSelectedPrestador(p)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                            {p.photoURL ? (
                              <img src={p.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">{p.nome.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{p.nome}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold">{p.prestadorData?.rating || '5.0'}</span>
                              <span>•</span>
                              <span>{p.prestadorData?.totalServicos || 0} serviços</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">MT 1.000,00</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Preço Base</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">Nenhum prestador disponível para esta categoria.</div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ChevronLeft size={18} />}>Voltar</Button>
                <Button onClick={() => setStep(4)} rightIcon={<ChevronRight size={18} />} disabled={!selectedPrestador}>Próximo</Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary">Pagamento (80%)</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Valor do Adiantamento</p>
                      <h3 className="text-2xl font-black text-primary">{formatCurrency(800)}</h3>
                    </div>
                    <CreditCard size={32} className="text-gray-300" />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Escolha o método:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 border-2 border-primary rounded-2xl flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                        <span className="text-xs font-bold">M-Pesa</span>
                      </button>
                      <button className="p-4 border-2 border-gray-100 rounded-2xl flex flex-col items-center gap-2 opacity-50 grayscale">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                        <span className="text-xs font-bold">e-Mola</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} leftIcon={<ChevronLeft size={18} />}>Voltar</Button>
                <Button onClick={() => setStep(5)} rightIcon={<ChevronRight size={18} />}>Confirmar Pagamento</Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary">Confirmar Solicitação</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Serviço</p>
                          <p className="font-bold text-primary">{selectedService || selectedCategory?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Local</p>
                          <p className="font-bold text-primary">{details.endereco}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Data e Hora</p>
                          <p className="font-bold text-primary">{formatDate(details.data)} às {details.hora}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Prestador</p>
                          <p className="font-bold text-primary">{selectedPrestador?.nome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-600">Total do Serviço</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(1000)}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)} leftIcon={<ChevronLeft size={18} />}>Voltar</Button>
                <Button onClick={handleSubmit} isLoading={isLoading}>Finalizar e Enviar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
