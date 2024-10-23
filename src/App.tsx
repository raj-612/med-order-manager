import { Authenticator} from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import outputs from "../amplify_outputs.json";
import OrderingDashboard from './components/OrderingDashboard';
import ChatWidget from './components/chatWidget';

Amplify.configure(outputs);

export default function App() {
  return (
    <Authenticator className='flex justify-center items-center h-screen'>
      {({ signOut, user }) => (
        <div className="min-h-screen flex flex-col">
          <div className="flex justify-end p-4 bg-gray-100">
            <button 
              onClick={signOut} 
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Sign out
            </button>
          </div>
          <main className="flex flex-1">
            <OrderingDashboard user={user} />
            <ChatWidget />
          </main>
        </div>
      )}
    </Authenticator>
  );
}