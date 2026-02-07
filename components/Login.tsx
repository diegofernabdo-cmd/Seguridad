import React, { useState } from 'react';
import { Landmark, ArrowRight, Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (user: string, pass: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/30 blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-900/50 rotate-3 transform hover:rotate-0 transition-all duration-500">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-serif">OSZFORD</h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium tracking-wide">SECURITY SUITE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Credencial</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all"
                placeholder="Usuario o ID"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Acceso</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all"
                placeholder="Clave de seguridad"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-xl text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 mt-4 group hover:-translate-y-0.5"
          >
            Acceder al Sistema
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-800 pt-6">
          <p>Sistema exclusivo para personal de OSZFORD Security.</p>
          <p className="mt-1 opacity-50">Secure Connection • TLS 1.3</p>
        </div>
      </div>
    </div>
  );
};