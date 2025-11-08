import { useState } from "react";
import api from "../lib/api";

export default function Login({ onLoggedIn }) {
  const [userId, setUserId] = useState("6748aaaa0000000000000001");
  const [name, setName] = useState("buyerA");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: { userId, name },
      });
      if (!res?.token) throw new Error("No token from server");
      // ส่งให้ App.jsx บันทึก token + navigate("/items")
      onLoggedIn(res.token);
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/5 border border-white/10">
      <h1 className="text-2xl font-bold mb-4">H2H — Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">User ID</label>
          <input className="input" value={userId} onChange={e => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
