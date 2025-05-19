import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { OrderTable } from "@/components/orders/OrderTable"; // adjust path if needed

// Order interface
interface Order {
  id?: number;
  item_id: number;
  quantity: number;
  total_price?: number;
  order_date?: string;
  expected_date?: string;
  status?: string;
  created_at?: string;
}

// Form validation schema
const formSchema = z.object({
  item_id: z.coerce.number().min(1, { message: "Item ID is required." }),
  quantity: z.coerce
    .number()
    .min(1, { message: "Quantity must be at least 1." }),
});

type FormValues = z.infer<typeof formSchema>;

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: 0,
      quantity: 1,
    },
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:8000/orders/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        if (Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("http://localhost:8000/add-order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error adding order",
          description: result?.detail || `HTTP error! status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        setOrders((prev) => [...prev, result.data]);
        form.reset();
        toast({
          title: "Order Added",
          description: `Order for item ${result.data.item_id} added successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding order",
        description: error?.message || "Failed to add order.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading orders...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div>Error loading orders: {error.message}</div>
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
            <Label>Item ID</Label>
            <Input type="number" {...form.register("item_id")} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" {...form.register("quantity")} />
          </div>

          <div className="md:col-span-3">
            <Button type="submit">Add Order</Button>
          </div>
        </form>

        <OrderTable data={orders} />
      </div>
    </AppLayout>
  );
};

export default Orders;
