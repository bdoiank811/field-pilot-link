import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FlightMission } from '@/types/drone';
import { Clock, Battery, Calendar } from 'lucide-react';

interface FlightHistoryProps {
  missions: FlightMission[];
}

export const FlightHistory = ({ missions }: FlightHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'aborted':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'emergency':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const sortedMissions = [...missions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Flight History
        </CardTitle>
        <CardDescription>
          Complete log of all drone missions with performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drone</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Battery Used</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No flight history available
                  </TableCell>
                </TableRow>
              ) : (
                sortedMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">{mission.droneName}</TableCell>
                    <TableCell>{mission.farm}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(mission.startTime).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{mission.duration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{mission.batteryConsumed}%</span>
                        <span className="text-xs text-muted-foreground">
                          ({mission.batteryStart}% → {mission.batteryEnd}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(mission.status)}>
                        {mission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
