import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import AccessModal from "../components/AccessModal";

const FileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [role, setRole] = useState("none");
  const [loading, setLoading] = useState(true);

  const [accessDenied, setAccessDenied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      const { data } = await api.get(`/api/files/${id}`);
      setFile(data.file);
      setRole(data.role);
      setNewName(data.file.name);
      if (data.hasRequested) setRequestSent(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setAccessDenied(true);
      } else {
        toast.error("Could not load file");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    try {
      await api.post(`/api/files/${id}/request`);
      setRequestSent(true);
      toast.success("Request sent to owner!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(file.url, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this file forever?"))
      return;
    try {
      await api.delete(`/api/files/${id}`);
      toast.success("File deleted");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("name", newName);
      if (newFile) {
        formData.append("file", newFile);
      }

      const { data } = await api.put(`/api/files/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(data.file);
      setIsEditing(false);
      setNewFile(null);
      toast.success("File updated successfully!");
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
            <LockClosedIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You need permission to view this file.
          </p>
          {user ? (
            requestSent ? (
              <div className="bg-green-50 text-green-700 px-5 py-3 rounded-lg font-medium border border-green-200">
                Request Sent!
              </div>
            ) : (
              <button
                onClick={handleRequestAccess}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" /> Request Access
              </button>
            )
          ) : (
            <button
              onClick={() =>
                navigate("/login", { state: { from: `/file/${id}` } })
              }
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Log In to Request
            </button>
          )}
        </div>
      </div>
    );
  }

  const canEdit = role === "owner" || role === "edit";

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          &larr; Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* PREVIEW */}
          <div className="bg-gray-900 h-[450px] flex items-center justify-center relative group">
            {file.type.startsWith("image/") ? (
              <img
                src={file.url}
                alt={file.name}
                className="h-full object-contain"
              />
            ) : file.type.startsWith("video/") ? (
              <video src={file.url} controls className="h-full w-full" />
            ) : (
              <div className="text-white text-center">
                <div className="text-7xl mb-3">📄</div>
                <p className="text-lg">Preview not available</p>
              </div>
            )}
            <button
              onClick={handleDownload}
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg backdrop-blur-sm transition-all"
            >
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
          </div>

          {/* DETAILS & ACTIONS */}
          <div className="p-7">
            {!isEditing ? (
              <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {file.name}
                  </h1>
                  <p className="text-base text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB •{" "}
                    {role === "owner" ? "You" : "User"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {role === "owner" && (
                    <button
                      onClick={() => setShowAccessModal(true)}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-lg hover:bg-green-100 font-medium transition-all border border-green-200"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                      Manage Access
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-lg hover:bg-blue-100 font-medium transition-all border border-blue-200"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 -m-7 p-7 border-t-2 border-blue-300">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-blue-900">Edit Mode</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Replace File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewFile(e.target.files[0])}
                    className="w-full text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:bg-blue-400"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 px-6 py-2.5 font-medium hover:bg-red-50 rounded-lg transition-all border border-red-300"
                  >
                    Delete File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAccessModal && (
        <AccessModal fileId={id} onClose={() => setShowAccessModal(false)} />
      )}
    </div>
  );
};

export default FileView;
