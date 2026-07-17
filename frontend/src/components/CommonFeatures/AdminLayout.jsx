import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import '../../assets/css/common.css'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-layout-root">
      <Header
        adminName="Commander Rhodes"
        stationName="Orion Base Alpha"
      />
      <div className="admin-body">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className={`admin-main${collapsed ? " sidebar-collapsed" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}