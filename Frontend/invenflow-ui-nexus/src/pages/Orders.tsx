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

// Interfaces
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
  items?: { name: string };
  supplier?: { name: string };
  customer?: { name: string };
}

interface Item {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
}

// Validation schema
const formSchema = z.object({
  item_id: z.coerce.number().min(1, { message: "Item is required." }),
  supplier_id: z.coerce.number().min(1, { message: "Supplier is required." }),
  customer_id: z.coerce.number().min(1, { message: "Customer is required." }),
  quantity: z.coerce
    .number()
    .min(1, { message: "Quantity must be at least 1." }),
});

type FormValues = z.infer<typeof formSchema>;

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  // Fetch all required data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, itemsRes, suppliersRes, customersRes] =
          await Promise.all([
            fetch("http://localhost:8000/orders/"),
            fetch("http://localhost:8000/items/"),
            fetch("http://localhost:8000/suppliers/"),
            fetch("http://localhost:8000/customers/"),
          ]);

        if (
          !ordersRes.ok ||
          !itemsRes.ok ||
          !suppliersRes.ok ||
          !customersRes.ok
        ) {
          throw new Error("One or more resources failed to load.");
        }

        const ordersData = await ordersRes.json();
        const itemsData = await itemsRes.json();
        const suppliersData = await suppliersRes.json();
        const customersData = await customersRes.json();

        setOrders(ordersData.data || []);
        setItems(itemsData.data || []);
        setSuppliers(suppliersData.data || []);
        setCustomers(customersData.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Form submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("http://localhost:8000/add-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMessage = "Failed to add order.";
        if (result?.detail) {
          if (Array.isArray(result.detail)) {
            errorMessage = result.detail
              .map(
                (err: { loc: string[]; msg: string }) =>
                  `${err.loc.join(".")} - ${err.msg}`
              )
              .join("\n");
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Orders Dashboard
        </h1>
        <p className="text-gray-600">Track and manage your orders.</p>
      </div>

      <div className="space-y-8">
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add Order
          </h2>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <Label>Item</Label>
              <select
                {...form.register("item_id")}
                className="w-full border rounded px-2 py-1"
              >
                <option value={0}>Select Item</option>
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
                {...form.register("supplier_id")}
                className="w-full border rounded px-2 py-1"
              >
                <option value={0}>Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Customer</Label>
              <select
                {...form.register("customer_id")}
                className="w-full border rounded px-2 py-1"
              >
                <option value={0}>Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" {...form.register("quantity")} />
            </div>

            <div className="md:col-span-4">
              <Button type="submit">Add Order</Button>
            </div>
          </form>
        </div>

        <OrderTable data={orders} />
      </div>
    </AppLayout>
  );
};

export default Orders;
