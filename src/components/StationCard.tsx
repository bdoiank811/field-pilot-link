import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChargingStation } from '@/types/drone';
import { Plug, CheckCircle, Wrench } from 'lucide-react';

interface StationCardProps {
  station: ChargingStation;
}

export const StationCard = ({ station }: StationCardProps) => {
  const statusConfig = {
    available: {
      icon: CheckCircle,
      label: 'Available',
      className: 'bg-success text-success-foreground'
    },
    charging: {
      icon: Plug,
      label: 'Charging',
      className: 'bg-secondary text-secondary-foreground'
    },
    maintenance: {
      icon: Wrench,
      label: 'Maintenance',
      className: 'bg-destructive text-destructive-foreground'
    }
  };

  const config = statusConfig[station.status];
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base text-foreground">{station.name}</h3>
            <p className="text-xs text-muted-foreground">{station.id}</p>
          </div>
          <Badge className={`${config.className} flex items-center gap-1.5`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="font-medium text-foreground">{station.capacity} drones</span>
        </div>
        {station.assignedDrone && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assigned:</span>
            <span className="font-medium text-foreground">{station.assignedDrone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
