import {
  XMarkIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const ShareModal = ({ fileId, fileName, onClose }) => {
  const shareLink = `${window.location.origin}/file/${fileId}`;
  const shareText = `Check out this file: ${fileName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleWhatsApp = () => {
    // Opens WhatsApp Web or App with pre-filled text
    const url = `https://wa.me/?text=${encodeURIComponent(
      shareText + " " + shareLink
    )}`;
    window.open(url, "_blank");
  };

  const handleEmail = () => {
    const subject = `Shared File: ${fileName}`;
    const body = `Hi,\n\nI wanted to share this file with you: ${fileName}\n\nView it here: ${shareLink}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 text-gray-800">Share File</h3>

        {/* Link Display */}
        <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500 truncate mr-2">
            {shareLink}
          </span>
          <button
            onClick={handleCopy}
            className="text-blue-600 font-bold text-xs hover:underline"
          >
            COPY
          </button>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors group"
          >
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Email</span>
          </button>

          {/* Copy Link (Big Button) */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="bg-gray-200 p-3 rounded-full group-hover:bg-gray-300">
              <LinkIcon className="h-6 w-6 text-gray-700" />
            </div>
            <span className="text-xs font-medium text-gray-700">Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
