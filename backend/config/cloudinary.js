import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mini-drive", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "pdf"], // Restrict file types
    resource_type: "auto", // Auto-detect image or raw (pdf)
  },
});

export { cloudinary, storage };