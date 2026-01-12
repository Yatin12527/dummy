import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

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
      console.log("notif data:",data)
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleRead = async (notif) => {
    try {
      await api.put(`/api/notifications/${notif._id}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notif._id ? { ...n, isRead: true } : n
        )
      );

      navigate(`/file/${notif.file._id}`);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error reading notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-blue-600"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleRead(notif)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    notif.isRead ? "opacity-50" : "bg-blue-50"
                  }`}
                >
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
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
