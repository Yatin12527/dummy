import { useState } from "react";
import {
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import AccessModal from "./AccessModal";
import ShareModal from "./ShareModal";

const FileList = ({ files, onDelete }) => {
  const [accessModalFileId, setAccessModalFileId] = useState(null);
  const [shareModalFile, setShareModalFile] = useState(null);

  const getFileFormat = (filename) => {
    if (!filename) return "FILE";
    return filename.split(".").pop().toUpperCase();
  };

  const getFileSize = (size) => {
    if (!size) return "";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const renderPreview = (file) => {
    if (file.type.startsWith("image/") && !file.type.includes("svg")) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
          <img
            src={file.url}
            alt={file.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
          <div className="absolute inset-0 bg-black/20" />
          <VideoCameraIcon className="relative h-16 w-16 text-white drop-shadow-lg" />
        </div>
      );
    }
    if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-violet-400 to-purple-600">
          <MusicalNoteIcon className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
      );
    }
    if (file.type.includes("pdf")) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-400 to-rose-600">
          <DocumentIcon className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-400 to-gray-600">
        <QuestionMarkCircleIcon className="h-16 w-16 text-white drop-shadow-lg" />
        <span className="text-xs font-bold text-white mt-2">
          {getFileFormat(file.name)}
        </span>
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
          <DocumentIcon className="h-12 w-12 text-indigo-500" />
        </div>
        <p className="text-lg font-medium text-gray-700">
          No files uploaded yet
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-0">
        {files.map((file) => (
          <div
            key={file._id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:-translate-y-1"
          >
            {/* Preview Section */}
            <div className="h-64 relative overflow-hidden">
              {renderPreview(file)}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <EyeIcon className="h-3.5 w-3.5" /> View
                  </a>
                  <a
                    href={file.url}
                    download
                    className="bg-white/90 hover:bg-white backdrop-blur-sm text-gray-900 p-2 rounded-lg flex items-center justify-center transition-all"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
              <h3
                className="text-sm font-semibold text-gray-900 truncate mb-1"
                title={file.name}
              >
                {file.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {getFileFormat(file.name)}{" "}
                {file.size && `• ${getFileSize(file.size)}`}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAccessModalFileId(file._id)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow"
                >
                  <UserGroupIcon className="h-3.5 w-3.5" /> Share
                </button>
                <button
                  onClick={() => onDelete(file._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-lg flex items-center justify-center transition-all"
                  title="Delete file"
                >
                  <TrashIcon className="h-4 w-4" />
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
