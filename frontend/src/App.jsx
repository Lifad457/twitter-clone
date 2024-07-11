import { Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';

function App() {
	return (
		<div className='flex max-w-6xl mx-auto'>
			<Sidebar />
			<Outlet />
			<RightPanel />
		</div>
	);
}

export default App;
