import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["view", "edit", "delete"],
          default: "view",
        },
      },
    ],

    accessType: {
      type: String,
      enum: ["restricted", "public"],
      default: "restricted",
    },
    publicPermission: {
      type: String,
      enum: ["view", "edit"],
      default: "view",
    },

    accessRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;
