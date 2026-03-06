import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Download,
  FileText,
  TrendingUp,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Pagamento } from '../../types';
import { formatCurrency, formatDate, exportToCSV, exportToPDF } from '../../utils/utils';
import { ExportButtons } from '../../components/ui/ExportButtons';
import { useToast } from '../../contexts/ToastContext';

export default function Pagamentos() {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'pagamentos'), orderBy('data', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Pagamento));
      if (statusFilter !== 'todos') {
        data = data.filter(p => p.status === statusFilter);
      }
      setPagamentos(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const filteredPagamentos = pagamentos.filter(p => 
    p.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (pagamentoId: string, newStatus: Pagamento['status']) => {
    try {
      await updateDoc(doc(db, 'pagamentos', pagamentoId), { status: newStatus });
      showToast('Status do pagamento atualizado.', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleConfirmar = async (pagamentoId: string) => {
    try {
      await updateDoc(doc(db, 'pagamentos', pagamentoId), { 
        status: 'confirmado',
        dataConfirmacao: new Date().toISOString()
      });
      showToast('Pagamento confirmado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao confirmar pagamento.', 'error');
    }
  };

  const handleRejeitar = async (pagamentoId: string) => {
    try {
      await updateDoc(doc(db, 'pagamentos', pagamentoId), { 
        status: 'falhou',
        dataRejeicao: new Date().toISOString()
      });
      showToast('Pagamento rejeitado.', 'info');
    } catch (error) {
      showToast('Erro ao rejeitar pagamento.', 'error');
    }
  };

  const exportHeaders = ['ID', 'Cliente', 'Valor', 'Método', 'Tipo', 'Status', 'Data'];
  const exportData = filteredPagamentos.map(p => ({
    ID: p.id,
    Cliente: p.clienteNome || 'N/A',
    Valor: p.valor,
    Método: p.metodo,
    Tipo: p.tipo,
    Status: p.status,
    Data: formatDate(p.data)
  }));

  const pdfData = filteredPagamentos.map(p => [
    p.id.slice(-6).toUpperCase(),
    p.clienteNome || 'N/A',
    formatCurrency(p.valor),
    p.metodo,
    p.tipo,
    p.status,
    formatDate(p.data)
  ]);

  const stats = {
    total: pagamentos.filter(p => p.status === 'confirmado').reduce((acc, curr) => acc + curr.valor, 0),
    pendente: pagamentos.filter(p => p.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0),
    hoje: pagamentos.filter(p => {
      const d = p.data instanceof Date ? p.data : (p.data as any)?.toDate?.() || new Date((p.data as any).seconds * 1000);
      return d.toDateString() === new Date().toDateString() && p.status === 'confirmado';
    }).reduce((acc, curr) => acc + curr.valor, 0)
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1 hover:text-accent transition-colors"
          >
            <Home className="w-4 h-4" /> Início
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="hover:text-accent transition-colors"
          >
            Admin
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Pagamentos</span>
        </div>

        {/* Header com botão Voltar */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar à página anterior"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <DollarSign size={32} className="text-accent" />
              Gestão Financeira
            </h1>
            <p className="text-gray-500">Controle de pagamentos, depósitos e saques.</p>
          </div>
        </div>

        {/* Botões de exportação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <ExportButtons 
              data={exportData}
              filename="pagamentos_dexapp"
              title="Relatório Financeiro - DEXAPP"
              headers={exportHeaders}
              pdfData={pdfData}
            />
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-gray-100">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Total Confirmado</p>
              <h3 className="text-3xl font-black text-primary">{formatCurrency(stats.total)}</h3>
              <div className="mt-4 flex items-center text-green-500 text-xs font-bold">
                <ArrowUpRight size={14} className="mr-1" /> +15% vs mês anterior
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-100">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Pendente de Validação</p>
              <h3 className="text-3xl font-black text-orange-500">{formatCurrency(stats.pendente)}</h3>
              <div className="mt-4 flex items-center text-orange-500 text-xs font-bold">
                <Clock size={14} className="mr-1" /> {pagamentos.filter(p => p.status === 'pendente').length} transações
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Receita de Hoje</p>
              <h3 className="text-3xl font-black">{formatCurrency(stats.hoje)}</h3>
              <div className="mt-4 flex items-center text-white/70 text-xs font-bold">
                <TrendingUp size={14} className="mr-1" /> Meta diária: 80%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por cliente ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={20} className="text-gray-400" />}
                  className="rounded-xl border-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-sm text-primary outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="pendente">Pendentes</option>
                  <option value="falhou">Falhou</option>
                </select>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Filter size={20} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transação / Data</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor / Tipo</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPagamentos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="text-xs font-bold text-primary">#{p.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(p.data)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-primary">{p.clienteNome || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400">{p.metodo}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-black text-primary">{formatCurrency(p.valor)}</p>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-wider">{p.tipo}</p>
                      </td>
                      <td className="p-4">
                        {p.status === 'pendente' ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              onClick={() => handleConfirmar(p.id)}
                            >
                              Confirmar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                              onClick={() => handleRejeitar(p.id)}
                            >
                              Rejeitar
                            </Button>
                          </div>
                        ) : (
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value as Pagamento['status'])}
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                              p.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                              p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            <option value="confirmado">Confirmado</option>
                            <option value="pendente">Pendente</option>
                            <option value="falhou">Falhou</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.comprovativoUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-accent"
                              onClick={() => window.open(p.comprovativoUrl, '_blank')}
                            >
                              <Eye size={18} />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-gray-400">
                            <FileText size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Botão Voltar flutuante */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
