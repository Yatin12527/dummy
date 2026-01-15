import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  ShareIcon,
  EyeIcon,
  PencilSquareIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const FileList = ({ files, onDelete, onShare }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getFilePermissions = (file) => {
    // 1. OWNER (No Badge, Full Permissions)
    if (file.owner?._id === user.id || file.owner === user.id) {
      return {
        role: "owner",
        canDelete: true,
        canShare: true,
        label: null, // Removed Badge
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
        canShare: false,
        label:
          role === "edit" ? "Editor" : role === "delete" ? "Editor" : "Viewer",
        // Editor Badge: Black BG + White Text
        // Viewer Badge: Gray Default
        badgeClass: canEdit
          ? "bg-gray-900 text-white border border-gray-900 shadow-md"
          : "bg-gray-100 text-gray-600 border border-gray-200",
      };
    }

    // 3. FALLBACK / VIEWER
    return {
      role: "viewer",
      canDelete: false,
      canShare: false,
      label: "Viewer",
      badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
    };
  };

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
        const { role, canDelete, canShare, label, badgeClass } =
          getFilePermissions(file);
        const FileIcon = getFileIcon(file.type);

        return (
          <div
            key={file._id}
            className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* File Preview */}
            <div
              onClick={() => navigate(`/file/${file._id}`)}
              className="cursor-pointer relative h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <FileIcon className="w-12 h-12 text-gray-300 group-hover:text-gray-400 transition-colors" />
              )}

              {/* Role Badge (Only show if label exists, i.e., NOT owner) */}
              {label && (
                <div className="absolute top-3 right-3">
                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3
                  className="text-sm font-semibold text-gray-900 truncate mb-1"
                  title={file.name}
                >
                  {file.name}
                </h3>

                {/* Shared By */}
                {role !== "owner" && file.owner && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    Shared by{" "}
                    <span className="font-medium text-gray-700">
                      {file.owner.name}
                    </span>
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>
                    {new Date(file.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {/* PRIMARY ACTION BUTTON */}
                <button
                  onClick={() => navigate(`/file/${file._id}`)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md shadow-sm transition-all ${
                    role === "edit" || role === "owner"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md" // Open (Green)
                      : "bg-gray-900 text-white hover:bg-black hover:shadow-md" // View (Black)
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

                {/* SHARE BUTTON (Blue Outline) */}
                {canShare && onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(file);
                    }}
                    className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-md transition-all shadow-sm"
                    title="Share"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
                )}

                {/* DELETE BUTTON (Solid Red) */}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file._id);
                    }}
                    className="p-2 bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md rounded-md transition-all shadow-sm"
                    title="Delete"
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
