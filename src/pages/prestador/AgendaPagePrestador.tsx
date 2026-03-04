import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { formatDate, translateStatus } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';

export default function AgendaPagePrestador() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'solicitacoes'),
      where('prestadorId', '==', user.id),
      where('status', 'in', ['accepted', 'in_progress']),
      orderBy('dataAgendada', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setAgendamentos(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <CalendarIcon size={32} className="text-accent" />
                Minha Agenda de Trabalho
              </h1>
              <p className="text-gray-500">Gerencie seus compromissos e horários de serviço.</p>
            </div>
            <Button variant="outline" leftIcon={<Filter size={18} />}>Filtrar</Button>
          </div>

          <div className="space-y-6">
            {agendamentos.length > 0 ? (
              agendamentos.map((item) => (
                <Card key={item.id} hoverable className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-accent text-white p-6 md:w-40 flex flex-col items-center justify-center text-center">
                        <p className="text-xs font-bold uppercase opacity-70 mb-1">
                          {formatDate(item.dataAgendada).split(' ')[1]}
                        </p>
                        <p className="text-4xl font-black">
                          {formatDate(item.dataAgendada).split(' ')[0]}
                        </p>
                        <p className="text-xs font-bold mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.dataAgendada.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {translateStatus(item.status)}
                          </span>
                          <h3 className="text-xl font-black text-primary">{item.servico}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <UserIcon size={14} />
                              <span>{item.clienteNome}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{item.endereco.split(',')[0]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/prestador/dashboard`)}>
                            Ver no Painel
                          </Button>
                          {item.status === 'accepted' && (
                            <Button size="sm" leftIcon={<CheckCircle2 size={16} />}>
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <CalendarIcon size={40} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Sem serviços agendados</h3>
                <p className="text-gray-500 mb-6">Fique atento às novas solicitações no seu painel.</p>
                <Button onClick={() => navigate('/prestador/dashboard')}>Ir para o Painel</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
