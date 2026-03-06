import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  ExternalLink,
  Home,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User } from '../../types';
import { formatDate, exportToCSV, exportToPDF } from '../../utils/utils';
import { ExportButtons } from '../../components/ui/ExportButtons';
import { useToast } from '../../contexts/ToastContext';

export default function Prestadores() {
  const navigate = useNavigate();
  const [prestadores, setPrestadores] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'prestador'));
    const unsubscribe = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      if (statusFilter !== 'todos') {
        data = data.filter(p => p.status === statusFilter);
      }
      setPrestadores(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const filteredPrestadores = prestadores.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prestadorData?.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      showToast('Status do prestador atualizado.', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const exportHeaders = ['Nome', 'Categoria', 'Telefone', 'Status', 'Trabalhos', 'Rating'];
  const exportData = filteredPrestadores.map(p => ({
    Nome: p.nome,
    Categoria: p.prestadorData?.categoria || 'N/A',
    Telefone: p.telefone,
    Status: p.status,
    Trabalhos: p.prestadorData?.trabalhos || 0,
    Rating: p.prestadorData?.rating || 0
  }));

  const pdfData = filteredPrestadores.map(p => [
    p.nome,
    p.prestadorData?.categoria || 'N/A',
    p.telefone,
    p.status,
    p.prestadorData?.trabalhos || 0,
    p.prestadorData?.rating || 0
  ]);

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
          <span className="text-primary font-bold">Prestadores</span>
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
              <Briefcase size={32} className="text-accent" />
              Gestão de Prestadores
            </h1>
            <p className="text-gray-500">Acompanhe e valide os profissionais da plataforma.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <ExportButtons 
              data={exportData}
              filename="prestadores_dexapp"
              title="Relatório de Prestadores - DEXAPP"
              headers={exportHeaders}
              pdfData={pdfData}
            />
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por nome ou categoria..."
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
                  <option value="ativo">Ativos</option>
                  <option value="pendente">Pendentes (Validação)</option>
                  <option value="bloqueado">Bloqueados</option>
                </select>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Filter size={20} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrestadores.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -5 }}>
              <Card className="h-full overflow-hidden border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl overflow-hidden shadow-inner">
                        {p.photoURL ? (
                          <img src={p.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          p.nome.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-primary leading-tight">{p.nome}</h3>
                        <p className="text-xs font-bold text-accent uppercase tracking-widest">{p.prestadorData?.categoria || 'Sem Categoria'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        p.status === 'ativo' ? 'bg-green-100 text-green-700' :
                        p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                      <div className="flex items-center text-yellow-500 gap-1">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-black">{p.prestadorData?.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <MapPin size={16} />
                      </div>
                      Maputo, Moçambique
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <CheckCircle2 size={16} />
                      </div>
                      {p.prestadorData?.trabalhos || 0} Trabalhos Concluídos
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.prestadorData?.especialidades?.map((esp, i) => (
                      <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {esp}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl font-bold"
                      leftIcon={<FileText size={16} />}
                      onClick={() => window.open(p.prestadorData?.biUrl, '_blank')}
                      disabled={!p.prestadorData?.biUrl}
                    >
                      Ver BI
                    </Button>
                    {p.status === 'pendente' ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-xl font-bold bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(p.id, 'ativo')}
                      >
                        Aprovar
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold text-red-500 border-red-100 hover:bg-red-50"
                        onClick={() => handleStatusChange(p.id, 'bloqueado')}
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

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
