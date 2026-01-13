import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";

const Home = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const { data } = await api.get("/api/files/myfiles");
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/api/files/${id}`);
      toast.success("File deleted");
      fetchFiles();
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const redirectLogic = () => {
    navigate("/admin");
  };

  console.log(user);

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>

      {/* Navbar */}
      <nav className=" top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
        <div className="mb-10">
          <FileUpload onUploadSuccess={fetchFiles} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your Files
          </h2>
          <FileList files={files} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
};

export default Home;
