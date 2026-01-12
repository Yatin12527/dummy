import { useState } from "react";
import {
  TrashIcon,
  EyeIcon,
  ShareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import AccessModal from "./AccessModal";

const FileList = ({ files, onDelete }) => {
  const [selectedFileId, setSelectedFileId] = useState(null);

  if (files.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">No files uploaded yet.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
          >
            {/* Preview Area */}
            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              {file.type.includes("image") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-4xl">📄</span>
              )}
            </div>

            {/* Footer Area */}
            <div className="p-4">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={file.name}
              >
                {file.name}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {/* View */}
                <a
                  href={`/file/${file._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                >
                  <EyeIcon className="h-3 w-3" /> View
                </a>

                {/* Share */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/file/${file._id}`
                    );
                    toast.success("Link copied!");
                  }}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                >
                  <ShareIcon className="h-3 w-3" /> Share
                </button>

                {/* Manage Access (New) */}
                <button
                  onClick={() => setSelectedFileId(file._id)}
                  className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs"
                >
                  <UserGroupIcon className="h-3 w-3" /> Access
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(file._id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs"
                >
                  <TrashIcon className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Render Modal if a file is selected */}
      {selectedFileId && (
        <AccessModal
          fileId={selectedFileId}
          onClose={() => setSelectedFileId(null)}
        />
      )}
    </>
  );
};

export default FileList;
