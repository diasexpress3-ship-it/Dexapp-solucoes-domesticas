import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter
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
  const [dateRange, setDateRange] = useState('Este Mês');

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3">
              <BarChart3 size={32} className="text-accent" />
              Relatórios e Estatísticas
            </h1>
            <p className="text-gray-500">Análise detalhada do crescimento e uso da plataforma.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Calendar size={18} />}>{dateRange}</Button>
            <Button leftIcon={<Download size={18} />}>Exportar PDF</Button>
          </div>
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
      </div>
    </AppLayout>
  );
}
