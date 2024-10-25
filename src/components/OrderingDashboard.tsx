import LetyboOrderingPlatform from '../complete-letybo-ordering-platform';

const OrderingDashboard = ({ user }: { user: any }) => {
  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="w-full max-w-[600px] p-4">
        <LetyboOrderingPlatform user={user} />
      </div>
    </div>
  );
};

export default OrderingDashboard;
