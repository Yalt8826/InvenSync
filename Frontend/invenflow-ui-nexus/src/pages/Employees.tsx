import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import StockTable from "@/components/inventory/StockTable";
import AlertSection from "@/components/dashboard/AlertSection";
import PricingRules from "@/components/pricing/PricingRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Assuming this is your API call function
const getItemsData = async () => {
  // Replace this with your actual API call
  // For demonstration, I'm simulating a fetch with a delay
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      // Simulate a successful response with an empty array or some data
      resolve([]); // Or resolve([{ id: 1, name: 'Item 1', ... }]);
      // Simulate an error (for testing)
      // reject(new Error('Failed to fetch items'));
    }, 500); // Simulate a 500ms delay
  });
};

interface InventoryItem {
  id?: string; // Changed to string to match your mapping
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stockLevel: number | null; // Changed to stockLevel
  status: string | null;
}

const Index = () => {
  const { toast } = useToast();
  const [supabaseItems, setSupabaseItems] = useState<any[]>([]); // Keep as an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemsFromSupabase = async () => {
      try {
        const data = await getItemsData();
        setSupabaseItems(data); // Set the fetched data (which should be an array)
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
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

  // Function to transform item data
  const transformItemData = (items: any[]): InventoryItem[] => {
    return items.map((item) => ({
      id: item?.id?.toString() || "N/A", // Use optional chaining and nullish coalescing
      name: item?.name || "N/A",
      sku: item?.sku ?? "N/A", // Use nullish coalescing for brevity
      category: item?.category || "N/A",
      price: item?.price || 0,
      stockLevel: item?.stocklevel || 0, // Corrected property name
      status: item?.status || "N/A",
    }));
  };

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
          <h1>Error loading items: {error}</h1>
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
                  {/* You can add more tabs here based on categories or status if needed */}
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <StockTable
                  title="Top 5 Inventory Items"
                  data={supabaseItems.slice(0, 5).map((item) => ({
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
                  data={transformItemData(
                    supabaseItems.filter(
                      (item) =>
                        item?.status &&
                        item.status.toLowerCase() === "low stock"
                    )
                  )}
                />
              </TabsContent>

              <TabsContent value="out-of-stock" className="mt-0">
                <StockTable
                  title="Out of Stock Items"
                  data={transformItemData(
                    supabaseItems.filter(
                      (item) =>
                        item?.status &&
                        item.status.toLowerCase() === "out of stock"
                    )
                  )}
                />
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
