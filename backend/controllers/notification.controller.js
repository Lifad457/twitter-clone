import Notification from '../models/notification.model.js';

export const getAllNotifications = async (req, res) => {
	try {
		const userId = req.user._id;
		const notifications = await Notification.find({ to: userId }).populate({
			path: 'from',
			select: 'username profilePicture',
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json({
			notifications,
		});
	} catch (error) {
		console.log('Error in getAllNotifications : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({
			message: 'Notifications deleted successfully!',
		});
	} catch (error) {
		console.log('Error in deleteNotification : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};

export const deleteNotification = async (req, res) => {
	try {
		const notificationId = req.params.id;
		const notification = await Notification.findById(notificationId);
		if (!notification) {
			return res.status(404).json({
				message: 'Notification not found!',
			});
		}
		const userId = req.user._id;
		if (notification.to.toString() !== userId.toString()) {
			return res.status(403).json({
				message: 'You are not authorized to delete this notification!',
			});
		}
		await Notification.findByIdAndDelete(notificationId);

		res.status(200).json({
			message: 'Notification deleted successfully!',
		});
	} catch (error) {
		console.log('Error in markNotificationRead : ', error.message);
		res.status(500).json({
			message: 'Internal server error!',
		});
	}
};