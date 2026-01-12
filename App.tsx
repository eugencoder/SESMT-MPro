
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { EmployeeManager } from './pages/EmployeeManager';
import { ServiceManager } from './pages/ServiceManager';
import { StockManager } from './pages/StockManager';
import { Login } from './pages/Login';
import { Employee, Service, StockItem, StockTransaction } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  useEffect(() => {
    StorageService.init();
    setEmployees(StorageService.getEmployees());
    setServices(StorageService.getServices());
    setStock(StorageService.getStock());
    setTransactions(StorageService.getTransactions());

    const session = StorageService.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
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

  // --- Handlers ---

  const handleSaveEmployee = (employee: Employee) => {
    setEmployees(prev => {
      const exists = prev.find(e => e.id === employee.id);
      const newData = exists ? prev.map(e => e.id === employee.id ? employee : e) : [...prev, employee];
      StorageService.saveEmployees(newData);
      return newData;
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => {
      const newData = prev.filter(e => e.id !== id);
      StorageService.saveEmployees(newData);
      return newData;
    });
  };

  const handleSaveService = (service: Service) => {
    setServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      const newData = exists ? prev.map(s => s.id === service.id ? service : s) : [...prev, service];
      StorageService.saveServices(newData);
      return newData;
    });
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => {
      const newData = prev.filter(s => s.id !== id);
      StorageService.saveServices(newData);
      return newData;
    });
  };

  const handleSaveStock = (item: StockItem) => {
    setStock(prev => {
      const exists = prev.find(s => s.id === item.id);
      const newData = exists ? prev.map(s => s.id === item.id ? item : s) : [...prev, item];
      StorageService.saveStock(newData);
      return newData;
    });
  };

  const handleDeleteStock = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este item do inventário?')) {
      setStock(prev => {
        const newData = prev.filter(s => s.id !== id);
        StorageService.saveStock(newData);
        return newData;
      });
    }
  };

  const handleAddTransaction = (trans: StockTransaction) => {
    // 1. Save Transaction
    const newTransactions = [...transactions, trans];
    setTransactions(newTransactions);
    StorageService.saveTransactions(newTransactions);

    // 2. Update Stock Quantity
    setStock(prev => {
      const newData = prev.map(item => {
        if (item.id === trans.itemId) {
          const newQty = trans.type === 'in' 
            ? item.currentQuantity + trans.quantity 
            : item.currentQuantity - trans.quantity;
          return { ...item, currentQuantity: Math.max(0, newQty) };
        }
        return item;
      });
      StorageService.saveStock(newData);
      return newData;
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={(u) => handleLogin(u)} />;
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
            <Dashboard employees={employees} services={services} />
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
