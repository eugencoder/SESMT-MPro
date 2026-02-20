
export interface EPI {
  id: string;
  name: string;
  ca: string; // Certificado de Aprovação
  expiryDate: string;
  issueDate: string;
  noExpiry?: boolean; // Indicates if the EPI has no expiration date
}

export interface Employee {
  id: string;
  name: string;
  re: string; // Registro de Empregado
  role: string;
  department: string;
  restrictions: string; // Restrições de atividade
  admissionDate: string;
  epis: EPI[];
}

export interface ServiceComment {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  expiryDate: string;
  status: 'active' | 'scheduled' | 'expired';
  description: string;
  link?: string;
  comments?: ServiceComment[];
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string; // ex: 'Par', 'Unidade', 'Conjunto'
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  type: 'in' | 'out';
  personName: string; // Quem retirou (Colaborador)
  responsibleName: string; // Quem entregou (TST/Almoxarife)
  date: string;
}

export interface User {
  username: string;
  name: string;
  isAuthenticated: boolean;
}

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'info';

export interface AISuggestion {
  epiName: string;
  reason: string;
}
