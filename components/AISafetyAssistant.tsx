
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Loader2, ShieldAlert } from 'lucide-react';

export const AISafetyAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askGemini = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um especialista em Segurança do Trabalho (SESMT). Responda de forma concisa e profissional à seguinte dúvida: ${query}`,
        config: {
          systemInstruction: "Você auxilia Técnicos e Engenheiros de Segurança do Trabalho com dúvidas sobre Normas Regulamentadoras (NRs), EPIs e prevenção de acidentes. Seja direto e use português brasileiro.",
        }
      });
      setResponse(result.text || "Não foi possível obter uma resposta no momento.");
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("Erro ao conectar com a inteligência artificial. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-blue-200 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles size={120} className="text-blue-500" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Assistente IA SESMT</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Consultoria Técnica em Tempo Real</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
            placeholder="Ex: Quais os EPIs necessários para soldador?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askGemini()}
          />
          <button
            onClick={askGemini}
            disabled={loading}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>

        {response && (
          <div className="p-5 bg-white border border-blue-100 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-blue-600 shrink-0 mt-1" size={18} />
              <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {response}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
