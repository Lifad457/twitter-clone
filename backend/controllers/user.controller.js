import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

export const getUserProfile = async (req, res) => {
	try {
		const user = await User.findOne({
			username: req.params.username,
		}).select('-password');
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}
		res.status(200).json(user);
	} catch (error) {
		console.log('Error in getUserProfile : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const userToModify = await User.findById(req.params.id);
		const currentUser = await User.findById(req.user._id);

		if (userToModify._id === currentUser._id) {
			return res.status(400).json({
				message: 'You cannot follow/unfollow yourself!',
			});
		}

		if (!userToModify || !currentUser) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}

		if (userToModify.followers.includes(currentUser._id)) {
			await User.findByIdAndUpdate(userToModify._id, {
				$pull: { followers: currentUser._id },
			});
			await User.findByIdAndUpdate(currentUser._id, {
				$pull: { following: userToModify._id },
			});
			res.status(200).json({
				message: 'User unfollowed successfully!',
			});
		} else {
			await User.findByIdAndUpdate(userToModify._id, {
				$push: { followers: currentUser._id },
			});
			await User.findByIdAndUpdate(currentUser._id, {
				$push: { following: userToModify._id },
			});

			const notification = new Notification({
				type: 'follow',
				from: currentUser._id,
				to: userToModify._id,
			});
			await notification.save();

			res.status(200).json({
				message: 'User followed successfully!',
			});
		}
	} catch (error) {
		console.log('Error in followUnfollowUser : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};
