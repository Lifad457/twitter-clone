import { Outlet } from 'react-router-dom';

function App() {
	return (
		<div className='flex max-w-6xl mx-auto'>
			<Outlet />
		</div>
	);
}

export default App;
