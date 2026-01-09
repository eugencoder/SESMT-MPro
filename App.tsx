import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { EmployeeManager } from './pages/EmployeeManager';
import { ServiceManager } from './pages/ServiceManager';
import { Login } from './pages/Login';
import { Employee, Service } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Centralized State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Initialize Data on Mount
  useEffect(() => {
    StorageService.init();
    setEmployees(StorageService.getEmployees());
    setServices(StorageService.getServices());

    // Check for existing session
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

  // --- Data Handlers (Sync State + DB) ---

  const handleSaveEmployee = (employee: Employee) => {
    setEmployees(prev => {
      const exists = prev.find(e => e.id === employee.id);
      let newData;
      if (exists) {
        newData = prev.map(e => e.id === employee.id ? employee : e);
      } else {
        newData = [...prev, employee];
      }
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
      let newData;
      if (exists) {
        newData = prev.map(s => s.id === service.id ? service : s);
      } else {
        newData = [...prev, service];
      }
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

  if (!isAuthenticated) {
    return <Login onLogin={() => handleLogin('user')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
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