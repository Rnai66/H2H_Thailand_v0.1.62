import { useState } from "react";
import { api } from "../api";

export default function ChatBox({ token, threadId, onThreadCreated, buyerId, sellerId, itemId }) {
  const [text, setText] = useState("");

  const ensureThreadAndSend = async () => {
    let tid = threadId;
    if (!tid) {
      const t = await api.createThread(token, { itemId, buyerId, sellerId });
      tid = t._id; onThreadCreated?.(t);
    }
    if (!text.trim()) return;
    await api.sendMessage(token, tid, text.trim());
    setText("");
  };

  return (
    <div className="p-3 rounded-2xl border shadow-sm">
      <div className="font-medium mb-2">สนทนาซื้อ–ขาย</div>
      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)}
               placeholder="พิมพ์ข้อความ..." className="flex-1 px-3 py-2 rounded-2xl border" />
        <button onClick={ensureThreadAndSend}
                className="px-4 py-2 rounded-2xl bg-green-600 text-white">ส่ง</button>
      </div>
    </div>
  );
}
