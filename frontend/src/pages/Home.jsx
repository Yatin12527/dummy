import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";
import AccessModal from "../components/AccessModal";

const Home = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("my");
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const fetchFiles = async () => {
    try {
      const endpoint =
        activeTab === "my" ? "/api/files/myfiles" : "/api/files/shared";
      const { data } = await api.get(endpoint);
      setFiles(data);
    } catch (error) {
      toast.error("Could not load files");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/files/${id}`);
      toast.success("File deleted");
      fetchFiles();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // 3. HANDLER FOR THE FILE LIST BUTTON
  const handleManageClick = (file) => {
    setSelectedFileId(file._id);
    setShowAccessModal(true); // Opens the Access/Manage Modal
  };

  const redirectLogic = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <img src="/miniDrive.svg" alt="Mini Drive" className="h-7 w-7" />
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
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === "my" && (
          <div className="mb-10">
            <FileUpload onUploadSuccess={fetchFiles} />
          </div>
        )}

        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTab === "my" ? "Your Files" : "Shared with You"}
            </h2>
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeTab === "my"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                My Files
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeTab === "shared"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Shared
              </button>
            </div>
          </div>

          <FileList
            files={files}
            onDelete={handleDelete}
            onShare={handleManageClick}
          />
        </div>
      </main>

      {showAccessModal && selectedFileId && (
        <AccessModal
          fileId={selectedFileId}
          onClose={() => {
            setShowAccessModal(false);
            setSelectedFileId(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
