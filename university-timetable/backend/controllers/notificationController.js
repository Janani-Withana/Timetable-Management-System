// controllers/notificationController.js
const Notification = require('../models/notification');

// Create Notification
const createNotification = async (message, eventType, recipients) => {
  try {
    const notification = new Notification({
      message,
      eventType,
      recipients,
      timestamp: Date.now()
    });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get Unread Notifications for a User
const getUnreadNotifications = async (recipient) => {
  try {
    const notifications = await Notification.find({ recipient, read: false });
    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
};

// Mark Notification as Read
const markNotificationAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

module.exports = {
  createNotification,
  getUnreadNotifications,
  markNotificationAsRead
};
