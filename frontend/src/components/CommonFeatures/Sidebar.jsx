import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../assets/css/common.css'

const navItems = [
  {
    key: "overview",
    label: "Station Overview",
    icon: "🛰️",
    path: "/admin/station",
    desc: "Live station vitals",
  },
  {
    key: "crew",
    label: "Crew Management",
    icon: "👨‍🚀",
    path: "/admin/crew",
    desc: "Add, update, manage crew",
  },
  {
    key: "storage",
    label: "Storage Management",
    icon: "📦",
    path: "/admin/storage",
    desc: "Alpha–Theta modules",
  },
  {
    key: "tasks",
    label: "Task Management",
    icon: "✅",
    path: "/admin/tasks",
    desc: "Assign & track tasks",
  },
  {
    key: "medical",
    label: "Medical Inventory",
    icon: "💊",
    path: "/admin/medical",
    desc: "Supplies & expiry dates",
  },
  {
    key: "complaints",
    label: "Complaint Center",
    icon: "📋",
    path: "/admin/complaints",
    desc: "Crew-submitted issues",
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredKey, setHoveredKey] = useState(null);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar-root${collapsed ? " collapsed" : ""}`}>

      {/* toggle button */}
      <button
        className="sidebar-toggle-btn"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "›" : "‹"}
      </button>

      {/* nav section label */}
      {!collapsed && (
        <p className="sidebar-section-title">NAVIGATION</p>
      )}

      {/* nav items */}
      <nav className="sidebar-nav-list">
        {navItems.map((item) => (
          <div
            key={item.key}
            className="sidebar-item-wrap"
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <button
              className={`sidebar-nav-btn${isActive(item.path) ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!collapsed && (
                <div className="sidebar-nav-text">
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-desc">{item.desc}</span>
                </div>
              )}
              {!collapsed && isActive(item.path) && (
                <span className="sidebar-active-dot" />
              )}
            </button>

            {/* tooltip when collapsed */}
            {collapsed && hoveredKey === item.key && (
              <div className="sidebar-tooltip">
                <span className="tooltip-label">{item.label}</span>
                <span className="tooltip-desc">{item.desc}</span>
              </div>
            )}
          </div>
        ))}
      </nav>

      

  

    </aside>
  );
}