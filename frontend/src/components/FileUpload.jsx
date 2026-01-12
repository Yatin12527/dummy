import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("File uploaded successfully!");
      setFile(null);
      document.getElementById("fileInput").value = "";
      onUploadSuccess();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">Upload New File</h3>
      <form onSubmit={handleUpload} className="flex gap-4 items-center">
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={uploading}
          className={`px-4 py-2 text-white font-bold rounded ${
            uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;