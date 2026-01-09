import { Employee, Service } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SERVICES } from '../constants';

const KEYS = {
  EMPLOYEES: 'sesmt_db_employees',
  SERVICES: 'sesmt_db_services',
  USER_SESSION: 'sesmt_user_session'
};

export const StorageService = {
  // Inicializa o banco de dados se estiver vazio
  init: () => {
    if (!localStorage.getItem(KEYS.EMPLOYEES)) {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    }
    if (!localStorage.getItem(KEYS.SERVICES)) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }
  },

  // Colaboradores
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  },

  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  // Serviços
  getServices: (): Service[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  },

  saveServices: (services: Service[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  // Sessão de Usuário (Persistência de Login)
  login: (username: string) => {
    localStorage.setItem(KEYS.USER_SESSION, JSON.stringify({ username, timestamp: Date.now() }));
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER_SESSION);
  },

  getSession: () => {
    const session = localStorage.getItem(KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  }
};