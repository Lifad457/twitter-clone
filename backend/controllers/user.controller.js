import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

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

			//TODO: return the id of the user as a response
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

			//TODO: return the id of the user as a response
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

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select(
			'following'
		);

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);

		const filteredUsers = users.filter(
			(user) => !usersFollowedByMe.following.includes(user._id)
		);
		const suggestedUsers = filteredUsers.slice(0, 4);
		suggestedUsers.forEach((user) => {
			user.password = null;
		});

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log('Error in getSuggestedUsers : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const updateUser = async (req, res) => {
	const {
		fullname,
		username,
		email,
		currentPasword,
		newPassword,
		bio,
		link,
	} = req.body;
	let { profilePicture, coverPicture } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}

		if (
			(!newPassword && currentPasword) ||
			(newPassword && !currentPasword)
		) {
			return res.status(400).json({
				message: 'Please enter both current and new password!',
			});
		}

		if (currentPasword && newPassword) {
			const isMatch = await bcrypt.compare(currentPasword, user.password);
			if (!isMatch) {
				return res.status(400).json({
					message: 'Current password is incorrect!',
				});
			}

			if (newPassword.length < 6) {
				return res.status(400).json({
					message: 'Password must be at least 6 characters long!',
				});
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profilePicture) {
			if (user.profilePicture) {
				await cloudinary.uploader.destroy(
					user.profilePicture.split('/').pop().split('.')[0]
				);
			}

			const uploadResponse = await cloudinary.uploader.upload(
				profilePicture
			);
			profilePicture = uploadResponse.secure_url;
		}

		if (coverPicture) {
			if (user.coverPicture) {
				await cloudinary.uploader.destroy(
					user.coverPicture.split('/').pop().split('.')[0]
				);
			}

			const uploadResponse = await cloudinary.uploader.upload(
				coverPicture
			);
			coverPicture = uploadResponse.secure_url;
		}

		user.fullname = fullname || user.fullname;
		user.username = username || user.username;
		user.email = email || user.email;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profilePicture = profilePicture || user.profilePicture;
		user.coverPicture = coverPicture || user.coverPicture;

		user = await user.save();
		user.password = null;

		res.status(200).json(user);
	} catch (error) {
		console.log('Error in updateUser : ', error.message);
		res.status(500).json({
			message: 'Internal server error! ' + error.message,
		});
	}
};
