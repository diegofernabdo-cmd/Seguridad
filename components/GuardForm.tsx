import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Guard } from '../types';

interface GuardFormProps {
  onClose: () => void;
  onSave: (guard: Omit<Guard, 'id' | 'joinedDate' | 'sanctions' | 'credentials' | 'memos'>) => void;
}

export const GuardForm: React.FC<GuardFormProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('Acceso Principal');
  const [status, setStatus] = useState<Guard['status']>('Activo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position) return;
    onSave({ name, position, status, location });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Registrar Vigilante
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Puesto / Cargo</label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: Supervisor de Turno"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Asignada</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option>Acceso Principal</option>
              <option>Estacionamiento Norte</option>
              <option>Torre de Control</option>
              <option>Ronda Perimetral</option>
              <option>Recepción</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado Actual</label>
            <div className="flex gap-2">
              {['Activo', 'Descanso', 'Baja'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s as any)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    status === s
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md shadow-blue-600/20 transition-all"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};