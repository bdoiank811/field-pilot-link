import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Drone } from '@/types/drone';
import { StatusBadge } from './StatusBadge';
import { BatteryIndicator } from './BatteryIndicator';
import { MapPin, Building2, Clock, AlertTriangle } from 'lucide-react';

interface DroneCardProps {
  drone: Drone;
}

export const DroneCard = ({ drone }: DroneCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{drone.name}</h3>
            <p className="text-sm text-muted-foreground">{drone.id}</p>
          </div>
          <StatusBadge status={drone.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Battery</span>
          <BatteryIndicator level={drone.battery} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Farm:</span>
            <span className="font-medium text-foreground">{drone.farm}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Station:</span>
            <span className="font-medium text-foreground">{drone.station}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last Active:</span>
            <span className="font-medium text-foreground">{drone.lastActivity}</span>
          </div>
        </div>

        {drone.issues.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                {drone.issues.length} Issue{drone.issues.length > 1 ? 's' : ''}
              </span>
            </div>
            {drone.issues.map((issue) => (
              <Badge
                key={issue.id}
                variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'secondary'}
                className="text-xs mr-1 mb-1"
              >
                {issue.severity}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
