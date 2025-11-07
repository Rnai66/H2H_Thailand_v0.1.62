import { Router } from "express";
const router = Router();

// Mock data ใช้ทดสอบหน้า Items และ flow เริ่มออเดอร์ + อัปสลิป
router.get("/", (_req, res) => {
  res.json({
    items: [
      {
        _id: "6748bbbb0000000000000001",
        name: "iPhone 13 128GB",
        price: 12000,
        sellerId: "6748aaaa0000000000000002",
        createdAt: new Date(),
      },
    ],
  });
});

export default router;
