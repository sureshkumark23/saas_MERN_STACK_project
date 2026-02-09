const Notification = require("../models/notification");

/**
 * GET MY NOTIFICATIONS
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId,
    })
      .populate("workspace", "name")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * MARK NOTIFICATION AS READ
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: req.user.userId,
      },
      {
        isRead: true,
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
};
