import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import outputs from "../amplify_outputs.json";
import OrderingDashboard from './components/OrderingDashboard';
import { useEffect } from 'react';

Amplify.configure(outputs);

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    script.setAttribute('data-widget-id', '671a9d069d106a9e690febe9');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
            {/* <ChatWidget /> */}
          </main>
        </div>
      )}
    </Authenticator>
  );
}
