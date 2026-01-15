import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  UserGroupIcon, // CHANGED: Used for "Manage Access"
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
        canManage: true, // Renamed for clarity
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
        canManage: false, // Editors usually can't manage other users
        label:
          role === "edit" ? "Editor" : role === "delete" ? "Editor" : "Viewer",
        badgeClass: canEdit
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-600 border border-gray-200",
      };
    }

    // 3. FALLBACK
    return {
      role: "viewer",
      canDelete: false,
      canManage: false,
      label: "Viewer",
      badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => {
        const { role, canDelete, canManage, label, badgeClass } =
          getFilePermissions(file);
        const FileIcon = getFileIcon(file.type);

        return (
          <div
            key={file._id}
            className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
          >
            {/* --- PREVIEW AREA --- */}
            <div
              onClick={() => navigate(`/file/${file._id}`)}
              className="cursor-pointer relative h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <FileIcon className="w-16 h-16 text-gray-300 group-hover:text-gray-400 transition-colors duration-300" />
              )}

              {/* Role Badge (Hidden for Owner) */}
              {label && (
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* --- INFO AREA --- */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3
                  className="text-sm font-bold text-gray-900 truncate mb-1"
                  title={file.name}
                >
                  {file.name}
                </h3>

                {/* Shared By Badge */}
                {role !== "owner" && file.owner && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                      {file.owner.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">
                      Shared by{" "}
                      <span className="font-medium text-gray-700">
                        {file.owner.name}
                      </span>
                    </span>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4 font-medium mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>
                    {new Date(file.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* --- ACTION BUTTONS --- */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {/* 1. PRIMARY: Open (Green) or View (Black) */}
                <button
                  onClick={() => navigate(`/file/${file._id}`)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${
                    role === "edit" || role === "owner"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {role === "edit" || role === "owner" ? (
                    <>
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Open
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-3.5 h-3.5" /> View
                    </>
                  )}
                </button>

                {/* 2. MANAGE USERS (Blue) - Only for Owner */}
                {/* Changed Icon to UserGroupIcon to signify "Manage Users" */}
                {canManage && onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(file); // Opens the Share/Manage Modal
                    }}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Manage Users & Access"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                  </button>
                )}

                {/* 3. DELETE (Red) */}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file._id);
                    }}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
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
