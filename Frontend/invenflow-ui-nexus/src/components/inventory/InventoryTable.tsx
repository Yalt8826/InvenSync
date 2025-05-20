import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  item_id: number;
  name: string;
  sku?: string | null;
  category?: string | null;
  price?: number | null;
  stocklevel?: number | null;
  stockstatus?: string | null;
  supplier?: number | null;
  supplier_name?: string | null;
  lastUpdated?: string | null;
}

interface InventoryTableProps {
  data: InventoryItem[];
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead>Supplier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.item_id}>
              <TableCell className="font-medium">
                {item.name || "Unnamed"}
              </TableCell>
              <TableCell>{item.sku || "-"}</TableCell>
              <TableCell>{item.category || "-"}</TableCell>
              <TableCell>
                {typeof item.price === "number" ? item.price.toFixed(2) : "-"}
              </TableCell>
              <TableCell>
                {typeof item.stocklevel === "number" ? item.stocklevel : "-"}
              </TableCell>
              <TableCell>{item.supplier_name || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
