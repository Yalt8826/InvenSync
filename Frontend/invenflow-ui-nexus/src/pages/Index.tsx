// src/pages/index.js (or wherever your Index component is)
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import StockTable from "@/components/inventory/StockTable";
import AlertSection from "@/components/dashboard/AlertSection";
import PricingRules from "@/components/pricing/PricingRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getItemsData } from "@/api-reqs/items";

const Index = () => {
  const { toast } = useToast();
  const [supabaseItems, setSupabaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemsFromSupabase = async () => {
      try {
        const data = await getItemsData();
        setSupabaseItems(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchItemsFromSupabase();

    // Show welcome toast when dashboard loads
    toast({
      title: "Welcome to InvenFlow",
      description: "Your inventory management dashboard is ready.",
    });
  }, [toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <h1>Loading items...</h1>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <h1>Error loading items: {error.message}</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your inventory today.
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
                  {/* You can add more tabs here based on categories or status if needed */}
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <StockTable
                  title="All Inventory Items"
                  data={supabaseItems.map((item) => ({
                    id: item.id?.toString() || "N/A",
                    name: item.name || "N/A",
                    sku: item.sku == null ? "N/A" : item.sku,
                    category: item?.category || "N/A",
                    price: item?.price || 0,
                    stockLevel: item?.stocklevel || 0,
                    status: item?.status || "N/A",
                  }))}
                />
              </TabsContent>

              <TabsContent value="low-stock" className="mt-0">
                <StockTable
                  title="Low Stock Items"
                  data={supabaseItems
                    .filter(
                      (item) =>
                        item?.status &&
                        item.status.toLowerCase() === "low stock"
                    )
                    .map((item) => ({
                      id: item.id?.toString() || "N/A",
                      name: item?.name || "N/A",
                      sku: item?.sku == null ? "N/A" : item.sku,
                      category: item?.category || "N/A",
                      price: item?.price || 0,
                      stockLevel: item?.stocklevel || 0,
                      status: item?.status || "N/A",
                    }))}
                />
              </TabsContent>

              <TabsContent value="out-of-stock" className="mt-0">
                <StockTable
                  title="Out of Stock Items"
                  data={supabaseItems
                    .filter(
                      (item) =>
                        item?.status &&
                        item.status.toLowerCase() === "out of stock"
                    )
                    .map((item) => ({
                      id: item.id?.toString() || "N/A",
                      name: item?.name || "N/A",
                      sku: item?.sku == null ? "N/A" : item.sku,
                      category: item?.category || "N/A",
                      price: item?.price || 0,
                      stockLevel: item?.stocklevel || 0,
                      status: item?.status || "N/A",
                    }))}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <AlertSection />
          </div>
        </div>

        <PricingRules />
      </div>
    </AppLayout>
  );
};

export default Index;
