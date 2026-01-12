import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";

const FileView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFile = async () => {
    try {
      const res = await api.get(`/api/files/${id}`);
      setData(res.data);
    } catch (error) {
      toast.error("Error loading file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [id]);

  const handleRequestAccess = async () => {
    try {
      await api.post(`/api/files/${id}/request`);
      toast.success("Request sent!");
      fetchFile();
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!data?.hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔒 Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this file.
          </p>

          {data?.hasRequested ? (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            >
              Request Pending...
            </button>
          ) : (
            <button
              onClick={handleRequestAccess}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Request Access
            </button>
          )}
        </div>
      </div>
    );
  }

  const { file } = data;
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">{file.name}</h1>
          <a
            href={file.url}
            download
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Download Original
          </a>
        </div>

        <div className="p-8 flex justify-center bg-gray-100">
          {file.type.includes("image") ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[70vh] object-contain shadow-lg"
            />
          ) : (
            <iframe
              src={file.url}
              className="w-full h-[70vh] border shadow-lg"
              title="pdf-viewer"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileView;
