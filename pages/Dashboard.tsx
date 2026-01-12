
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Employee, Service, StockItem } from '../types';
import { getAlertLevel } from '../components/AlertBadge';
import { Shield, AlertTriangle, User as UserIcon, CalendarClock, Package, ShieldAlert, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { AISafetyAssistant } from '../components/AISafetyAssistant';

interface DashboardProps {
  employees: Employee[];
  services: Service[];
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, services }) => {
  const stock: StockItem[] = StorageService.getStock();
  const lowStock = stock.filter(i => i.currentQuantity <= i.minQuantity);

  let totalEPIs = 0;
  let expiredEPIs = 0;
  let warningEPIs = 0;

  const upcomingExpirations: Array<{
    id: string;
    type: 'EPI' | 'Service' | 'Estoque';
    title: string;
    subtitle: string;
    date: string;
    status: 'critical' | 'warning';
  }> = [];

  lowStock.forEach(item => {
    upcomingExpirations.push({
      id: item.id,
      type: 'Estoque',
      title: item.name,
      subtitle: `Estoque Crítico: ${item.currentQuantity} ${item.unit}s`,
      date: new Date().toISOString(),
      status: 'critical'
    });
  });

  employees.forEach(emp => {
    emp.epis.forEach(epi => {
      totalEPIs++;
      const status = getAlertLevel(epi.expiryDate, epi.noExpiry);
      if (status === 'critical') {
        expiredEPIs++;
        upcomingExpirations.push({
          id: epi.id,
          type: 'EPI',
          title: epi.name,
          subtitle: `Colab: ${emp.name}`,
          date: epi.expiryDate,
          status: 'critical'
        });
      }
      if (status === 'warning') {
        warningEPIs++;
        upcomingExpirations.push({
          id: epi.id,
          type: 'EPI',
          title: epi.name,
          subtitle: `Colab: ${emp.name}`,
          date: epi.expiryDate,
          status: 'warning'
        });
      }
    });
  });

  let expiredServices = 0;
  services.forEach(svc => {
    const status = getAlertLevel(svc.expiryDate);
    if (status === 'critical') {
      expiredServices++;
      upcomingExpirations.push({
        id: svc.id,
        type: 'Service',
        title: svc.name,
        subtitle: svc.provider,
        date: svc.expiryDate,
        status: 'critical'
      });
    }
  });

  upcomingExpirations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const validEPIs = totalEPIs - expiredEPIs - warningEPIs;

  const pieData = [
    { name: 'Válidos', value: validEPIs, color: '#10b981' },
    { name: 'Atenção', value: warningEPIs, color: '#f59e0b' },
    { name: 'Vencidos', value: expiredEPIs, color: '#ef4444' },
  ];

  const kpiStyles: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-700' },
    red: { bg: 'bg-red-500/10', text: 'text-red-700' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-700' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-700' }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard de Gestão</h2>
          <p className="text-slate-700 font-medium">SESMT-MPro Insights em tempo real</p>
        </div>
        <div className="bg-white/90 px-5 py-2.5 rounded-2xl border border-slate-300 shadow-sm text-sm text-slate-800 flex items-center gap-3">
          <CalendarClock size={18} className="text-blue-600" />
          <span className="font-black">{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Seção de Alertas de Estoque Crítico */}
      {lowStock.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 rounded-[2.5rem] p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600 text-white rounded-xl animate-pulse">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-lg font-black text-red-900">Atenção: Itens em Estoque Crítico</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map(item => (
              <div key={item.id} className="bg-white border border-red-100 p-4 rounded-2xl flex items-center justify-between group hover:border-red-400 transition-all shadow-sm">
                <div className="space-y-1">
                  <p className="font-black text-slate-900 text-sm">{item.name}</p>
                  <p className="text-[10px] font-bold text-red-600 uppercase">
                    Qtd: {item.currentQuantity} / Min: {item.minQuantity} {item.unit}s
                  </p>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${Math.min(100, (item.currentQuantity / item.minQuantity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Colaboradores', val: employees.length, color: 'blue', icon: <UserIcon /> },
          { label: 'EPIs Vencidos', val: expiredEPIs, color: 'red', icon: <AlertTriangle /> },
          { label: 'Estoque Baixo', val: lowStock.length, color: 'amber', icon: <Package /> },
          { label: 'Serviços Ativos', val: services.length, color: 'indigo', icon: <Shield /> }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-slate-600 mb-1 uppercase tracking-widest">{kpi.label}</p>
                <h3 className="text-4xl font-black text-slate-900">{kpi.val}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${kpiStyles[kpi.color].bg} ${kpiStyles[kpi.color].text} group-hover:scale-110 transition-transform duration-300`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/80 p-8 rounded-[2.5rem] border border-slate-200 shadow-md">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    Distribuição de Conformidade (EPIs)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={90} outerRadius={120} paddingAngle={8} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={6} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', background: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <AISafetyAssistant />
        </div>

        <div className="xl:col-span-1 bg-white/80 p-8 rounded-[2.5rem] border border-slate-200 shadow-md h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600/10 rounded-xl">
                    <CalendarClock className="text-blue-700" size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Feed de Alertas</h3>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
                {upcomingExpirations.length === 0 ? (
                    <div className="text-center py-20">
                        <Shield size={32} className="text-emerald-700 mx-auto mb-4" />
                        <p className="font-black text-slate-800">Operação 100% OK!</p>
                    </div>
                ) : (
                    upcomingExpirations.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${item.type === 'EPI' ? 'bg-blue-100 text-blue-800' : item.type === 'Estoque' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {item.type}
                                    </span>
                                    <h4 className="font-black text-slate-900 text-sm mt-2">{item.title}</h4>
                                    <p className="text-[11px] text-slate-700 font-bold">{item.subtitle}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${item.status === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {item.type === 'Estoque' ? 'CRÍTICO' : new Date(item.date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
