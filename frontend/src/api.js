const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
export const api = {
  async login(userId, name) {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ userId, name })
    });
    return r.json();
  },
  async myOrders(token) {
    const r = await fetch(`${API_BASE}/api/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return r.json();
  },
  async createOrder(token, body) {
    const r = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    return r.json();
  },
  async uploadSlip(token, orderId, file) {
    const fd = new FormData();
    fd.append("slip", file);
    const r = await fetch(`${API_BASE}/api/orders/${orderId}/slip`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    return r.json();
  },
  async verify(token, orderId) {
    const r = await fetch(`${API_BASE}/api/orders/${orderId}/verify-payment`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
    return r.json();
  },
  async complete(token, orderId) {
    const r = await fetch(`${API_BASE}/api/orders/${orderId}/complete`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
    return r.json();
  },
  // chat
  async createThread(token, body) {
    const r = await fetch(`${API_BASE}/api/chat/threads`, {
      method:"POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(body)
    });
    return r.json();
  },
  async sendMessage(token, threadId, text) {
    const r = await fetch(`${API_BASE}/api/chat/threads/${threadId}/messages`, {
      method:"POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ text })
    });
    return r.json();
  }
};
