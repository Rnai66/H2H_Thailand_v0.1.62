import express from "express";
import ChatThread from "../models/ChatThread.js";
import ChatMessage from "../models/ChatMessage.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// สร้าง/ดึง thread (unique per item+buyer+seller)
router.post("/threads", auth, async (req, res, next) => {
  try {
    const { itemId, buyerId, sellerId } = req.body;
    const thread = await ChatThread.findOneAndUpdate(
      { itemId, buyerId, sellerId },
      { $setOnInsert: { itemId, buyerId, sellerId } },
      { new: true, upsert: true }
    );
    res.json(thread);
  } catch (e) { next(e); }
});

router.get("/threads/:threadId/messages", auth, async (req, res, next) => {
  try {
    const msgs = await ChatMessage.find({ threadId: req.params.threadId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (e) { next(e); }
});

router.post("/threads/:threadId/messages", auth, async (req, res, next) => {
  try {
    const { text = "", attachments = [] } = req.body || {};
    const msg = await ChatMessage.create({
      threadId: req.params.threadId,
      senderId: req.user._id,
      text,
      attachments,
      readBy: [req.user._id]
    });
    await ChatThread.findByIdAndUpdate(req.params.threadId, { lastMessageAt: new Date() });
    res.json(msg);
  } catch (e) { next(e); }
});

export default router;
