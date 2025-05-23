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
  gst: z.string().nullable().optional(),
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
      gst: null,
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

      // ✅ Use result.data instead of result
      if (!result?.data || !result.data.name) {
        toast({
          title: "Unexpected response format",
          description: "Supplier added, but response format was not expected.",
          variant: "default",
        });
        return;
      }

      setSuppliers((prev) => [...prev, result.data]);
      form.reset();
      toast({
        title: "Supplier Added",
        description: `${result.data.name} added successfully.`,
      });
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Supplier Dashboard
        </h1>
        <p className="text-gray-600">View and manage your suppliers.</p>
      </div>

      <div className="space-y-8">
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add Supplier
          </h2>
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
              <Button type="submit" className="w-full md:w-auto">
                Add Supplier
              </Button>
            </div>
          </form>
        </div>

        <SupplierTable data={suppliers} />
      </div>
    </AppLayout>
  );
};

export default Supplier;
