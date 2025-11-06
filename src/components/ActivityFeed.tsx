import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ActivityEvent } from '@/types/drone';
import { Activity, AlertTriangle, CheckCircle2, Plug, Battery, Wrench, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export const ActivityFeed = ({ events }: ActivityFeedProps) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return Activity;
      case 'alert':
        return AlertTriangle;
      case 'mission_complete':
        return CheckCircle2;
      case 'station_update':
        return Plug;
      case 'battery_warning':
        return Battery;
      case 'maintenance':
        return Wrench;
      default:
        return Radio;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (severity) {
      switch (severity) {
        case 'critical':
          return 'text-destructive';
        case 'high':
          return 'text-warning';
        case 'medium':
          return 'text-secondary';
        case 'low':
          return 'text-muted-foreground';
      }
    }
    
    switch (type) {
      case 'status_change':
        return 'text-primary';
      case 'alert':
        return 'text-warning';
      case 'mission_complete':
        return 'text-success';
      case 'station_update':
        return 'text-secondary';
      case 'battery_warning':
        return 'text-warning';
      case 'maintenance':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;

    const colors = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      medium: 'bg-secondary/10 text-secondary border-secondary/20',
      low: 'bg-muted text-muted-foreground border-muted',
    };

    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity}
      </Badge>
    );
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Live Activity Feed
        </CardTitle>
        <CardDescription>
          Real-time updates from your drone fleet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            ) : (
              sortedEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                const color = getEventColor(event.type, event.severity);
                
                return (
                  <div
                    key={event.id}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-full bg-accent`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {event.message}
                        </p>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                        {event.droneName && (
                          <>
                            <span>•</span>
                            <span>{event.droneName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
