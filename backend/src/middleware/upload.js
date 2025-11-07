import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.resolve(process.cwd(), "uploads", "slips");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file?.originalname || "");
    cb(null, `slip_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});

export const slipUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png","image/jpeg","image/webp","application/pdf"].includes(file.mimetype);
    cb(ok ? null : new Error("Invalid file type"));
  }
});

// ✅ เพิ่มโหมด any() สำหรับกันพลาด fieldname
export const slipUploadAny = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
}).any();
