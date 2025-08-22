// src/config/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // ✅ IMPORTANT
import cloudinary from "../config/cloudinary.js"; // your Cloudinary config

// Cloudinary storage for PDFs/DOCX/ZIP
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "submissions",
    resource_type: "raw", // for PDFs/DOCX/ZIP
    public_id: (req, file) => Date.now() + "_" + file.originalname,
    access_mode: "public",
  },
});

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

export const upload = multer({ storage, fileFilter });
