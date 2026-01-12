import { useEffect, useState } from "react";
import {
  XMarkIcon,
  GlobeAltIcon,
  LockClosedIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import api from "../utils/api";
import toast from "react-hot-toast";

const AccessModal = ({ fileId, onClose }) => {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("view");
  const [loading, setLoading] = useState(false);

  // General Access States
  const [accessType, setAccessType] = useState("restricted");
  const [publicPermission, setPublicPermission] = useState("view");

  useEffect(() => {
    fetchFileDetails();
  }, [fileId]);

  const fetchFileDetails = async () => {
    try {
      const { data } = await api.get(`/api/files/${fileId}`);
      setFile(data.file);
      setAccessType(data.file.accessType || "restricted");
      setPublicPermission(data.file.publicPermission || "view");
    } catch (error) {
      console.error("Error fetching file details");
      toast.error("Failed to load access details");
    }
  };

  // 1. Handle Inviting New Users via Email
  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await api.post(`/api/files/${fileId}/share`, { email, role: inviteRole });
      toast.success(`Access granted to ${email}`);
      setEmail(""); // Clear input
      fetchFileDetails(); // Refresh list to show new user
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Changing General Access (Restricted vs Public)
  const handleGeneralAccessChange = async (newType, newPermission) => {
    // Optimistic UI Update
    setAccessType(newType);
    if (newPermission) setPublicPermission(newPermission);

    try {
      await api.put(`/api/files/${fileId}/access`, {
        accessType: newType,
        publicPermission: newPermission || publicPermission,
      });
      toast.success("General access updated");
    } catch (error) {
      toast.error("Failed to update access");
      fetchFileDetails(); // Revert on error
    }
  };

  // 3. Handle Managing Existing Users (Update Role or Remove)
  const handlePermissionChange = async (userId, newRole) => {
    try {
      await api.put(`/api/files/${fileId}/manage-access`, {
        userId,
        role: newRole,
      });

      if (newRole === "remove") {
        toast.success("Access removed");
      } else {
        toast.success("Permission updated");
      }

      fetchFileDetails(); // Refresh list
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/file/${fileId}`);
    toast.success("Link copied!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg truncate pr-4">
            Share "{file?.name}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* SECTION 1: Invite People */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Add people via email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded px-2 text-sm focus:outline-none"
              >
                <option value="view">Viewer</option>
                <option value="edit">Editor</option>
              </select>
              <button
                onClick={handleShare}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>

          {/* SECTION 2: People with Access List */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">
              People with access
            </p>
            <div className="space-y-4">
              {/* Owner Row (Static) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    YOU
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      You (Owner)
                    </p>
                    <p className="text-xs text-gray-500">Owner</p>
                  </div>
                </div>
              </div>

              {/* Shared Users Rows (Dynamic) */}
              {file?.sharedWith?.map(
                (share) =>
                  share.user && (
                    <div
                      key={share.user._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {share.user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {share.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {share.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Permission Dropdown */}
                      <select
                        value={share.role}
                        onChange={(e) =>
                          handlePermissionChange(share.user._id, e.target.value)
                        }
                        className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-100"
                      >
                        <option value="view">Viewer</option>
                        <option value="edit">Editor</option>
                        <hr disabled />
                        <option
                          value="remove"
                          className="text-red-600 font-bold"
                        >
                          Remove access
                        </option>
                      </select>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* SECTION 3: General Access (Public/Private) */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">
              General Access
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    accessType === "public" ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {accessType === "public" ? (
                    <GlobeAltIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                <div className="flex flex-col">
                  <select
                    value={accessType}
                    onChange={(e) => handleGeneralAccessChange(e.target.value)}
                    className="text-sm font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1 w-full"
                  >
                    <option value="restricted">Restricted</option>
                    <option value="public">Anyone with the link</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    {accessType === "restricted"
                      ? "Only people added can open with this link"
                      : "Anyone on the internet with the link can view"}
                  </p>
                </div>
              </div>

              {/* Permission Dropdown (Only visible if Public) */}
              {accessType === "public" && (
                <select
                  value={publicPermission}
                  onChange={(e) =>
                    handleGeneralAccessChange("public", e.target.value)
                  }
                  className="text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-900"
                >
                  <option value="view">Viewer</option>
                  <option value="edit">Editor</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-blue-600 font-bold text-sm px-4 py-2 rounded-full border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;
