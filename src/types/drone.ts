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

export interface FlightMission {
  id: string;
  droneId: string;
  droneName: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  batteryStart: number;
  batteryEnd: number;
  batteryConsumed: number;
  farm: string;
  status: 'completed' | 'aborted' | 'emergency';
}

export interface ChargingStation {
  id: string;
  name: string;
  status: 'available' | 'charging' | 'maintenance';
  assignedDrone?: string;
  capacity: number;
}
