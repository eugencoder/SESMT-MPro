
import React, { useState } from 'react';
import { Service, ServiceComment } from '../types';
import { Plus, Search, Calendar, Edit2, Trash2, Inbox, ClipboardCheck, Info, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Send, Link as LinkIcon } from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';

import { StorageService } from '../services/storage';

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
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const filteredServices = services.filter(svc => 
    svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    svc.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComment = (serviceId: string) => {
    if (!newComment.trim()) return;

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const session = StorageService.getSession();
    const authorName = session?.username || 'Usuário';

    const comment: ServiceComment = {
      id: Date.now().toString(),
      text: newComment,
      date: new Date().toISOString(),
      author: authorName
    };

    const updatedService = {
      ...service,
      comments: [...(service.comments || []), comment]
    };

    onSave(updatedService);
    setNewComment('');
  };

  const toggleExpand = (id: string) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData(service);
    } else {
      setEditingId(null);
      setFormData({ name: '', provider: '', description: '', expiryDate: '', link: '' });
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
                <React.Fragment key={service.id}>
                  <tr className={`hover:bg-white/50 transition-colors ${expandedServiceId === service.id ? 'bg-blue-50/30' : ''}`}>
                    <td className="p-6 cursor-pointer" onClick={() => toggleExpand(service.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-300 ${expandedServiceId === service.id ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} className="text-slate-400" />
                        </div>
                        <div className="w-1.5 h-8 bg-purple-500/40 rounded-full"></div>
                        <span className="font-black text-slate-900 whitespace-nowrap">{service.name}</span>
                        {service.comments && service.comments.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                            <MessageSquare size={10} />
                            {service.comments.length}
                          </div>
                        )}
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
                      {service.link && (
                        <a 
                          href={service.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block text-slate-500 hover:text-blue-700 p-2.5 rounded-xl hover:bg-blue-50 transition-all align-middle"
                          title="Abrir Link Externo"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                      <button 
                        onClick={() => handleOpenModal(service)} 
                        className="text-slate-500 hover:text-blue-700 p-2.5 rounded-xl hover:bg-blue-50 transition-all align-middle"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)} 
                        className="text-slate-500 hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all align-middle"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                  {expandedServiceId === service.id && (
                    <tr className="bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                      <td colSpan={6} className="p-0">
                        <div className="p-6 pl-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Detalhes e Link */}
                          <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Detalhes do Serviço</h4>
                              <p className="text-slate-700 text-sm leading-relaxed mb-6">
                                {service.description || "Sem descrição detalhada."}
                              </p>
                              {service.link ? (
                                <a 
                                  href={service.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                    <LinkIcon size={16} />
                                  </div>
                                  <span className="font-bold text-sm truncate">Acessar Documento/Link</span>
                                  <ExternalLink size={14} className="ml-auto opacity-50" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 text-slate-400 rounded-xl border border-dashed border-slate-200">
                                  <LinkIcon size={16} />
                                  <span className="font-medium text-sm">Nenhum link vinculado</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Seção de Comentários Trello-style */}
                          <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
                              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <MessageSquare size={14} />
                                  Histórico de Atividades
                                </h4>
                                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                                  {service.comments?.length || 0} registros
                                </span>
                              </div>
                              
                              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                                {service.comments && service.comments.length > 0 ? (
                                  service.comments.map((comment) => (
                                    <div key={comment.id} className="relative pl-6 border-l-2 border-slate-200 pb-1 last:pb-0">
                                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-400"></div>
                                      <div className="bg-white p-4 rounded-xl rounded-tl-none border border-slate-100 shadow-sm hover:shadow-md transition-shadow -mt-2">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-black text-slate-800 text-xs">{comment.author}</span>
                                          <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(comment.date).toLocaleString('pt-BR')}
                                          </span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{comment.text}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-10 text-slate-400">
                                    <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Nenhuma atividade registrada</p>
                                  </div>
                                )}
                              </div>

                              <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Adicionar comentário ou atualização..." 
                                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(service.id)}
                                  />
                                  <button 
                                    onClick={() => handleAddComment(service.id)}
                                    disabled={!newComment.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
                                  >
                                    <Send size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Link de Acesso / Documento</label>
                  <div className="relative">
                    <input type="url" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400 pl-12"
                      placeholder="https://..."
                      value={formData.link || ''}
                      onChange={e => setFormData({...formData, link: e.target.value})} />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
