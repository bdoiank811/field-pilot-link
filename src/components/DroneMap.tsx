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
  selectedDroneId?: string | null;
  onDroneClick?: (droneId: string) => void;
}

// Custom icons for different drone statuses
const createDroneIcon = (status: string) => {
  const colors = {
    active: '#16a34a',
    charging: '#0891b2',
    maintenance: '#dc2626',
    idle: '#6b7280'
  };

  const color = colors[status as keyof typeof colors] || colors.idle;

  return L.divIcon({
    className: 'custom-drone-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: 16px;
        ">✈</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getBatteryColor = (level: number) => {
  if (level >= 60) return '#16a34a';
  if (level >= 30) return '#eab308';
  return '#dc2626';
};

export const DroneMap = ({ drones, flightPaths = {}, selectedDroneId = null, onDroneClick }: DroneMapProps) => {
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

        const marker = L.marker([drone.location.lat, drone.location.lng], {
          icon: createDroneIcon(drone.status)
        }).addTo(mapRef.current);

        const statusColors = {
          active: '#16a34a',
          charging: '#0891b2',
          maintenance: '#dc2626',
          idle: '#6b7280'
        };

        const statusColor = statusColors[drone.status as keyof typeof statusColors];

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
                ${selectedDroneId === drone.id ? 'Hide' : 'Show'} Flight Path
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

      // Draw flight path for selected drone
      if (selectedDroneId && flightPaths[selectedDroneId] && flightPaths[selectedDroneId].length > 1) {
        const path = flightPaths[selectedDroneId];
        const drone = drones.find(d => d.id === selectedDroneId);
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
  }, [drones, flightPaths, selectedDroneId, onDroneClick]);

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
