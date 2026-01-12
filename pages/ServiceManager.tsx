
import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Search, Calendar, Edit2, Trash2, Inbox, ClipboardCheck, Info } from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';

interface ServiceManagerProps {
  services: Service[];
  onSave: (service: Service) => void;
  onDelete: (id: string) => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredServices = services.filter(svc => 
    svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    svc.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData(service);
    } else {
      setEditingId(null);
      setFormData({ name: '', provider: '', description: '', expiryDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este serviço?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalService: Service = {
      ...(formData as Service),
      id: editingId ? editingId : Date.now().toString(),
      status: 'active'
    };

    onSave(finalService);
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Serviços & Prazos</h2>
          <p className="text-slate-600 font-medium">Controle de validade de treinamentos, laudos e extintores</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-bold whitespace-nowrap"
        >
          <Plus size={20} />
          Adicionar Serviço
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-500 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar serviços ou prestadores..."
          className="pl-12 w-full md:w-96 p-4 bg-white/80 backdrop-blur-md border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 placeholder-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Serviço / Atividade</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Prestador / Empresa</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Descrição</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Vencimento</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-white/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-purple-500/40 rounded-full"></div>
                      <span className="font-black text-slate-900 whitespace-nowrap">{service.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-800 font-bold text-sm whitespace-nowrap">{service.provider}</td>
                  <td className="p-6 text-slate-600 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{service.description}</td>
                  <td className="p-6 text-sm">
                    <span className="flex items-center gap-2 text-slate-900 font-black whitespace-nowrap">
                      <Calendar size={16} className="text-blue-600" />
                      {new Date(service.expiryDate).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="whitespace-nowrap">
                      <AlertBadge date={service.expiryDate} />
                    </div>
                  </td>
                  <td className="p-6 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleOpenModal(service)} 
                      className="text-slate-500 hover:text-blue-700 p-2.5 rounded-xl hover:bg-blue-50 transition-all"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)} 
                      className="text-slate-500 hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <Inbox size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Nenhum serviço encontrado</h3>
                        <p className="text-slate-500 font-medium mt-1">Inicie o cadastro de treinamentos ou manutenções.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High Contrast Glassmorphism Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-slate-300 w-full max-w-2xl transform animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                    <ClipboardCheck size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Editar Serviço / Manutenção' : 'Novo Serviço / Manutenção'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-all font-bold text-xl">
                    ✕
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Nome do Serviço / Atividade</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400"
                    placeholder="Ex: Recarga de Extintores Bloco B"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Prestador / Empresa Responsável</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400"
                    placeholder="Ex: Segur-Tech Ltda"
                    value={formData.provider || ''}
                    onChange={e => setFormData({...formData, provider: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Descrição Detalhada</label>
                  <textarea className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400" rows={3}
                    placeholder="Descreva o escopo da manutenção ou treinamento..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Data de Vencimento / Próxima Execução</label>
                  <div className="relative">
                    <input required type="date" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                      value={formData.expiryDate || ''}
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-700 font-black uppercase tracking-widest text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="px-16 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-sm">
                    SALVAR REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
