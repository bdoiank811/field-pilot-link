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

export const DroneMap = ({ drones }: DroneMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Calculate center point
    const center: [number, number] = drones.length > 0
      ? [
          drones.reduce((sum, d) => sum + d.location.lat, 0) / drones.length,
          drones.reduce((sum, d) => sum + d.location.lng, 0) / drones.length
        ]
      : [40.7128, -74.006];

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

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

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

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
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all drones
    if (drones.length > 0) {
      const bounds = L.latLngBounds(
        drones.map(drone => [drone.location.lat, drone.location.lng] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [drones]);

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
