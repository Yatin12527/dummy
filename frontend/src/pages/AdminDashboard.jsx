import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, totalUsers: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Access Denied");
      navigate("/");
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const filesRes = await api.get("/api/admin/all-files");
      const statsRes = await api.get("/api/admin/stats");
      setFiles(filesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching admin data");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Admin Action: Delete this file permanently?")) return;
    try {
      await api.delete(`/api/files/${id}`);
      toast.success("File deleted by Admin");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-400">Admin Dashboard 🛡️</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white"
            >
              User View
            </button>
            <button
              onClick={logout}
              className="text-red-400 border border-red-400 px-3 rounded hover:bg-red-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">
              Total Users
            </h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">
              Total Files Uploaded
            </h3>
            <p className="text-2xl font-bold">{stats.totalFiles}</p>
          </div>
        </div>

        {/* All Files Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file._id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.owner?.email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
