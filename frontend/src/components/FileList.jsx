import { useState } from "react";
import {
  TrashIcon,
  EyeIcon,
  ShareIcon,
  UserGroupIcon,
  DocumentIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import AccessModal from "./AccessModal";
import ShareModal from "./ShareModal"; 

const FileList = ({ files, onDelete }) => {
  const [accessModalFileId, setAccessModalFileId] = useState(null);
  const [shareModalFile, setShareModalFile] = useState(null); // Tracks which file to share

  const getFileFormat = (filename) => {
    if (!filename) return "FILE";
    return filename.split(".").pop().toUpperCase();
  };

  const renderPreview = (file) => {
    if (file.type.startsWith("image/") && !file.type.includes("svg")) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            src={file.url}
            className="w-full h-full object-cover opacity-80"
            muted
          />
          <VideoCameraIcon className="absolute h-12 w-12 text-white opacity-80" />
        </div>
      );
    }
    if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-purple-50">
          <MusicalNoteIcon className="h-16 w-16 text-purple-500" />
          <span className="text-xs font-bold text-purple-600 mt-2">AUDIO</span>
        </div>
      );
    }
    if (file.type.includes("pdf")) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50">
          <DocumentIcon className="h-16 w-16 text-red-500" />
          <span className="text-xs font-bold text-red-600 mt-2">PDF</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400" />
        <span className="text-xs font-bold text-gray-500 mt-2">
          {getFileFormat(file.name)} FILE
        </span>
      </div>
    );
  };

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
            className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Preview Section */}
            <div className="h-40 flex items-center justify-center overflow-hidden relative group">
              {renderPreview(file)}
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"
              />
            </div>

            {/* Footer Section */}
            <div className="p-4">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={file.name}
              >
                {file.name}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <a
                  href={`/file/${file._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                >
                  <EyeIcon className="h-3 w-3" /> View
                </a>
                <button
                  onClick={() => setShareModalFile(file)}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                >
                  <ShareIcon className="h-3 w-3" /> Share
                </button>

                <button
                  onClick={() => setAccessModalFileId(file._id)}
                  className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs"
                >
                  <UserGroupIcon className="h-3 w-3" /> Access
                </button>

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

      {/* Access Modal */}
      {accessModalFileId && (
        <AccessModal
          fileId={accessModalFileId}
          onClose={() => setAccessModalFileId(null)}
        />
      )}

      {/* Share Modal */}
      {shareModalFile && (
        <ShareModal
          fileId={shareModalFile._id}
          fileName={shareModalFile.name}
          onClose={() => setShareModalFile(null)}
        />
      )}
    </>
  );
};

export default FileList;
