import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart as ChartIcon,
  TrendingUp,
  AlertTriangle,
  Package2,
} from "lucide-react";
import { getInventoryData } from "@/api-reqs/inventory";
import { getTotalRevenue } from "@/api-reqs/totalrev";

// Temporarily loosen the type for debug purposes
interface InventoryItem {
  [key: string]: any;
}

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
  <Card className="p-4 rounded-2xl shadow-md">
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryResponse, revenueData] = await Promise.all([
          getInventoryData(),
          getTotalRevenue(),
        ]);

        console.log("Raw inventory response:", inventoryResponse);

        const items = inventoryResponse || [];
        console.log("Parsed inventory items:", items);

        setInventory(items);
        setRevenue(revenueData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error loading metrics: {error.message}</div>;

  // Debug log before computing metrics
  console.log("Inventory before metrics calculation:", inventory);

  const totalProducts = new Set(inventory.map((item) => item.item_id)).size;

  const totalStock = inventory.reduce((sum, item) => {
    console.log("Item stocklevel:", item.stocklevel);
    return sum + (Number(item.stocklevel) || 0);
  }, 0);

  const lowStockItems = inventory.filter((item) => {
    console.log("Item stockstatus:", item.stockstatus);
    return item.stockstatus?.toLowerCase() === "low stock";
  }).length;

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
        value={lowStockItems}
        change="Based on current inventory"
        isWarning={lowStockItems > 5}
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
