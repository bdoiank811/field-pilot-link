import { useState } from 'react';
import { DroneCard } from '@/components/DroneCard';
import { StationCard } from '@/components/StationCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { DashboardStats } from '@/components/DashboardStats';
import { DroneMap } from '@/components/DroneMap';
import { mockDrones, mockStations } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane } from 'lucide-react';

const Index = () => {
  const [drones] = useState(mockDrones);
  const [stations] = useState(mockStations);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <DashboardStats drones={drones} />

        {/* Tabs */}
        <Tabs defaultValue="drones" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="drones">Drones</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
