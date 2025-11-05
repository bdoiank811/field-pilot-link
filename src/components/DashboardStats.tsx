import { Card, CardContent } from '@/components/ui/card';
import { Activity, Battery, AlertTriangle, Plug } from 'lucide-react';
import { Drone } from '@/types/drone';

interface DashboardStatsProps {
  drones: Drone[];
}

export const DashboardStats = ({ drones }: DashboardStatsProps) => {
  const activeDrones = drones.filter(d => d.status === 'active').length;
  const avgBattery = Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length);
  const totalIssues = drones.reduce((sum, d) => sum + d.issues.length, 0);
  const chargingDrones = drones.filter(d => d.status === 'charging').length;

  const stats = [
    {
      label: 'Active Drones',
      value: activeDrones,
      icon: Activity,
      color: 'text-success'
    },
    {
      label: 'Avg Battery',
      value: `${avgBattery}%`,
      icon: Battery,
      color: 'text-secondary'
    },
    {
      label: 'Active Issues',
      value: totalIssues,
      icon: AlertTriangle,
      color: totalIssues > 0 ? 'text-warning' : 'text-muted-foreground'
    },
    {
      label: 'Charging',
      value: chargingDrones,
      icon: Plug,
      color: 'text-secondary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
