import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Pagamento } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History, 
  CreditCard,
  Download,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/utils';

export default function CarteiraPage() {
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pagamentos'),
      where('clienteId', '==', user.id),
      orderBy('data', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pagamento));
      setPagamentos(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalSpent = pagamentos.reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                <Wallet size={32} className="text-accent" />
                Minha Carteira
              </h1>
              <p className="text-gray-500">Gerencie seus pagamentos e histórico financeiro.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" leftIcon={<Download size={18} />}>Extrato</Button>
              <Button leftIcon={<Plus size={18} />}>Adicionar Saldo</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Balance Card */}
            <Card className="lg:col-span-1 bg-primary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-8 relative z-10">
                <p className="text-xs font-bold uppercase opacity-70 mb-2">Saldo Disponível</p>
                <h2 className="text-4xl font-black mb-6">{formatCurrency(0)}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase opacity-50">Total Gasto</p>
                    <p className="font-bold">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase opacity-50">Cashback</p>
                    <p className="font-bold">{formatCurrency(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                    <ArrowDownRight size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Último Pagamento</p>
                    <h3 className="text-xl font-black text-primary">
                      {pagamentos.length > 0 ? formatCurrency(pagamentos[0].valor) : 'MT 0,00'}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Método Preferido</p>
                    <h3 className="text-xl font-black text-primary">M-Pesa</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History size={20} className="text-primary" />
                <h3 className="font-bold text-primary">Histórico de Transações</h3>
              </div>
              <Button variant="ghost" size="sm">Ver Tudo</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {pagamentos.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        p.status === 'confirmado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">Pagamento de Serviço</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Solicitação: #{p.solicitacaoId?.slice(-6).toUpperCase() || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">-{formatCurrency(p.valor)}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(p.data)}</p>
                    </div>
                  </div>
                ))}
                {pagamentos.length === 0 && (
                  <div className="p-12 text-center text-gray-500">Nenhuma transação encontrada.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
