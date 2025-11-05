export type DroneStatus = 'active' | 'charging' | 'maintenance' | 'idle';

export interface Drone {
  id: string;
  name: string;
  status: DroneStatus;
  battery: number;
  location: {
    lat: number;
    lng: number;
  };
  farm: string;
  station: string;
  lastActivity: string;
  issues: HardwareIssue[];
}

export interface HardwareIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  status: 'available' | 'charging' | 'maintenance';
  assignedDrone?: string;
  capacity: number;
}
