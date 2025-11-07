// backend/src/routes/items.js
import { Router } from "express";
const router = Router();

// mock กันพังระหว่างยังจัด DB/Model
const mock = [
  { _id: "6748bbbb0000000000000001", title: "iPhone 13 128GB", price: 12000, sellerId: "6748aaaa0000000000000002" },
  { _id: "6748bbbb0000000000000002", title: "AirPods Pro",     price:  4500, sellerId: "6748aaaa0000000000000002" },
];

// GET /api/items
router.get("/", async (_req, res) => {
  res.json({ page: 1, limit: 20, total: mock.length, items: mock });
});

// GET /api/items/:id
router.get("/:id", async (req, res) => {
  const it = mock.find(x => String(x._id) === String(req.params.id));
  if (!it) return res.status(404).json({ message: "Item not found" });
  res.json({ item: it });
});

export default router;
