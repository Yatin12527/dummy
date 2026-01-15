import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import { FolderIcon, ShareIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  // State to track which tab is active: 'my' or 'shared'
  const [activeTab, setActiveTab] = useState("my");
  const navigate = useNavigate();

  // Fetch files whenever the activeTab changes
  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const fetchFiles = async () => {
    try {
      // Dynamic Endpoint based on active tab
      const endpoint =
        activeTab === "my" ? "/api/files/myfiles" : "/api/files/shared";
      const { data } = await api.get(endpoint);
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files");
      toast.error("Could not load files");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/api/files/${id}`);
      toast.success("File deleted");
      fetchFiles(); // Refresh list after delete
    } catch (error) {
      // Backend will return 403 if you try to delete a shared file (as intended)
      toast.error(error.response?.data?.message || "Failed to delete file");
    }
  };

  const redirectLogic = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>

      {/* Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <img
                src="/miniDrive.svg"
                alt="Mini Drive logo"
                className="h-7 w-7"
              />
              <span className="flex text-gray-900 items-center gap-2">
                Mini Drive
                {user.role === "admin" && (
                  <sup className="ml-1 text-[10px] p-1 font-semibold text-blue-600 border border-blue-600 rounded-full px-1 leading-none">
                    admin
                  </sup>
                )}
              </span>
            </h1>

            <div className="flex items-center gap-4">
              <Notifications />
              <div className="hidden sm:flex items-center gap-4 border-l border-gray-200 pl-4">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                {user.role === "admin" && (
                  <button
                    onClick={redirectLogic}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Only show Upload button if looking at MY files */}
        {activeTab === "my" && (
          <div className="mb-10 animate-fade-in">
            <FileUpload onUploadSuccess={fetchFiles} />
          </div>
        )}

        <div>
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTab === "my" ? "Your Files" : "Shared with You"}
            </h2>

            {/* TAB TOGGLE BUTTONS */}
            <div className="bg-gray-100 p-1 rounded-lg inline-flex shadow-inner">
              <button
                onClick={() => setActiveTab("my")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "my"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FolderIcon className="h-4 w-4" />
                My Files
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "shared"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ShareIcon className="h-4 w-4" />
                Shared with me
              </button>
            </div>
          </div>

          {/* List Display */}
          {files.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                {activeTab === "my"
                  ? "You haven't uploaded any files yet."
                  : "No files have been shared with you yet."}
              </p>
            </div>
          ) : (
            <FileList files={files} onDelete={handleDelete} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
