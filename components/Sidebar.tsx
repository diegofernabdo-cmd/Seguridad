import React from 'react';
import { LayoutDashboard, Users, BrainCircuit, LogOut, Map, Landmark } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout }) => {
  const adminItems = [
    { id: 'dashboard', label: 'Comando Central', icon: LayoutDashboard },
    { id: 'roster', label: 'Mapa Táctico', icon: Map },
    { id: 'directory', label: 'Personal & RRHH', icon: Users },
    { id: 'ai-analyst', label: 'Inteligencia IA', icon: BrainCircuit },
  ];

  const guardItems = [
    { id: 'dashboard', label: 'Mi Portal', icon: LayoutDashboard },
  ];

  const menuItems = currentUser?.role === 'guard' ? guardItems : adminItems;

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
        <div className="bg-indigo-700 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
          <Landmark className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight font-serif">OSZFORD</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Security Suite</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${
             currentUser?.role === 'admin' ? 'bg-indigo-600' : 'bg-slate-600'
          }`}>
            {currentUser?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser?.role === 'admin' ? 'bg-green-500' : 'bg-blue-400'}`}></span>
              {currentUser?.role === 'admin' ? 'Director' : currentUser?.role === 'guard' ? 'Oficial' : 'Visitante'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};