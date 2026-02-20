
import { createClient } from '@supabase/supabase-js';
import { Employee, Service, StockItem, StockTransaction } from '../types';

const SUPABASE_URL = 'https://omfowmjaoyyrpnyqyvbe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1UVeaWwQKpn3abx3a_viig_19jx0icW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SESSION_KEY = 'sesmt_user_session';

export const StorageService = {
  /**
   * Testa a conexão com o Supabase buscando um registro simples.
   */
  init: async () => {
    try {
      const { error } = await supabase.from('employees').select('id').limit(1);
      if (error) throw error;
      console.log('✅ Conexão com Supabase estabelecida com sucesso.');
      return true;
    } catch (err) {
      console.error('❌ Falha ao conectar com Supabase. Verifique se as tabelas foram criadas via script SQL.', err);
      return false;
    }
  },

  // --- Colaboradores (Tabela: employees) ---
  getEmployees: async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  saveEmployee: async (employee: Employee) => {
    // Supabase lida automaticamente com a serialização do array 'epis' para JSONB
    const { error } = await supabase.from('employees').upsert(employee);
    if (error) throw error;
  },

  deleteEmployee: async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Serviços (Tabela: services) ---
  getServices: async (): Promise<Service[]> => {
    const { data, error } = await supabase.from('services').select('*').order('expiryDate');
    if (error) throw error;
    return data || [];
  },

  saveService: async (service: Service) => {
    const { error } = await supabase.from('services').upsert(service);
    if (error) throw error;
  },

  deleteService: async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Estoque (Tabela: stock) ---
  getStock: async (): Promise<StockItem[]> => {
    const { data, error } = await supabase.from('stock').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  saveStockItem: async (item: StockItem) => {
    const { error } = await supabase.from('stock').upsert(item);
    if (error) throw error;
  },

  deleteStockItem: async (id: string) => {
    const { error } = await supabase.from('stock').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Transações (Tabela: transactions) ---
  getTransactions: async (): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  addTransaction: async (transaction: StockTransaction) => {
    const { error } = await supabase.from('transactions').insert(transaction);
    if (error) throw error;
  },

  // --- Gestão de Sessão (Local) ---
  login: (username: string) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, timestamp: Date.now() }));
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
