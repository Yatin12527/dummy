import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  accessRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const File = mongoose.model("File", fileSchema);
export default File;