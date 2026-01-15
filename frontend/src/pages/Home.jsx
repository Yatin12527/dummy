import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AccessModal from "../components/AccessModal";
import {
  FolderIcon,
  FolderOpenIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("my");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchFiles();

    // Start polling for updates every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchFiles();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [activeTab]);

  const fetchFiles = async () => {
    try {
      const endpoint =
        activeTab === "my" ? "/api/files/myfiles" : "/api/files/shared";
      const { data } = await api.get(endpoint);
      setFiles(data);
    } catch (error) {
      // Only show error on initial load, not during polling
      if (files.length === 0) {
        toast.error("Could not load files");
      }
    } finally {
      setIsLoading(false);
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

  const handleManageClick = (file) => {
    setSelectedFileId(file._id);
    setShowAccessModal(true);
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === "my" && (
          <div className="mb-10">
            <FileUpload onUploadSuccess={fetchFiles} />
          </div>
        )}

        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {activeTab === "my" ? (
                <>
                  <FolderIcon className="w-7 h-7" />
                  Your Files
                </>
              ) : (
                <>
                  <ShareIcon className="w-7 h-7" />
                  Shared with You
                </>
              )}
            </h2>
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                  activeTab === "my"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                <FolderIcon className="w-4 h-4" />
                My Files
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                  activeTab === "shared"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                <ShareIcon className="w-4 h-4" />
                Shared
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">
                Loading files...
              </p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-gray-50 rounded-full p-6 mb-4">
                {activeTab === "my" ? (
                  <FolderOpenIcon className="w-16 h-16 text-gray-300" />
                ) : (
                  <ShareIcon className="w-16 h-16 text-gray-300" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === "my" ? "No files yet" : "No shared files"}
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {activeTab === "my"
                  ? "Upload your first file to get started with Mini Drive"
                  : "Files shared with you by others will appear here"}
              </p>
            </div>
          ) : (
            <FileList
              files={files}
              onDelete={handleDelete}
              onShare={handleManageClick}
            />
          )}
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
