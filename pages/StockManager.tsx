
import React, { useState } from 'react';
import { StockItem, StockTransaction } from '../types';
import { Plus, Search, Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, History, Trash2, Edit2, FileText, Download, FileSearch } from 'lucide-react';
import { StorageService } from '../services/storage';

interface StockManagerProps {
  stock: StockItem[];
  transactions: StockTransaction[];
  onSaveStock: (item: StockItem) => void;
  onDeleteStock: (id: string) => void;
  onAddTransaction: (transaction: StockTransaction) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({ 
  stock, 
  transactions, 
  onSaveStock, 
  onDeleteStock, 
  onAddTransaction 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('out');

  const [formData, setFormData] = useState<Partial<StockItem>>({
    name: '', category: '', currentQuantity: 0, minQuantity: 0, unit: 'Unidade'
  });

  const [transData, setTransData] = useState<Partial<StockTransaction>>({
    itemId: '', quantity: 1, personName: '', responsibleName: ''
  });

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = stock.filter(item => item.currentQuantity <= item.minQuantity).length;

  const handleOpenModal = (item?: StockItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: '', currentQuantity: 0, minQuantity: 0, unit: 'Unidade' });
    }
    setIsModalOpen(true);
  };

  const handleOpenTransaction = (type: 'in' | 'out', itemId?: string) => {
    setTransactionType(type);
    setTransData({ itemId: itemId || '', quantity: 1, personName: '', responsibleName: '' });
    setIsTransactionModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStock({
      ...(formData as StockItem),
      id: editingItem ? editingItem.id : Date.now().toString()
    });
    setIsModalOpen(false);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stock.find(s => s.id === transData.itemId);
    if (!item) return;

    const newTransaction: StockTransaction = {
      ...(transData as StockTransaction),
      id: Date.now().toString(),
      type: transactionType,
      itemName: item.name,
      date: new Date().toISOString().split('T')[0]
    };

    onAddTransaction(newTransaction);
    setIsTransactionModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Material/EPI', 'Categoria', 'Estoque Atual', 'Unidade', 'Estoque Minimo'];
    const separator = ';'; // Padrão Excel PT-BR
    
    // Envolver campos em aspas para evitar quebras
    const formatField = (field: any) => `"${String(field).replace(/"/g, '""')}"`;

    const rows = stock.map(item => [
      formatField(item.id),
      formatField(item.name),
      formatField(item.category),
      formatField(item.currentQuantity),
      formatField(item.unit),
      formatField(item.minQuantity)
    ]);

    const csvContent = [
      headers.map(formatField).join(separator),
      ...rows.map(row => row.join(separator))
    ].join('\r\n');

    // Adiciona o BOM UTF-8 (\uFEFF) para garantir que o Excel abra com acentuação correta
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_sesmt_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = (specificItemId?: string) => {
    const session = StorageService.getSession();
    const username = session?.username || 'user';
    
    const userNamesMap: Record<string, string> = {
      'sesmt': 'Administrador SESMT',
      'tst01': 'Técnico de Segurança 01',
      'tst02': 'Técnico de Segurança 02',
      'tst03': 'Técnico de Segurança 03',
      'tst04': 'Técnico de Segurança 04',
      'user': 'Usuário Padrão'
    };
    
    const currentUser = userNamesMap[username.toLowerCase()] || username.toUpperCase();
    const now = new Date().toLocaleString('pt-BR');

    const filteredTransactions = specificItemId 
      ? transactions.filter(t => t.itemId === specificItemId)
      : transactions;

    const itemName = specificItemId 
      ? stock.find(s => s.id === specificItemId)?.name 
      : 'Geral';

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const rows = filteredTransactions.slice().reverse().map(t => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
        <td>${t.itemName}</td>
        <td style="color: ${t.type === 'in' ? '#059669' : '#d97706'}; font-weight: bold;">
          ${t.type === 'in' ? 'ENTRADA' : 'BAIXA/SAÍDA'}
        </td>
        <td>${t.personName}</td>
        <td>${t.responsibleName}</td>
        <td style="text-align: center; font-weight: bold;">${t.quantity}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Auditoria - ${itemName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
          .report-info { text-align: right; font-size: 12px; color: #64748b; }
          h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; }
          .audit-meta { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; }
          .signature-box { width: 250px; text-align: center; font-size: 12px; }
          .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">SESMT-MPro</div>
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">SAFETY MANAGEMENT SYSTEM</div>
          </div>
          <div class="report-info">
            <div>Data: ${now}</div>
            <div>Emitido por: <strong>${currentUser}</strong></div>
          </div>
        </div>

        <h1>Movimentação de Estoque: ${itemName}</h1>
        <div class="audit-meta">
          Histórico detalhado de entradas e saídas. Documento gerado para fins de fiscalização e controle interno.
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Material / EPI</th>
              <th>Operação</th>
              <th>Beneficiário / Origem</th>
              <th>Responsável SESMT</th>
              <th style="text-align: center;">Qtd</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhuma movimentação registrada</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">
            <div class="signature-line">Responsável pela Emissão (${currentUser})</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Assinatura Auditoria / Fiscalização</div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Controle de Estoque</h2>
          <p className="text-slate-600 font-medium">Gestão de Inventário e Movimentações de EPI</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
          <button 
            onClick={() => handleGenerateReport()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-slate-900/20 font-black text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
            title="Relatório Geral de Movimentações"
          >
            <FileText size={18} />
            Relatório
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-md font-black text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap border border-slate-300"
            title="Exportar inventário atual em formato CSV compatível com Excel"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button 
            onClick={() => handleOpenTransaction('in')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-600/20 font-black text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
          >
            <ArrowUpCircle size={18} />
            Entrada
          </button>
          <button 
            onClick={() => handleOpenTransaction('out')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-amber-600/20 font-black text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
          >
            <ArrowDownCircle size={18} />
            Baixa (Saída)
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 font-black text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Package size={30} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase">Total em Inventário</p>
            <h3 className="text-3xl font-black text-slate-900">{stock.length} Itens</h3>
          </div>
        </div>
        <div className="bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
          <div className={`p-4 ${lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'} rounded-2xl`}>
            <AlertTriangle size={30} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase">Estoque Crítico</p>
            <h3 className={`text-3xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lowStockCount} Alertas</h3>
          </div>
        </div>
        <div className="bg-white/80 p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
            <History size={30} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase">Baixas do Mês</p>
            <h3 className="text-3xl font-black text-slate-900">
                {transactions.filter(t => t.type === 'out' && t.date.startsWith(new Date().toISOString().slice(0, 7))).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar no inventário..."
              className="pl-12 w-full p-4 bg-white/80 backdrop-blur-md border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-slate-900 placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">EPI / Material</th>
                    <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center whitespace-nowrap">Quant. Atual</th>
                    <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center whitespace-nowrap">Mínimo</th>
                    <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map(item => {
                    const isLow = item.currentQuantity <= item.minQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-white/50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 whitespace-nowrap">{item.name}</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase whitespace-nowrap">{item.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-lg font-black ${isLow ? 'text-red-700' : 'text-slate-900'}`}>{item.currentQuantity}</span>
                          <span className="text-[10px] text-slate-600 ml-1 font-bold">{item.unit}s</span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-600">{item.minQuantity}</td>
                        <td className="p-4">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${isLow ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                            {isLow ? 'Reposição Necessária' : 'Estoque OK'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button onClick={() => handleGenerateReport(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Histórico do Item">
                            <FileSearch size={20} />
                          </button>
                          <button onClick={() => handleOpenTransaction('in', item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Entrada Individual">
                            <ArrowUpCircle size={20} />
                          </button>
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-500 hover:text-blue-600 rounded-xl transition-all" title="Editar">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => onDeleteStock(item.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-xl transition-all" title="Excluir">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white/70 backdrop-blur-lg p-8 rounded-[2.5rem] border border-slate-200 shadow-md h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600/10 rounded-xl">
              <History className="text-blue-700" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Últimas Movimentações</h3>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {transactions.slice().reverse().slice(0, 15).map(t => (
              <div key={t.id} className="bg-white/50 p-4 rounded-2xl border border-white/50 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${t.type === 'in' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{t.itemName}</h4>
                    <p className="text-[10px] text-slate-700 font-bold mt-1 uppercase">
                      {t.type === 'out' ? 'SAÍDA PARA: ' : 'ENTRADA DE: '} {t.personName}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium italic mt-1">Responsável: {t.responsibleName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${t.type === 'in' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {t.type === 'in' ? '+' : '-'}{t.quantity}
                    </span>
                    <p className="text-[9px] text-slate-500 font-bold mt-1">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Cadastro Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-slate-300 w-full max-w-2xl transform animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                  <Package size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{editingItem ? 'Editar Item no Inventário' : 'Novo Item no Inventário'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-all font-bold text-xl">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Nome do EPI / Material</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400" 
                    placeholder="Ex: Luva de Raspa Premium"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Categoria</label>
                  <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400" 
                    placeholder="Ex: Proteção Manual"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Unidade</label>
                  <select className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    <option value="Unidade">Unidade</option>
                    <option value="Par">Par</option>
                    <option value="Conjunto">Conjunto</option>
                    <option value="Kit">Kit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Estoque Atual</label>
                  <input required type="number" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" 
                    value={formData.currentQuantity} onChange={e => setFormData({...formData, currentQuantity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Estoque Mínimo (Alerta)</label>
                  <input required type="number" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" 
                    value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-700 font-black uppercase tracking-widest text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                 <button type="submit" className="px-16 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-sm">SALVAR ITEM</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimentação */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-slate-300 w-full max-w-xl transform animate-in zoom-in-95 duration-300 overflow-hidden">
             <div className={`p-10 border-b border-slate-200 ${transactionType === 'in' ? 'bg-emerald-50/80' : 'bg-amber-50/80'} flex justify-between items-center`}>
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl text-white ${transactionType === 'in' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                    {transactionType === 'in' ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{transactionType === 'in' ? 'Entrada em Estoque' : 'Baixa de Material (Saída)'}</h3>
               </div>
               <button onClick={() => setIsTransactionModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-500 transition-all font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleSaveTransaction} className="p-10 space-y-8">
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Item / EPI</label>
                <select required className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                  value={transData.itemId} onChange={e => setTransData({...transData, itemId: e.target.value})}>
                  <option value="">Selecione um item...</option>
                  {stock.map(s => <option key={s.id} value={s.id}>{s.name} (Atual: {s.currentQuantity} {s.unit}s)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Quantidade</label>
                <input required type="number" min="1" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" 
                  value={transData.quantity} onChange={e => setTransData({...transData, quantity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">{transactionType === 'in' ? 'Origem / Fornecedor' : 'Quem Retirou (Colaborador)'}</label>
                <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400" 
                  placeholder={transactionType === 'in' ? "Nome do fornecedor" : "Nome do colaborador"}
                  value={transData.personName} onChange={e => setTransData({...transData, personName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Responsável (TST / Almoxarife)</label>
                <input required type="text" className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 placeholder-slate-400" 
                  placeholder="Nome do responsável"
                  value={transData.responsibleName} onChange={e => setTransData({...transData, responsibleName: e.target.value})} />
              </div>
              <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
                 <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-8 py-4 text-slate-700 font-black uppercase tracking-widest text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                 <button type="submit" className={`px-16 py-4 ${transactionType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'} text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-sm`}>
                    CONFIRMAR
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
