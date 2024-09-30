import { useState, useEffect } from 'react';
import { fetchOrders } from '@/services/orderService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from 'clsx';

interface OrdersTableProps {
  className?: string;
  refresh: boolean;
}

const OrdersTable = ({ className, refresh }: OrdersTableProps) => {
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [refresh]);

  return (
    <div className={clsx("w-full p-4", className)}>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <Table>
        <TableCaption>A list of your recent orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Selected Package</TableHead>
            <TableHead>Vials</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.order_id}>
              <TableCell>{order.order_id}</TableCell>
              <TableCell>{order.email}</TableCell>
              <TableCell>{order.selected_package}</TableCell>
              <TableCell>{order.vials}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;