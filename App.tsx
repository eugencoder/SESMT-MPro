import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { EmployeeManager } from './pages/EmployeeManager';
import { ServiceManager } from './pages/ServiceManager';
import { Login } from './pages/Login';
import { INITIAL_EMPLOYEES, INITIAL_SERVICES } from './constants';
import { Employee, Service } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Centralized State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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
            <EmployeeManager employees={employees} setEmployees={setEmployees} />
          )}
          {currentPage === 'services' && (
            <ServiceManager services={services} setServices={setServices} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
