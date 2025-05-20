import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SupplierTable } from "@/components/supplier/SupplierTable";

interface Supplier {
  id?: number;
  name: string;
  address: string | null;
  gst: string | null;
}

const formSchema = z.object({
  name: z.string().min(2),
  address: z.string().nullable().optional(),
  gst: z.string().nullable().optional(), // use gst here, matching DB column name
});

type FormValues = z.infer<typeof formSchema>;

const Supplier = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: null,
      gstno: null, // use gstno here
    },
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("http://localhost:8000/suppliers/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        if (Array.isArray(result.data)) {
          setSuppliers(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("http://localhost:8000/add-supplier/", {
        // note trailing slash
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error adding supplier",
          description: result?.detail || `HTTP error! status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        setSuppliers((prev) => [...prev, result.data]);
        form.reset();
        toast({
          title: "Supplier Added",
          description: `${result.data.name} added successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding supplier",
        description: error?.message || "Failed to add supplier.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading suppliers...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div>Error loading suppliers: {error.message}</div>
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
            <Label>Address</Label>
            <Input {...form.register("address")} />
          </div>
          <div>
            <Label>GST Number</Label>
            <Input {...form.register("gst")} />
          </div>

          <div className="md:col-span-3">
            <Button type="submit">Add Supplier</Button>
          </div>
        </form>

        <SupplierTable data={suppliers} />
      </div>
    </AppLayout>
  );
};

export default Supplier;
