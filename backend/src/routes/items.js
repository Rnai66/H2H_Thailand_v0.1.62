import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// ===== helpers กันแตก =====
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id || "");
}
function mockList() {
  return {
    page: 1,
    limit: 20,
    total: 2,
    items: [
      { _id: "6748bbbb0000000000000001", title: "iPhone 13 128GB", price: 12000, sellerId: "6748aaaa0000000000000002" },
      { _id: "6748bbbb0000000000000002", title: "AirPods Pro",     price:  4500, sellerId: "6748aaaa0000000000000002" },
    ],
  };
}
function parsePaging(req) {
  const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? "20", 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const sortRaw = typeof req.query.sort === "string" ? req.query.sort : "-createdAt";
  const sort = sortRaw.startsWith("-") ? { [sortRaw.slice(1)]: -1 } : { [sortRaw]: 1 };
  return { page, limit, skip, sort };
}
function buildFilter(req) {
  const f = {};
  if (req.query.q) f.name = { $regex: String(req.query.q), $options: "i" };
  if (req.query.sellerId && isValidObjectId(req.query.sellerId)) f.sellerId = req.query.sellerId;
  if (req.query.includeDeleted !== "true") f.isDeleted = { $ne: true };
  return f;
}

// พยายามโหลดโมดูล dbPool/Item อย่าง “ขณะรัน” (lazy)
// ถ้าโหลดไม่ได้/ENV ไม่ครบ → คืน { Item: null } เพื่อใช้ mock
async function getItemModelSafe() {
  try {
    const dbPool = await import("../config/dbPool.js");
    const itemMod = await import("../models/Item.js");
    const getConnection = dbPool.getConnection;
    const DBNAMES = dbPool.DBNAMES || { ITEM: "item_db" };
    const ItemFactory = itemMod.ItemModel || itemMod.default;
    if (!getConnection || !ItemFactory) return { Item: null };
    const conn = getConnection(DBNAMES.ITEM);
    return { Item: ItemFactory(conn) };
  } catch {
    return { Item: null };
  }
}

/* GET /api/items */
router.get("/", async (req, res) => {
  const { page, limit, skip, sort } = parsePaging(req);
  const filter = buildFilter(req);

  const { Item } = await getItemModelSafe();
  if (!Item) {
    // DB ยังไม่พร้อม → ส่ง mock ให้หน้า UI ใช้งานได้ก่อน
    return res.json(mockList());
  }

  try {
    const [items, total] = await Promise.all([
      Item.find(filter).sort(sort).skip(skip).limit(limit),
      Item.countDocuments(filter),
    ]);
    res.json({ page, limit, total, items });
  } catch (e) {
    // ถ้า query DB พัง → fallback mock
    res.json(mockList());
  }
});

/* GET /api/items/:id */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid item id" });
  }
  const { Item } = await getItemModelSafe();
  if (!Item) {
    // mock รายการเดียว
    if (id === "6748bbbb0000000000000001") {
      return res.json({ item: mockList().items[0] });
    }
    return res.status(404).json({ message: "Item not found" });
  }
  try {
    const item = await Item.findById(id);
    if (!item || item.isDeleted) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (e) {
    return res.status(500).json({ message: "Failed to load item", error: e.message });
  }
});

export default router;
