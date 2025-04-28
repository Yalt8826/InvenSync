import { Card } from "@/components/ui/card";
import {
  BarChart as ChartIcon,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Package2, // Import Package2 for Total Stock icon
} from "lucide-react";
import { getItemsData } from "@/api-reqs/items";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  isWarning?: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({
  title,
  value,
  change,
  isPositive,
  isWarning,
  icon,
}: MetricCardProps) => (
  <Card className="metric-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
    </div>
  </Card>
);

export const DashboardMetrics = () => {
  const [supabaseItems, setSupabaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItemsData();
        setSupabaseItems(data);
        setLoading(false);

        const calculatedTotalStock = data.reduce(
          (sum, item) => sum + (item?.stocklevel || 0),
          0
        );
        setTotalStock(calculatedTotalStock);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error loading metrics: {error.message}</div>;
  }

  const totalProducts = supabaseItems.length;
  const lowStockItemsCount = supabaseItems.filter(
    (item) => item?.status?.toLowerCase() === "low stock"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Products"
        value={totalProducts}
        icon={<ChartIcon className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Total Stock"
        value={totalStock}
        icon={<Package2 className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Low Stock Items"
        value={lowStockItemsCount}
        change="Based on current inventory"
        isWarning={lowStockItemsCount > 5}
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
      />
      <MetricCard
        title="Monthly Revenue"
        value="$48,573" // This data would likely come from another source
        change="18% from last month"
        isPositive
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
      />
    </div>
  );
};

export default DashboardMetrics;
