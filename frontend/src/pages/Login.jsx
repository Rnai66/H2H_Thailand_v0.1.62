import { useState } from "react";
import { login, profile } from "../api/auth";

export default function Login() {
  const [userId, setUserId] = useState("6748aaaa0000000000000001");
  const [name, setName] = useState("buyerA");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const doLogin = async () => {
    try {
      setBusy(true); setMsg(""); setMe(null);
      const res = await login(userId.trim(), name.trim());
      setToken(res.token);
      localStorage.setItem("token", res.token);
      setMsg("✅ Login สำเร็จ");
    } catch (e) {
      setMsg("❌ Login ล้มเหลว: " + e.message);
    } finally { setBusy(false); }
  };

  const checkProfile = async () => {
    try {
      setBusy(true); setMsg("");
      const res = await profile(token);
      setMe(res.user);
      setMsg("✅ ดึงโปรไฟล์สำเร็จ");
    } catch (e) {
      setMsg("❌ โปรไฟล์ล้มเหลว: " + e.message);
    } finally { setBusy(false); }
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setToken(""); setMe(null); setMsg("ℹ️ ลบ token แล้ว");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">H2H — Login Test</h1>

      <div className="space-y-2">
        <label className="block text-sm">User ID</label>
        <input
          className="w-full px-3 py-2 rounded-xl border"
          value={userId}
          onChange={e=>setUserId(e.target.value)}
          placeholder="เช่น 6748aaaa0000000000000001"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Name</label>
        <input
          className="w-full px-3 py-2 rounded-xl border"
          value={name}
          onChange={e=>setName(e.target.value)}
          placeholder="เช่น buyerA"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 rounded-2xl bg-blue-700 text-white disabled:opacity-50"
          onClick={doLogin}
          disabled={busy || !userId.trim() || !name.trim()}
        >
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <button
          className="px-4 py-2 rounded-2xl bg-stone-200"
          onClick={clearToken}
          disabled={busy}
        >
          ลบ token
        </button>
      </div>

      <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-sm">
        <div><b>Token length:</b> {token ? token.length : 0}</div>
        <div className="truncate"><b>Token:</b> {token || "-"}</div>
      </div>

      <div className="space-y-2">
        <button
          className="px-4 py-2 rounded-2xl bg-green-700 text-white disabled:opacity-50"
          onClick={checkProfile}
          disabled={busy || !token}
        >
          ดึงโปรไฟล์ (GET /api/auth/profile)
        </button>

        {me && (
          <div className="p-3 rounded-xl border text-sm">
            <div><b>_id:</b> {me._id}</div>
            <div><b>name:</b> {me.name}</div>
            <div><b>role:</b> {me.role}</div>
          </div>
        )}
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      <div className="text-xs text-stone-500">
        Tips:
        <ul className="list-disc ml-5">
          <li>ตั้งค่า <code>VITE_API_BASE=http://localhost:4000</code> ใน <code>.env</code> ฝั่ง frontend</li>
          <li>ถ้า 401 ให้ดูว่ามีหัว <code>Authorization: Bearer &lt;token&gt;</code> หรือยัง</li>
        </ul>
      </div>
    </div>
  );
}
