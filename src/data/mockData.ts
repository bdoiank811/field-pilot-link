import { Drone, ChargingStation } from '@/types/drone';

export const mockDrones: Drone[] = [
  {
    id: 'DJI-001',
    name: 'Agras T40-Alpha',
    status: 'active',
    battery: 78,
    location: { lat: 40.7128, lng: -74.006 },
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
    location: { lat: 40.7228, lng: -74.016 },
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
    location: { lat: 40.7328, lng: -74.026 },
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
    location: { lat: 40.7428, lng: -74.036 },
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
    location: { lat: 40.7528, lng: -74.046 },
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
    location: { lat: 40.7628, lng: -74.056 },
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
