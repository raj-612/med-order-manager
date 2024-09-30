import { useState } from 'react';
import LetyboOrderingPlatform from '../complete-letybo-ordering-platform';
import OrdersTable from './OrdersTable';

const OrderingDashboard = ({ user }: { user: any }) => {
  const [refreshOrders, setRefreshOrders] = useState(false);

  const handleRefreshOrders = () => {
    setRefreshOrders((prev) => !prev);
  };

  return (
    <div className="flex flex-1">
      <div className="w-1/3 p-4">
        <LetyboOrderingPlatform user={user} onOrderPlaced={handleRefreshOrders} />
      </div>
      <div className="w-2/3 p-4">
        <OrdersTable refresh={refreshOrders} />
      </div>
    </div>
  );
};

export default OrderingDashboard;