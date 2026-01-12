
import React from 'react';
import { LayoutDashboard, Users, ClipboardCheck, LogOut, HardHat, Package } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'employees', label: "Controle de EPI's", icon: <Users size={20} /> },
    { id: 'stock', label: 'Controle de Estoque', icon: <Package size={20} /> },
    { id: 'services', label: 'Serviços & Prazos', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900/90 backdrop-blur-xl text-white h-screen flex flex-col fixed left-0 top-0 border-r border-white/10 shadow-2xl z-10">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
          <HardHat size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">SESMT-MPro</h1>
          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Safety Management</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentPage === item.id 
                ? 'bg-blue-600/80 text-white shadow-lg shadow-blue-600/20 border border-white/10' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair do Sistema</span>
        </button>
      </div>
    </div>
  );
};
