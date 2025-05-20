import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { InventoryTable } from "@/components/inventory/InventoryTable";

interface InventoryItem {
  item_id: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stocklevel: number | null;
  stockstatus?: string | null;
  supplier: number | null;
  supplier_name?: string | null;
  lastUpdated?: string | null;
}

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await fetch("http://localhost:8000/inventory");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setInventoryItems(result.data);
        } else {
          throw new Error("Invalid response format");
        }
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

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
        <div>Error loading inventory: {error.message}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Dashboard
        </h1>
        <p className="text-gray-600">
          View and manage your inventory items below.
        </p>
        <InventoryTable data={inventoryItems} />
      </div>
    </AppLayout>
  );
};

export default Inventory;
