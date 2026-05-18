import { Outlet } from "react-router-dom";
import AdminNav from "../components/AdminNav";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <AdminNav />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />   {/* 🔥 THIS FIXES YOUR ISSUE */}
      </div>
    </div>
  );
}