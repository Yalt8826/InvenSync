
import { Card } from "@/components/ui/card";
import {
  BarChart as ChartIcon,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isWarning?: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, isPositive, isWarning, icon }: MetricCardProps) => (
  <Card className="metric-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        <div className="flex items-center mt-2">
          {isWarning ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
          ) : isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span 
            className={`text-sm ${
              isWarning 
                ? "text-yellow-600" 
                : isPositive 
                  ? "text-green-600" 
                  : "text-red-600"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      <div className="p-2 bg-primary/10 rounded-full">
        {icon}
      </div>
    </div>
  </Card>
);

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Products"
        value="1,284"
        change="12% from last month"
        isPositive
        icon={<ChartIcon className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Low Stock Items"
        value="32"
        change="8 more than yesterday"
        isWarning
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
      />
      <MetricCard
        title="Monthly Revenue"
        value="$48,573"
        change="18% from last month"
        isPositive
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Stock Value"
        value="$245,890"
        change="2% from last week"
        isPositive
        icon={<ChartIcon className="h-6 w-6 text-primary" />}
      />
    </div>
  );
};

export default DashboardMetrics;
