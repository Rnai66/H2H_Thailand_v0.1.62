Marketplace สไตล์  (Blue-Gold UI): รองรับ Login, Items, Chat (Buyer–Seller),
Orders พร้อมอัปโหลดสลิป และกระบวนการยืนยันชำระเงิน (verify / complete) ครบในหน้าเดียว
- Auth (JWT): POST /api/auth/login (mock sign-in), GET /api/auth/profile
- Items: GET /api/items รองรับ paging/filter
- Chat: POST /api/chat/threads, POST /api/chat/threads/:threadId/messages
- Orders: 
  1) POST /api/orders 
  2) POST /api/orders/:id/slip 
  3) POST /api/orders/:id/verify-payment 
  4) POST /api/orders/:id/complete
- Uploads: ไฟล์สลิปเก็บที่ uploads/slips/... และเสิร์ฟผ่าน /uploads/...
- CORS: คุมด้วยตัวแปร CORS_ORIGIN (รองรับหลายโดเมน คั่นด้วยคอมมา)
- Health: GET /api/health

backend/
  src/
    server.js
    routes/
      auth.js
      healthRoutes.js
      itemsRoutes.js
      chatRoutes.js
      orderRoutes.js
    middleware/
      auth.js
      upload.js
    config/
      db.js
      dbPool.js
    models/
      Item.js
      Order.js
      ChatThread.js
      ChatMessage.js
    helpers/
      pagination.js
      filters.js
    validation/
      items.js
uploads/
  slips/

หมายเหตุ:
- ถ้าเห็น 404 ที่ /api/items ให้ยืนยันว่าได้ mount แล้วใน server.js:
  import itemsRoutes from "./routes/itemsRoutes.js";
  app.use("/api/items", itemsRoutes);

NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

MONGO_USER=your_mongo_user
MONGO_PASS=your_mongo_pass
MONGO_CLUSTER=cluster0.rasol58.mongodb.net

DB_USER=user_db
DB_ITEM=item_db
DB_PAYMENT=payment_db
DB_TOKEN=token_db
DB_PROFILE=profile_db
JWT_SECRET=secret123
JWT_EXPIRES_IN=90d

MONGO_URI="mongodb+srv:rnaibro_db_user:ltpRGPx1dIbiyW7b@cluster0.rasol58.mongodb.net
npm i --prefix backend
mkdir -p backend/uploads/slips

curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"6748aaaa0000000000000001","name":"buyerA"}' | jq .

curl -s http://localhost:4000/api/auth/profile -H "Authorization: Bearer <TOKEN>" | jq .
curl -s -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"6748bbbb0000000000000001","sellerId":"6748aaaa0000000000000002","price":12000,"method":"bank_transfer"}' | jq .

curl -s -X POST http://localhost:4000/api/orders/<ORDER_ID>/slip \
  -H "Authorization: Bearer <TOKEN>" \
  -F slip=@/absolute/path/to/slip.jpg | jq .
curl -s -X POST http://localhost:4000/api/orders/<ORDER_ID>/verify-payment -H "Authorization: Bearer <SELLER_TOKEN>" | jq .
curl -s -X POST http://localhost:4000/api/orders/<ORDER_ID>/complete       -H "Authorization: Bearer <BUYER_TOKEN>"  | jq .
curl -s -X POST http://localhost:4000/api/orders/<ORDER_ID>/verify-payment -H "Authorization: Bearer <SELLER_TOKEN>" | jq .
curl -s -X POST http://localhost:4000/api/orders/<ORDER_ID>/complete       -H "Authorization: Bearer <BUYER_TOKEN>"  | jq .

สร้าง frontend/.env:
VITE_API_BASE=http://localhost:4000
Render:
- Build Command:  npm i --prefix backend
- Start Command:  npm start --prefix backend
- PORT: ใช้ process.env.PORT
- ตั้ง ENV ตาม backend/.env

Railway:
- Variables ตาม backend/.env
- Start Command: npm start --prefix backend
- (ทางเลือก) Procfile:
  web: npm start --prefix backend

Vercel:
- แนะนำเฉพาะฝั่ง Frontend (Vite) แล้วตั้ง VITE_API_BASE ให้ชี้ URL ของ backend ที่ Render/Railway

CORS_ORIGIN รองรับหลายโดเมน เช่น:
CORS_ORIGIN=https://my-frontend.vercel.app,http://localhost:5173
- "No file uploaded (field name must be 'slip')": ชื่อ field ต้อง "slip" และใช้ -F slip=@/path/to/file.jpg
- "Unauthorized": ต้องมี Authorization: Bearer <token>
- "404 Not Found /api/items": ตรวจว่าได้ mount itemsRoutes แล้วจริง
