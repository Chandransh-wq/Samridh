import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
    },
    pageContent: {
      type: String,
    },
    pageCreated: {
      type: Date, // Changed to Date type
      default: Date.now,
    },
    tags: [{ type: String }], // Corrected array of strings
  },
  { timestamps: true }
); // Mongoose handles createdAt/updatedAt automatically

const folderSchema = new mongoose.Schema(
  {
    createdBy: {
      // Assuming 'createdBy' refers to a User ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    color: {
      type: String,
      required: true,
    },
    favourite: {
      type: Boolean,
      required: true,
      default: false,
    },
    tags: [{ type: String }], // Corrected array of strings
    icons: {
      type: String, // Assuming this stores a single URL or name
      default: "Other",
    },
    pages: [
      {
        // Corrected to be an array of ObjectIds referencing the 'Page' model
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
      },
    ],
  },
  { timestamps: true }
); // Mongoose handles createdAt/updatedAt automatically

// You typically need to define models before exporting the folder schema
const Page = mongoose.model("Page", pageSchema);
const Folder = mongoose.model("Folder", folderSchema);

export { Page, Folder };
// Export the models instead of just the schema
