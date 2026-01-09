import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Search, Filter, Calendar, Edit2, Trash2 } from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';

interface ServiceManagerProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ services, setServices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData(service);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      setServices(prev => prev.map(s => s.id === editingId ? { ...formData, id: editingId } as Service : s));
    } else {
      // Create new
      const newService: Service = {
        ...formData as Service,
        id: Date.now().toString(),
        status: 'active'
      };
      setServices([...services, newService]);
    }
    
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Serviços & Manutenções</h2>
          <p className="text-slate-500">Controle de validade de treinamentos, laudos e extintores</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Adicionar Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Serviço / Atividade</th>
                <th className="p-4">Prestador</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{service.name}</td>
                  <td className="p-4 text-slate-600 text-sm">{service.provider}</td>
                  <td className="p-4 text-slate-500 text-sm max-w-xs truncate">{service.description}</td>
                  <td className="p-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(service.expiryDate).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="p-4">
                    <AlertBadge date={service.expiryDate} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(service)} 
                        className="text-slate-400 hover:text-blue-600 p-1" 
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(e, service.id)} 
                        className="text-slate-400 hover:text-red-600 p-1" 
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
                <input required type="text" className="w-full p-2 border rounded-lg"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prestador / Empresa</label>
                <input required type="text" className="w-full p-2 border rounded-lg"
                   value={formData.provider || ''}
                  onChange={e => setFormData({...formData, provider: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea className="w-full p-2 border rounded-lg" rows={3}
                   value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                <input required type="date" className="w-full p-2 border rounded-lg"
                   value={formData.expiryDate || ''}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
