import { Badge } from '@/components/ui/badge';
import { DroneStatus } from '@/types/drone';
import { Activity, Battery, Wrench, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: DroneStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const configs = {
    active: {
      icon: Activity,
      label: 'Active',
      variant: 'default' as const,
      className: 'bg-success text-success-foreground'
    },
    charging: {
      icon: Battery,
      label: 'Charging',
      variant: 'secondary' as const,
      className: 'bg-secondary text-secondary-foreground'
    },
    maintenance: {
      icon: Wrench,
      label: 'Maintenance',
      variant: 'destructive' as const,
      className: 'bg-destructive text-destructive-foreground'
    },
    idle: {
      icon: Circle,
      label: 'Idle',
      variant: 'outline' as const,
      className: 'border-muted-foreground/30 text-muted-foreground'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-1.5`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
