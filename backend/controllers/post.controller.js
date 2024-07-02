import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { image } = req.body;
		const userId = req.user._id.toString();

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
    }
    catch (error) {
        console.log('Error in deletePost : ', error.message);
        res.status(500).json({
            message: 'Internal server error!',
        });
    }
}