// frontend/src/pages/ItemDetail.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import SlipUploader from "../components/SlipUploader";
import OrderActions from "../components/OrderActions";
import ChatBox from "../components/ChatBox";

const BUYER_ID = "6748aaaa0000000000000001";
const SELLER_ID = "6748aaaa0000000000000002";
const ITEM_ID = "6748bbbb0000000000000001";

export default function ItemDetail() {
  const [buyerToken, setBuyerToken] = useState("");
  const [sellerToken, setSellerToken] = useState("");
  const [order, setOrder] = useState(null);
  const [thread, setThread] = useState(null);

  useEffect(() => {
    (async () => {
      const bt = await api.login(BUYER_ID, "buyerA"); setBuyerToken(bt.token);
      const st = await api.login(SELLER_ID, "sellerB"); setSellerToken(st.token);
    })();
  }, []);

  const createOrder = async () => {
    const res = await api.createOrder(buyerToken, {
      itemId: ITEM_ID, sellerId: SELLER_ID, price: 12000, method: "bank_transfer"
    });
    setOrder(res);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">iPhone 13 128GB — ฿12,000</h1>

      {!order && (
        <button className="px-5 py-3 rounded-2xl bg-blue-700 text-white"
                onClick={createOrder}>เริ่มสั่งซื้อ</button>
      )}

      {order && (
        <div className="p-4 rounded-2xl border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              สถานะ: {order.status}
            </span>
            {order.slip?.url && (
              <a className="text-sm underline" href={order.slip.url} target="_blank">ดูสลิป</a>
            )}
          </div>

          <SlipUploader token={buyerToken} order={order} onUpdated={setOrder} />
          <OrderActions tokenBuyer={buyerToken} tokenSeller={sellerToken}
                        order={order} role="buyer" onUpdated={setOrder} />
        </div>
      )}

      <ChatBox token={buyerToken} threadId={thread?._id} onThreadCreated={setThread}
               buyerId={BUYER_ID} sellerId={SELLER_ID} itemId={ITEM_ID} />
    </div>
  );
}
