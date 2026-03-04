import React from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';
import { exportToCSV, exportToPDF } from '../../utils/utils';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title: string;
  headers: string[];
  pdfData: any[][];
  className?: string;
}

export const ExportButtons = ({
  data,
  filename,
  title,
  headers,
  pdfData,
  className = '',
}: ExportButtonsProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        leftIcon={<FileSpreadsheet size={16} />}
        onClick={() => exportToCSV(data, filename)}
      >
        CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        leftIcon={<FileText size={16} />}
        onClick={() => exportToPDF(title, headers, pdfData, filename)}
      >
        PDF
      </Button>
    </div>
  );
};
