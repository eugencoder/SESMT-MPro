
import { Employee, Service, StockItem, StockTransaction } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SERVICES, INITIAL_STOCK, INITIAL_TRANSACTIONS } from '../constants';

const KEYS = {
  EMPLOYEES: 'sesmt_db_employees',
  SERVICES: 'sesmt_db_services',
  STOCK: 'sesmt_db_stock',
  TRANSACTIONS: 'sesmt_db_transactions',
  USER_SESSION: 'sesmt_user_session'
};

export const StorageService = {
  init: () => {
    if (!localStorage.getItem(KEYS.EMPLOYEES)) {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    }
    if (!localStorage.getItem(KEYS.SERVICES)) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }
    if (!localStorage.getItem(KEYS.STOCK)) {
      localStorage.setItem(KEYS.STOCK, JSON.stringify(INITIAL_STOCK));
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
  },

  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  },

  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getServices: (): Service[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  },

  saveServices: (services: Service[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  getStock: (): StockItem[] => {
    const data = localStorage.getItem(KEYS.STOCK);
    return data ? JSON.parse(data) : INITIAL_STOCK;
  },

  saveStock: (stock: StockItem[]) => {
    localStorage.setItem(KEYS.STOCK, JSON.stringify(stock));
  },

  getTransactions: (): StockTransaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  },

  saveTransactions: (transactions: StockTransaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

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
