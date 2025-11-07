import { Drone, ChargingStation, FlightMission, ActivityEvent } from '@/types/drone';

export const mockDrones: Drone[] = [
  {
    id: 'DJI-001',
    name: 'Agras T40-Alpha',
    status: 'active',
    battery: 78,
    location: { lat: 40.0691, lng: 45.0382 },
    farm: 'Greenfield Farms North',
    station: 'Station A-1',
    lastActivity: '2 minutes ago',
    issues: []
  },
  {
    id: 'DJI-002',
    name: 'Agras T40-Beta',
    status: 'charging',
    battery: 45,
    location: { lat: 40.0791, lng: 45.0482 },
    farm: 'Riverside Agricultural',
    station: 'Station A-2',
    lastActivity: '15 minutes ago',
    issues: [
      {
        id: 'ISS-001',
        severity: 'low',
        description: 'Spray nozzle calibration recommended',
        timestamp: '30 minutes ago'
      }
    ]
  },
  {
    id: 'DJI-003',
    name: 'Agras T40-Gamma',
    status: 'active',
    battery: 92,
    location: { lat: 40.0891, lng: 45.0582 },
    farm: 'Summit Valley Organics',
    station: 'Station B-1',
    lastActivity: 'Just now',
    issues: []
  },
  {
    id: 'DJI-004',
    name: 'Agras T40-Delta',
    status: 'maintenance',
    battery: 12,
    location: { lat: 40.0991, lng: 45.0682 },
    farm: 'Mountain View Ranch',
    station: 'Station B-2',
    lastActivity: '2 hours ago',
    issues: [
      {
        id: 'ISS-002',
        severity: 'critical',
        description: 'Motor overheating detected - immediate service required',
        timestamp: '2 hours ago'
      },
      {
        id: 'ISS-003',
        severity: 'high',
        description: 'GPS signal loss reported',
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: 'DJI-005',
    name: 'Agras T40-Epsilon',
    status: 'idle',
    battery: 100,
    location: { lat: 40.1091, lng: 45.0782 },
    farm: 'Oakwood Estates',
    station: 'Station C-1',
    lastActivity: '45 minutes ago',
    issues: []
  },
  {
    id: 'DJI-006',
    name: 'Agras T40-Zeta',
    status: 'active',
    battery: 65,
    location: { lat: 40.1191, lng: 45.0882 },
    farm: 'Prairie Fields Co-op',
    station: 'Station C-2',
    lastActivity: '5 minutes ago',
    issues: [
      {
        id: 'ISS-004',
        severity: 'medium',
        description: 'Battery efficiency below optimal threshold',
        timestamp: '1 hour ago'
      }
    ]
  }
];

export const mockStations: ChargingStation[] = [
  {
    id: 'Station A-1',
    name: 'North Sector Alpha',
    status: 'charging',
    assignedDrone: 'DJI-001',
    capacity: 2
  },
  {
    id: 'Station A-2',
    name: 'North Sector Beta',
    status: 'charging',
    assignedDrone: 'DJI-002',
    capacity: 2
  },
  {
    id: 'Station B-1',
    name: 'East Sector Alpha',
    status: 'available',
    assignedDrone: 'DJI-003',
    capacity: 3
  },
  {
    id: 'Station B-2',
    name: 'East Sector Beta',
    status: 'maintenance',
    assignedDrone: 'DJI-004',
    capacity: 3
  },
  {
    id: 'Station C-1',
    name: 'South Sector Alpha',
    status: 'available',
    assignedDrone: 'DJI-005',
    capacity: 2
  },
  {
    id: 'Station C-2',
    name: 'South Sector Beta',
    status: 'charging',
    assignedDrone: 'DJI-006',
    capacity: 2
  }
];

export const mockFlightMissions: FlightMission[] = [
  {
    id: 'FLT-001',
    droneId: 'DJI-001',
    droneName: 'Agras T40-Alpha',
    startTime: '2025-01-05T08:30:00',
    endTime: '2025-01-05T10:15:00',
    duration: 105,
    batteryStart: 100,
    batteryEnd: 22,
    batteryConsumed: 78,
    farm: 'Greenfield Farms North',
    status: 'completed'
  },
  {
    id: 'FLT-002',
    droneId: 'DJI-003',
    droneName: 'Agras T40-Gamma',
    startTime: '2025-01-05T07:00:00',
    endTime: '2025-01-05T08:25:00',
    duration: 85,
    batteryStart: 100,
    batteryEnd: 35,
    batteryConsumed: 65,
    farm: 'Summit Valley Organics',
    status: 'completed'
  },
  {
    id: 'FLT-003',
    droneId: 'DJI-006',
    droneName: 'Agras T40-Zeta',
    startTime: '2025-01-05T06:15:00',
    endTime: '2025-01-05T08:45:00',
    duration: 150,
    batteryStart: 98,
    batteryEnd: 12,
    batteryConsumed: 86,
    farm: 'Prairie Fields Co-op',
    status: 'completed'
  },
  {
    id: 'FLT-004',
    droneId: 'DJI-004',
    droneName: 'Agras T40-Delta',
    startTime: '2025-01-05T05:30:00',
    endTime: '2025-01-05T06:10:00',
    duration: 40,
    batteryStart: 95,
    batteryEnd: 55,
    batteryConsumed: 40,
    farm: 'Mountain View Ranch',
    status: 'emergency'
  },
  {
    id: 'FLT-005',
    droneId: 'DJI-002',
    droneName: 'Agras T40-Beta',
    startTime: '2025-01-04T14:00:00',
    endTime: '2025-01-04T16:30:00',
    duration: 150,
    batteryStart: 100,
    batteryEnd: 8,
    batteryConsumed: 92,
    farm: 'Riverside Agricultural',
    status: 'completed'
  },
  {
    id: 'FLT-006',
    droneId: 'DJI-005',
    droneName: 'Agras T40-Epsilon',
    startTime: '2025-01-04T13:20:00',
    endTime: '2025-01-04T14:45:00',
    duration: 85,
    batteryStart: 100,
    batteryEnd: 42,
    batteryConsumed: 58,
    farm: 'Oakwood Estates',
    status: 'completed'
  },
  {
    id: 'FLT-007',
    droneId: 'DJI-001',
    droneName: 'Agras T40-Alpha',
    startTime: '2025-01-04T09:00:00',
    endTime: '2025-01-04T10:15:00',
    duration: 75,
    batteryStart: 98,
    batteryEnd: 38,
    batteryConsumed: 60,
    farm: 'Greenfield Farms North',
    status: 'aborted'
  },
  {
    id: 'FLT-008',
    droneId: 'DJI-003',
    droneName: 'Agras T40-Gamma',
    startTime: '2025-01-04T08:30:00',
    endTime: '2025-01-04T11:00:00',
    duration: 150,
    batteryStart: 100,
    batteryEnd: 15,
    batteryConsumed: 85,
    farm: 'Summit Valley Organics',
    status: 'completed'
  },
  {
    id: 'FLT-009',
    droneId: 'DJI-006',
    droneName: 'Agras T40-Zeta',
    startTime: '2025-01-03T15:45:00',
    endTime: '2025-01-03T17:30:00',
    duration: 105,
    batteryStart: 100,
    batteryEnd: 25,
    batteryConsumed: 75,
    farm: 'Prairie Fields Co-op',
    status: 'completed'
  },
  {
    id: 'FLT-010',
    droneId: 'DJI-002',
    droneName: 'Agras T40-Beta',
    startTime: '2025-01-03T10:00:00',
    endTime: '2025-01-03T12:45:00',
    duration: 165,
    batteryStart: 95,
    batteryEnd: 5,
    batteryConsumed: 90,
    farm: 'Riverside Agricultural',
    status: 'completed'
  }
];

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'ACT-001',
    type: 'mission_complete',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    message: 'Successfully completed spray mission covering 45 acres',
    droneId: 'DJI-001',
    droneName: 'Agras T40-Alpha',
  },
  {
    id: 'ACT-002',
    type: 'alert',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    message: 'GPS signal loss reported - drone returning to base',
    droneId: 'DJI-004',
    droneName: 'Agras T40-Delta',
    severity: 'high',
  },
  {
    id: 'ACT-003',
    type: 'status_change',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    message: 'Drone status changed from idle to active - mission started',
    droneId: 'DJI-003',
    droneName: 'Agras T40-Gamma',
  },
  {
    id: 'ACT-004',
    type: 'battery_warning',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    message: 'Battery level below 15% - initiating return to charging station',
    droneId: 'DJI-004',
    droneName: 'Agras T40-Delta',
    severity: 'medium',
  },
  {
    id: 'ACT-005',
    type: 'station_update',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    message: 'Charging station North Sector Beta now available',
    stationId: 'Station A-2',
  },
  {
    id: 'ACT-006',
    type: 'mission_complete',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    message: 'Field mapping mission completed - data uploaded successfully',
    droneId: 'DJI-006',
    droneName: 'Agras T40-Zeta',
  },
  {
    id: 'ACT-007',
    type: 'maintenance',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    message: 'Scheduled maintenance started - estimated completion in 2 hours',
    droneId: 'DJI-004',
    droneName: 'Agras T40-Delta',
    severity: 'low',
  },
  {
    id: 'ACT-008',
    type: 'alert',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    message: 'Motor overheating detected - immediate service required',
    droneId: 'DJI-004',
    droneName: 'Agras T40-Delta',
    severity: 'critical',
  },
  {
    id: 'ACT-009',
    type: 'status_change',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    message: 'Drone entered charging mode - battery at 45%',
    droneId: 'DJI-002',
    droneName: 'Agras T40-Beta',
  },
  {
    id: 'ACT-010',
    type: 'mission_complete',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    message: 'Pest detection survey completed - 12 areas flagged for treatment',
    droneId: 'DJI-005',
    droneName: 'Agras T40-Epsilon',
  },
  {
    id: 'ACT-011',
    type: 'station_update',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    message: 'East Sector Beta station entered maintenance mode',
    stationId: 'Station B-2',
  },
  {
    id: 'ACT-012',
    type: 'battery_warning',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    message: 'Battery efficiency below optimal threshold - calibration recommended',
    droneId: 'DJI-006',
    droneName: 'Agras T40-Zeta',
    severity: 'medium',
  },
  {
    id: 'ACT-013',
    type: 'status_change',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    message: 'Drone completed charging - battery at 100%',
    droneId: 'DJI-005',
    droneName: 'Agras T40-Epsilon',
  },
  {
    id: 'ACT-014',
    type: 'alert',
    timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    message: 'Spray nozzle calibration recommended after 50 flight hours',
    droneId: 'DJI-002',
    droneName: 'Agras T40-Beta',
    severity: 'low',
  },
  {
    id: 'ACT-015',
    type: 'mission_complete',
    timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    message: 'Early morning irrigation survey completed successfully',
    droneId: 'DJI-001',
    droneName: 'Agras T40-Alpha',
  },
];
