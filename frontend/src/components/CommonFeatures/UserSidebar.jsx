import { useState } from "react";
import { NavLink } from "react-router-dom";
import '../../assets/css/UserLayout.css';

const NAV = [
  { icon: "🛰️", label: "Station View",   desc: "Live system status",   path: "/crew/UserStationview"   },
  { icon: "📦", label: "Storage View",   desc: "Module load & stock",   path: "/crew/UserStorageView"     },
  { icon: "💊", label: "Medical View",   desc: "Supplies & expiry",     path: "/crew/UserMedicalView"     },
  { icon: "✅", label: "My Tasks",        desc: "Assigned tasks",        path: "/crew/UserTask"       },
  { icon: "📋", label: "Complaints",     desc: "Submit & track issues", path: "/crew/UserComplain"  },
  { icon: "👤", label: "My Profile",     desc: "Account details",       path: "/crew/UserProfile"     },
];

export default function UserSidebar({ collapsed, onToggle }) {
  return (
    <aside className={`us-sidebar${collapsed ? " us-collapsed" : ""}`}>
      {/* toggle */}
      <button className="us-toggle" onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}>
        {collapsed ? "›" : "‹"}
      </button>

      {/* nav */}
      <nav className="us-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `us-nav-item${isActive ? " us-active" : ""}`}
            title={collapsed ? `${item.label} — ${item.desc}` : ""}
          >
            <span className="us-nav-icon">{item.icon}</span>
            {!collapsed && (
              <div className="us-nav-text">
                <span className="us-nav-label">{item.label}</span>
                <span className="us-nav-desc">{item.desc}</span>
              </div>
            )}
            {collapsed && <span className="us-tooltip">{item.label}<br /><small>{item.desc}</small></span>}
          </NavLink>
        ))}
      </nav>

      {/* bottom — crew status */}
      {!collapsed && (
        <div className="us-crew-status">
          <p className="us-cs-heading">My Status</p>
          <div className="us-cs-row">
            <span className="us-cs-dot us-cs-dot-green" />
            <span className="us-cs-label">Active · On Duty</span>
          </div>
          <div className="us-cs-row" style={{ marginTop: ".35rem" }}>
            <span className="us-cs-dot" style={{ background: "#60a5fa" }} />
            <span className="us-cs-label">Compartment Bay B</span>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="us-status-dots">
          <span title="Active" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-400)", display: "block" }} />
        </div>
      )}
    </aside>
  );
}