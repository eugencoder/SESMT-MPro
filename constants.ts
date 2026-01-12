
import { Employee, Service, StockItem, StockTransaction } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    re: '12093',
    role: 'Soldador',
    department: 'Manutenção',
    restrictions: 'Não operar empilhadeira. Sensibilidade a poeira.',
    admissionDate: '2022-03-15',
    epis: [
      {
        id: 'epi-1',
        name: 'Luva de Raspa',
        ca: '12345',
        issueDate: '2023-10-01',
        expiryDate: '2024-04-01',
      },
      {
        id: 'epi-2',
        name: 'Máscara de Solda',
        ca: '54321',
        issueDate: '2023-01-15',
        expiryDate: '2025-01-15',
      }
    ]
  },
  {
    id: '2',
    name: 'Ana Souza',
    re: '14502',
    role: 'Técnica Química',
    department: 'Laboratório',
    restrictions: 'Nenhuma',
    admissionDate: '2021-06-10',
    epis: [
      {
        id: 'epi-3',
        name: 'Óculos de Proteção',
        ca: '98765',
        issueDate: '2024-01-20',
        expiryDate: '2024-06-20',
      }
    ]
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Recarga Extintores - Bloco A',
    provider: 'Segurança Total Ltda',
    expiryDate: '2024-05-15',
    status: 'active',
    description: 'Manutenção anual preventiva dos extintores de CO2 e Pó Químico.'
  }
];

export const INITIAL_STOCK: StockItem[] = [
  { id: 'st1', name: 'Luva de Raspa', category: 'Proteção Manual', currentQuantity: 45, minQuantity: 10, unit: 'Par' },
  { id: 'st2', name: 'Óculos de Proteção Incolor', category: 'Proteção Visual', currentQuantity: 5, minQuantity: 15, unit: 'Unidade' },
  { id: 'st3', name: 'Protetor Auricular Plug', category: 'Proteção Auditiva', currentQuantity: 120, minQuantity: 50, unit: 'Par' },
  { id: 'st4', name: 'Bota de Segurança Bico Aço', category: 'Proteção de Pés', currentQuantity: 8, minQuantity: 12, unit: 'Par' }
];

export const INITIAL_TRANSACTIONS: StockTransaction[] = [
  { id: 't1', itemId: 'st1', itemName: 'Luva de Raspa', quantity: 1, type: 'out', personName: 'Carlos Silva', responsibleName: 'TST João', date: '2024-03-01' },
  { id: 't2', itemId: 'st2', itemName: 'Óculos de Proteção Incolor', quantity: 20, type: 'in', personName: 'Fornecedor XPTO', responsibleName: 'TST Maria', date: '2024-02-15' }
];
