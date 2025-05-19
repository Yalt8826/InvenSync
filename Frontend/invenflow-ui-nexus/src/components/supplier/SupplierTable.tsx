import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Supplier {
  id: number;
  name: string;
  address: string | null;
  gstno: string | null;
  // removed created_at
}

interface SupplierTableProps {
  data: Supplier[];
}

export const SupplierTable: React.FC<SupplierTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>GST No</TableHead>
            {/* Removed Created At column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.address || "-"}</TableCell>
              <TableCell>{supplier.gstno || "-"}</TableCell>
              {/* Removed Created At cell */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
