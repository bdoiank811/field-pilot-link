import { useState, useEffect } from 'react';
import { DroneCard } from '@/components/DroneCard';
import { StationCard } from '@/components/StationCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { DashboardStats } from '@/components/DashboardStats';
import { DroneMap } from '@/components/DroneMap';
import { FlightHistory } from '@/components/FlightHistory';
import { ActivityFeed } from '@/components/ActivityFeed';
import { mockDrones, mockStations, mockFlightMissions, mockActivityEvents } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plane, Play, Pause } from 'lucide-react';
import { Drone } from '@/types/drone';

const Index = () => {
  const [drones, setDrones] = useState(mockDrones);
  const [stations] = useState(mockStations);
  const [missions] = useState(mockFlightMissions);
  const [activityEvents] = useState(mockActivityEvents);
  const [activeTab, setActiveTab] = useState('drones');
  const [isSimulating, setIsSimulating] = useState(false);

  // Drone tracking simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setDrones(prevDrones => 
        prevDrones.map(drone => {
          // Only move active drones
          if (drone.status !== 'active') return drone;

          // Generate small random movement
          const latChange = (Math.random() - 0.5) * 0.002; // ~200m
          const lngChange = (Math.random() - 0.5) * 0.002;

          return {
            ...drone,
            location: {
              lat: drone.location.lat + latChange,
              lng: drone.location.lng + lngChange,
            },
            // Gradually decrease battery for active drones
            battery: Math.max(0, drone.battery - 0.1),
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleStatClick = (statType: 'active' | 'battery' | 'issues' | 'charging') => {
    switch (statType) {
      case 'active':
      case 'battery':
      case 'charging':
        setActiveTab('drones');
        break;
      case 'issues':
        setActiveTab('alerts');
        break;
    }
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      // Reset to original positions when stopping
      setDrones(mockDrones);
    }
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  SmartFarm Drone Fleet Manager
                </h1>
                <p className="text-sm text-muted-foreground">
                  Field Engineer Dashboard - Real-time monitoring and control
                </p>
              </div>
            </div>
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
                  Start Tracking Simulation
                </>
              )}
            </Button>
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
              {drones.map((drone) => (
                <DroneCard key={drone.id} drone={drone} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <DroneMap drones={drones} />
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
