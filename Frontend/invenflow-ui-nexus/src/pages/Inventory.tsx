import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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

interface Item {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [itemId, setItemId] = useState<number>();
  const [supplierId, setSupplierId] = useState<number>();
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryRes, itemsRes, suppliersRes] = await Promise.all([
          fetch("http://localhost:8000/inventory"),
          fetch("http://localhost:8000/items/"),
          fetch("http://localhost:8000/suppliers/"),
        ]);

        if (!inventoryRes.ok || !itemsRes.ok || !suppliersRes.ok)
          throw new Error("Failed to fetch data");

        const inventoryData = await inventoryRes.json();
        const itemsData = await itemsRes.json();
        const suppliersData = await suppliersRes.json();

        setInventoryItems(inventoryData.data || []);
        setItems(itemsData.data || []);
        setSuppliers(suppliersData.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/add-supply/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
          supplier_id: supplierId,
          quantity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to add supply");
      }

      toast({
        title: "Supply added",
        description: "The supply was added successfully.",
        variant: "default",
      });

      setItemId(undefined);
      setSupplierId(undefined);
      setQuantity(1);
      window.location.reload();
    } catch (err) {
      toast({
        title: "Submission failed",
        description: "There was a problem adding the supply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
        <div>Error loading data: {error.message}</div>
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

        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Add Supply</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Item</Label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={itemId ?? ""}
                onChange={(e) => setItemId(Number(e.target.value))}
                required
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Supplier</Label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={supplierId ?? ""}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto"
            >
              {submitting ? "Submitting..." : "Add Supply"}
            </Button>
          </div>
        </form>

        <InventoryTable data={inventoryItems} />
      </div>
    </AppLayout>
  );
};

export default Inventory;
