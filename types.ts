
export interface Host {
  id: string;
  name: string;
  avatar: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface Session {
  id: string;
  hostId: string;
  hostName: string; // Denormalized for easier display
  accountId: string; // New: To distinguish between big and small accounts
  accountName: string; // New: Display name (e.g., anta_globalstore)
  date: string;
  startTime: string;
  durationMinutes: number;
  revenue: number; // In PHP (Philippine Peso)
  revenueUSD: number; // In USD (US Dollar)
  views: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  HOSTS = 'HOSTS',
  LOG_SESSION = 'LOG_SESSION',
  DATA_CENTER = 'DATA_CENTER'
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}