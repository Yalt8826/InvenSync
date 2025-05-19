import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id?: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stocklevel: number | null;
  supplier: number | null;
  supplier_name?: string | null;
  lastUpdated?: string | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  sku: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  price: z.coerce.number().positive().nullable().optional(),
  stocklevel: z.coerce.number().int().nonnegative().nullable().optional(),
  supplier: z.coerce.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: null,
      category: null,
      price: null,
      stockLevel: null,
      supplier: null,
    },
  });

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await fetch("http://localhost:8000/items/");
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

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("http://localhost:8000/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error adding item",
          description:
            result?.detail || `HTTP error! status: ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        setInventoryItems((prev) => [...prev, result.data]);
        form.reset();
        toast({
          title: "Item Added",
          description: `${result.data.name} added successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding item",
        description: error?.message || "Failed to add item.",
        variant: "destructive",
      });
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
        <div>Error loading inventory: {error.message}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <Label>Name</Label>
            <Input {...form.register("name")} />
          </div>
          <div>
            <Label>SKU</Label>
            <Input {...form.register("sku")} />
          </div>
          <div>
            <Label>Category</Label>
            <Input {...form.register("category")} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" {...form.register("price")} />
          </div>
          <div>
            <Label>Stock Level</Label>
            <Input type="number" {...form.register("stocklevel")} />
          </div>
          <div>
            <Label>Supplier ID</Label>
            <Input type="number" {...form.register("supplier")} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Add to Inventory</Button>
          </div>
        </form>

        <InventoryTable data={inventoryItems} />
      </div>
    </AppLayout>
  );
};

export default Inventory;
