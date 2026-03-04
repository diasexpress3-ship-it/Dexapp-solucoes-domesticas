import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const formatCurrency = (value: any) => {
  const amount = typeof value === 'number' ? value : parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
  }).format(amount).replace('MZN', 'MTn');
};

export const formatDate = (date: any) => {
  if (!date) return '---';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTime = (date: any) => {
  if (!date) return '---';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'HH:mm', { locale: ptBR });
};

export const formatPhone = (phone: string) => {
  if (!phone) return '---';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+258 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const translateStatus = (status: string) => {
  const statuses: Record<string, string> = {
    active: 'Ativo',
    ativo: 'Ativo',
    pending: 'Pendente',
    pendente: 'Pendente',
    blocked: 'Bloqueado',
    bloqueado: 'Bloqueado',
    suspenso: 'Suspenso',
    rejected: 'Rejeitado',
    approved: 'Aprovado',
    buscando_prestador: 'Buscando Prestador',
    prestador_atribuido: 'Prestador Atribuído',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    waiting_payment: 'Aguardando Pagamento',
    confirmed: 'Confirmado',
    confirmado: 'Confirmado',
    falhou: 'Falhou'
  };
  return statuses[status] || status;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (title: string, headers: string[], data: any[][], filename: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
  });
  doc.save(`${filename}.pdf`);
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9;
};

export function truncateText(text: any, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeWords(text: any): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getTodayFileName(prefix: string): string {
  return `${prefix}_${format(new Date(), 'yyyyMMdd_HHmmss')}`;
}

export function getDayFromDate(date: any): string {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'dd');
}

export function getShortMonth(date: any): string {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM', { locale: ptBR }).toUpperCase();
}
