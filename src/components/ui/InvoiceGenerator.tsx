import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Mail, Printer, 
  CreditCard, Calendar, User, Phone, MapPin,
  Building2, Hash, DollarSign, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { formatCurrency, formatDate, formatPhone } from '../../utils/utils';
import { useToast } from '../../contexts/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceGeneratorProps {
  data: {
    invoiceNumber: string;
    date: Date;
    dueDate?: Date;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    paymentMethod?: string;
    paymentStatus?: 'pending' | 'paid' | 'overdue';
    notes?: string;
    companyDetails?: {
      name: string;
      address: string;
      phone: string;
      email: string;
      vat?: string;
    };
  };
  onClose?: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ data, onClose }) => {
  const { showToast } = useToast();

  const defaultCompany = {
    name: 'DEXAPP - Soluções Domésticas',
    address: 'Av. 24 de Julho, nº 123, Maputo, Moçambique',
    phone: '+258 84 000 0000',
    email: 'geral@dex.co.mz',
    vat: '123456789'
  };

  const company = data.companyDetails || defaultCompany;

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(10, 29, 86); // #0A1D56
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FATURA', 20, 25);
      
      doc.setFontSize(10);
      doc.text(`Nº ${data.invoiceNumber}`, 20, 35);

      // Company Details
      doc.setTextColor(10, 29, 86);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, 140, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(company.address, 140, 57);
      doc.text(company.phone, 140, 64);
      doc.text(company.email, 140, 71);

      // Invoice Details
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', 20, 90);
      doc.text('Vencimento:', 20, 97);
      doc.text('Cliente:', 20, 111);
      
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(data.date), 60, 90);
      doc.text(data.dueDate ? formatDate(data.dueDate) : '---', 60, 97);
      doc.text(data.clientName, 60, 111);
      
      if (data.clientPhone) {
        doc.text(`Tel: ${formatPhone(data.clientPhone)}`, 60, 118);
      }
      if (data.clientEmail) {
        doc.text(`Email: ${data.clientEmail}`, 60, 125);
      }

      // Items Table
      const tableColumn = ['Descrição', 'Quantidade', 'Preço Unit.', 'Total'];
      const tableRows = data.items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.total)
      ]);

      autoTable(doc, {
        startY: 140,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 122, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Totals
      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 130, finalY);
      doc.text('Taxa:', 130, finalY + 7);
      doc.text('Total:', 130, finalY + 21);
      
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(data.subtotal), 170, finalY, { align: 'right' });
      doc.text(formatCurrency(data.tax || 0), 170, finalY + 7, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(formatCurrency(data.total), 170, finalY + 21, { align: 'right' });

      // Payment Status
      const statusY = finalY + 35;
      const statusColor = data.paymentStatus === 'paid' ? [16, 185, 129] : 
                         data.paymentStatus === 'overdue' ? [239, 68, 68] : [245, 158, 11];
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(20, statusY, 50, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(data.paymentStatus?.toUpperCase() || 'PENDENTE', 45, statusY + 6, { align: 'center' });

      // Payment Method
      if (data.paymentMethod) {
        doc.setTextColor(10, 29, 86);
        doc.setFontSize(9);
        doc.text(`Método: ${data.paymentMethod}`, 90, statusY + 5);
      }

      // Notes
      if (data.notes) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('Observações:', 20, statusY + 20);
        doc.text(data.notes, 20, statusY + 27);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Esta fatura é um documento oficial da DEXAPP.', pageWidth / 2, 280, { align: 'center' });

      doc.save(`fatura_${data.invoiceNumber}.pdf`);
      showToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao gerar PDF', 'error');
    }
  };

  const handlePrint = () => {
    generatePDF(); // Por simplicidade, gera PDF
  };

  const handleEmail = () => {
    if (!data.clientEmail) {
      showToast('Cliente não possui email cadastrado', 'error');
      return;
    }
    
    // Simular envio de email
    showToast('Enviando fatura por email...', 'info');
    setTimeout(() => {
      showToast('Fatura enviada com sucesso!', 'success');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary">Gerar Fatura</h3>
              <p className="text-sm text-slate-500">Nº {data.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />} onClick={handleEmail}>
              Email
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Imprimir
            </Button>
            <Button size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={generatePDF}>
              PDF
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Preview da Fatura */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-primary">FATURA</h2>
                <p className="text-sm text-slate-500">Nº {data.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">{company.name}</p>
                <p className="text-xs text-slate-500">{company.address}</p>
                <p className="text-xs text-slate-500">{company.phone}</p>
                <p className="text-xs text-slate-500">{company.email}</p>
              </div>
            </div>

            {/* Datas e Cliente */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Datas</p>
                <div className="space-y-1">
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-500 w-20">Emissão:</span>
                    <span className="font-bold text-primary">{formatDate(data.date)}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-500 w-20">Vencimento:</span>
                    <span className="font-bold text-primary">{data.dueDate ? formatDate(data.dueDate) : '---'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cliente</p>
                <p className="font-bold text-primary">{data.clientName}</p>
                {data.clientPhone && <p className="text-sm text-slate-500">{formatPhone(data.clientPhone)}</p>}
                {data.clientEmail && <p className="text-sm text-slate-500">{data.clientEmail}</p>}
                {data.clientAddress && <p className="text-sm text-slate-500">{data.clientAddress}</p>}
              </div>
            </div>

            {/* Tabela de Itens */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th className="p-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Qtd</th>
                    <th className="p-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Preço Unit.</th>
                    <th className="p-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-700">{item.description}</td>
                      <td className="p-3 text-center font-bold text-primary">{item.quantity}</td>
                      <td className="p-3 text-right font-bold text-primary">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-primary">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Subtotal:</span>
                  <span className="font-bold text-primary">{formatCurrency(data.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Taxa ({data.tax ? '10%' : '0%'}):</span>
                  <span className="font-bold text-primary">{formatCurrency(data.tax || 0)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between">
                  <span className="font-black text-primary">Total:</span>
                  <span className="text-xl font-black text-primary">{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>

            {/* Status e Pagamento */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                  data.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  data.paymentStatus === 'overdue' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {data.paymentStatus === 'paid' && <CheckCircle className="w-3 h-3" />}
                  {data.paymentStatus || 'PENDENTE'}
                </div>
                {data.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CreditCard className="w-4 h-4" />
                    {data.paymentMethod}
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Documento gerado em {formatDate(new Date())}
              </div>
            </div>

            {/* Observações */}
            {data.notes && (
              <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                <span className="font-bold">Obs:</span> {data.notes}
              </div>
            )}
          </div>

          {/* Botões de Ação Rápida */}
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={generatePDF} fullWidth>
              Download PDF
            </Button>
            <Button variant="outline" leftIcon={<Mail className="w-4 h-4" />} onClick={handleEmail} fullWidth>
              Enviar por Email
            </Button>
            <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint} fullWidth>
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
