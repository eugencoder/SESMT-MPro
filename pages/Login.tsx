
import React, { useState } from 'react';
import { Lock, User as UserIcon, AlertCircle, HardHat } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allowedUsers = ['sesmt', 'tst01', 'tst02', 'tst03', 'tst04'];
    
    if (allowedUsers.includes(username.toLowerCase()) && password === '1234') {
      onLogin(username);
    } else {
      setError('Acesso negado. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Orbs for Glassmorphism Context */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>

      <div className="bg-white/10 backdrop-blur-2xl w-full max-w-4xl rounded-3xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row min-h-[550px] z-10">
        {/* Left Side - Visual */}
        <div className="w-full md:w-1/2 bg-slate-900/40 p-12 text-white flex flex-col justify-between relative border-r border-white/10">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 border border-white/20">
                      <HardHat size={32} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">SESMT-MPro</h1>
                      <div className="h-1 w-12 bg-blue-500/50 mt-1 rounded-full"></div>
                    </div>
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight">Segurança do Trabalho & Gestão Inteligente</h2>
                <p className="text-slate-400 text-lg leading-relaxed">Controle total de EPIs e prazos em uma interface moderna e segura.</p>
            </div>
            
            <p className="text-[10px] text-slate-500 relative z-10 uppercase tracking-widest font-semibold">SESMT-MPro Platform © 2026</p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white/5">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
            <p className="text-slate-400">Acesse o painel administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-pulse">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-500" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-600"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/30 border border-white/10 active:scale-[0.98]"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
