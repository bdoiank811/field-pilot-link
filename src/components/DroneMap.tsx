import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone, ChargingStation } from '@/types/drone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Radio } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DroneMapProps {
  drones: Drone[];
  stations: ChargingStation[];
  stationColors: Record<string, string>;
  flightPaths?: Record<string, Array<[number, number]>>;
  selectedDroneIds?: string[];
  onDroneClick?: (droneId: string) => void;
}

// Custom icons for different drone statuses with station color outline
const createDroneIcon = (status: string, stationColor: string, isTracked: boolean = false) => {
  const colors = {
    active: '#16a34a',
    charging: '#0891b2',
    maintenance: '#dc2626',
    idle: '#6b7280'
  };

  const color = colors[status as keyof typeof colors] || colors.idle;
  const size = isTracked ? 44 : 32;
  const iconFontSize = isTracked ? 22 : 16;
  const innerBorderWidth = 2;
  const outerBorderWidth = 3;

  return L.divIcon({
    className: 'custom-drone-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${innerBorderWidth}px solid white;
        box-shadow: 0 0 0 ${outerBorderWidth}px ${stationColor}, 0 ${isTracked ? 4 : 2}px ${isTracked ? 12 : 8}px rgba(0,0,0,${isTracked ? 0.4 : 0.3});
        ${isTracked ? 'animation: pulse 2s infinite;' : ''}
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: ${iconFontSize}px;
          font-weight: ${isTracked ? 'bold' : 'normal'};
        ">✈</div>
      </div>
      ${isTracked ? `<style>
        @keyframes pulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.1); }
        }
      </style>` : ''}
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Custom station icon
const createStationIcon = (stationColor: string, status: string) => {
  const statusIcons = {
    available: '✓',
    charging: '⚡',
    maintenance: '🔧'
  };

  const icon = statusIcons[status as keyof typeof statusIcons] || '📍';

  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        background-color: ${stationColor};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 20px;
          font-weight: bold;
        ">${icon}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const getBatteryColor = (level: number) => {
  if (level >= 60) return '#16a34a';
  if (level >= 30) return '#eab308';
  return '#dc2626';
};

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

export const DroneMap = ({ 
  drones, 
  stations, 
  stationColors, 
  flightPaths = {}, 
  selectedDroneIds = [], 
  onDroneClick 
}: DroneMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const stationMarkersRef = useRef<L.Marker[]>([]);
  const [showStations, setShowStations] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Prevent duplicate map initialization
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Calculate center point - default to rural Armenia
    const center: [number, number] = drones.length > 0
      ? [
          drones.reduce((sum, d) => sum + d.location.lat, 0) / drones.length,
          drones.reduce((sum, d) => sum + d.location.lng, 0) / drones.length
        ]
      : [40.0691, 45.0382];

    // Initialize map
    try {
      mapRef.current = L.map(mapContainerRef.current).setView(center, 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Clear existing markers and polylines
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      polylinesRef.current.forEach(polyline => polyline.remove());
      polylinesRef.current = [];
      stationMarkersRef.current.forEach(marker => marker.remove());
      stationMarkersRef.current = [];

      // Add markers for each drone
      drones.forEach((drone) => {
        if (!mapRef.current) return;

        const isTracked = selectedDroneIds.includes(drone.id);
        const stationColor = stationColors[drone.station] || '#6b7280';
        const marker = L.marker([drone.location.lat, drone.location.lng], {
          icon: createDroneIcon(drone.status, stationColor, isTracked)
        }).addTo(mapRef.current);

        const statusColors = {
          active: '#16a34a',
          charging: '#0891b2',
          maintenance: '#dc2626',
          idle: '#6b7280'
        };

        const statusColor = statusColors[drone.status as keyof typeof statusColors];

        // Calculate flight statistics if tracked
        const flightStats = isTracked && flightPaths[drone.id]
          ? calculateFlightStats(flightPaths[drone.id])
          : null;

        // Create popup content
        const popupContent = `
        <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">${drone.name}</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #6b7280;">Status:</span>
              <span style="
                background-color: ${statusColor};
                color: white;
                padding: 4px 12px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
              ">${drone.status.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #6b7280;">Battery:</span>
              <span style="
                color: ${getBatteryColor(drone.battery)};
                font-weight: 600;
                font-size: 14px;
              ">${drone.battery}%</span>
            </div>
            <div style="padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">
                <strong style="color: #1f2937;">Farm:</strong> ${drone.farm}
              </p>
              <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">
                <strong style="color: #1f2937;">Station:</strong> 
                <span style="
                  display: inline-block;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: ${stationColor};
                  margin: 0 4px;
                "></span>
                ${drone.station}
              </p>
              <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">
                <strong style="color: #1f2937;">Location:</strong> ${drone.location.lat.toFixed(4)}, ${drone.location.lng.toFixed(4)}
              </p>
            </div>
            ${drone.issues.length > 0 ? `
              <div style="padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; font-weight: 600; color: #dc2626;">
                  ⚠️ ${drone.issues.length} Hardware Issue${drone.issues.length > 1 ? 's' : ''}
                </p>
              </div>
            ` : ''}
            ${flightStats ? `
              <div style="padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">
                  📊 Flight Statistics
                </p>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 13px; color: #6b7280;">Distance:</span>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${flightStats.distance.toFixed(2)} km</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 13px; color: #6b7280;">Flight Time:</span>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${flightStats.flightTime.toFixed(1)} min</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 13px; color: #6b7280;">Avg Speed:</span>
                    <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${flightStats.avgSpeed.toFixed(1)} km/h</span>
                  </div>
                </div>
              </div>
            ` : ''}
            <div style="padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <button 
                onclick="window.droneClickHandler('${drone.id}')"
                style="
                  width: 100%;
                  padding: 8px 16px;
                  background-color: ${statusColor};
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                "
              >
                ${isTracked ? 'Untrack' : 'Track'} Flight Path
              </button>
            </div>
          </div>
        </div>
        `;

        marker.bindPopup(popupContent);
        
        // Add click handler for the marker itself
        marker.on('click', () => {
          if (onDroneClick) {
            onDroneClick(drone.id);
          }
        });
        
        markersRef.current.push(marker);
      });

      // Draw flight paths for all selected drones
      selectedDroneIds.forEach(droneId => {
        if (flightPaths[droneId] && flightPaths[droneId].length > 1 && mapRef.current) {
          const path = flightPaths[droneId];
          const drone = drones.find(d => d.id === droneId);
          const color = drone ? stationColors[drone.station] : '#3b82f6';
          
          const polyline = L.polyline(path, {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 10',
          }).addTo(mapRef.current);
          
          polylinesRef.current.push(polyline);
        }
      });

      // Add station markers if showStations is true
      if (showStations) {
        stations.forEach((station) => {
          if (!mapRef.current) return;
          
          const color = stationColors[station.id] || '#6b7280';
          const icon = createStationIcon(color, station.status);
          
          const marker = L.marker([station.location.lat, station.location.lng], { icon })
            .addTo(mapRef.current);

          const assignedDrone = drones.find(d => d.id === station.assignedDrone);

          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${color};">${station.name}</h3>
              <div style="margin-bottom: 4px;">
                <strong>ID:</strong> ${station.id}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Status:</strong> 
                <span style="
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 11px;
                  background: ${station.status === 'available' ? '#16a34a' : station.status === 'charging' ? '#0891b2' : '#dc2626'};
                  color: white;
                ">${station.status.toUpperCase()}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <strong>Capacity:</strong> ${station.capacity} drones
              </div>
              ${assignedDrone ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <strong>Assigned Drone:</strong><br/>
                  ${assignedDrone.name}
                </div>
              ` : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          stationMarkersRef.current.push(marker);
        });
      }

      // Fit bounds to show all drones
      if (drones.length > 0) {
        const bounds = L.latLngBounds(
          drones.map(drone => [drone.location.lat, drone.location.lng] as [number, number])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }, [drones, flightPaths, selectedDroneIds, onDroneClick, stations, stationColors, showStations]);

  // Set up global click handler for popup buttons
  useEffect(() => {
    (window as any).droneClickHandler = (droneId: string) => {
      if (onDroneClick) {
        onDroneClick(droneId);
      }
    };
    
    return () => {
      delete (window as any).droneClickHandler;
    };
  }, [onDroneClick]);

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Live Drone Tracking Map</CardTitle>
          </div>
          <Button
            variant={showStations ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStations(!showStations)}
            className="gap-2"
          >
            <Radio className="h-4 w-4" />
            {showStations ? 'Hide' : 'Show'} Stations
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(stationColors).map(([stationId, color]) => (
            <Badge 
              key={stationId} 
              variant="outline"
              style={{ borderColor: color, color: color }}
            >
              <span 
                style={{ 
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: '6px'
                }}
              />
              {stationId}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainerRef} 
          className="h-[600px] w-full"
          style={{ zIndex: 0 }}
        />
      </CardContent>
    </Card>
  );
};
