/**
 * auth.js — Utility สำหรับจัดการ JWT token ฝั่ง frontend
 * ใช้ร่วมกับ api.js, App.jsx
 */

const TOKEN_KEY = "token";

/** อ่าน token จาก localStorage */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

/** บันทึกหรือเคลียร์ token */
export function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** ถอดรหัส payload ของ JWT (base64 → JSON) */
export function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = token.split(".")[1];
    // decodeURIComponent(escape(...)) รองรับ UTF-8
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}

/** คืนค่าผู้ใช้ปัจจุบันจาก token ถ้ามี */
export function getCurrentUser() {
  const t = getToken();
  if (!t) return null;

  const p = decodeJwt(t);
  if (!p) return null;

  const now = Math.floor(Date.now() / 1000);
  if (p.exp && p.exp < now) {
    // token หมดอายุ
    setToken("");
    return null;
  }

  return {
    id: p.id,
    email: p.email,
    role: p.role || "user",
    exp: p.exp,
  };
}
