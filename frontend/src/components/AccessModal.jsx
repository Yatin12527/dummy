import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";

const AccessModal = ({ fileId, onClose }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, [fileId]);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get(`/api/files/${fileId}/requests`);
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests");
    }
  };

  const handleGrant = async (userId) => {
    try {
      await api.post(`/api/files/${fileId}/grant`, {
        userId,
      });
      toast.success("Access Granted!");
      setRequests(requests.filter((r) => r._id !== userId));
    } catch (error) {
      toast.error("Failed to grant access");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-bold mb-4">Manage Access</h3>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending requests.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {requests.map((user) => (
              <li
                key={user._id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => handleGrant(user._id)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                >
                  <CheckCircleIcon className="h-4 w-4" /> Approve
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccessModal;
