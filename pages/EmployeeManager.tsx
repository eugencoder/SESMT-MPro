
import React, { useState } from 'react';
import { Employee, EPI } from '../types';
import { Plus, Search, Trash2, Edit2, FileWarning, Inbox, HardHat, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';
import { GoogleGenAI, Type } from "@google/genai";

interface EmployeeManagerProps {
  employees: Employee[];
  onSave: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '', re: '', role: '', department: '', restrictions: '', admissionDate: '', epis: []
  });

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.re.toLowerCase().includes(term) ||
      emp.epis.some(epi => epi.name.toLowerCase().includes(term))
    );
  });

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData(JSON.parse(JSON.stringify(employee)));
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', re: '', role: '', department: '', restrictions: '', admissionDate: '', epis: [] });
    }
    setIsModalOpen(true);
  };

  const handleSuggestEPIs = async () => {
    if (!formData.role) {
      alert("Por favor, preencha o cargo para obter sugestões.");
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Liste os EPIs essenciais e comuns para a função de "${formData.role}" no Brasil.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ca: { type: Type.STRING, description: "Número de CA fictício ou comum para este EPI" }
              },
              required: ["name", "ca"]
            }
          }
        }
      });

      const suggestions = JSON.parse(result.text || "[]");
      const newEPIs: EPI[] = suggestions.map((s: any) => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        name: s.name,
        ca: s.ca || '00000',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        noExpiry: false
      }));

      setFormData(prev => ({ ...prev, epis: [...(prev.epis || []), ...newEPIs] }));
    } catch (error) {
      console.error("AI Error:", error);
      alert("Erro ao obter sugestões da IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este cadastro?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmployee: Employee = {
      ...(formData as Employee),
      id: editingEmployee ? editingEmployee.id : Date.now().toString()
    };
    onSave(finalEmployee);
    setIsModalOpen(false);
  };

  const addEPI = () => {
    const newEPI: EPI = { id: Date.now().toString(), name: '', ca: '', expiryDate: '', issueDate: new Date().toISOString().split('T')[0] };
    setFormData(prev => ({ ...prev, epis: [...(prev.epis || []), newEPI] }));
  };

  const updateEPI = (index: number, field: keyof EPI, value: any) => {
    const newEPIs = [...(formData.epis || [])];
    newEPIs[index] = { ...newEPIs[index], [field]: value };
    if (field === 'noExpiry' && value === true) newEPIs[index].expiryDate = '';
    setFormData(prev => ({ ...prev, epis: newEPIs }));
  };

  const removeEPI = (index: number) => {
    if (window.confirm('Remover este EPI?')) {
      const newEPIs = [...(formData.epis || [])];
      newEPIs.splice(index, 1);
      setFormData(prev => ({ ...prev, epis: newEPIs }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Controle de EPI's</h2>
          <p className="text-slate-600 font-medium">Gestão de fichas de EPI e restrições médicas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-bold"
        >
          <Plus size={20} />
          Cadastrar Colaborador
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-500 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, RE, função ou EPI..."
          className="pl-12 w-full md:w-96 p-4 bg-white/80 backdrop-blur-md border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 placeholder-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="p-20 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-400 text-center">
          <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox size={40} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Nenhum registro encontrado</h3>
          <p className="text-slate-600 mt-2 font-medium">Tente buscar por um termo diferente ou inicie um novo cadastro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 overflow-hidden hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group flex flex-col">
              <div className="p-8 border-b border-white/40 bg-white/30 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-900 text-xl group-hover:text-blue-700 transition-colors">{emp.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-700 mt-2 font-bold">
                      <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">RE: {emp.re}</span>
                      <span>{emp.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(emp)} className="text-slate-500 hover:text-blue-700 p-2.5 rounded-xl hover:bg-blue-50 transition-all" title="Editar">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDeleteEmployee(emp.id)} className="text-slate-500 hover:text-red-700 p-2.5 rounded-xl hover:bg-red-50 transition-all" title="Excluir">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1">
                {emp.restrictions && emp.restrictions !== 'Nenhuma' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                    <FileWarning className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Restrição Ativa</p>
                      <p className="text-sm text-slate-900 mt-1 font-semibold leading-relaxed">{emp.restrictions}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Equipamentos em Uso</h4>
                  {emp.epis.length === 0 ? (
                    <p className="text-sm text-slate-500 italic bg-slate-100/50 p-4 rounded-2xl text-center border border-slate-200 font-medium">Nenhum EPI registrado.</p>
                  ) : (
                    <div className="space-y-4">
                      {emp.epis.map((epi) => (
                        <div key={epi.id} className="flex justify-between items-center group/epi bg-white/30 p-3 rounded-2xl border border-white/50 hover:bg-white/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-blue-500/40 rounded-full group-hover/epi:bg-blue-600 transition-colors"></div>
                            <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 text-sm">{epi.name}</p>
                                  <span className="text-[10px] text-slate-600 font-bold bg-slate-200 px-1.5 py-0.5 rounded">CA {epi.ca}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                                  <Calendar size={10} />
                                  <span>Entrega: {epi.issueDate ? new Date(epi.issueDate).toLocaleDateString('pt-BR') : '--/--/--'}</span>
                                </div>
                            </div>
                          </div>
                          <AlertBadge date={epi.expiryDate} noExpiry={epi.noExpiry} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-slate-300 w-full max-w-5xl my-8 overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 text-white">
                  <HardHat size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {editingEmployee ? 'Editar Ficha do Colaborador' : 'Nova Ficha de EPI'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-all font-bold text-xl">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2">Nome Completo</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder-slate-400" 
                    placeholder="Ex: Milton Antonio"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2">Registro (RE)</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder-slate-400" 
                    placeholder="00000"
                    value={formData.re} onChange={e => setFormData({...formData, re: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2">Função / Cargo</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder-slate-400" 
                    placeholder="Ex: Soldador"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2">Data de Admissão</label>
                  <input required type="date" className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium" 
                    value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-800 mb-2">Restrições Médicas e Observações</label>
                <textarea className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder-slate-400" rows={3}
                  placeholder="Descreva restrições ou observações importantes..."
                  value={formData.restrictions} onChange={e => setFormData({...formData, restrictions: e.target.value})} />
              </div>

              <div className="pt-8 border-t border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 w-2 h-6 rounded-full"></span>
                    <h4 className="text-xl font-black text-slate-900">Listagem de Equipamentos Entregues</h4>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleSuggestEPIs}
                      disabled={aiLoading}
                      className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Sugestão IA
                    </button>
                    <button type="button" onClick={addEPI} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2">
                      <Plus size={18} />
                      Adicionar EPI
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {formData.epis?.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-500 font-bold italic">Nenhum equipamento adicionado ainda.</p>
                    </div>
                  )}
                  {formData.epis?.map((epi, index) => (
                    <div key={epi.id} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end group relative transition-all hover:border-blue-300">
                      <div className="lg:col-span-3">
                        <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">EPI / Equipamento</label>
                        <input type="text" required className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm text-slate-900 font-bold" 
                          value={epi.name} onChange={e => updateEPI(index, 'name', e.target.value)} />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">CA</label>
                        <input type="text" required className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm text-slate-900 font-bold" 
                          value={epi.ca} onChange={e => updateEPI(index, 'ca', e.target.value)} />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">Data de Entrega</label>
                        <input type="date" required className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm text-slate-900 font-bold" 
                          value={epi.issueDate} onChange={e => updateEPI(index, 'issueDate', e.target.value)} />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest">Vencimento</label>
                        <input type="date" disabled={epi.noExpiry} className="w-full p-3 bg-white disabled:bg-slate-200 border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm text-slate-900 font-bold" 
                          value={epi.expiryDate} onChange={e => updateEPI(index, 'expiryDate', e.target.value)} />
                      </div>
                      <div className="lg:col-span-2 flex items-center pb-3">
                         <div className="flex items-center cursor-pointer select-none" onClick={() => updateEPI(index, 'noExpiry', !epi.noExpiry)}>
                           <input type="checkbox" id={`inf-${index}`} checked={epi.noExpiry} readOnly className="w-5 h-5 text-blue-600 mr-2 rounded-lg border-slate-300 transition-all" />
                           <label htmlFor={`inf-${index}`} className="text-xs font-black text-slate-700 uppercase cursor-pointer">Sem Venc.</label>
                         </div>
                      </div>
                      <div className="lg:col-span-1 flex justify-center pb-1">
                        <button type="button" onClick={() => removeEPI(index)} className="p-3 text-red-500 hover:text-white hover:bg-red-600 rounded-2xl transition-all shadow-sm">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-10 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-700 font-black hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest text-sm">Cancelar</button>
                <button type="submit" className="px-16 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-sm">
                  SALVAR REGISTRO COMPLETO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
