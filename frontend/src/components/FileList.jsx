import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  UserGroupIcon,
  EyeIcon,
  PencilSquareIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const FileList = ({ files, onDelete, onShare }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- PERMISSION LOGIC ---
  const getFilePermissions = (file) => {
    // 1. OWNER (Full Access)
    if (file.owner?._id === user.id || file.owner === user.id) {
      return {
        role: "owner",
        canDelete: true,
        canManage: true,
        label: null,
        badgeClass: null,
      };
    }

    // 2. SHARED USER
    const sharedInfo = file.sharedWith?.find(
      (s) => s.user === user.id || s.user?._id === user.id
    );

    if (sharedInfo) {
      const role = sharedInfo.role;
      const canEdit = role === "edit" || role === "delete";
      return {
        role,
        canDelete: canEdit,
        canManage: false,
        label:
          role === "edit" ? "Editor" : role === "delete" ? "Editor" : "Viewer",
        badgeClass: canEdit
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
      };
    }

    // 3. FALLBACK
    return {
      role: "viewer",
      canDelete: false,
      canManage: false,
      label: "Viewer",
      badgeClass: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
    };
  };

  // --- ICON HELPER ---
  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return PhotoIcon;
    if (type.startsWith("video/")) return FilmIcon;
    if (type.startsWith("audio/")) return MusicalNoteIcon;
    if (type.includes("pdf")) return DocumentTextIcon;
    if (type.includes("zip") || type.includes("rar")) return ArchiveBoxIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {files.map((file) => {
        const { role, canDelete, canManage, label, badgeClass } =
          getFilePermissions(file);
        const FileIcon = getFileIcon(file.type);

        return (
          <div
            key={file._id}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* --- PREVIEW AREA --- */}
            <div
              onClick={() => navigate(`/file/${file._id}`)}
              className="cursor-pointer relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl"></div>
                  <FileIcon className="relative w-20 h-20 text-gray-400 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-110" />
                </div>
              )}

              {/* Role Badge */}
              {label && (
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-lg backdrop-blur-sm ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* --- INFO AREA --- */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex-grow space-y-3">
                <h3
                  className="text-sm font-bold text-gray-900 truncate"
                  title={file.name}
                >
                  {file.name}
                </h3>

                {/* Shared By Badge */}
                {role !== "owner" && file.owner && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {file.owner.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600">
                      <span className="font-medium text-gray-800">
                        {file.owner.name}
                      </span>
                    </span>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {formatFileSize(file.size)}
                  </span>
                  <span>
                    {new Date(file.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* --- ACTION BUTTONS --- */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                {/* 1. PRIMARY: Open or View */}
                <button
                  onClick={() => navigate(`/file/${file._id}`)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                    role === "edit" || role === "owner"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black"
                  }`}
                >
                  {role === "edit" || role === "owner" ? (
                    <>
                      <PencilSquareIcon className="w-4 h-4" /> Open
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" /> View
                    </>
                  )}
                </button>

                {/* 2. MANAGE USERS - Only for Owner */}
                {canManage && onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(file);
                    }}
                    className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-blue-100"
                    title="Manage Users & Access"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                  </button>
                )}

                {/* 3. DELETE */}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file._id);
                    }}
                    className="p-2.5 bg-gradient-to-br from-rose-50 to-red-50 text-rose-600 hover:from-rose-100 hover:to-red-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-rose-100"
                    title="Delete File"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileList;