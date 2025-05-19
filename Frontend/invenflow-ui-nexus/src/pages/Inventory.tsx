import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InventoryTable } from "@/components/inventory/InventoryTable";

interface InventoryItem {
  id?: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stocklevel: number | null;
  supplier: number | null; // Now likely the supplier ID
  supplier_name?: string | null; // New property for the supplier name
  lastUpdated: string | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  sku: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be positive." })
    .nullable()
    .optional(),
  stockLevel: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Stock must be non-negative." })
    .nullable()
    .optional(),
  supplier: z.coerce.number().nullable().optional(), // Supplier ID from the form
});

type FormValues = z.infer<typeof formSchema>;

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming your backend now returns the supplier name as part of the item data
        setInventoryItems(data);
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
      const response = await fetch("http://localhost:8000/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast({
          title: "Error adding item",
          description:
            responseData?.detail || `HTTP error! status: ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      // Assuming your backend returns the new item with the supplier name
      setInventoryItems([...inventoryItems, responseData]);
      form.reset();
      toast({
        title: "Item Added",
        description: `${values.name} added successfully.`,
      });
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

  console.log("Inventory Items being passed to table:", inventoryItems); // DEBUGGING

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* ... your UI ... */}
        <div className="md:col-span-2">
          <InventoryTable data={inventoryItems} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Inventory;
