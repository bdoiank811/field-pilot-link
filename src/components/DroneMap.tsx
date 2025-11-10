import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone } from '@/types/drone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DroneMapProps {
  drones: Drone[];
  flightPaths?: Record<string, Array<[number, number]>>;
  selectedDroneIds?: string[];
  onDroneClick?: (droneId: string) => void;
}

// Custom icons for different drone statuses
const createDroneIcon = (status: string, isTracked: boolean = false) => {
  const colors = {
    active: '#16a34a',
    charging: '#0891b2',
    maintenance: '#dc2626',
    idle: '#6b7280'
  };

  const color = colors[status as keyof typeof colors] || colors.idle;
  const size = isTracked ? 44 : 32;
  const iconFontSize = isTracked ? 22 : 16;
  const borderWidth = isTracked ? 4 : 3;

  return L.divIcon({
    className: 'custom-drone-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${borderWidth}px solid white;
        box-shadow: 0 ${isTracked ? 4 : 2}px ${isTracked ? 12 : 8}px rgba(0,0,0,${isTracked ? 0.4 : 0.3});
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

export const DroneMap = ({ drones, flightPaths = {}, selectedDroneIds = [], onDroneClick }: DroneMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

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

      // Add markers for each drone
      drones.forEach((drone) => {
        if (!mapRef.current) return;

        const isTracked = selectedDroneIds.includes(drone.id);
        const marker = L.marker([drone.location.lat, drone.location.lng], {
          icon: createDroneIcon(drone.status, isTracked)
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
                <strong style="color: #1f2937;">Station:</strong> ${drone.station}
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
          const statusColors = {
            active: '#16a34a',
            charging: '#0891b2',
            maintenance: '#dc2626',
            idle: '#6b7280'
          };
          const color = drone ? statusColors[drone.status as keyof typeof statusColors] : '#6b7280';
          
          const polyline = L.polyline(path, {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 10',
          }).addTo(mapRef.current);
          
          polylinesRef.current.push(polyline);
        }
      });

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
  }, [drones, flightPaths, selectedDroneIds, onDroneClick]);

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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Live Drone Locations
          <Badge variant="secondary" className="ml-auto">
            {drones.length} Tracked
          </Badge>
        </CardTitle>
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
