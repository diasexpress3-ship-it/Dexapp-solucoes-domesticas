import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  Home,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { exportToPDF } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const dataServicos = [
  { name: 'Limpeza', value: 45 },
  { name: 'Reparos', value: 25 },
  { name: 'Cozinha', value: 15 },
  { name: 'Jardinagem', value: 10 },
  { name: 'Outros', value: 5 },
];

const dataMensal = [
  { name: 'Jan', solicitacoes: 120, concluidas: 100 },
  { name: 'Fev', solicitacoes: 150, concluidas: 130 },
  { name: 'Mar', solicitacoes: 180, concluidas: 160 },
  { name: 'Abr', solicitacoes: 200, concluidas: 185 },
  { name: 'Mai', solicitacoes: 250, concluidas: 230 },
  { name: 'Jun', solicitacoes: 300, concluidas: 280 },
];

const COLORS = ['#0A1D56', '#FF7A00', '#4F46E5', '#10B981', '#F59E0B'];

export default function Relatorios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('Este Mês');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = () => {
    setIsGenerating(true);
    showToast('A gerar relatório PDF...', 'info');
    
    setTimeout(() => {
      try {
        const pdfData = dataMensal.map(item => [
          item.name,
          item.solicitacoes.toString(),
          item.concluidas.toString(),
          `${Math.round((item.concluidas / item.solicitacoes) * 100)}%`,
          `MT ${(item.concluidas * 1200).toLocaleString()}`
        ]);

        exportToPDF(
          'Relatório de Desempenho - DEXAPP',
          ['Mês', 'Solicitações', 'Concluídas', 'Taxa', 'Receita'],
          pdfData,
          'relatorio_dexapp'
        );
        
        showToast('PDF gerado com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao gerar PDF', 'error');
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
    showToast(`Período alterado para: ${e.target.value}`, 'success');
  };

  const handleLogoClick = () => {
    navigate('/'); // Vai para Landing Page
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header com logo clicável */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Ir para Landing Page"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="text-xl font-black text-primary">DEX<span className="text-accent">-app</span></span>
          </button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              leftIcon={<Home className="w-5 h-5" />} 
              onClick={handleLogoClick}
            >
              Landing Page
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button 
            onClick={handleLogoClick}
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
          <span className="text-primary font-bold">Relatórios</span>
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
              <BarChart3 size={32} className="text-accent" />
              Relatórios e Estatísticas
            </h1>
            <p className="text-gray-500">Análise detalhada do crescimento e uso da plataforma.</p>
          </div>
        </div>

        {/* Controles de período e exportação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={handlePeriodChange}
              className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-sm text-primary outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="Este Mês">Este Mês</option>
              <option value="Últimos 30 Dias">Últimos 30 Dias</option>
              <option value="Este Ano">Este Ano</option>
              <option value="Últimos 12 Meses">Últimos 12 Meses</option>
            </select>
            <Button 
              variant="outline" 
              leftIcon={<Filter size={18} />}
              className="rounded-xl"
            >
              Filtrar
            </Button>
          </div>
          <Button 
            leftIcon={<Download size={18} />} 
            onClick={handleExportPDF}
            isLoading={isGenerating}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {isGenerating ? 'A gerar...' : 'Exportar PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary flex items-center gap-2">
                <PieChartIcon size={20} className="text-accent" />
                Distribuição por Categoria
              </h3>
            </CardHeader>
            <CardContent className="p-6 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataServicos}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {dataServicos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Desempenho Mensal
              </h3>
            </CardHeader>
            <CardContent className="p-6 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataMensal}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  <Bar dataKey="solicitacoes" name="Solicitações" fill="#0A1D56" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concluidas" name="Concluídas" fill="#FF7A00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-bold text-primary">Resumo de Atividades</h3>
            <Button variant="ghost" size="sm" leftIcon={<Filter size={16} />}>Filtrar</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mês</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Solicitações</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Concluídas</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Taxa de Conversão</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Receita Estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataMensal.reverse().map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-primary">{item.name}</td>
                      <td className="p-4 text-sm text-gray-600">{item.solicitacoes}</td>
                      <td className="p-4 text-sm text-gray-600">{item.concluidas}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${(item.concluidas / item.solicitacoes) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-primary">
                            {Math.round((item.concluidas / item.solicitacoes) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-black text-primary text-sm">
                        MT {(item.concluidas * 1200).toLocaleString()}
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
            onClick={handleLogoClick}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Ir para Landing Page"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
