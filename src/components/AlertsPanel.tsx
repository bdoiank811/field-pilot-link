import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Drone } from '@/types/drone';

interface AlertsPanelProps {
  drones: Drone[];
}

export const AlertsPanel = ({ drones }: AlertsPanelProps) => {
  const allIssues = drones.flatMap(drone => 
    drone.issues.map(issue => ({ ...issue, droneName: drone.name, droneId: drone.id }))
  );

  const sortedIssues = allIssues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-destructive/80 text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Hardware Alerts
          {sortedIssues.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {sortedIssues.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedIssues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
            <p>All systems operational</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedIssues.map((issue) => {
              const Icon = getIcon(issue.severity);
              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {issue.droneName} ({issue.droneId})
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{issue.description}</p>
                      <p className="text-xs text-muted-foreground">{issue.timestamp}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
