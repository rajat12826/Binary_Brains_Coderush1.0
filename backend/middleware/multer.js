import multer from "multer";

const storage = multer.memoryStorage(); // keep file in memory, not disk

function fileFilter(req, file, cb) {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip"
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PDF, DOCX, or ZIP files are allowed"), false);
  }
  cb(null, true);
}

export const upload = multer({ storage, fileFilter });
