import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import api from "./lib/api";
import { getToken, setToken } from "./lib/auth";

// Components / Pages
import PageFade from "./components/PageFade";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Tokens from "./pages/Tokens";
import PaymentsPage from "./pages/PaymentsPage";
import UsersPage from "./pages/UsersPage";
import ItemsPage from "./pages/ItemsPage";
import H2HLayout from "./ui/H2HLayout";

/* ---------- Guards ---------- */
function Protected({ me, children }) {
  if (!me) return <Navigate to="/login" replace />;
  return children;
}
function AdminOnly({ me, children }) {
  if (!me) return <Navigate to="/login" replace />;
  if (me.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

/* ---------- Home ---------- */
function Home() {
  return (
    <div className="page-fade section">
      <h2 className="text-3xl font-semibold title-glow mb-2">
        Welcome to H2H Thailand
      </h2>
      <p className="text-[var(--fg-muted)] max-w-2xl">
        ระบบ H2H Digital Silk UI — โทน Blue–Gold + Glassmorphism พร้อมการจัดการผู้ใช้
        สินค้า การชำระเงิน และโทเคนแบบครบวงจร 💙🟨
      </p>
    </div>
  );
}

/* ---------- Main App ---------- */
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  async function fetchMe() {
    const tok = getToken();
    if (!tok) {
      setMe(null);
      setLoadingMe(false);
      return;
    }
    try {
      // ✅ แนบ Authorization header ด้วย token
      const res = await api("/api/auth/profile", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setMe(res.user || null);
    } catch {
      // token เสีย/หมดอายุ เคลียร์ทิ้ง
      setToken("");
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }

  useEffect(() => { fetchMe(); }, []);

  async function handleLoggedIn(token) {
    setToken(token);
    toast.success("✅ Logged in successfully!");
    // ดึงโปรไฟล์ก่อน แล้วค่อยเด้งไป /items
    await fetchMe();
    navigate("/items");
  }

  function handleLogout() {
    setToken("");
    setMe(null);
    toast("Logged out");
    navigate("/login");
  }

  const Wrapper = PageFade || (({ children }) => <>{children}</>);

  if (loadingMe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--fg-muted)]">
        Loading user profile...
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <Wrapper key={location.pathname}>
        <Routes location={location}>
          {/* Public */}
          <Route path="/login" element={<Login onLoggedIn={handleLoggedIn} />} />
          <Route path="/register" element={<Register onLoggedIn={handleLoggedIn} />} />

          {/* App Layout (แสดงเมนู/เค้าโครงได้ แม้ยังไม่ล็อกอิน, แต่เพจสำคัญคุ้มด้วย Protected) */}
          <Route element={<H2HLayout me={me} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/items" />} />
            <Route path="/" element={<Home />} />

            <Route
              path="/profile"
              element={
                <Protected me={me}>
                  <Profile me={me} toast={toast} />
                </Protected>
              }
            />
            <Route
              path="/items"
              element={
                <Protected me={me}>
                  <ItemsPage />
                </Protected>
              }
            />
            <Route
              path="/users"
              element={
                <AdminOnly me={me}>
                  <UsersPage />
                </AdminOnly>
              }
            />
            <Route
              path="/tokens"
              element={
                <AdminOnly me={me}>
                  <Tokens toast={toast} />
                </AdminOnly>
              }
            />
            <Route
              path="/payments"
              element={
                <AdminOnly me={me}>
                  <PaymentsPage />
                </AdminOnly>
              }
            />

            <Route path="*" element={<div>Not found</div>} />
          </Route>
        </Routes>
      </Wrapper>
    </>
  );
}
