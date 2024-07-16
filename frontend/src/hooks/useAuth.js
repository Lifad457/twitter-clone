import { useQuery } from '@tanstack/react-query';

export const useAuth = () => {
	const {
		data: authUser,
		isloading,
		error,
		isError,
	} = useQuery({
		queryKey: ['authUser'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/auth/me');
				const data = await response.json();
				if (data.message) return null;
				if (!response.ok)
					throw new Error(data.message || 'Failed to get user');
				return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		retry: false,
	});

	return {
		authUser,
		isloading,
		error,
		isError,
	};
};
