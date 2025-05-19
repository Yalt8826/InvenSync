// DashboardMetrics.tsx
import { Card } from "@/components/ui/card";
import {
  BarChart as ChartIcon,
  TrendingUp,
  AlertTriangle,
  Package2,
} from "lucide-react";
import { getItemsData } from "@/api-reqs/items";
import { getTotalRevenue } from "@/api-reqs/totalrev"; // 👈 API to get total revenue
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
        {change && (
          <p
            className={`text-xs mt-1 ${
              isWarning
                ? "text-yellow-600"
                : isPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
    </div>
  </Card>
);

export const DashboardMetrics = () => {
  const [supabaseItems, setSupabaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [totalStock, setTotalStock] = useState(0);
  const [revenue, setRevenue] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, revenueData] = await Promise.all([
          getItemsData(),
          getTotalRevenue(),
        ]);

        setSupabaseItems(itemsData);
        setRevenue(revenueData);
        setLoading(false);

        const calculatedTotalStock = itemsData.reduce(
          (sum, item) => sum + (item?.stocklevel || 0),
          0
        );
        setTotalStock(calculatedTotalStock);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
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
        value={
          revenue !== null
            ? `₹${revenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`
            : "Loading..."
        }
        change="Updated live"
        isPositive
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
      />
    </div>
  );
};

export default DashboardMetrics;
