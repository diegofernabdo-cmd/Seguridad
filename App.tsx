import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCard } from './components/StatsCard';
import { GuardForm } from './components/GuardForm';
import { Login } from './components/Login';
import { Guard, ViewState, User, Sanction, Memo } from './types';
import { analyzeRoster } from './services/geminiService';
import { 
  Plus, 
  Search, 
  Users, 
  ShieldAlert, 
  UserCheck, 
  Trash2, 
  MapPin,
  Sparkles,
  Loader2,
  BrainCircuit,
  Clock,
  Lock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Key,
  Gavel,
  AlertTriangle,
  Move,
  Moon,
  Sun,
  FileText,
  Award,
  Ban,
  Map // Added Map import
} from 'lucide-react';

// --- DATA INITIALIZATION HELPERS ---
const generateCredentials = (name: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const password = Math.random().toString(36).slice(-8);
  return {
    username: `${cleanName}.${randomNum}`,
    accessKey: password
  };
};

// Expanded Data Set
const INITIAL_GUARDS: Guard[] = [
  { id: '1', name: 'Carlos Rodríguez', position: 'Supervisor General', status: 'Activo', joinedDate: '2023-01-15', location: 'Torre de Control', lastUpdate: '10:00 AM', sanctions: [], memos: [], credentials: generateCredentials('Carlos Rodríguez') },
  { id: '2', name: 'Ana Martínez', position: 'Oficial de Seguridad', status: 'Activo', joinedDate: '2023-03-10', location: 'Acceso Principal', lastUpdate: '08:30 AM', sanctions: [], memos: [], credentials: generateCredentials('Ana Martínez') },
  { id: '3', name: 'Roberto Díaz', position: 'Vigilante Nocturno', status: 'Descanso', joinedDate: '2023-05-22', location: 'Ronda Perimetral', lastUpdate: '06:00 AM', sanctions: [], memos: [], credentials: generateCredentials('Roberto Díaz') },
  { id: '4', name: 'Luis Morales', position: 'Monitorista CCTV', status: 'Activo', joinedDate: '2023-06-15', location: 'Torre de Control', lastUpdate: '09:00 AM', sanctions: [], memos: [], credentials: generateCredentials('Luis Morales') },
  { id: '5', name: 'Elena Vega', position: 'Recepción', status: 'Activo', joinedDate: '2023-07-01', location: 'Recepción', lastUpdate: '08:00 AM', sanctions: [], memos: [], credentials: generateCredentials('Elena Vega') },
  { id: '6', name: 'Pedro Sánchez', position: 'Vigilante', status: 'Activo', joinedDate: '2023-08-20', location: 'Estacionamiento Norte', lastUpdate: '08:15 AM', sanctions: [], memos: [], credentials: generateCredentials('Pedro Sánchez') },
  { id: '7', name: 'Marta Gómez', position: 'Vigilante', status: 'Baja', joinedDate: '2022-12-01', location: 'Sin Asignar', lastUpdate: '---', sanctions: [], memos: [], credentials: generateCredentials('Marta Gómez') },
  { id: '8', name: 'Jorge Ruiz', position: 'Rondinero', status: 'Activo', joinedDate: '2023-09-10', location: 'Ronda Perimetral', lastUpdate: '07:45 AM', sanctions: [], memos: [], credentials: generateCredentials('Jorge Ruiz') },
  { id: '9', name: 'Sofía López', position: 'Control de Accesos', status: 'Descanso', joinedDate: '2023-10-05', location: 'Acceso Proveedores', lastUpdate: '06:00 PM', sanctions: [], memos: [], credentials: generateCredentials('Sofía López') },
  { id: '10', name: 'Diego Torres', position: 'Seguridad Canina', status: 'Activo', joinedDate: '2023-11-12', location: 'Jardines Sur', lastUpdate: '08:30 AM', sanctions: [], memos: [], credentials: generateCredentials('Diego Torres') },
];

const LOCATIONS = [
  'Acceso Principal', 
  'Torre de Control', 
  'Ronda Perimetral', 
  'Recepción', 
  'Estacionamiento Norte',
  'Acceso Proveedores',
  'Jardines Sur'
];

export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');

  // App State
  const [view, setView] = useState<ViewState>('dashboard');
  const [guards, setGuards] = useState<Guard[]>(() => {
    const saved = localStorage.getItem('oszford_guards_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((g: any) => ({
        ...g,
        sanctions: g.sanctions || [],
        memos: g.memos || [],
        credentials: g.credentials || generateCredentials(g.name)
      }));
    }
    return INITIAL_GUARDS;
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sanctionModalOpen, setSanctionModalOpen] = useState<string | null>(null);
  const [memoModalOpen, setMemoModalOpen] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Roster View State
  const [nightMode, setNightMode] = useState(false);
  
  // AI State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Timer for clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem('oszford_guards_v4', JSON.stringify(guards));
    }
  }, [guards, user]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- AUTH ---
  const handleLogin = (username: string, pass: string) => {
    if (username === 'Diego Valencia' && pass === '12345') {
      setUser({ id: 'admin', name: 'Diego Valencia', role: 'admin' });
      setAuthError('');
    } else {
      // Check if it's a guard
      const guard = guards.find(g => g.credentials.username === username && g.credentials.accessKey === pass);
      if (guard) {
        if (guard.status === 'Baja') {
          setAuthError('ACCESO DENEGADO: Usuario dado de baja.');
          return;
        }
        setUser({ id: guard.id, name: guard.name, role: 'guard' });
        setAuthError('');
      } else if (username.trim() !== '') {
        // Fallback viewer
        setUser({ id: 'guest', name: username, role: 'viewer' });
        setAuthError('');
      } else {
        setAuthError('Credenciales inválidas. Intente nuevamente.');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    setAiReport(null);
    setNightMode(false);
  };

  // --- CRUD ACTIONS ---
  const handleAddGuard = (newGuardData: Omit<Guard, 'id' | 'joinedDate' | 'sanctions' | 'credentials' | 'memos'>) => {
    if (user?.role !== 'admin') return;
    const newGuard: Guard = {
      ...newGuardData,
      id: crypto.randomUUID(),
      joinedDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      sanctions: [],
      memos: [],
      credentials: generateCredentials(newGuardData.name)
    };
    setGuards([newGuard, ...guards]);
    showNotification('Oficial registrado en Oszford Security');
  };

  const handleFireGuard = (id: string) => {
    if (user?.role !== 'admin') {
       showNotification('Permiso denegado', 'error');
       return;
    }
    if (confirm('ADVERTENCIA: ¿Confirma la BAJA DEFINITIVA de este elemento? Esto bloqueará su acceso.')) {
      setGuards(guards.map(g => g.id === id ? {
        ...g,
        status: 'Baja',
        location: 'Sin Asignar',
        lastUpdate: new Date().toLocaleTimeString()
      } : g));
      showNotification('Elemento dado de baja exitosamente');
    }
  }

  const handleDeleteGuard = (id: string) => {
    if (user?.role !== 'admin') return;
    if (confirm('¿Eliminar registro de la base de datos permanentemente?')) {
      setGuards(guards.filter(g => g.id !== id));
      showNotification('Registro eliminado');
    }
  };

  const handleStatusChange = (id: string, newStatus: Guard['status']) => {
    if (user?.role !== 'admin') return;
    setGuards(guards.map(g => g.id === id ? {
      ...g, 
      status: newStatus,
      lastUpdate: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    } : g));
    showNotification(`Estado actualizado: ${newStatus}`);
  };

  const handleAddSanction = (guardId: string, reason: string, severity: Sanction['severity']) => {
    if (user?.role !== 'admin') return;
    const newSanction: Sanction = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      reason,
      severity,
      issuedBy: user.name,
      read: false
    };
    setGuards(guards.map(g => g.id === guardId ? {
      ...g,
      sanctions: [newSanction, ...g.sanctions]
    } : g));
    setSanctionModalOpen(null);
    showNotification('Sanción aplicada y notificada al usuario', 'error');
  };

  const handleAddMemo = (guardId: string, title: string, message: string, type: Memo['type']) => {
    if (user?.role !== 'admin') return;
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      title,
      message,
      type,
      issuedBy: user.name,
      read: false
    };
    setGuards(guards.map(g => g.id === guardId ? {
      ...g,
      memos: [newMemo, ...g.memos]
    } : g));
    setMemoModalOpen(null);
    showNotification('Memorándum enviado exitosamente');
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, guardId: string) => {
    if (user?.role !== 'admin') return;
    e.dataTransfer.setData('guardId', guardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (user?.role !== 'admin') return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLocation: string) => {
    if (user?.role !== 'admin') return;
    e.preventDefault();
    const guardId = e.dataTransfer.getData('guardId');
    const guard = guards.find(g => g.id === guardId);
    if (guard && guard.location !== targetLocation) {
      setGuards(guards.map(g => g.id === guardId ? { ...g, location: targetLocation } : g));
      showNotification(`${guard.name} reasignado a ${targetLocation}`);
    }
  };

  // --- AI ---
  const generateAnalysis = async () => {
    if (user?.role !== 'admin') return;
    setIsAnalyzing(true);
    setAiReport(null);
    const report = await analyzeRoster(guards);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  // --- RENDER ---
  if (!user) {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  // --- GUARD PORTAL VIEW ---
  if (user.role === 'guard') {
    const myGuard = guards.find(g => g.id === user.id);
    if (!myGuard) return <div className="text-white">Error de cuenta</div>;

    const unreadSanctions = myGuard.sanctions.filter(s => !s.read).length;
    const unreadMemos = myGuard.memos.filter(m => !m.read).length;

    return (
       <div className="flex min-h-screen bg-slate-50 font-sans">
          <Sidebar currentView={view} onChangeView={setView} currentUser={user} onLogout={handleLogout} />
          <main className="ml-64 flex-1 p-8">
             <header className="mb-8">
               <h1 className="text-3xl font-bold text-slate-800">Bienvenido, Oficial {myGuard.name.split(' ')[0]}</h1>
               <p className="text-slate-500">Panel del Personal - Oszford Security</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-sm text-slate-500">Estado Actual</p>
                   <p className={`text-2xl font-bold ${myGuard.status === 'Activo' ? 'text-green-600' : 'text-amber-600'}`}>
                     {myGuard.status}
                   </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-sm text-slate-500">Ubicación Asignada</p>
                   <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <MapPin className="w-5 h-5 text-indigo-600" />
                     {myGuard.location}
                   </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-sm text-slate-500">Notificaciones</p>
                   <p className="text-xl font-bold text-slate-800">
                     {unreadSanctions > 0 ? <span className="text-red-600">{unreadSanctions} Sanciones</span> : 'Sin sanciones'} • {unreadMemos} Memos
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Memos Section */}
                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                     <FileText className="w-5 h-5 text-blue-500" /> Memorándums y Felicitaciones
                   </h3>
                   {myGuard.memos.length === 0 ? (
                     <div className="p-8 bg-slate-100 rounded-xl text-center text-slate-400">No hay mensajes.</div>
                   ) : (
                     myGuard.memos.map(memo => (
                       <div key={memo.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${
                         memo.type === 'Felicitacion' ? 'border-green-500' : memo.type === 'Aviso' ? 'border-amber-500' : 'border-blue-500'
                       }`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                               memo.type === 'Felicitacion' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                            }`}>{memo.type.toUpperCase()}</span>
                            <span className="text-xs text-slate-400">{memo.date}</span>
                          </div>
                          <h4 className="font-bold text-slate-800">{memo.title}</h4>
                          <p className="text-slate-600 text-sm mt-1">{memo.message}</p>
                          <p className="text-xs text-slate-400 mt-2 text-right">De: {memo.issuedBy}</p>
                       </div>
                     ))
                   )}
                </div>

                {/* Sanctions Section */}
                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-red-500" /> Historial Disciplinario
                   </h3>
                   {myGuard.sanctions.length === 0 ? (
                     <div className="p-8 bg-green-50 border border-green-100 rounded-xl text-center text-green-700 flex flex-col items-center">
                       <Award className="w-8 h-8 mb-2 opacity-50" />
                       Historial Limpio. ¡Buen trabajo!
                     </div>
                   ) : (
                     myGuard.sanctions.map(sanction => (
                       <div key={sanction.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-red-800">{sanction.severity}</span>
                             <span className="text-xs text-red-600">{sanction.date}</span>
                          </div>
                          <p className="text-sm text-red-700 italic">"{sanction.reason}"</p>
                          <p className="text-xs text-red-400 mt-2 text-right">Emitido por: {sanction.issuedBy}</p>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </main>
       </div>
    );
  }

  // --- ADMIN PORTAL ---
  const filteredGuards = guards.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: guards.length,
    active: guards.filter(g => g.status === 'Activo').length,
    onLeave: guards.filter(g => g.status === 'Descanso').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar currentView={view} onChangeView={setView} currentUser={user} onLogout={handleLogout} />

      <main className="ml-64 flex-1 p-8 relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-serif tracking-tight">
              {view === 'dashboard' && 'Comando Central'}
              {view === 'directory' && 'Directorio & RRHH'}
              {view === 'roster' && 'Mapa Táctico de Planta'}
              {view === 'ai-analyst' && 'Inteligencia IA'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-slate-500 text-sm">Bienvenido, {user.name}</p>
               {user.role === 'viewer' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Modo Visita</span>}
            </div>
          </div>
          <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-700 flex items-center justify-end gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                {currentTime}
              </p>
              <div className="flex items-center gap-2 justify-end mt-1">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <span className="text-xs text-slate-400">Sistema Operativo</span>
              </div>
          </div>
        </header>

        {/* Notifications */}
        {notification && (
          <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce-in ${
            notification.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'
          }`}>
             {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5" />}
             <span className="font-medium">{notification.msg}</span>
          </div>
        )}

        {/* --- VIEW: DASHBOARD --- */}
        {view === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard title="Fuerza Oszford" value={stats.total} icon={Users} color="bg-indigo-600" description="Personal Total" />
              <StatsCard title="Despliegue Operativo" value={stats.active} icon={UserCheck} color="bg-emerald-500" description="En Turno Activo" />
              <StatsCard title="Inactivos" value={stats.onLeave} icon={ShieldAlert} color="bg-amber-500" description="Descanso o Baja" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
                  <button onClick={() => setView('roster')} className="text-sm text-indigo-600 font-medium">Ver Mapa Completo</button>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {guards.slice(0, 4).map(g => (
                        <div key={g.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${g.status === 'Activo' ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                              {g.name.charAt(0)}
                           </div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-slate-700 text-sm truncate">{g.name}</p>
                              <p className="text-xs text-slate-400 truncate">{g.location}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- VIEW: ROSTER (MAP/BLOCKS) --- */}
        {view === 'roster' && (
          <div className={`animate-fade-in transition-colors duration-500 rounded-2xl overflow-hidden shadow-2xl border flex flex-col h-[calc(100vh-140px)]
              ${nightMode 
                 ? 'bg-[#0f172a] border-slate-800 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]' 
                 : 'bg-slate-50 border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]'
              }`}
          >
             
             {/* Toolbar */}
             <div className={`p-4 flex justify-between items-center border-b shrink-0 backdrop-blur-sm ${nightMode ? 'bg-[#1e293b]/90 border-slate-700 text-white' : 'bg-white/90 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                   <Map className={`w-5 h-5 ${nightMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                   <h3 className="font-bold">Mapa Táctico de Planta</h3>
                </div>
                <button 
                  onClick={() => setNightMode(!nightMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                     nightMode 
                     ? 'bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20' 
                     : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {nightMode ? 'Modo Día' : 'Modo Nocturno'}
                </button>
             </div>

             {/* Grid Map Layout */}
             <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                   {LOCATIONS.map(location => {
                      const locationGuards = guards.filter(g => g.location === location);
                      return (
                         <div 
                           key={location}
                           onDragOver={handleDragOver}
                           onDrop={(e) => handleDrop(e, location)}
                           className={`
                              rounded-xl border-2 transition-all duration-300 min-h-[250px] flex flex-col relative
                              ${nightMode 
                                 ? 'bg-[#1e293b]/60 border-slate-700 hover:border-indigo-500/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)]' 
                                 : 'bg-white/60 border-slate-300 hover:border-indigo-400 backdrop-blur-sm shadow-sm'}
                           `}
                         >
                            {/* Header of Block */}
                            <div className={`p-3 border-b flex justify-between items-center ${nightMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
                               <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${locationGuards.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                  {location}
                               </span>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${nightMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                  {locationGuards.length} ELM
                               </span>
                            </div>
                            
                            {/* Drop Zone */}
                            <div className="p-3 space-y-3 flex-1 flex flex-col">
                               {locationGuards.map(guard => (
                                  <div 
                                    key={guard.id}
                                    draggable={user.role === 'admin'}
                                    onDragStart={(e) => handleDragStart(e, guard.id)}
                                    className={`
                                       relative p-3 rounded-lg border cursor-grab active:cursor-grabbing group shadow-sm transition-transform hover:-translate-y-0.5
                                       ${nightMode 
                                          ? 'bg-[#0f172a] border-slate-600 text-slate-300 hover:bg-indigo-900/30 hover:border-indigo-500' 
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'}
                                    `}
                                  >
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                           <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${guard.status === 'Activo' ? 'bg-green-500 text-green-500' : guard.status === 'Descanso' ? 'bg-amber-500 text-amber-500' : 'bg-red-500 text-red-500'}`}></div>
                                           <span className="font-bold text-sm">{guard.name}</span>
                                        </div>
                                        {user.role === 'admin' && <Move className="w-3 h-3 opacity-0 group-hover:opacity-50" />}
                                     </div>
                                     <p className={`text-xs mt-1 ${nightMode ? 'text-slate-500' : 'text-slate-400'}`}>{guard.position}</p>
                                     
                                     {/* Status Indicators */}
                                     <div className="flex gap-1 mt-2">
                                        {guard.sanctions.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500" title="Sancionado"></span>}
                                        {guard.memos.some(m => !m.read) && <span className="w-2 h-2 rounded-full bg-blue-500" title="Mensaje sin leer"></span>}
                                     </div>
                                  </div>
                               ))}
                               {locationGuards.length === 0 && (
                                  <div className={`h-full flex flex-col items-center justify-center text-xs border-2 border-dashed rounded-lg opacity-50 ${nightMode ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
                                     <span className="mb-1">Zona Sin Cubrir</span>
                                     {user.role === 'admin' && <span className="text-[10px]">Arrastre personal aquí</span>}
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
        )}

        {/* --- VIEW: DIRECTORY (HR) --- */}
        {view === 'directory' && (
          <div className="space-y-6 animate-fade-in">
             {/* Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar elemento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              
              {user.role === 'admin' && (
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Alta de Personal
                </button>
              )}
            </div>

            {/* Guard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuards.map(guard => (
                <div key={guard.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                   <div className={`h-1.5 w-full ${guard.status === 'Activo' ? 'bg-green-500' : guard.status === 'Baja' ? 'bg-red-500' : 'bg-amber-500'}`} />
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                               {guard.name.charAt(0)}
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-800">{guard.name}</h3>
                               <p className="text-xs text-indigo-600 font-medium">{guard.position}</p>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            {user.role === 'admin' && (
                               <>
                                 <button onClick={() => setMemoModalOpen(guard.id)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Enviar Memo">
                                    <FileText className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setSanctionModalOpen(guard.id)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded" title="Sancionar">
                                    <Gavel className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleFireGuard(guard.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="DAR DE BAJA">
                                    <Ban className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDeleteGuard(guard.id)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded" title="Borrar Registro">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                               </>
                            )}
                         </div>
                      </div>

                      {/* Details */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-2 mb-4">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Ubicación:</span>
                            <span className="font-bold text-slate-700">{guard.location}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Estado:</span>
                            {user.role === 'admin' ? (
                               <select 
                                  value={guard.status}
                                  onChange={(e) => handleStatusChange(guard.id, e.target.value as any)}
                                  className="bg-transparent text-right font-bold text-slate-700 outline-none cursor-pointer hover:text-indigo-600"
                               >
                                 <option value="Activo">Activo</option>
                                 <option value="Descanso">Descanso</option>
                                 <option value="Baja">BAJA</option>
                               </select>
                            ) : (
                               <span className="font-bold">{guard.status}</span>
                            )}
                         </div>
                      </div>

                      {/* Credentials (Admin Only) */}
                      {user.role === 'admin' && (
                         <details className="group/creds text-xs border-t border-slate-100 pt-2">
                           <summary className="cursor-pointer text-indigo-600 font-medium flex items-center gap-1 select-none">
                              <Key className="w-3 h-3" /> Credenciales de Acceso
                           </summary>
                           <div className="mt-2 bg-indigo-50 p-2 rounded text-indigo-900 font-mono">
                              <p>USR: {guard.credentials.username}</p>
                              <p>PWD: {guard.credentials.accessKey}</p>
                           </div>
                         </details>
                      )}
                      
                      {/* Stats Badges */}
                      <div className="mt-4 flex gap-2 text-xs">
                         {guard.sanctions.length > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                               {guard.sanctions.length} Sanciones
                            </span>
                         )}
                         {guard.memos.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                               {guard.memos.length} Memos
                            </span>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: AI ANALYST --- */}
        {view === 'ai-analyst' && (
           <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
             <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 shadow-xl">
                      <Sparkles className="w-7 h-7 text-yellow-300" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 font-serif">Inteligencia Oszford IA</h2>
                    <p className="text-slate-300 max-w-lg leading-relaxed text-sm md:text-base">
                      Análisis predictivo de seguridad, optimización de rondas y detección de vulnerabilidades en la cobertura actual.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={generateAnalysis}
                      disabled={isAnalyzing || user.role !== 'admin'}
                      className={`
                        relative overflow-hidden group flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all shadow-xl
                        ${user.role === 'admin' 
                          ? 'bg-white text-indigo-950 hover:bg-indigo-50 hover:scale-105 active:scale-95' 
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-75'}
                      `}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit className={`w-5 h-5 ${user.role === 'admin' ? 'text-indigo-600' : ''}`} />
                          <span>{user.role === 'admin' ? 'Generar Informe' : 'Restringido'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
             </div>

             {aiReport && (
               <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
                 <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Informe Generado</span>
                 </div>
                 <div className="p-8">
                   <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                     {aiReport}
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {isFormOpen && (
        <GuardForm onClose={() => setIsFormOpen(false)} onSave={handleAddGuard} />
      )}

      {/* Sanction Modal */}
      {sanctionModalOpen && (
        <SanctionModal 
          guardId={sanctionModalOpen}
          guardName={guards.find(g => g.id === sanctionModalOpen)?.name || ''}
          onClose={() => setSanctionModalOpen(null)}
          onSave={handleAddSanction}
        />
      )}

      {/* Memo Modal */}
      {memoModalOpen && (
        <MemoModal
          guardId={memoModalOpen}
          guardName={guards.find(g => g.id === memoModalOpen)?.name || ''}
          onClose={() => setMemoModalOpen(null)}
          onSave={handleAddMemo}
        />
      )}

    </div>
  );
}

// --- HELPER COMPONENT: Sanction Modal ---
const SanctionModal: React.FC<{guardId: string, guardName: string, onClose: () => void, onSave: (id: string, reason: string, severity: Sanction['severity']) => void}> = ({ guardId, guardName, onClose, onSave }) => {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<Sanction['severity']>('Leve');
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Sancionar Elemento
        </h3>
        <p className="text-sm text-slate-500 mb-4">Oficial: <span className="font-bold text-slate-700">{guardName}</span></p>
        <div className="space-y-3">
          <div>
             <label className="block text-xs font-bold text-slate-700 mb-1">Gravedad</label>
             <div className="flex gap-2">
               {['Leve', 'Grave', 'Muy Grave'].map(s => (
                 <button key={s} onClick={() => setSeverity(s as any)} className={`flex-1 py-1.5 text-xs font-bold rounded border ${severity === s ? 'bg-red-100 border-red-300 text-red-800' : 'bg-white border-slate-200'}`}>{s}</button>
               ))}
             </div>
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-700 mb-1">Motivo</label>
             <textarea className="w-full text-sm border border-slate-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-red-500 outline-none" placeholder="Describa el incidente..." value={reason} onChange={(e) => setReason(e.target.value)}></textarea>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSave(guardId, reason, severity)} disabled={!reason} className="flex-1 py-2 text-sm text-white bg-red-600 font-bold rounded-lg hover:bg-red-700 disabled:opacity-50">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: Memo Modal ---
const MemoModal: React.FC<{guardId: string, guardName: string, onClose: () => void, onSave: (id: string, title: string, msg: string, type: Memo['type']) => void}> = ({ guardId, guardName, onClose, onSave }) => {
   const [title, setTitle] = useState('');
   const [msg, setMsg] = useState('');
   const [type, setType] = useState<Memo['type']>('Aviso');
   return (
     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm">
       <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-in">
         <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
           <FileText className="w-5 h-5 text-blue-500" /> Nuevo Comunicado
         </h3>
         <p className="text-sm text-slate-500 mb-4">Destinatario: <span className="font-bold text-slate-700">{guardName}</span></p>
         <div className="space-y-3">
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
              <div className="flex gap-2">
                {['Aviso', 'Felicitacion', 'General'].map(t => (
                  <button key={t} onClick={() => setType(t as any)} className={`flex-1 py-1.5 text-xs font-bold rounded border ${type === t ? (t==='Felicitacion'?'bg-green-100 border-green-300 text-green-800':'bg-blue-100 border-blue-300 text-blue-800') : 'bg-white border-slate-200'}`}>{t}</button>
                ))}
              </div>
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título</label>
              <input type="text" className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none" placeholder="Asunto" value={title} onChange={(e) => setTitle(e.target.value)} />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje</label>
              <textarea className="w-full text-sm border border-slate-300 rounded-lg p-3 h-20 resize-none outline-none" placeholder="Escriba el mensaje..." value={msg} onChange={(e) => setMsg(e.target.value)}></textarea>
           </div>
         </div>
         <div className="flex gap-2 mt-4">
           <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
           <button onClick={() => onSave(guardId, title, msg, type)} disabled={!msg || !title} className="flex-1 py-2 text-sm text-white bg-blue-600 font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">Enviar</button>
         </div>
       </div>
     </div>
   );
 };