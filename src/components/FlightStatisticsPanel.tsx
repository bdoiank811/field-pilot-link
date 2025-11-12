import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Drone } from "@/types/drone";
import { StatusBadge } from "./StatusBadge";

interface FlightStatisticsPanelProps {
  drones: Drone[];
  flightPaths: Record<string, Array<[number, number]>>;
  selectedDroneIds: string[];
}

// Calculate distance between two coordinates using Haversine formula (in km)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate flight statistics
const calculateFlightStats = (path: Array<[number, number]>) => {
  if (path.length < 2) {
    return { distance: 0, flightTime: 0, avgSpeed: 0 };
  }

  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += calculateDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
  }

  // Assuming 2 second intervals between points
  const flightTime = (path.length - 1) * 2 / 60; // in minutes
  const avgSpeed = flightTime > 0 ? (totalDistance / flightTime) * 60 : 0; // km/h

  return {
    distance: totalDistance,
    flightTime: flightTime,
    avgSpeed: avgSpeed
  };
};

export const FlightStatisticsPanel = ({ drones, flightPaths, selectedDroneIds }: FlightStatisticsPanelProps) => {
  const trackedDrones = drones.filter(drone => selectedDroneIds.includes(drone.id));

  if (trackedDrones.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Flight Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No drones are currently being tracked. Click on a drone to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Flight Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Avg Speed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackedDrones.map(drone => {
              const stats = flightPaths[drone.id] 
                ? calculateFlightStats(flightPaths[drone.id])
                : { distance: 0, flightTime: 0, avgSpeed: 0 };
              
              return (
                <TableRow key={drone.id}>
                  <TableCell className="font-medium">{drone.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={drone.status} />
                  </TableCell>
                  <TableCell className="text-right">{stats.distance.toFixed(2)} km</TableCell>
                  <TableCell className="text-right">{stats.flightTime.toFixed(1)} min</TableCell>
                  <TableCell className="text-right">{stats.avgSpeed.toFixed(1)} km/h</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
