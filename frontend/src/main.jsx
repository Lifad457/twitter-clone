import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from 'react-router-dom';
import './index.css';
import HomePage from './pages/home/HomePage.jsx';
import SignUpPage from './pages/auth/signup/SignUpPage.jsx';
import LoginPage from './pages/auth/login/LoginPage.jsx';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path='/' element={<App />}>
			<Route index element={<HomePage />} />
			<Route path='signup' element={<SignUpPage />} />
			<Route path='login' element={<LoginPage />} />
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
