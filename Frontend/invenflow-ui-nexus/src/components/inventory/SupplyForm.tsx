import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SupplyFormProps {
  onSuccess: () => void;
}

interface Item {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

export const SupplyForm: React.FC<SupplyFormProps> = ({ onSuccess }) => {
  const [itemId, setItemId] = useState<number>();
  const [supplierId, setSupplierId] = useState<number>();
  const [quantity, setQuantity] = useState<number>(1);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, suppliersRes] = await Promise.all([
        fetch("http://localhost:8000/items/"),
        fetch("http://localhost:8000/suppliers/"),
      ]);

      const itemsData = await itemsRes.json();
      const suppliersData = await suppliersRes.json();
      setItems(itemsData.data);
      setSuppliers(suppliersData.data);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

    if (response.ok) {
      onSuccess();
      setItemId(undefined);
      setSupplierId(undefined);
      setQuantity(1);
    } else {
      alert("Failed to add supply");
    }

    setLoading(false);
  };

  return (
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
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Submitting..." : "Add Supply"}
        </Button>
      </div>
    </form>
  );
};
