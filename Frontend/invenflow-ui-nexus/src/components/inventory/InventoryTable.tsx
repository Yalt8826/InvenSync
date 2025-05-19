import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stocklevel: number | null;
  supplier: string | null;
  lastUpdated: string | null;
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
            <TableHead className="text-right">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => {
            console.log("Current Item in Table:", item); // INSPECT THE ENTIRE ITEM

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku || "-"}</TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>
                  {typeof item.price === "number"
                    ? item.price.toFixed(2)
                    : `PRICE IS NOT A NUMBER: ${item.price}`}
                </TableCell>
                <TableCell>
                  {typeof item.stocklevel === "number" ? item.stocklevel : "-"}
                </TableCell>
                <TableCell>{item.supplier || "-"}</TableCell>
                <TableCell className="text-right">
                  {item.lastUpdated || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
