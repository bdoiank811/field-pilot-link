import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

interface BatteryIndicatorProps {
  level: number;
}

export const BatteryIndicator = ({ level }: BatteryIndicatorProps) => {
  const getIcon = () => {
    if (level >= 80) return BatteryFull;
    if (level >= 40) return BatteryMedium;
    if (level >= 20) return BatteryLow;
    return Battery;
  };

  const getColor = () => {
    if (level >= 60) return 'text-success';
    if (level >= 30) return 'text-warning';
    return 'text-destructive';
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${getColor()}`} />
      <span className={`font-semibold ${getColor()}`}>{level}%</span>
    </div>
  );
};
