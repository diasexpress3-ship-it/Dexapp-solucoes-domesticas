// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata um valor numérico para moeda (MT)
 * @param value - Valor a ser formatado
 * @returns String formatada (ex: 1.500 MT)
 */
export const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return '0 MT';
  return value.toLocaleString('pt-BR') + ' MT';
};

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data a ser formatada (Date, timestamp ou string)
 * @returns String formatada (ex: 15/03/2024)
 */
export const formatDate = (date: Date | string | number | any): string => {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (date?.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'N/A';
  }
};

/**
 * Formata data e hora
 * @param date - Data a ser formatada
 * @returns String formatada (ex: 15/03/2024 14:30)
 */
export const formatDateTime = (date: Date | string | number | any): string => {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (date?.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }

    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return 'N/A';
  }
};

/**
 * Formata hora
 * @param date - Data a ser formatada
 * @returns String formatada (ex: 14:30)
 */
export const formatTime = (date: Date | string | number | any): string => {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (date?.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }

    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar hora:', error);
    return 'N/A';
  }
};

/**
 * Formata número de telefone
 * @param phone - Número de telefone
 * @returns String formatada (ex: 84 123 4567)
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove tudo que não é dígito
  const cleaned = phone.replace(/\D/g, '');
  
  // Formata baseado no tamanho
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (cleaned.length === 12) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  }
  
  return phone;
};

// ============================================
// FUNÇÕES DE TRADUÇÃO
// ============================================

/**
 * Traduz status da solicitação
 * @param status - Status em inglês/português
 * @returns Status traduzido
 */
export const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Status em inglês
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'in_progress': 'Em Andamento',
    'waiting_payment': 'Aguardando Pagamento',
    'paid': 'Pago',
    'confirmed': 'Confirmado',
    
    // Status em português (sistema atual)
    'buscando_prestador': 'Buscando Prestador',
    'prestador_atribuido': 'Prestador Atribuído',
    'em_andamento': 'Em Andamento',
    'aguardando_pagamento_final': 'Aguardando Pagamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado',
    'aguardando_orcamento': 'Aguardando Orçamento',
    'aguardando_aprovacao_cliente': 'Aguardando Aprovação',
    'pagamento_parcial': 'Pagamento Parcial',
    'pagamento_confirmado': 'Pagamento Confirmado',
    
    // Status de usuários
    'activo': 'Ativo',
    'inactivo': 'Inativo',
    'pendente': 'Pendente',
    'pendente_documentos': 'Documentos Pendentes',
    'rejeitado': 'Rejeitado',
    
    // Status de pagamentos/saques
    'pago': 'Pago',
    'processado': 'Processado',
    'aprovado': 'Aprovado',
    'rejeitado_pagamento': 'Rejeitado'
  };

  return statusMap[status] || status;
};

/**
 * Traduz tamanho do serviço
 * @param tamanho - Tamanho em inglês/português
 * @returns Tamanho traduzido com descrição
 */
export const translateTamanho = (tamanho: string): string => {
  const tamanhoMap: Record<string, string> = {
    'pequeno': 'Pequeno (1-6h)',
    'medio': 'Médio (24-48h)',
    'grande': 'Grande (+48h)',
    'small': 'Pequeno (1-6h)',
    'medium': 'Médio (24-48h)',
    'large': 'Grande (+48h)'
  };
  return tamanhoMap[tamanho] || tamanho;
};

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida email
 * @param email - Email a ser validado
 * @returns Booleano indicando se é válido
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valida telefone Moçambicano
 * @param phone - Telefone a ser validado
 * @returns Booleano indicando se é válido
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 9;
};

/**
 * Valida NIB (Número de Identificação Bancária)
 * @param nib - NIB a ser validado
 * @returns Booleano indicando se é válido
 */
export const isValidNIB = (nib: string): boolean => {
  const cleaned = nib.replace(/\D/g, '');
  return cleaned.length === 21;
};

/**
 * Valida número de conta bancária
 * @param conta - Número da conta
 * @returns Booleano indicando se é válido
 */
export const isValidBankAccount = (conta: string): boolean => {
  const cleaned = conta.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 12;
};

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula percentual
 * @param valor - Valor atual
 * @param total - Valor total
 * @returns Percentual calculado
 */
export const calculatePercentage = (valor: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((valor / total) * 100);
};

/**
 * Calcula valor com desconto
 * @param valor - Valor original
 * @param percentual - Percentual de desconto
 * @returns Valor com desconto
 */
export const calculateDiscount = (valor: number, percentual: number): number => {
  return Math.round(valor * (1 - percentual / 100));
};

/**
 * Calcula valor com acréscimo
 * @param valor - Valor original
 * @param percentual - Percentual de acréscimo
 * @returns Valor com acréscimo
 */
export const calculateIncrease = (valor: number, percentual: number): number => {
  return Math.round(valor * (1 + percentual / 100));
};

/**
 * Calcula valor do prestador (60%)
 * @param valorTotal - Valor total pago pelo cliente
 * @returns Valor do prestador
 */
export const calculatePrestadorValue = (valorTotal: number): number => {
  return Math.round(valorTotal * 0.6);
};

/**
 * Calcula valor da plataforma (40%)
 * @param valorTotal - Valor total pago pelo cliente
 * @returns Valor da plataforma
 */
export const calculatePlataformaValue = (valorTotal: number): number => {
  return Math.round(valorTotal * 0.4);
};

/**
 * Calcula valor com taxa
 * @param valor - Valor base
 * @param taxa - Taxa percentual
 * @returns Valor com taxa
 */
export const calculateWithFee = (valor: number, taxa: number): number => {
  return Math.round(valor * (1 + taxa / 100));
};

// ============================================
// FUNÇÕES DE GERAÇÃO
// ============================================

/**
 * Gera ID único
 * @param prefix - Prefixo do ID
 * @returns ID gerado
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Gera referência de pagamento
 * @returns Referência gerada
 */
export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
};

/**
 * Gera número de fatura
 * @returns Número de fatura
 */
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};

/**
 * Gera código de verificação
 * @param length - Tamanho do código
 * @returns Código gerado
 */
export const generateVerificationCode = (length: number = 6): string => {
  return Math.random().toString().substring(2, 2 + length);
};

// ============================================
// FUNÇÕES DE ARQUIVO
// ============================================

/**
 * Formata tamanho de arquivo
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: 1.5 MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtém extensão do arquivo
 * @param filename - Nome do arquivo
 * @returns Extensão do arquivo
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Verifica se é imagem
 * @param file - Arquivo ou tipo MIME
 * @returns Booleano indicando se é imagem
 */
export const isImage = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return file.startsWith('image/');
  }
  return file.type.startsWith('image/');
};

/**
 * Verifica se é PDF
 * @param file - Arquivo ou tipo MIME
 * @returns Booleano indicando se é PDF
 */
export const isPDF = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return file === 'application/pdf';
  }
  return file.type === 'application/pdf';
};

// ============================================
// FUNÇÕES DE EXPORTAÇÃO
// ============================================

/**
 * Exporta dados para CSV
 * @param data - Array de objetos a serem exportados
 * @param filename - Nome do arquivo (sem extensão)
 */
export const exportToCSV = (data: any[], filename: string = 'export'): void => {
  if (data.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Obter cabeçalhos
  const headers = Object.keys(data[0]);
  
  // Criar linhas
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      // Escapar vírgulas e aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  // Combinar cabeçalhos e linhas
  const csv = [headers.join(','), ...rows].join('\n');
  
  // Criar e baixar arquivo
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exporta para PDF (simulado - requer biblioteca externa)
 * @param title - Título do relatório
 * @param headers - Cabeçalhos da tabela
 * @param data - Dados da tabela
 * @param filename - Nome do arquivo
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[],
  filename: string = 'relatorio'
): void => {
  // Esta é uma versão simplificada que apenas gera um alerta
  // Em produção, usar biblioteca como jsPDF ou react-pdf
  console.log('Exportando PDF:', { title, headers, data, filename });
  alert('Funcionalidade de exportação PDF será implementada com biblioteca específica');
};

// ============================================
// FUNÇÕES DE TRUNCAGEM
// ============================================

/**
 * Trunca texto
 * @param text - Texto a ser truncado
 * @param length - Tamanho máximo
 * @param suffix - Sufixo a ser adicionado
 * @returns Texto truncado
 */
export const truncateText = (text: string, length: number = 50, suffix: string = '...'): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Trunca ID
 * @param id - ID a ser truncado
 * @param chars - Número de caracteres a manter
 * @returns ID truncado
 */
export const truncateId = (id: string, chars: number = 8): string => {
  if (!id) return '';
  if (id.length <= chars) return id;
  return '...' + id.slice(-chars);
};

// ============================================
// FUNÇÕES DE CORES
// ============================================

/**
 * Gera cor baseada em string
 * @param str - String de entrada
 * @returns Código de cor HSL
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Obtém cor do status
 * @param status - Status
 * @returns Classes de cor Tailwind
 */
export const getStatusColorClass = (status: string): string => {
  const statusColors: Record<string, string> = {
    'activo': 'bg-green-100 text-green-700',
    'inactivo': 'bg-gray-100 text-gray-700',
    'pendente': 'bg-yellow-100 text-yellow-700',
    'pendente_documentos': 'bg-orange-100 text-orange-700',
    'rejeitado': 'bg-red-100 text-red-700',
    'buscando_prestador': 'bg-yellow-100 text-yellow-700',
    'prestador_atribuido': 'bg-blue-100 text-blue-700',
    'em_andamento': 'bg-indigo-100 text-indigo-700',
    'aguardando_pagamento_final': 'bg-purple-100 text-purple-700',
    'concluido': 'bg-green-100 text-green-700',
    'cancelado': 'bg-red-100 text-red-700',
    'pago': 'bg-green-100 text-green-700',
    'aprovado': 'bg-green-100 text-green-700',
    'processado': 'bg-blue-100 text-blue-700'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-700';
};

// ============================================
// FUNÇÕES DE ORDENAÇÃO
// ============================================

/**
 * Ordena por data (mais recente primeiro)
 * @param a - Primeiro item
 * @param b - Segundo item
 * @returns Número para ordenação
 */
export const sortByDate = (a: { data: Date | any }, b: { data: Date | any }): number => {
  const dateA = a.data?.toDate?.() || a.data;
  const dateB = b.data?.toDate?.() || b.data;
  return new Date(dateB).getTime() - new Date(dateA).getTime();
};

/**
 * Ordena por nome
 * @param a - Primeiro item
 * @param b - Segundo item
 * @returns Número para ordenação
 */
export const sortByName = (a: { nome: string }, b: { nome: string }): number => {
  return a.nome.localeCompare(b.nome);
};

// ============================================
// FUNÇÕES DE CLIPBOARD
// ============================================

/**
 * Copia texto para clipboard
 * @param text - Texto a ser copiado
 * @returns Promise indicando sucesso ou falha
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE DEBOUNCE
// ============================================

/**
 * Debounce para evitar chamadas repetidas
 * @param func - Função a ser executada
 * @param wait - Tempo de espera em ms
 * @returns Função com debounce
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ============================================
// FUNÇÕES DE THROTTLE
// ============================================

/**
 * Throttle para limitar frequência de chamadas
 * @param func - Função a ser executada
 * @param limit - Limite em ms
 * @returns Função com throttle
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
