import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils/generateToken.js';

export const signup = async (req, res) => {
	{
		try {
			const { username, fullname, email, password } = req.body;

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({
					message: 'Invalid email format!',
				});
			}

			const existingUser = await User.findOne({ username });
			if (existingUser) {
				return res.status(400).json({
					message: 'Username already taken!',
				});
			}

			const existingEmail = await User.findOne({ email });
			if (existingEmail) {
				return res.status(400).json({
					message: 'Email already exists!',
				});
			}

			if (password.length < 6) {
				return res.status(400).json({
					error: 'Password must be at least 6 characters long',
				});
			}

			const salt = await bcrypt.genSalt(10);
			const passwordHash = await bcrypt.hash(password, salt);

			const newUser = new User({
				fullname,
				username,
				email,
				password: passwordHash,
			});

			if (newUser) {
				generateToken(newUser._id, res);
				await newUser.save();

				res.status(201).json({
					_id: newUser._id,
					fullname: newUser.fullname,
					username: newUser.username,
					email: newUser.email,
					followers: newUser.followers,
					following: newUser.following,
					profilePicture: newUser.profilePicture,
					coverPicture: newUser.coverPicture,
				});
			} else {
				res.status(400).json({
					message: 'Failed to create user!',
				});
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: 'Internal server error!',
			});
		}
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isMatch = await bcrypt.compare(password, user?.password || '');

		if (!user || !isMatch) {
			return res.status(400).json({
				message: 'Invalid username or password!',
			});
		}

		generateToken(user._id, res);
		res.status(200).json({
			_id: user._id,
			fullname: user.fullname,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profilePicture: user.profilePicture,
			coverPicture: user.coverPicture,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie('jwt', '', { maxAge: 0 });
		res.status(200).json({
			message: 'Logged out successfully!',
		});
	} catch (error) {
		console.error('error in logout controller:', error.message);
		res.status(500).json({
			error: 'Internal server error!',
		});
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		res.status(200).json(user);
	} catch (error) {
		console.error('error in getMe controller:', error.message);
		res.status(500).json({
			error: 'Internal server error!',
		});
	}
};
