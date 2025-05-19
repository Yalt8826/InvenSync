import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderTable } from "@/components/orders/OrderTable";

// Order interface (matches the Python backend) - Adjusted to reflect what we RECEIVE from the backend
export interface Order {
  id: number;
  item_id: number;
  quantity: number;
  supplier_id: number;
  customer_id: number;
  total_price: number;
  order_date: string;
  expected_date: string;
  status: string;
  created_at: string;

  items?: { name: string };
  supplier?: { name: string };
  customer?: { name: string };
}

// Form validation schema - Include customer_id
const formSchema = z.object({
  item_id: z.coerce.number().min(1, { message: "Item ID is required." }),
  supplier_id: z.coerce
    .number()
    .min(1, { message: "Supplier ID is required." }),
  customer_id: z.coerce
    .number()
    .min(1, { message: "Customer ID is required." }),
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
      supplier_id: 0,
      customer_id: 0,
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
      const res = await fetch("http://localhost:8000/add-order", {
        // Removed trailing slash
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values), // Send item_id, supplier_id, customer_id, and quantity
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMessage = "Failed to add order.";
        if (result && result.detail) {
          if (Array.isArray(result.detail)) {
            // Format detailed validation errors from FastAPI
            const validationErrors = result.detail.map(
              (err: { loc: string[]; msg: string }) =>
                `${err.loc.join(".")} - ${err.msg}`
            );
            errorMessage = validationErrors.join("\n");
          } else if (typeof result.detail === "string") {
            errorMessage = result.detail;
          }
        }
        toast({
          title: "Error adding order",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        const newOrder: Order = result.data;
        setOrders((prev) => [...prev, newOrder]);
        form.reset();
        toast({
          title: "Order Added",
          description: `Order for item ${newOrder.item_id} added successfully.`,
        });
      } else {
        toast({
          title: "Order Added",
          description: `Order added successfully.`,
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
          className="grid grid-cols-1 md:grid-cols-4 gap-4" // Adjusted grid columns
        >
          <div>
            <Label>Item ID</Label>
            <Input type="number" {...form.register("item_id")} />
          </div>
          <div>
            <Label>Supplier ID</Label>
            <Input type="number" {...form.register("supplier_id")} />
          </div>
          <div>
            <Label>Customer ID</Label>
            <Input type="number" {...form.register("customer_id")} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" {...form.register("quantity")} />
          </div>

          <div className="md:col-span-4">
            {" "}
            {/* Adjusted colspan */}
            <Button type="submit">Add Order</Button>
          </div>
        </form>

        <OrderTable data={orders} />
      </div>
    </AppLayout>
  );
};

export default Orders;
