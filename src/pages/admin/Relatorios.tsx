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

// ============================================
// INTERFACES E TIPOS
// ============================================
interface ServicoData {
  name: string;
  value: number;
}

interface MensalData {
  name: string;
  solicitacoes: number;
  concluidas: number;
}

// ============================================
// CONSTANTES
// ============================================
const dataServicos: ServicoData[] = [
  { name: 'Limpeza', value: 45 },
  { name: 'Reparos', value: 25 },
  { name: 'Cozinha', value: 15 },
  { name: 'Jardinagem', value: 10 },
  { name: 'Outros', value: 5 },
];

const dataMensal: MensalData[] = [
  { name: 'Jan', solicitacoes: 120, concluidas: 100 },
  { name: 'Fev', solicitacoes: 150, concluidas: 130 },
  { name: 'Mar', solicitacoes: 180, concluidas: 160 },
  { name: 'Abr', solicitacoes: 200, concluidas: 185 },
  { name: 'Mai', solicitacoes: 250, concluidas: 230 },
  { name: 'Jun', solicitacoes: 300, concluidas: 280 },
];

const COLORS: string[] = ['#0A1D56', '#FF7A00', '#4F46E5', '#10B981', '#F59E0B'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Relatorios() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState<string>('Este Mês');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ============================================
  // HANDLER PARA MUDANÇA DE PERÍODO
  // ============================================
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    setDateRange(newPeriod);
    
    // Mostrar toast de confirmação
    if (showToast) {
      showToast(`Período alterado para: ${newPeriod}`, 'success');
    }
    
    // Aqui você pode adicionar lógica para buscar dados do novo período
    console.log('Período alterado:', newPeriod);
  };

  // ============================================
  // HANDLER PARA FILTRAR
  // ============================================
  const handleFilter = () => {
    setIsLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      setIsLoading(false);
      if (showToast) {
        showToast('Dados filtrados com sucesso!', 'success');
      }
    }, 500);
  };

  // ============================================
  // HANDLER PARA EXPORTAR PDF
  // ============================================
  const handleExportPDF = () => {
    setIsGenerating(true);
    
    if (showToast) {
      showToast('A gerar relatório PDF...', 'info');
    }
    
    // Simular processamento
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
        
        if (showToast) {
          showToast('PDF gerado com sucesso!', 'success');
        }
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        if (showToast) {
          showToast('Erro ao gerar PDF', 'error');
        }
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ======================================== */}
        {/* BREADCRUMB NAVIGATION */}
        {/* ======================================== */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
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
          <span className="text-primary font-bold">Relatórios</span>
        </div>

        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
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

        {/* ======================================== */}
        {/* CONTROLES DE PERÍODO E EXPORTAÇÃO */}
        {/* ======================================== */}
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
              onClick={handleFilter}
              isLoading={isLoading}
              className="rounded-xl"
            >
              {isLoading ? 'Filtrando...' : 'Filtrar'}
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

        {/* ======================================== */}
        {/* GRÁFICOS */}
        {/* ======================================== */}
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataServicos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} serviços`, 'Quantidade']}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
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
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#9ca3af'}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#9ca3af'}} 
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Quantidade']}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
                  <Bar 
                    dataKey="solicitacoes" 
                    name="Solicitações" 
                    fill="#0A1D56" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="concluidas" 
                    name="Concluídas" 
                    fill="#FF7A00" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ======================================== */}
        {/* TABELA RESUMO */}
        {/* ======================================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-bold text-primary">Resumo de Atividades</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              leftIcon={<Filter size={16} />}
              onClick={handleFilter}
            >
              Filtrar
            </Button>
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
                  {dataMensal.slice().reverse().map((item, idx) => {
                    const taxa = Math.round((item.concluidas / item.solicitacoes) * 100);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-primary">{item.name}</td>
                        <td className="p-4 text-sm text-gray-600">{item.solicitacoes.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-600">{item.concluidas.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all duration-300" 
                                style={{ width: `${taxa}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary min-w-[40px]">
                              {taxa}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-primary text-sm">
                          MT {(item.concluidas * 1200).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
