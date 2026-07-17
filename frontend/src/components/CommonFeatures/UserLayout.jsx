import { useState } from "react";
import { Outlet } from "react-router-dom";
import UserHeader  from "./UserHeader";
import UserSidebar from "./UserSidebar";
import '../../assets/css/UserLayout.css';

export default function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="ul-shell">
      <UserHeader crewName="Eng. Marco Reyes" stationName="ISS-Horizon VII" />
      <div className="ul-body">
        <UserSidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
        <main className="ul-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}