import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Employee, Service } from '../types';
import { getAlertLevel } from '../components/AlertBadge';
import { Shield, HardHat, AlertTriangle, User as UserIcon, CalendarClock } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  services: Service[];
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, services }) => {
  // Logic to calculate stats
  let totalEPIs = 0;
  let expiredEPIs = 0;
  let warningEPIs = 0;

  // Logic to gather upcoming expirations
  const upcomingExpirations: Array<{
    id: string;
    type: 'EPI' | 'Service';
    title: string;
    subtitle: string;
    date: string;
    status: 'critical' | 'warning';
  }> = [];

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
          subtitle: `Colab: ${emp.name} (RE: ${emp.re})`,
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
          subtitle: `Colab: ${emp.name} (RE: ${emp.re})`,
          date: epi.expiryDate,
          status: 'warning'
        });
      }
    });
  });

  let expiredServices = 0;
  let warningServices = 0;
  services.forEach(svc => {
    const status = getAlertLevel(svc.expiryDate);
    if (status === 'critical') {
      expiredServices++;
      upcomingExpirations.push({
        id: svc.id,
        type: 'Service',
        title: svc.name,
        subtitle: `Prestador: ${svc.provider}`,
        date: svc.expiryDate,
        status: 'critical'
      });
    }
    if (status === 'warning') {
      warningServices++;
      upcomingExpirations.push({
        id: svc.id,
        type: 'Service',
        title: svc.name,
        subtitle: `Prestador: ${svc.provider}`,
        date: svc.expiryDate,
        status: 'warning'
      });
    }
  });

  // Sort upcoming expirations by date
  upcomingExpirations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const validEPIs = totalEPIs - expiredEPIs - warningEPIs;

  const pieData = [
    { name: 'Válidos', value: validEPIs, color: '#10b981' }, // Emerald 500
    { name: 'Atenção', value: warningEPIs, color: '#f59e0b' }, // Amber 500
    { name: 'Vencidos', value: expiredEPIs, color: '#ef4444' }, // Red 500
  ];

  const barData = [
    {
      name: 'EPIs',
      Válidos: validEPIs,
      Atenção: warningEPIs,
      Vencidos: expiredEPIs,
    },
    {
      name: 'Serviços',
      Válidos: services.length - expiredServices - warningServices,
      Atenção: warningServices,
      Vencidos: expiredServices,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500">Monitoramento em tempo real do SESMT</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600">
          Data: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Colaboradores</p>
            <h3 className="text-3xl font-bold text-slate-800">{employees.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <UserIcon />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">EPIs Vencidos</p>
            <h3 className="text-3xl font-bold text-red-600">{expiredEPIs}</h3>
            <p className="text-xs text-red-500 mt-1">Requer ação imediata</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">EPIs a Vencer (30d)</p>
            <h3 className="text-3xl font-bold text-amber-500">{warningEPIs}</h3>
            <p className="text-xs text-amber-600 mt-1">Planejar substituição</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <HardHat />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Serviços Pendentes</p>
            <h3 className="text-3xl font-bold text-slate-800">{expiredServices + warningServices}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Shield />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Status de Conformidade (EPIs)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Comparison Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Panorama Geral</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Válidos" stackId="a" fill="#10b981" />
                        <Bar dataKey="Atenção" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Vencidos" stackId="a" fill="#ef4444" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>
        </div>

        {/* Upcoming Expirations List */}
        <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="text-slate-500" size={24} />
                <h3 className="text-lg font-bold text-slate-800">Próximos Vencimentos</h3>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
                {upcomingExpirations.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>Tudo em dia! 🎉</p>
                        <p className="text-sm">Nenhum vencimento próximo.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingExpirations.map((item) => (
                            <div key={item.id} className={`p-3 rounded-lg border-l-4 ${item.status === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-amber-500 bg-amber-50'} border border-slate-100`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.type === 'EPI' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {item.type}
                                            </span>
                                            <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1">{item.subtitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-bold ${item.status === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                            {new Date(item.date).toLocaleDateString('pt-BR')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase">Vencimento</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
