import { useState, useEffect } from 'react';
import { DroneCard } from '@/components/DroneCard';
import { StationCard } from '@/components/StationCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { DashboardStats } from '@/components/DashboardStats';
import { DroneMap } from '@/components/DroneMap';
import { FlightHistory } from '@/components/FlightHistory';
import { ActivityFeed } from '@/components/ActivityFeed';
import { FlightStatisticsPanel } from '@/components/FlightStatisticsPanel';
import { mockDrones, mockStations, mockFlightMissions, mockActivityEvents, stationColors } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Drone } from '@/types/drone';
import aerolinkLogo from '@/assets/aerolink-logo.jpeg';

const Index = () => {
  // Initialize drones with randomized positions for active drones, station positions for others
  const [drones, setDrones] = useState(() => {
    return mockDrones.map(drone => {
      if (drone.status === 'active' && drone.issues.length === 0) {
        // Randomize position for active drones without issues
        const baseLat = 40.0691;
        const baseLng = 45.0382;
        const randomLat = baseLat + (Math.random() - 0.5) * 0.08;
        const randomLng = baseLng + (Math.random() - 0.5) * 0.08;
        return {
          ...drone,
          location: { lat: randomLat, lng: randomLng }
        };
      }
      return drone;
    });
  });
  const [stations] = useState(mockStations);
  const [missions] = useState(mockFlightMissions);
  const [activityEvents] = useState(mockActivityEvents);
  const [activeTab, setActiveTab] = useState('drones');
  const [isSimulating, setIsSimulating] = useState(false);
  const [flightPaths, setFlightPaths] = useState<Record<string, Array<[number, number]>>>({});
  const [selectedDroneIds, setSelectedDroneIds] = useState<string[]>([]);
  const [dronePatterns, setDronePatterns] = useState<Record<string, { corners: Array<[number, number]>, currentCorner: number }>>();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Initialize square flight patterns for each drone
  useEffect(() => {
    if (!isSimulating || dronePatterns) return;

    const patterns: Record<string, { corners: Array<[number, number]>, currentCorner: number }> = {};
    
    drones.forEach(drone => {
      if (drone.status === 'active' && drone.issues.length === 0) {
        // Create a square pattern around the starting position
        const size = 0.004; // Size of the square (~400m per side)
        const { lat, lng } = drone.location;
        
        patterns[drone.id] = {
          corners: [
            [lat, lng],
            [lat + size, lng],
            [lat + size, lng + size],
            [lat, lng + size],
            [lat, lng] // Return to start
          ],
          currentCorner: 0
        };
      }
    });
    
    setDronePatterns(patterns);
  }, [isSimulating, drones]);

  // Drone tracking simulation with square pattern
  useEffect(() => {
    if (!isSimulating || !dronePatterns) return;

    const interval = setInterval(() => {
      setDrones(prevDrones => 
        prevDrones.map(drone => {
          // Only move active drones with no issues
          if (drone.status !== 'active' || drone.issues.length > 0 || !dronePatterns[drone.id]) return drone;

          const pattern = dronePatterns[drone.id];
          const currentCorner = pattern.corners[pattern.currentCorner];
          const nextCorner = pattern.corners[(pattern.currentCorner + 1) % pattern.corners.length];

          // Calculate direction to next corner
          const latDiff = nextCorner[0] - drone.location.lat;
          const lngDiff = nextCorner[1] - drone.location.lng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

          // Move towards next corner
          const step = 0.0002; // Step size per update
          let newLat = drone.location.lat;
          let newLng = drone.location.lng;

          if (distance < step) {
            // Reached corner, move to next one
            newLat = nextCorner[0];
            newLng = nextCorner[1];
            pattern.currentCorner = (pattern.currentCorner + 1) % pattern.corners.length;
          } else {
            // Move towards corner
            newLat += (latDiff / distance) * step;
            newLng += (lngDiff / distance) * step;
          }

          return {
            ...drone,
            location: {
              lat: newLat,
              lng: newLng,
            },
            // Gradually decrease battery for active drones
            battery: Math.max(0, drone.battery - 0.05),
          };
        })
      );

      // Update flight paths only for tracked drones
      setFlightPaths(prevPaths => {
        const newPaths = { ...prevPaths };
        drones.forEach(drone => {
          if (drone.status === 'active' && selectedDroneIds.includes(drone.id)) {
            const path = newPaths[drone.id] || [];
            newPaths[drone.id] = [...path, [drone.location.lat, drone.location.lng]];
            // Keep only last 200 positions
            if (newPaths[drone.id].length > 200) {
              newPaths[drone.id] = newPaths[drone.id].slice(-200);
            }
          }
        });
        return newPaths;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isSimulating, drones, dronePatterns, selectedDroneIds]);

  const handleStatClick = (statType: 'active' | 'battery' | 'issues' | 'charging') => {
    switch (statType) {
      case 'active':
        setActiveTab('drones');
        setStatusFilter(prev => prev === 'active' ? null : 'active');
        break;
      case 'battery':
        setActiveTab('drones');
        setStatusFilter(null);
        break;
      case 'charging':
        setActiveTab('drones');
        setStatusFilter(prev => prev === 'charging' ? null : 'charging');
        break;
      case 'issues':
        setActiveTab('alerts');
        setStatusFilter(null);
        break;
    }
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      // Reset to original positions when stopping
      setDrones(mockDrones);
      setDronePatterns(undefined);
      // Keep flight paths visible
    }
    setIsSimulating(!isSimulating);
  };

  const handleDroneClick = (droneId: string) => {
    setSelectedDroneIds(prev => {
      if (prev.includes(droneId)) {
        // Untrack: remove from array and clear its flight path
        setFlightPaths(prevPaths => {
          const newPaths = { ...prevPaths };
          delete newPaths[droneId];
          return newPaths;
        });
        return prev.filter(id => id !== droneId);
      } else {
        // Track: add to array
        return [...prev, droneId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <img src={aerolinkLogo} alt="AeroLink Technologies" className="h-16 w-auto" />
            </div>
            
            {/* Centered title and subtitle */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-primary">
                SmartFarm Drone Fleet Manager
              </h1>
              <p className="text-sm text-primary/80">
                Field Engineer Dashboard - Real-time monitoring and control
              </p>
            </div>
            
            {/* Simulation button on the right */}
            <div className="flex-shrink-0">
              <Button
                onClick={toggleSimulation}
                variant={isSimulating ? "destructive" : "default"}
                className="gap-2"
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Simulation
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <DashboardStats drones={drones} onStatClick={handleStatClick} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Main content with tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="drones">Drones</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="stations">Stations</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

          <TabsContent value="drones" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drones
                .filter(drone => statusFilter ? drone.status === statusFilter : true)
                .map((drone) => (
                  <DroneCard key={drone.id} drone={drone} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <div className="space-y-6">
              <DroneMap 
                drones={drones}
                stations={stations}
                stationColors={stationColors}
                flightPaths={flightPaths}
                selectedDroneIds={selectedDroneIds}
                onDroneClick={handleDroneClick}
              />
              <FlightStatisticsPanel 
                drones={drones}
                flightPaths={flightPaths}
                selectedDroneIds={selectedDroneIds}
              />
            </div>
          </TabsContent>

          <TabsContent value="stations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <AlertsPanel drones={drones} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <FlightHistory missions={missions} />
          </TabsContent>
            </Tabs>
          </div>

          {/* Right side - Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed events={activityEvents} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
