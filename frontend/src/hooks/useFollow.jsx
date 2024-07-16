import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: followUnfollowMutation, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const response = await fetch(`/api/users/follow/${userId}`, {
					method: 'POST',
				});

				const data = await response.json();
				if (!response.ok)
					throw new Error(data.message || 'Failed to follow user');
				return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
				queryClient.invalidateQueries({ queryKey: ['authUser'] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { followUnfollowMutation, isPending };
};
