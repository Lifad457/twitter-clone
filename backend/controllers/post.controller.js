import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { v2 as cloudinary } from 'cloudinary';
import Notification from '../models/notification.model.js';

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { image } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}
		if (!text && !image) {
			return res.status(400).json({
				message: 'Please provide either text or image!',
			});
		}

		if (image) {
			const uploadedResponse = await cloudinary.uploader.upload(image);
			image = uploadedResponse.secure_url;
		}

		const post = new Post({
			user: userId,
			text: text,
			image: image,
		});
		await post.save();

		res.status(201).json({
			message: 'Post created successfully!',
			post,
		});
	} catch (error) {
		console.log('Error in createPost : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				message: 'Post not found!',
			});
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({
				message: 'You are not authorized to delete this post!',
			});
		}

		if (post.image) {
			const imgId = post.image.split('/').pop().split('.')[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({
			message: 'Post deleted successfully!',
		});
	} catch (error) {
		console.log('Error in deletePost : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const userId = req.user._id;
		const postId = req.params.id;

		if (!text) {
			return res.status(400).json({
				message: 'Please provide comment text!',
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({
				message: 'Post not found!',
			});
		}

		const comment = {
			user: userId,
			text: text,
		};
		post.comments.push(comment);
		await post.save();

		res.status(200).json({
			message: 'Comment added successfully!',
			post,
		});
	} catch (error) {
		console.log('Error in commentOnPost : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const postId = req.params.id;

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({
				message: 'Post not found!',
			});
		}

		const isLiked = post.likes.includes(userId);
		if (isLiked) {
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne(
				{ _id: userId },
				{ $pull: { likedPosts: postId } }
			);

			res.status(200).json({
				message: 'Post unliked successfully!',
				post,
			});
		} else {
			post.likes.push(userId);
			await User.updateOne(
				{ _id: userId },
				{ $push: { likedPosts: postId } }
			);
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: 'like',
			});
			await notification.save();

			res.status(200).json({
				message: 'Post liked successfully!',
				post,
			});
		}
	} catch (error) {
		console.log('Error in likeUnlikePost : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: 'user',
				select: '-password',
			})
			.populate({
				path: 'comments.user',
				select: '-password',
			});
		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json({
			posts,
		});
	} catch (error) {
		console.log('Error in getAllPosts : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const getLikedPosts = async (req, res) => {
	try {
		const userId = req.params.id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: 'user',
				select: '-password',
			})
			.populate({
				path: 'comments.user',
				select: '-password',
			});

		if (likedPosts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json({
			likedPosts,
		});
	} catch (error) {
		console.log('Error in getLikedPosts : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			});
		}

		const followingPosts = user.following;
		console.log(followingPosts);
		const feedPosts = await Post.find({ user: { $in: followingPosts } })
			.sort({ createdAt: -1 })
			.populate({ path: 'user', select: '-password' })
			.populate({ path: 'comments.user', select: '-password' });
		console.log(feedPosts);
		if (feedPosts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json({
			feedPosts,
		});
	} catch (error) {
		console.log('Error in getFollowingPosts : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};
