import { Navigate, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';

import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './utils/useAuth';

function App() {
	const { isLoading, authUser } = useAuth();

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/'>
					<Route
						index
						element={
							authUser ? <HomePage /> : <Navigate to='/login' />
						}
					/>
					<Route
						path='login'
						element={
							!authUser ? <LoginPage /> : <Navigate to='/' />
						}
					/>
					<Route
						path='signup'
						element={
							!authUser ? <SignUpPage /> : <Navigate to='/' />
						}
					/>
					<Route
						path='notifications'
						element={
							authUser ? (
								<NotificationPage />
							) : (
								<Navigate to='/login' />
							)
						}
					/>
					<Route
						path='profile/:username'
						element={
							authUser ? (
								<ProfilePage />
							) : (
								<Navigate to='/login' />
							)
						}
					/>
				</Route>
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;
