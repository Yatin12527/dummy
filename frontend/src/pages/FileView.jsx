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
  UserGroupIcon, // Import this
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import AccessModal from "../components/AccessModal"; // Import the Modal

const FileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [role, setRole] = useState("none");
  const [loading, setLoading] = useState(true);

  // States
  const [accessDenied, setAccessDenied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false); // Modal State

  // ... (Keep newName, newFile, isSaving states same as before)
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

  // ... (Keep handleRequestAccess, handleDownload, handleDelete, handleSaveEdit same as before) ...
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

  // Access Denied Screen (Same as before)
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-500 mb-6">
            You need permission to view this file.
          </p>
          {user ? (
            requestSent ? (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg font-medium">
                Request Sent!
              </div>
            ) : (
              <button
                onClick={handleRequestAccess}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
              >
                <PaperAirplaneIcon className="h-5 w-5" /> Request Access
              </button>
            )
          ) : (
            <button
              onClick={() =>
                navigate("/login", { state: { from: `/file/${id}` } })
              }
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold"
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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-gray-500 hover:text-gray-900 text-sm"
      >
        &larr; Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* PREVIEW */}
        <div className="bg-gray-900 h-96 flex items-center justify-center relative group">
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
              <div className="text-6xl mb-2">📄</div>
              <p>Preview not available</p>
            </div>
          )}
          <button
            onClick={handleDownload}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
          </button>
        </div>

        {/* DETAILS & ACTIONS */}
        <div className="p-6">
          {!isEditing ? (
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {file.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Size: {(file.size / 1024).toFixed(2)} KB •{" "}
                  {role === "owner" ? "You" : "User"}
                </p>
              </div>

              <div className="flex gap-2">
                {/* NEW: Share Button (Only for Owner) */}
                {role === "owner" && (
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 font-medium transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    Manage Access
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode (Same as previous code...)
            <div className="bg-blue-50 -m-2 p-6 rounded-lg border border-blue-100">
              {/* ... Your edit mode code ... */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-blue-800">Edit Mode</h2>
                <button onClick={() => setIsEditing(false)}>
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* ... Rename/Replace inputs ... */}
              <div className="mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.files[0])}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER THE MODAL */}
      {showAccessModal && (
        <AccessModal fileId={id} onClose={() => setShowAccessModal(false)} />
      )}
    </div>
  );
};

export default FileView;
