export interface Sanction {
  id: string;
  date: string;
  reason: string;
  severity: 'Leve' | 'Grave' | 'Muy Grave';
  issuedBy: string;
  read: boolean;
}

export interface Memo {
  id: string;
  date: string;
  title: string;
  message: string;
  type: 'Felicitacion' | 'Aviso' | 'General';
  issuedBy: string;
  read: boolean;
}

export interface Guard {
  id: string;
  name: string;
  position: string;
  status: 'Activo' | 'Descanso' | 'Baja';
  joinedDate: string;
  location: string;
  lastUpdate?: string;
  sanctions: Sanction[];
  memos: Memo[];
  credentials: {
    username: string;
    accessKey: string;
  };
}

export type ViewState = 'dashboard' | 'directory' | 'roster' | 'ai-analyst';

export type UserRole = 'admin' | 'guard' | 'viewer';

export interface User {
  id: string; // Added ID for mapping
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface GuardStats {
  total: number;
  active: number;
  onLeave: number;
}