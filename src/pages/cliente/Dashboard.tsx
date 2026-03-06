import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Solicitacao, Pagamento } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, translateStatus } from '../../utils/utils';
import { 
  Briefcase, 
  Wallet, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Plus,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [recentSolicitacoes, setRecentSolicitacoes] = useState<Solicitacao[]>([]);
  const [stats, setStats] = useState({
    totalGasto: 0,
    servicosAtivos: 0,
    servicosConcluidos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'solicitacoes'),
      where('clienteId', '==', user.id),
      orderBy('dataSolicitacao', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));
      setRecentSolicitacoes(docs);
      
      // Calculate stats
      const total = docs.reduce((acc, curr) => acc + (curr.status === 'concluido' ? curr.valorTotal : 0), 0);
      const active = docs.filter(s => ['buscando_prestador', 'prestador_atribuido', 'em_andamento'].includes(s.status)).length;
      const completed = docs.filter(s => s.status === 'concluido').length;
      
      setStats({
        totalGasto: total,
        servicosAtivos: active,
        servicosConcluidos: completed,
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header com saudação personalizada */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">
              Olá, {user?.nome?.split(' ')[0] || 'Cliente'}! 👋
            </h1>
            <p className="text-gray-500">Bem-vindo ao seu painel de controle</p>
          </div>
          <Link to="/cliente/nova-solicitacao">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white"
              leftIcon={<Plus size={20} />}
            >
              Nova Solicitação
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-primary to-blue-900 text-white border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Wallet size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Investido</p>
                <h3 className="text-2xl font-black">{formatCurrency(stats.totalGasto)}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serviços Ativos</p>
                <h3 className="text-2xl font-black text-primary">{stats.servicosAtivos}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concluídos</p>
                <h3 className="text-2xl font-black text-primary">{stats.servicosConcluidos}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-primary">Solicitações Recentes</h2>
              <Link to="/cliente/agenda" className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
                Ver todas <ChevronRight size={16} />
              </Link>
            </div>

            {recentSolicitacoes.length > 0 ? (
              <div className="space-y-4">
                {recentSolicitacoes.map((sol) => (
                  <motion.div 
                    key={sol.id} 
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:border-accent/20 transition-all shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                              <Briefcase size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-primary">{sol.servico}</h4>
                              <p className="text-xs text-gray-500">{formatDate(sol.dataSolicitacao)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-black text-primary">{formatCurrency(sol.valorTotal)}</p>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                sol.status === 'concluido' ? 'bg-green-100 text-green-700' :
                                sol.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {translateStatus(sol.status)}
                              </span>
                            </div>
                            <Link to={`/cliente/acompanhamento/${sol.id}`}>
                              <Button variant="ghost" size="icon" className="text-accent">
                                <ChevronRight size={20} />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="font-black text-gray-700 mb-2">Nenhuma solicitação encontrada</h3>
                  <p className="text-sm text-gray-500 mb-6">Comece agora solicitando seu primeiro serviço.</p>
                  <Link to="/cliente/nova-solicitacao">
                    <Button className="bg-accent hover:bg-accent/90 text-white">
                      Solicitar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Carteira e Suporte */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-primary">Minha Carteira</h2>
            <Card className="bg-gradient-to-br from-accent to-orange-600 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Saldo Disponível</p>
                    <h3 className="text-3xl font-black">MT 0,00</h3>
                  </div>
                  <TrendingUp size={24} className="opacity-50" />
                </div>
                <Link to="/cliente/carteira">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Adicionar Fundos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="font-black text-primary">Suporte Rápido</h3>
              <Card className="bg-gray-50 border-none shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <a 
                    href="https://wa.me/258871425316" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">WhatsApp Suporte</p>
                      <p className="text-xs text-gray-500">+258 87 142 5316</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
