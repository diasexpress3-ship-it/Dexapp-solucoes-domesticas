import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Headphones, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import { formatCurrency, formatDate, translateStatus } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';

export default function CentralDashboard() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'solicitacoes'), orderBy('dataSolicitacao', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setSolicitacoes(docs);
      setFilteredSolicitacoes(docs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = solicitacoes.filter(s => 
      s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prestadorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.servico.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSolicitacoes(filtered);
  }, [searchTerm, solicitacoes]);

  const stats = {
    pending: solicitacoes.filter(s => s.status === 'buscando_prestador').length,
    active: solicitacoes.filter(s => s.status === 'prestador_atribuido' || s.status === 'em_andamento').length,
    completed: solicitacoes.filter(s => s.status === 'concluido').length,
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <Headphones size={32} className="text-accent" />
              Central de Atendimento
            </h1>
            <p className="text-gray-500">Monitore e gerencie as solicitações de serviço.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Pendentes</p>
                <h3 className="text-2xl font-black text-primary">{stats.pending}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Em Andamento</p>
                <h3 className="text-2xl font-black text-primary">{stats.active}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Concluídas</p>
                <h3 className="text-2xl font-black text-primary">{stats.completed}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por cliente, prestador ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <Button variant="outline" leftIcon={<Filter size={18} />}>Filtros</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredSolicitacoes.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-2 md:w-4 ${
                    s.status === 'buscando_prestador' ? 'bg-yellow-400' :
                    s.status === 'prestador_atribuido' ? 'bg-blue-400' :
                    s.status === 'em_andamento' ? 'bg-indigo-400' :
                    s.status === 'concluido' ? 'bg-green-400' :
                    'bg-red-400'
                  }`} />
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Serviço</p>
                        <h4 className="font-bold text-primary">{s.servico}</h4>
                        <p className="text-xs text-gray-500">{formatDate(s.dataAgendada)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Cliente</p>
                          <p className="text-sm font-bold text-primary">{s.clienteNome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Prestador</p>
                          <p className="text-sm font-bold text-primary">{s.prestadorNome}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="text-xs font-bold text-primary">{formatCurrency(s.valorTotal)}</p>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          s.status === 'buscando_prestador' ? 'bg-yellow-100 text-yellow-700' :
                          s.status === 'prestador_atribuido' ? 'bg-blue-100 text-blue-700' :
                          s.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700' :
                          s.status === 'concluido' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {translateStatus(s.status)}
                        </span>
                      </div>
                      <Button variant="outline" size="icon">
                        <MessageSquare size={18} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ArrowRight size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSolicitacoes.length === 0 && (
            <div className="py-12 text-center text-gray-500">Nenhuma solicitação encontrada.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
