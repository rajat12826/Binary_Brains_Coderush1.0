// src/config/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Memory storage for processing
const memoryStorage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PDF, DOCX, or ZIP files are allowed"), false);
  }
  cb(null, true);
}

// Use memory storage - we'll upload to Cloudinary manually in the controller
export const upload = multer({ 
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload buffer to Cloudinary manually
export const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "submissions",
        public_id: `${Date.now()}_${filename}`,
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};