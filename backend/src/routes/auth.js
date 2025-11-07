import { Router } from "express";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * Login ง่าย ๆ ให้ token (เพื่อทดสอบ flow)
 * รับอะไรมาก็ได้ขั้นต่ำ { userId, name }
 */
router.post("/login", (req, res) => {
  const { userId, name, role = "user" } = req.body || {};
  if (!userId || !name) return res.status(400).json({ message: "userId and name required" });

  const token = jwt.sign({ _id: userId, name, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
  res.json({ token });
});

/** โปรไฟล์จาก token */
router.get("/profile", auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
