// frontend/src/lib/api.js
import { getToken, setToken } from "./auth";

// รองรับได้ทั้ง VITE_API_URL และ VITE_API_BASE (เผื่อโปรเจกต์เก่า)
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:4000";

/**
 * Generic API helper
 * - แนบ Authorization: Bearer <token> อัตโนมัติถ้ามี
 * - credentials: "include" สำหรับ cookie/session
 * - รองรับ JSON และ FormData (ผ่าน opts.isForm)
 * - หากสถานะ !ok จะ throw Error พร้อมแนบ status และ payload
 */
export default async function api(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    isForm = false, // true = ส่ง FormData (ไม่ตั้ง Content-Type JSON)
    raw = false,    // true = คืน Response ตรงๆ ให้ผู้เรียกจัดการเอง
    signal,         // รองรับ AbortController
  } = opts;

  const token = getToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const finalHeaders = {
    ...(isForm ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: finalHeaders,
    body: body
      ? isForm
        ? body
        : JSON.stringify(body)
      : undefined,
    signal,
    cache: "no-store",
  });

  if (raw) return res;

  // พยายามแปลง JSON ถ้า content-type เป็น json
  const ctype = res.headers.get("content-type") || "";
  const isJSON = ctype.includes("application/json");
  const data = isJSON ? await safeJson(res) : await res.text();

  if (!res.ok) {
    // เคส 401: token หมดอายุ/ใช้ไม่ได้ -> ล้าง token ไว้ก่อน
    if (res.status === 401) {
      try { setToken(""); } catch {}
    }
    const err = new Error(
      (isJSON && (data?.message || data?.error)) ||
      `HTTP ${res.status} ${res.statusText}`
    );
    err.status = res.status;
    err.payload = data;
    err.url = url;
    throw err;
  }

  return data;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/* ===== Convenience helpers ===== */

export const apiGet = (path, options) =>
  api(path, { method: "GET", ...(options || {}) });

export const apiPost = (path, body, options) =>
  api(path, { method: "POST", body, ...(options || {}) });

export const apiPut = (path, body, options) =>
  api(path, { method: "PUT", body, ...(options || {}) });

export const apiPatch = (path, body, options) =>
  api(path, { method: "PATCH", body, ...(options || {}) });

export const apiDelete = (path, options) =>
  api(path, { method: "DELETE", ...(options || {}) });

export const apiUpload = (path, formData, options) =>
  api(path, { method: "POST", body: formData, isForm: true, ...(options || {}) });
