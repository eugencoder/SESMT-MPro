import { Employee, Service } from './types';

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
        expiryDate: '2024-04-01', // Expired/Critical
      },
      {
        id: 'epi-2',
        name: 'Máscara de Solda',
        ca: '54321',
        issueDate: '2023-01-15',
        expiryDate: '2025-01-15', // Normal
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
        expiryDate: '2024-06-20', // Warning (assuming close date)
      }
    ]
  },
  {
    id: '3',
    name: 'Roberto Mendes',
    re: '11002',
    role: 'Eletricista',
    department: 'Manutenção',
    restrictions: 'Trabalho em altura somente com supervisão.',
    admissionDate: '2023-02-01',
    epis: []
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
  },
  {
    id: 's2',
    name: 'Treinamento NR-35',
    provider: 'Top Treinamentos',
    expiryDate: '2023-12-20', // Expired
    status: 'expired',
    description: 'Reciclagem para trabalho em altura.'
  },
  {
    id: 's3',
    name: 'PCMSO - Renovação',
    provider: 'Clinica Médica Ocupacional',
    expiryDate: '2024-06-30',
    status: 'active',
    description: 'Renovação anual do programa médico.'
  }
];
