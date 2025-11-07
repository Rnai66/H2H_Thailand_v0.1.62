// backend/src/routes/orderRoutes.js
import express from "express";
import multer from "multer";
import Order from "../models/Order.js";
import auth from "../middleware/auth.js";
import { slipUploadAny } from "../middleware/upload.js"; // ใช้ any() กันพลาด fieldname

const router = express.Router();

// สร้างออเดอร์ (buyer)
router.post("/", auth, async (req, res, next) => {
  try {
    const { itemId, sellerId, price, method, notes } = req.body;
    const order = await Order.create({
      itemId,
      sellerId,
      buyerId: req.user._id,
      price,
      method,
      status: method === "bank_transfer" ? "PENDING_PAYMENT" : "FULFILLED",
      notes
    });
    res.json(order);
  } catch (e) { next(e); }
});

// ออเดอร์ของฉัน
router.get("/mine", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { next(e); }
});

// DEBUG: ดูว่า multipart ส่งไฟล์เข้ามาจริงไหม
const debugUpload = multer().any();
router.post("/:orderId/slip-debug",
  auth,
  (req, _res, next) => { console.log("🛰️ Content-Type:", req.headers["content-type"]); next(); },
  debugUpload,
  async (req, res) => {
    res.json({
      files: (req.files || []).map(f => ({
        fieldname: f.fieldname, originalname: f.originalname, mimetype: f.mimetype, size: f.size
      }))
    });
  }
);

// อัปโหลดสลิป (ใช้ any() เลือกไฟล์ตัวแรก)
router.post("/:orderId/slip",
  auth,
  (req, _res, next) => { console.log("🛰️ /slip Content-Type:", req.headers["content-type"]); next(); },
  slipUploadAny,
  async (req, res, next) => {
    try {
      const file = (req.files && req.files[0]) || null;
      if (!file) return res.status(400).json({ error: "No file detected (debug any())" });

      const order = await Order.findById(req.params.orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (String(order.buyerId) !== String(req.user._id)) return res.status(403).json({ error: "Not buyer" });

      order.slip = {
        url: `/uploads/slips/${file.filename}`,
        filename: file.originalname || file.filename,
        uploadedAt: new Date()
      };
      if (order.method === "bank_transfer") order.status = "PAID_PENDING_VERIFY";
      await order.save();

      res.json(order);
    } catch (e) { next(e); }
  }
);

// ผู้ขายยืนยันการชำระ
router.post("/:orderId/verify-payment", auth, async (req, res, next) => {
  try {
    console.log("🛰️ POST /verify-payment", req.params.orderId, "by", req.user._id);
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (String(order.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not seller" });
    }
    if (order.method === "bank_transfer") {
      if (order.status !== "PAID_PENDING_VERIFY") {
        return res.status(400).json({ error: "Upload slip first (status must be PAID_PENDING_VERIFY)" });
      }
      if (!order.slip?.url) return res.status(400).json({ error: "No slip uploaded" });
    }
    order.status = "PAID_VERIFIED";
    await order.save();
    res.json(order);
  } catch (e) { next(e); }
});

// ปิดงาน (buyer หรือ seller ฝ่ายใดก็ได้ที่อยู่ใน order)
router.post("/:orderId/complete", auth, async (req, res, next) => {
  try {
    console.log("🛰️ POST /complete", req.params.orderId, "by", req.user._id);
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const isParticipant =
      String(order.buyerId) === String(req.user._id) ||
      String(order.sellerId) === String(req.user._id);
    if (!isParticipant) return res.status(403).json({ error: "Not participant" });

    if (!["PAID_VERIFIED", "FULFILLED"].includes(order.status)) {
      return res.status(400).json({ error: "Invalid status to complete" });
    }
    order.status = "COMPLETED";
    await order.save();
    res.json(order);
  } catch (e) { next(e); }
});

export default router;
