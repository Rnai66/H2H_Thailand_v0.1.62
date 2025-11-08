import express from "express";
import "dotenv/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chatRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";   // ✅ import ครั้งเดียว
import itemsRoutes from "./routes/itemsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // อนุญาต non-browser clients ที่ไม่มี Origin (curl/Postman)
    if (!origin) return callback(null, true);

    // ถ้าอยู่ในลิสต์ .env → ผ่าน
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // ✅ อนุญาตทุกโดเมนที่ลงท้ายด้วย .vercel.app
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith(".vercel.app")) {
        return callback(null, true);
      }
    } catch {
      // ถ้า parse ไม่ได้ ก็ปล่อยให้ด้านล่างบล็อค
    }

    console.log("❌ CORS blocked:", origin, "Allowed:", allowedOrigins);
    return callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};


function buildAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGIN || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const defaults = ["http://localhost:5173"];
  return Array.from(new Set([...defaults, ...fromEnv]));
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// เสิร์ฟไฟล์อัปโหลด
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => res.json({ message: "H2H API is running" }));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// ✅ mount routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/items", itemsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// error handler (JSON เสมอ)
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err && (err.stack || err.message || err));
  if (err?.message === "Invalid file type") {
    return res.status(400).json({ error: "Invalid file type. Allowed: png, jpeg, webp, pdf" });
  }
  return res.status(500).json({ error: err?.message || "Server error" });
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 H2H Backend running on port ${PORT}`));
});
