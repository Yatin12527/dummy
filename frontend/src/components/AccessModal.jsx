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

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await api.post(`/api/files/${fileId}/share`, { email, role: inviteRole });
      toast.success(`Access granted to ${email}`);
      setEmail("");
      fetchFileDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralAccessChange = async (newType, newPermission) => {
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
      fetchFileDetails();
    }
  };

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

      fetchFileDetails();
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/file/${fileId}`);
    toast.success("Link copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200/50">
        {/* Header */}
        <div className="bg-white px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg sm:text-xl truncate pr-4">
            Share: <span className="text-blue-600">"{file?.name}"</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all flex-shrink-0"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* SECTION 1: Invite People */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Invite people
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
              >
                <option value="view">Viewer</option>
                <option value="edit">Editor</option>
              </select>
              <button
                onClick={handleShare}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>

          {/* SECTION 2: People with Access List */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              People with access
            </label>
            <div className="space-y-3">
              {/* Owner Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    YOU
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      You (Owner)
                    </p>
                    <p className="text-xs text-gray-500">Full access</p>
                  </div>
                </div>
              </div>

              {/* Shared Users Rows */}
              {file?.sharedWith && file?.sharedWith?.length > 0 ? (
                file?.sharedWith?.map(
                  (share) =>
                    share.user && (
                      <div
                        key={share.user._id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 uppercase">
                            {share.user.name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {share.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {share.user.email}
                            </p>
                          </div>
                        </div>

                        {/* Permission Dropdown */}
                        <select
                          value={share.role}
                          onChange={(e) =>
                            handlePermissionChange(
                              share.user._id,
                              e.target.value
                            )
                          }
                          className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer hover:border-gray-400 ml-2 flex-shrink-0"
                        >
                          <option value="view">Viewer</option>
                          <option value="edit">Editor</option>
                          <option value="remove" className="text-red-600">
                            Remove access
                          </option>
                        </select>
                      </div>
                    )
                )
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No one else has access yet
                </p>
              )}
            </div>
          </div>

          {/* SECTION 3: General Access */}
          <div className="border-t border-gray-100 pt-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              General access
            </label>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2.5 rounded-lg flex-shrink-0 ${
                      accessType === "public" ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    {accessType === "public" ? (
                      <GlobeAltIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <LockClosedIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <select
                      value={accessType}
                      onChange={(e) =>
                        handleGeneralAccessChange(e.target.value)
                      }
                      className="text-sm font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer w-full"
                    >
                      <option value="restricted">Restricted</option>
                      <option value="public">Anyone with the link</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      {accessType === "restricted"
                        ? "Only invited people can access"
                        : "Anyone on the internet with the link can access"}
                    </p>
                  </div>
                </div>

                {/* Permission Dropdown for Public */}
                {accessType === "public" && (
                  <select
                    value={publicPermission}
                    onChange={(e) =>
                      handleGeneralAccessChange("public", e.target.value)
                    }
                    className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer hover:border-gray-400 flex-shrink-0"
                  >
                    <option value="view">Viewer</option>
                    <option value="edit">Editor</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-100">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm px-4 py-2.5 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;
