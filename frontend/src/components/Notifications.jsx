import { useState, useEffect } from "react";
import { BellIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleRead = async (notif) => {
    try {
      // Mark as read in backend
      if (!notif.read) {
        await api.put(`/api/notifications/${notif._id}/read`);

        // Update local state (optimistic UI)
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      }

      setShowDropdown(false);

      // Navigate if it's a file request
      if (notif.file) {
        navigate(`/file/${notif.file._id}`);
      }
    } catch (error) {
      console.error("Error reading notification");
    }
  };

  const handleMarkAllRead = async () => {
    // Only proceed if there are unread items
    if (notifications.every((n) => n.read)) return;

    try {
      await api.put("/api/notifications/mark-read-all");

      // Update local state instantly
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-2 right-10 mt-2 w-80 bg-white rounded-lg shadow-xl z-[100] overflow-hidden border border-gray-100 animate-fade-in-down">
          {/* Header with Mark All Read Button */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Notifications</span>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                title="Mark all as read"
              >
                <CheckBadgeIcon className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto overflow-x-hidden">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleRead(notif)}
                  className={`p-4 border-b transition-colors cursor-pointer hover:bg-gray-50 flex gap-3 ${
                    notif.read ? "bg-white opacity-70" : "bg-blue-50"
                  }`}
                >
                  {/* Blue dot for unread */}
                  {!notif.read && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}

                  <div>
                    <p
                      className={`text-sm ${
                        notif.read
                          ? "text-gray-600"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;