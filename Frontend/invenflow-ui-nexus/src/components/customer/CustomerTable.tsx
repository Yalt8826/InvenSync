import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  id: number;
  name: string;
  address: string;
  phone_no: string;
  email: string;
  gender: string;
  dob: string;
}

interface CustomerTableProps {
  data: Customer[];
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>DOB</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.address || "-"}</TableCell>
              <TableCell>{customer.phone_no || "-"}</TableCell>
              <TableCell>{customer.email || "-"}</TableCell>
              <TableCell>{customer.gender || "-"}</TableCell>
              <TableCell>{customer.dob || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
