import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../assets/css/common.css'

export default function Header({ adminName = "Commander", stationName = "Orion Base Alpha" }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    navigate("/login");
  };

  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="header-root">
      {/* ── LEFT: Brand ── */}
      <div className="header-brand">
        <div className="header-logo">
          <span className="header-logo-hex">⬡</span>
          <span className="header-logo-dot" />
        </div>
        <div className="header-titles">
          <span className="header-project-name">SSHMS</span>
          <span className="header-station-name">{stationName}</span>
        </div>
      </div>

      

      {/* ── RIGHT: Admin info + logout ── */}
      <div className="header-right">
        {/* admin avatar + dropdown */}
        <div className="header-admin-wrap">
          <button
            className="header-admin-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="header-avatar">{initials}</div>
            <div className="header-admin-info">
              <span className="header-admin-name">{adminName}</span>
              <span className="header-admin-role">Admin</span>
            </div>
            <span className={`header-chevron${showDropdown ? " open" : ""}`}>▾</span>
          </button>

          {showDropdown && (
            <>
              <div
                className="dropdown-backdrop"
                onClick={() => setShowDropdown(false)}
              />
              <div className="header-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">{initials}</div>
                  <div>
                    <p className="dropdown-name">{adminName}</p>
                    <p className="dropdown-role-tag">Station Admin</p>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item">
                  <button  onClick={() => {navigate('profile')}}><span > 👤</span> My Profile</button>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item dropdown-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}