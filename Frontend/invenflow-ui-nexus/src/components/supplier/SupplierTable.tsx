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
  gst: string | null; // changed from gstno to gst
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.address || "-"}</TableCell>
              <TableCell>{supplier.gstno || "-"}</TableCell>{" "}
              {/* updated here */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
