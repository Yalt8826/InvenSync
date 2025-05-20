import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import AlertSection from "@/components/dashboard/AlertSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { InventoryTable } from "@/components/inventory/InventoryTable";

interface InventoryItem {
  item_id: number;
  stocklevel: number | null;
  stockstatus: string | null;
  lastUpdated?: string | null;
  items: {
    id: number;
    name: string;
    sku?: string | null;
    category?: string | null;
    price?: number | null;
  } | null;
  supplier: {
    id: number;
    name: string;
  } | null;
}

const Index = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("http://localhost:8000/inventory");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        if (Array.isArray(result.data)) {
          setInventory(result.data);
        } else {
          throw new Error("Invalid response format");
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch inventory");
        setLoading(false);
      }
    };

    fetchInventory();

    toast({
      title: "Welcome to InvenFlow",
      description: "Your inventory management dashboard is ready.",
    });
  }, [toast]);

  const filterByStatus = (status: string) => {
    return inventory
      .filter(
        (item) => item.stockstatus?.toLowerCase() === status.toLowerCase()
      )
      .slice(0, 5);
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading inventory...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div>Error loading inventory: {error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your inventory today.
          </p>
        </div>

        <DashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                  <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <InventoryTable data={inventory.slice(0, 5)} />
              </TabsContent>

              <TabsContent value="low-stock" className="mt-0">
                <InventoryTable data={filterByStatus("low stock")} />
              </TabsContent>

              <TabsContent value="out-of-stock" className="mt-0">
                <InventoryTable data={filterByStatus("out of stock")} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <AlertSection />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
