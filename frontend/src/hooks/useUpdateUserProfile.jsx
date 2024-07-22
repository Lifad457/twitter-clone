import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

	const { mutateAsync: updateProfileMutation, isPending: isUpdatingProfile } =
		useMutation({
			mutationFn: async (formData) => {
				try {
					const response = await fetch(`/api/users/update`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(formData),
					});

					const data = await response.json();
					if (!response.ok)
						throw new Error(
							data.message || 'Failed to update user'
						);
					return data;
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
			onSuccess: () => {
				toast.success('Profile updated successfully');
				Promise.all([
					queryClient.invalidateQueries({ queryKey: ['authUser'] }),
					queryClient.invalidateQueries({
						queryKey: ['userProfile'],
					}),
				]);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	return { updateProfileMutation, isUpdatingProfile };
};
export default useUpdateUserProfile;