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

export interface Service {
  id: string;
  name: string;
  provider: string;
  expiryDate: string;
  status: 'active' | 'scheduled' | 'expired';
  description: string;
}

export interface User {
  username: string;
  name: string;
  isAuthenticated: boolean;
}

export type AlertLevel = 'normal' | 'warning' | 'critical' | 'info';
