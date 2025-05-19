import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CustomerTable } from "@/components/customer/CustomerTable"; // You need to create this table component

interface Customer {
  id?: number;
  name: string;
  address: string;
  phone_no: string;
  email: string;
  gender: string;
  dob: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  address: z.string().min(3, "Address must be at least 3 characters."),
  phone_no: z.string().min(10, "Phone number must be valid."),
  email: z.string().email("Invalid email address."),
  gender: z.string().min(1, "Gender is required."),
  dob: z.string().min(1, "Date of birth is required."),
});

type FormValues = z.infer<typeof formSchema>;

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone_no: "",
      email: "",
      gender: "",
      dob: "",
    },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/customers/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        if (Array.isArray(result.data)) {
          setCustomers(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("http://localhost:8000/add-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error adding customer",
          description: result?.detail || `HTTP error! status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        setCustomers((prev) => [...prev, result.data]);
        form.reset();
        toast({
          title: "Customer Added",
          description: `${result.data.name} added successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding customer",
        description: error?.message || "Failed to add customer.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading customers...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div>Error loading customers: {error.message}</div>
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
            <Label>Phone Number</Label>
            <Input {...form.register("phone_no")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input {...form.register("email")} />
          </div>
          <div>
            <Label>Gender</Label>
            <Input {...form.register("gender")} />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" {...form.register("dob")} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Add Customer</Button>
          </div>
        </form>

        <CustomerTable data={customers} />
      </div>
    </AppLayout>
  );
};

export default Customers;
