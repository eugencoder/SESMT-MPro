
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { EmployeeManager } from './pages/EmployeeManager';
import { ServiceManager } from './pages/ServiceManager';
import { StockManager } from './pages/StockManager';
import { Login } from './pages/Login';
import { Employee, Service, StockItem, StockTransaction } from './types';
import { StorageService } from './services/storage';
import { Loader2, DatabaseZap } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const connected = await StorageService.init();
      setDbConnected(connected);

      if (connected) {
        try {
          const [empData, svcData, stockData, transData] = await Promise.all([
            StorageService.getEmployees(),
            StorageService.getServices(),
            StorageService.getStock(),
            StorageService.getTransactions()
          ]);

          setEmployees(empData);
          setServices(svcData);
          setStock(stockData);
          setTransactions(transData);
        } catch (err) {
          console.error("Erro ao carregar dados do Supabase:", err);
          alert("Erro crítico ao sincronizar dados. Verifique a estrutura das tabelas.");
        }
      }

      const session = StorageService.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initApp();
  }, []);

  const handleLogin = (username: string) => {
    StorageService.login(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    StorageService.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // --- Handlers de Persistência Supabase ---

  const handleSaveEmployee = async (employee: Employee) => {
    try {
      await StorageService.saveEmployee(employee);
      const updated = await StorageService.getEmployees();
      setEmployees(updated);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar no Supabase. Verifique se a coluna 'epis' é do tipo JSONB.");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await StorageService.deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Erro ao excluir registro.");
    }
  };

  const handleSaveService = async (service: Service) => {
    try {
      await StorageService.saveService(service);
      const updated = await StorageService.getServices();
      setServices(updated);
    } catch (err) {
      alert("Erro ao salvar serviço.");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await StorageService.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Erro ao excluir serviço.");
    }
  };

  const handleSaveStock = async (item: StockItem) => {
    try {
      await StorageService.saveStockItem(item);
      const updated = await StorageService.getStock();
      setStock(updated);
    } catch (err) {
      alert("Erro ao salvar item de estoque.");
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (window.confirm('Excluir este item permanentemente do inventário?')) {
      try {
        await StorageService.deleteStockItem(id);
        setStock(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert("Erro ao excluir item.");
      }
    }
  };

  const handleAddTransaction = async (trans: StockTransaction) => {
    try {
      // 1. Registra Transação
      await StorageService.addTransaction(trans);
      
      // 2. Atualiza Saldo no Estoque
      const item = stock.find(s => s.id === trans.itemId);
      if (item) {
        const newQty = trans.type === 'in' 
          ? item.currentQuantity + trans.quantity 
          : item.currentQuantity - trans.quantity;
        
        await StorageService.saveStockItem({ ...item, currentQuantity: Math.max(0, newQty) });
      }

      // 3. Recarrega estados para garantir consistência
      const [updatedStock, updatedTrans] = await Promise.all([
        StorageService.getStock(),
        StorageService.getTransactions()
      ]);
      
      setStock(updatedStock);
      setTransactions(updatedTrans);
    } catch (err) {
      alert("Erro ao processar movimentação. Verifique se a tabela 'transactions' existe.");
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-10">
        <div className="relative mb-8">
          <Loader2 size={80} className="text-blue-500 animate-spin opacity-20" />
          <DatabaseZap size={40} className="text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-blue-100">Sincronização em Nuvem</h2>
        <p className="text-slate-400 mt-4 font-medium animate-pulse">Estabelecendo túnel seguro com Supabase...</p>
      </div>
    );
  }

  if (dbConnected === false) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center text-white p-10 text-center">
        <DatabaseZap size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Erro de Conexão</h2>
        <p className="max-w-md text-red-200 font-medium">
          O sistema não conseguiu se comunicar com as tabelas do Supabase. 
          Certifique-se de que você executou o script SQL de criação das tabelas no painel do Supabase.
        </p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-white text-red-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-all">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          {currentPage === 'dashboard' && (
            <Dashboard employees={employees} services={services} stock={stock} />
          )}
          {currentPage === 'employees' && (
            <EmployeeManager 
              employees={employees} 
              onSave={handleSaveEmployee}
              onDelete={handleDeleteEmployee}
            />
          )}
          {currentPage === 'stock' && (
            <StockManager 
              stock={stock}
              transactions={transactions}
              onSaveStock={handleSaveStock}
              onDeleteStock={handleDeleteStock}
              onAddTransaction={handleAddTransaction}
            />
          )}
          {currentPage === 'services' && (
            <ServiceManager 
              services={services} 
              onSave={handleSaveService} 
              onDelete={handleDeleteService}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
