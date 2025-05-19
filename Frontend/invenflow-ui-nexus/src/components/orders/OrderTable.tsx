// components/order/OrderTable.tsx

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Order interface
export interface Order {
  id: number;
  item_id: number;
  quantity: number;
  supplier_id: number;
  customer_id: number;
  total_price?: number;
  order_date?: string;
  expected_date?: string;
  status?: string;
  created_at?: string;

  items?: { name?: string; id: number };
  supplier?: { name?: string; id: number };
  customers?: { name?: string; id: number };
}

interface Props {
  data: Order[];
}

export const OrderTable: React.FC<Props> = ({ data }) => {
  const [filter, setFilter] = useState<"all" | "delivered" | "pending">("all");

  const filteredData = data.filter((order) => {
    if (filter === "all") return true;
    if (filter === "delivered")
      return order.status?.toLowerCase() === "delivered";
    if (filter === "pending")
      return order.status?.toLowerCase() !== "delivered";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label>Filter by Status:</Label>
        <Select
          onValueChange={(value) => setFilter(value as any)}
          defaultValue="all"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Expected Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.items?.name || order.item_id}</TableCell>
              <TableCell>{order.supplier?.name || order.supplier_id}</TableCell>
              <TableCell>
                {order.customers?.name || order.customer_id}
              </TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>₹{order.total_price?.toFixed(2)}</TableCell>
              <TableCell>
                {order.order_date
                  ? new Date(order.order_date).toLocaleDateString()
                  : ""}
              </TableCell>
              <TableCell>
                {order.expected_date
                  ? new Date(order.expected_date).toLocaleDateString()
                  : ""}
              </TableCell>
              <TableCell>
                <Badge>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
