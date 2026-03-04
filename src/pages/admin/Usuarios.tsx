import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User } from '../../types';
import { formatDate, exportToCSV, exportToPDF } from '../../utils/utils';
import { ExportButtons } from '../../components/ui/ExportButtons';
import { useToast } from '../../contexts/ToastContext';

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = roleFilter === 'todos' 
      ? collection(db, 'users') 
      : query(collection(db, 'users'), where('role', '==', roleFilter));

    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roleFilter]);

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telefone.includes(searchTerm)
  );

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      showToast('Status do utilizador atualizado.', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const exportHeaders = ['Nome', 'Email', 'Telefone', 'Perfil', 'Status', 'Data Cadastro'];
  const exportData = filteredUsers.map(u => ({
    Nome: u.nome,
    Email: u.email || 'N/A',
    Telefone: u.telefone,
    Perfil: u.role,
    Status: u.status,
    'Data Cadastro': formatDate(u.dataCadastro)
  }));

  const pdfData = filteredUsers.map(u => [
    u.nome,
    u.email || 'N/A',
    u.telefone,
    u.role,
    u.status,
    formatDate(u.dataCadastro)
  ]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <Users size={32} className="text-accent" />
              Gestão de Utilizadores
            </h1>
            <p className="text-gray-500">Administre todos os perfis registados na plataforma.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ExportButtons 
              data={exportData}
              filename="utilizadores_dexapp"
              title="Relatório de Utilizadores - DEXAPP"
              headers={exportHeaders}
              pdfData={pdfData}
            />
            <Button variant="primary" leftIcon={<UserPlus size={18} />}>Novo Utilizador</Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={20} className="text-gray-400" />}
                  className="rounded-xl border-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-sm text-primary outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="todos">Todos os Perfis</option>
                  <option value="cliente">Clientes</option>
                  <option value="prestador">Prestadores</option>
                  <option value="central">Central</option>
                  <option value="admin">Administradores</option>
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
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilizador</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perfil</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold overflow-hidden">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              u.nome.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{u.nome}</p>
                            <p className="text-[10px] text-gray-400">Desde {formatDate(u.dataCadastro)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail size={12} className="text-accent" /> {u.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone size={12} className="text-accent" /> {u.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-gray-400" />
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{u.role}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.id, e.target.value as User['status'])}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                            u.status === 'ativo' ? 'bg-green-100 text-green-700' :
                            u.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                            u.status === 'bloqueado' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="ativo">Ativo</option>
                          <option value="pendente">Pendente</option>
                          <option value="bloqueado">Bloqueado</option>
                          <option value="suspenso">Suspenso</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                            <AlertCircle size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                            <MoreVertical size={18} />
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
      </div>
    </AppLayout>
  );
}
