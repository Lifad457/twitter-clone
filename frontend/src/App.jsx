import { Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

function App() {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<div className='flex max-w-6xl mx-auto'>
				<Sidebar />
				<Outlet />
				<RightPanel />
				<Toaster />
			</div>
		</QueryClientProvider>
	);
}

export default App;
