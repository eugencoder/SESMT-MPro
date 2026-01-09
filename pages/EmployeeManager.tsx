import React, { useState } from 'react';
import { Employee, EPI } from '../types';
import { Plus, Search, Trash2, Edit2, ShieldAlert, FileWarning } from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '', re: '', role: '', department: '', restrictions: '', admissionDate: '', epis: []
  });

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.re.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData(employee);
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', re: '', role: '', department: '', restrictions: '', admissionDate: '', epis: [] });
    }
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...formData, id: emp.id } as Employee : emp));
    } else {
      setEmployees(prev => [...prev, { ...formData, id: Date.now().toString() } as Employee]);
    }
    setIsModalOpen(false);
  };

  // EPI Management inside form
  const addEPI = () => {
    const newEPI: EPI = { id: Date.now().toString(), name: '', ca: '', expiryDate: '', issueDate: '' };
    setFormData(prev => ({ ...prev, epis: [...(prev.epis || []), newEPI] }));
  };

  const updateEPI = (index: number, field: keyof EPI, value: any) => {
    const newEPIs = [...(formData.epis || [])];
    newEPIs[index] = { ...newEPIs[index], [field]: value };
    
    // Clear expiry date if noExpiry is checked
    if (field === 'noExpiry' && value === true) {
        newEPIs[index].expiryDate = '';
    }
    
    setFormData(prev => ({ ...prev, epis: newEPIs }));
  };

  const removeEPI = (index: number) => {
    const newEPIs = [...(formData.epis || [])];
    newEPIs.splice(index, 1);
    setFormData(prev => ({ ...prev, epis: newEPIs }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Colaboradores & EPIs</h2>
          <p className="text-slate-500">Gestão de fichas de EPI e restrições médicas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Cadastro
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, função ou RE..."
          className="pl-10 w-full md:w-96 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid of Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{emp.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="bg-slate-200 text-slate-700 text-xs px-1.5 py-0.5 rounded font-mono">RE: {emp.re}</span>
                    <span>{emp.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => handleOpenModal(emp)} 
                  className="text-slate-400 hover:text-blue-600 p-1" 
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleDeleteEmployee(e, emp.id)} 
                  className="text-slate-400 hover:text-red-600 p-1" 
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Restrictions Section */}
              {emp.restrictions && emp.restrictions !== 'Nenhuma' && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 items-start">
                  <FileWarning className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Restrição de Atividade</p>
                    <p className="text-sm text-red-800 mt-1">{emp.restrictions}</p>
                  </div>
                </div>
              )}

              {/* EPI List */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">EPIs em uso</h4>
                {emp.epis.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum EPI registrado.</p>
                ) : (
                  <ul className="space-y-3">
                    {emp.epis.map(epi => (
                      <li key={epi.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-700">{epi.name}</p>
                          <p className="text-xs text-slate-500">CA: {epi.ca}</p>
                        </div>
                        <div className="text-right">
                          <AlertBadge date={epi.expiryDate} noExpiry={epi.noExpiry} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingEmployee ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">RE (Registro)</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.re} onChange={e => setFormData({...formData, re: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
                  <input required type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Restrições Médicas/Atividade</label>
                <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2}
                  value={formData.restrictions} onChange={e => setFormData({...formData, restrictions: e.target.value})} 
                  placeholder="Ex: Não levantar peso acima de 15kg..." />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800">Lista de EPIs</h4>
                  <button type="button" onClick={addEPI} className="text-sm text-blue-600 font-medium hover:underline">+ Adicionar EPI</button>
                </div>
                
                <div className="space-y-3">
                  {formData.epis?.map((epi, index) => (
                    <div key={epi.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-xs text-slate-500 mb-1">Equipamento</label>
                        <input type="text" required className="w-full p-1.5 text-sm border rounded" 
                          value={epi.name} onChange={e => updateEPI(index, 'name', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">CA</label>
                        <input type="text" required className="w-full p-1.5 text-sm border rounded" 
                          value={epi.ca} onChange={e => updateEPI(index, 'ca', e.target.value)} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs text-slate-500 mb-1">Data Entrega</label>
                        <input type="date" required className="w-full p-1.5 text-sm border rounded" 
                          value={epi.issueDate} onChange={e => updateEPI(index, 'issueDate', e.target.value)} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs text-slate-500 mb-1">Vencimento</label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="date" 
                                required={!epi.noExpiry}
                                disabled={epi.noExpiry}
                                className={`w-full p-1.5 text-sm border rounded ${epi.noExpiry ? 'bg-slate-100 text-slate-400' : ''}`}
                                value={epi.expiryDate} 
                                onChange={e => updateEPI(index, 'expiryDate', e.target.value)} 
                            />
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <input 
                                type="checkbox" 
                                id={`no-expiry-${index}`}
                                checked={epi.noExpiry || false}
                                onChange={e => updateEPI(index, 'noExpiry', e.target.checked)}
                                className="w-3 h-3 text-blue-600 rounded"
                            />
                            <label htmlFor={`no-expiry-${index}`} className="text-xs text-slate-500 select-none cursor-pointer">Sem validade</label>
                        </div>
                      </div>
                      <div className="md:col-span-1 flex justify-center pb-2">
                        <button type="button" onClick={() => removeEPI(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
