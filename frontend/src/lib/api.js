import { getToken } from "./auth";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Generic API helper for JSON and multipart/form requests.
 * @param {string} path - endpoint เช่น "/api/auth/login"
 * @param {object} opts - ตัวเลือก เช่น { method, body, headers, isForm }
 */
export default async function api(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    isForm = false, // ถ้า true จะไม่ set Content-Type JSON (ใช้ form-data แทน)
    raw = false, // ถ้าต้องการ raw Response
  } = opts;

  const token = getToken();

  // เตรียม headers
  const finalHeaders = {
    ...(isForm ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    credentials: "include",
    body: body
      ? isForm
        ? body // เช่น FormData
        : JSON.stringify(body)
      : undefined,
  });

  // คืน raw response ถ้าต้องการ
  if (raw) return res;

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `HTTP ${res.status} ${res.statusText}`;
    console.error("❌ API Error:", msg, "→", path);
    throw new Error(msg);
  }

  return data;
}
